<script lang="ts">
	import { tick } from 'svelte';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { invoke } from '@tauri-apps/api/core';
	import { openFile, type FileEntry } from '$lib/stores/setup';
	import {
		Search,
		FileText,
		Folder,
		ArrowUp,
		ArrowDown,
		CornerDownLeft,
		Loader2
	} from '@lucide/svelte';

	let { open = $bindable(false) }: { open: boolean } = $props();

	let searchQuery = $state('');
	let selectedIndex = $state(0);
	let inputEl: HTMLInputElement | undefined = $state();
	let listEl: HTMLDivElement | undefined = $state();

	interface FlatFile {
		name: string;
		path: string;
		is_dir: boolean;
		parentPath: string;
	}

	interface FileTreeData {
		files: FileEntry[];
		flat: FlatFile[];
	}

	function flattenTree(entries: FileEntry[], parentPath = ''): FlatFile[] {
		const result: FlatFile[] = [];
		for (const entry of entries) {
			const relativePath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
			result.push({
				name: entry.name,
				path: entry.path,
				is_dir: entry.is_dir,
				parentPath: parentPath || ''
			});
			if (entry.children) {
				result.push(...flattenTree(entry.children, relativePath));
			}
		}
		return result;
	}

	const queryClient = useQueryClient();

	const fileTreeQuery = createQuery<FileTreeData>(() => ({
		queryKey: ['fileTree'],
		queryFn: async () => {
			const files = await invoke<FileEntry[]>('get_file_tree');
			return { files, flat: flattenTree(files) };
		},
		enabled: open,
		staleTime: 60_000
	}));

	const openFileMutation = createMutation<boolean, void, { path: string; name: string }>(() => ({
		mutationFn: async ({ path, name }) => {
			await openFile(path, name);
			return true;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['fileTree'] });
		}
	}));

	function fuzzyMatch(q: string, text: string): { match: boolean; score: number } {
		if (!q) return { match: true, score: 0 };

		const ql = q.toLowerCase();
		const tl = text.toLowerCase();

		if (tl.includes(ql)) {
			const idx = tl.indexOf(ql);
			return { match: true, score: idx === 0 ? 100 : 50 - idx };
		}

		let qi = 0;
		let score = 0;
		let lastMatchIdx = -1;

		for (let ti = 0; ti < tl.length && qi < ql.length; ti++) {
			if (tl[ti] === ql[qi]) {
				qi++;
				score += lastMatchIdx === ti - 1 ? 10 : 1;
				lastMatchIdx = ti;
			}
		}

		return qi === ql.length ? { match: true, score } : { match: false, score: 0 };
	}

	let filteredFiles = $derived.by(() => {
		const flat = fileTreeQuery.data?.flat ?? [];
		if (!searchQuery.trim()) return flat.filter((f) => !f.is_dir).slice(0, 50);

		return flat
			.map((f) => {
				const searchPath = f.parentPath ? `${f.parentPath}/${f.name}` : f.name;
				const { match, score } = fuzzyMatch(searchQuery, searchPath);
				return { ...f, score, match };
			})
			.filter((f) => f.match)
			.sort((a, b) => b.score - a.score)
			.slice(0, 50);
	});

	let isLoading = $derived(fileTreeQuery.isPending || fileTreeQuery.isLoading);
	let isMutating = $derived(openFileMutation.isPending);

	function selectFile(file: FlatFile) {
		if (!file.is_dir && !isMutating) {
			openFileMutation.mutate({ path: file.path, name: file.name });
			open = false;
			searchQuery = '';
			selectedIndex = 0;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, filteredFiles.length - 1);
			scrollToSelected();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
			scrollToSelected();
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (filteredFiles[selectedIndex]) {
				selectFile(filteredFiles[selectedIndex]);
			}
		} else if (e.key === 'Escape') {
			open = false;
			searchQuery = '';
			selectedIndex = 0;
		}
	}

	function scrollToSelected() {
		tick().then(() => {
			const item = listEl?.querySelector(`[data-index="${selectedIndex}"]`);
			item?.scrollIntoView({ block: 'nearest' });
		});
	}

	function highlightMatch(text: string, q: string): string {
		if (!q) return text;
		const idx = text.toLowerCase().indexOf(q.toLowerCase());
		if (idx === -1) return text;
		return (
			text.slice(0, idx) +
			`<mark class="bg-primary/30 text-foreground rounded-sm">${text.slice(idx, idx + q.length)}</mark>` +
			text.slice(idx + q.length)
		);
	}

	function getDisplayPath(file: FlatFile): string {
		return file.parentPath ? `${file.parentPath}/${file.name}` : file.name;
	}

	$effect(() => {
		searchQuery;
		selectedIndex = 0;
	});

	$effect(() => {
		if (open) {
			tick().then(() => inputEl?.focus());
		}
	});

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			open = false;
			searchQuery = '';
			selectedIndex = 0;
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh]"
		role="dialog"
		tabindex="-1"
		onkeydown={handleKeydown}
		onclick={handleOverlayClick}
	>
		<div
			class="w-full max-w-lg overflow-hidden rounded-xl border bg-background shadow-2xl"
			role="document"
		>
			<div class="flex items-center gap-3 border-b px-4 py-3">
				{#if isLoading || isMutating}
					<Loader2 class="h-4 w-4 animate-spin text-muted-foreground" />
				{:else}
					<Search class="h-4 w-4 text-muted-foreground" />
				{/if}
				<input
					bind:this={inputEl}
					bind:value={searchQuery}
					placeholder="Search files..."
					class="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
					disabled={isMutating}
				/>
				<kbd
					class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
				>
					ESC
				</kbd>
			</div>

			<div bind:this={listEl} class="max-h-[40vh] overflow-y-auto p-1">
				{#if isLoading}
					<div class="py-8 text-center text-sm text-muted-foreground">Loading files...</div>
				{:else if filteredFiles.length === 0}
					<div class="py-8 text-center text-sm text-muted-foreground">No files found</div>
				{:else}
					{#each filteredFiles as file, i}
						<button
							data-index={i}
							class="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors {i ===
							selectedIndex
								? 'bg-accent text-accent-foreground'
								: 'hover:bg-muted'}"
							onclick={() => selectFile(file)}
							onmouseenter={() => (selectedIndex = i)}
							disabled={isMutating}
						>
							{#if file.is_dir}
								<Folder class="h-4 w-4 shrink-0 text-muted-foreground" />
							{:else}
								<FileText class="h-4 w-4 shrink-0 text-muted-foreground" />
							{/if}
							<span class="truncate">
								{@html highlightMatch(getDisplayPath(file), searchQuery)}
							</span>
							{#if i === selectedIndex && isMutating}
								<Loader2 class="ml-auto h-3 w-3 animate-spin text-muted-foreground" />
							{/if}
						</button>
					{/each}
				{/if}
			</div>

			<div class="flex items-center gap-4 border-t px-4 py-2 text-[10px] text-muted-foreground">
				<span class="flex items-center gap-1">
					<ArrowUp class="h-3 w-3" /><ArrowDown class="h-3 w-3" /> navigate
				</span>
				<span class="flex items-center gap-1">
					<CornerDownLeft class="h-3 w-3" /> open
				</span>
				{#if isMutating}
					<span class="ml-auto text-primary">Opening...</span>
				{:else}
					<span class="ml-auto">{filteredFiles.length} files</span>
				{/if}
			</div>
		</div>
	</div>
{/if}
