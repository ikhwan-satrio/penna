<script lang="ts">
	import { onMount } from 'svelte';
	import {
		isLoading,
		isSetupComplete,
		loadVaultPath,
		vaultPath,
		loadFileTree,
		activeTab,
		activeTabPath,
		saveActiveTab,
		openTabs,
		updateTabContent
	} from '$lib/stores/setup';
	import { settings } from '$lib/stores/settings';
	import SetupDialog from '$lib/components/setup-dialog.svelte';
	import FileTree from '$lib/components/file-tree.svelte';
	import MarkdownEditor from '$lib/components/markdown-editor.svelte';
	import MarkdownPreview from '$lib/components/markdown-preview.svelte';
	import TabBar from '$lib/components/tab-bar.svelte';
	import SettingsDialog from '$lib/components/settings-dialog.svelte';
	import ContextMenuWrapper from '$lib/components/context-menu-wrapper.svelte';
	import FileFinder from '$lib/components/file-finder.svelte';
	import {
		Save,
		FolderOpen,
		Settings,
		PanelLeftClose,
		PanelLeft,
		Eye,
		EyeOff,
		FolderPlus,
		RefreshCw,
		SidebarOpen,
		SidebarClose
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { PaneGroup, Pane, PaneResizer } from 'paneforge';
	import { createHotkey } from '@tanstack/svelte-hotkeys';

	let showSetup = $state(false);
	let showSettings = $state(false);
	let showSidebar = $state(true);
	let showEditor = $state(true);
	let showPreview = $state(true);
	let showFinder = $state(false);

	onMount(async () => {
		await loadVaultPath();
		if (!$isSetupComplete) {
			showSetup = true;
		} else if ($vaultPath) {
			await loadFileTree();
		}

		settings.subscribe(() => {});
	});

	$effect(() => {
		if ($isSetupComplete && $vaultPath) {
			loadFileTree();
		}
	});

	function handleEditorInput() {
		if ($activeTabPath) {
			const tabs = $openTabs;
			const tab = tabs.find((t) => t.path === $activeTabPath);
			if (tab) {
				updateTabContent($activeTabPath, tab.content);
			}
		}
	}

	async function handleSave() {
		await saveActiveTab();
	}

	function handleNewFile() {
		const event = new CustomEvent('filetree:newfile');
		window.dispatchEvent(event);
	}

	function handleRefresh() {
		loadFileTree();
	}

	createHotkey('Mod+S', () => {
		handleSave();
	});

	createHotkey('Mod+P', () => {
		showFinder = !showFinder;
	});

	createHotkey('Mod+N', () => {
		handleNewFile();
	});

	createHotkey('Mod+B', () => {
		showSidebar = !showSidebar;
	});

	const topbarItems = [
		{ label: 'New File', icon: FolderPlus, action: handleNewFile, shortcut: 'Ctrl+N' },
		{ label: 'Save', icon: Save, action: handleSave, shortcut: 'Ctrl+S' },
		{ separator: true, label: '' },
		{ label: 'Refresh', icon: RefreshCw, action: handleRefresh },
		{ separator: true, label: '' },
		{ label: 'Settings', icon: Settings, action: () => (showSettings = true) }
	];
</script>

{#if $isLoading}
	<div class="flex h-screen items-center justify-center">
		<p class="text-muted-foreground">Memuat...</p>
	</div>
{:else if !$isSetupComplete}
	<SetupDialog bind:open={showSetup} />
{:else}
	<div class="flex h-screen flex-col">
		<ContextMenuWrapper items={topbarItems}>
			<div data-tauri-drag-region class="flex h-8 items-center justify-between border-b px-3">
				<span class="select-none text-xs text-muted-foreground">Penna</span>
				<div class="flex items-center gap-1">
					{#if $activeTab?.dirty}
						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger>
									<Button variant="ghost" size="icon" class="h-6 w-6" onclick={handleSave}>
										<Save class="h-3.5 w-3.5" />
									</Button>
								</Tooltip.Trigger>
								<Tooltip.Content>Save (Ctrl+S)</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					{/if}

					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger>
								<Button
									variant="ghost"
									size="icon"
									class="h-6 w-6"
									onclick={() => (showSidebar = !showSidebar)}
								>
									{#if showSidebar}
										<SidebarClose class="h-3.5 w-3.5" />
									{:else}
										<SidebarOpen class="h-3.5 w-3.5" />
									{/if}
								</Button>
							</Tooltip.Trigger>
							<Tooltip.Content>{showSidebar ? 'Hide' : 'Show'} Sidebar (Ctrl+B)</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>

					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger>
								<Button
									variant="ghost"
									size="icon"
									class="h-6 w-6"
									onclick={() => (showEditor = !showEditor)}
								>
									{#if showEditor}
										<PanelLeftClose class="h-3.5 w-3.5" />
									{:else}
										<PanelLeft class="h-3.5 w-3.5" />
									{/if}
								</Button>
							</Tooltip.Trigger>
							<Tooltip.Content>{showEditor ? 'Hide' : 'Show'} Editor</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>

					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger>
								<Button
									variant="ghost"
									size="icon"
									class="h-6 w-6"
									onclick={() => (showPreview = !showPreview)}
								>
									{#if showPreview}
										<Eye class="h-3.5 w-3.5" />
									{:else}
										<EyeOff class="h-3.5 w-3.5" />
									{/if}
								</Button>
							</Tooltip.Trigger>
							<Tooltip.Content>{showPreview ? 'Hide' : 'Show'} Preview</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>

					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger>
								<Button
									variant="ghost"
									size="icon"
									class="h-6 w-6"
									onclick={() => (showSettings = true)}
								>
									<Settings class="h-3.5 w-3.5" />
								</Button>
							</Tooltip.Trigger>
							<Tooltip.Content>Settings</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				</div>
			</div>
		</ContextMenuWrapper>

		<div class="flex flex-1 overflow-hidden">
			<PaneGroup direction="horizontal">
				{#if showSidebar}
					<Pane defaultSize={12} minSize={8} maxSize={20}>
						<FileTree />
					</Pane>
					<PaneResizer class="w-1 bg-border hover:bg-primary/50 transition-colors" />
				{/if}
				<Pane defaultSize={showSidebar ? 88 : 100} minSize={30}>
					<div class="flex h-full flex-col">
						{#if $openTabs.length > 0}
							<TabBar />
							{#if showEditor && showPreview}
								<PaneGroup direction="horizontal" class="flex-1">
									<Pane defaultSize={50} minSize={20}>
										<MarkdownEditor
											path={$activeTab?.path ?? ''}
											content={$activeTab?.content ?? ''}
											oninput={handleEditorInput}
										/>
									</Pane>
									<PaneResizer class="w-1 bg-border hover:bg-primary/50 transition-colors" />
									<Pane defaultSize={50} minSize={20}>
										<MarkdownPreview content={$activeTab?.content ?? ''} />
									</Pane>
								</PaneGroup>
							{:else if showEditor}
								<div class="flex-1 overflow-hidden">
									<MarkdownEditor
										path={$activeTab?.path ?? ''}
										content={$activeTab?.content ?? ''}
										oninput={handleEditorInput}
									/>
								</div>
							{:else if showPreview}
								<div class="flex-1 overflow-hidden">
									<MarkdownPreview content={$activeTab?.content ?? ''} />
								</div>
							{/if}
						{:else}
							<div class="flex flex-1 items-center justify-center">
								<div class="text-center text-muted-foreground">
									<FolderOpen class="mx-auto mb-2 h-8 w-8 opacity-50" />
									<p class="text-sm">Select a file to start editing</p>
								</div>
							</div>
						{/if}
					</div>
				</Pane>
			</PaneGroup>
		</div>
	</div>
{/if}

<SettingsDialog bind:open={showSettings} />
<FileFinder bind:open={showFinder} />
