import { invoke } from '@tauri-apps/api/core';
import { writable, derived, get } from 'svelte/store';

export interface FileEntry {
	name: string;
	path: string;
	is_dir: boolean;
	children?: FileEntry[];
}

export interface OpenTab {
	path: string;
	name: string;
	content: string;
	dirty: boolean;
}

export const vaultPath = writable<string | null>(null);
export const isSetupComplete = writable<boolean>(false);
export const isLoading = writable<boolean>(true);

export const fileTree = writable<FileEntry[]>([]);
export const openTabs = writable<OpenTab[]>([]);
export const activeTabPath = writable<string | null>(null);

export const activeTab = derived(
	[openTabs, activeTabPath],
	([$tabs, $path]) => $tabs.find((t) => t.path === $path) ?? null
);

function isTauri(): boolean {
	return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

// --- Vault path ---

export async function loadVaultPath(): Promise<void> {
	isLoading.set(true);
	try {
		if (!isTauri()) {
			vaultPath.set(null);
			isSetupComplete.set(false);
			return;
		}
		const path = await invoke<string | null>('get_vault_path');
		vaultPath.set(path);
		isSetupComplete.set(!!path);
	} catch (e) {
		console.error('Failed to load vault path:', e);
		vaultPath.set(null);
		isSetupComplete.set(false);
	} finally {
		isLoading.set(false);
	}
}

export async function saveVaultPath(path: string): Promise<boolean> {
	try {
		if (!isTauri()) return false;
		await invoke('set_vault_path', { path });
		vaultPath.set(path);
		isSetupComplete.set(true);
		return true;
	} catch (e) {
		console.error('Failed to save vault path:', e);
		return false;
	}
}

export async function changeVault(): Promise<boolean> {
	try {
		if (!isTauri()) return false;
		const { open } = await import('@tauri-apps/plugin-dialog');
		const selected = await open({
			directory: true,
			multiple: false,
			title: 'Select Vault Directory'
		});
		if (selected) {
			const path = typeof selected === 'string' ? selected : selected;
			openTabs.set([]);
			activeTabPath.set(null);
			await saveVaultPath(path);
			await loadFileTree();
			return true;
		}
		return false;
	} catch (e) {
		console.error('Failed to change vault:', e);
		return false;
	}
}

// --- File tree ---

export async function loadFileTree(): Promise<void> {
	if (!isTauri()) return;
	try {
		const tree = await invoke<FileEntry[]>('get_file_tree');
		fileTree.set(tree);
	} catch (e) {
		console.error('Failed to load file tree:', e);
	}
}

// --- Tabs ---

export async function openFile(relativePath: string, name: string): Promise<void> {
	const tabs = get(openTabs);
	const existing = tabs.find((t) => t.path === relativePath);
	if (existing) {
		activeTabPath.set(relativePath);
		return;
	}
	try {
		if (!isTauri()) return;
		const content = await invoke<string>('read_file', { relativePath });
		openTabs.update((t) => [...t, { path: relativePath, name, content, dirty: false }]);
		activeTabPath.set(relativePath);
	} catch (e) {
		console.error('Failed to open file:', e);
	}
}

export async function saveActiveTab(): Promise<boolean> {
	const tabs = get(openTabs);
	const path = get(activeTabPath);
	const tab = tabs.find((t) => t.path === path);
	if (!tab || !tab.dirty) return true;
	try {
		if (!isTauri()) return false;
		await invoke('write_file', {
			relativePath: tab.path,
			content: tab.content
		});
		openTabs.update((t) =>
			t.map((item) => (item.path === path ? { ...item, dirty: false } : item))
		);
		return true;
	} catch (e) {
		console.error('Failed to save file:', e);
		return false;
	}
}

export function closeTab(path: string): void {
	const tabs = get(openTabs);
	const idx = tabs.findIndex((t) => t.path === path);
	const currentPath = get(activeTabPath);
	openTabs.update((t) => t.filter((item) => item.path !== path));
	if (currentPath === path) {
		const remaining = get(openTabs);
		if (remaining.length > 0) {
			const newIdx = Math.min(idx, remaining.length - 1);
			activeTabPath.set(remaining[newIdx].path);
		} else {
			activeTabPath.set(null);
		}
	}
}

export function updateTabContent(path: string, content: string): void {
	openTabs.update((t) =>
		t.map((item) => (item.path === path ? { ...item, content, dirty: true } : item))
	);
}

export async function createNewFile(parentPath: string, name: string): Promise<boolean> {
	try {
		if (!isTauri()) return false;
		const fullPath = parentPath ? `${parentPath}/${name}` : name;
		await invoke('create_file', { relativePath: fullPath });
		await loadFileTree();
		await openFile(fullPath, name);
		return true;
	} catch (e) {
		console.error('Failed to create file:', e);
		return false;
	}
}

export async function deleteFileByPath(relativePath: string): Promise<boolean> {
	try {
		if (!isTauri()) return false;
		await invoke('delete_file', { relativePath });
		closeTab(relativePath);
		await loadFileTree();
		return true;
	} catch (e) {
		console.error('Failed to delete file:', e);
		return false;
	}
}

export async function renameFileByPath(oldPath: string, newName: string): Promise<boolean> {
	try {
		if (!isTauri()) return false;
		const parts = oldPath.split('/');
		parts[parts.length - 1] = newName;
		const newPath = parts.join('/');
		await invoke('rename_file', { oldPath, newPath });
		const tab = get(openTabs).find((t) => t.path === oldPath);
		if (tab) {
			closeTab(oldPath);
			await openFile(newPath, newName);
		}
		await loadFileTree();
		return true;
	} catch (e) {
		console.error('Failed to rename file:', e);
		return false;
	}
}

// --- Wiki links ---

export interface WikiLinkCandidate {
	name: string;
	path: string;
}

export async function getWikiLinkCandidates(): Promise<WikiLinkCandidate[]> {
	try {
		if (!isTauri()) return [];
		return await invoke<WikiLinkCandidate[]>('get_wiki_link_candidates');
	} catch (e) {
		console.error('Failed to get wiki link candidates:', e);
		return [];
	}
}

export async function resolveWikiLink(linkName: string): Promise<string | null> {
	try {
		if (!isTauri()) return null;
		return await invoke<string | null>('resolve_wiki_link', { linkName });
	} catch (e) {
		console.error('Failed to resolve wiki link:', e);
		return null;
	}
}
