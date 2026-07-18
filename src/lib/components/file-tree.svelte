<script lang="ts">
	import {
		fileTree,
		openFile,
		createNewFile,
		deleteFileByPath,
		renameFileByPath,
		loadFileTree,
		type FileEntry
	} from '$lib/stores/setup';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import { Button } from '$lib/components/ui/button';
	import {
		ChevronRight,
		FolderOpen,
		FileText,
		Plus,
		Trash2,
		Pencil,
		RefreshCw
	} from '@lucide/svelte';
	import InputDialog from '$lib/components/input-dialog.svelte';
	import ConfirmDialog from '$lib/components/confirm-dialog.svelte';

	let inputDialogOpen = $state(false);
	let inputDialogTitle = $state('');
	let inputDialogPlaceholder = $state('');
	let inputDialogValue = $state('');
	let inputDialogCallback: ((value: string) => void) | null = $state(null);

	let confirmDialogOpen = $state(false);
	let confirmDialogTitle = $state('');
	let confirmDialogMessage = $state('');
	let confirmDialogCallback: (() => void) | null = $state(null);

	function showInputDialog(title: string, placeholder: string, callback: (value: string) => void) {
		inputDialogTitle = title;
		inputDialogPlaceholder = placeholder;
		inputDialogValue = '';
		inputDialogCallback = callback;
		inputDialogOpen = true;
	}

	function showConfirmDialog(title: string, message: string, callback: () => void) {
		confirmDialogTitle = title;
		confirmDialogMessage = message;
		confirmDialogCallback = callback;
		confirmDialogOpen = true;
	}

	function handleInputConfirm(value: string) {
		inputDialogCallback?.(value);
		inputDialogCallback = null;
	}

	function handleConfirm() {
		confirmDialogCallback?.();
		confirmDialogCallback = null;
	}

	function startRename(entry: FileEntry) {
		showInputDialog('Rename', entry.name, async (newName) => {
			await renameFileByPath(entry.path, newName);
		});
	}

	function startCreate(parentPath: string) {
		const placeholder = parentPath ? `${parentPath}/filename.md` : 'filename.md';
		showInputDialog('New File', placeholder, async (name) => {
			await createNewFile(parentPath, name);
		});
	}

	function confirmDelete(path: string, name: string) {
		showConfirmDialog('Delete File', `Are you sure you want to delete "${name}"?`, async () => {
			await deleteFileByPath(path);
		});
	}

	function handleRefresh() {
		loadFileTree();
	}

	function handleNewRootFile() {
		startCreate('');
	}
</script>

<div class="flex h-full flex-col">
	<div class="flex items-center justify-between border-b px-3 py-2">
		<span class="text-xs font-medium uppercase text-muted-foreground">Files</span>
		<Button variant="ghost" size="icon" class="h-6 w-6" onclick={() => startCreate('')}>
			<Plus class="h-3.5 w-3.5" />
		</Button>
	</div>

	<ContextMenu.Root>
		<ContextMenu.Trigger class="flex-1 overflow-auto p-1">
			{#each $fileTree as entry}
				{@render fileNode(entry)}
			{/each}
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.Item onclick={handleNewRootFile}>
				<Plus class="mr-2 h-3.5 w-3.5" /> New File
			</ContextMenu.Item>
			<ContextMenu.Item onclick={handleRefresh}>
				<RefreshCw class="mr-2 h-3.5 w-3.5" /> Refresh
			</ContextMenu.Item>
		</ContextMenu.Content>
	</ContextMenu.Root>
</div>

<InputDialog
	bind:open={inputDialogOpen}
	title={inputDialogTitle}
	placeholder={inputDialogPlaceholder}
	bind:value={inputDialogValue}
	onconfirm={handleInputConfirm}
/>

<ConfirmDialog
	bind:open={confirmDialogOpen}
	title={confirmDialogTitle}
	message={confirmDialogMessage}
	confirmText="yes"
	onconfirm={handleConfirm}
/>

{#snippet fileNode(entry: FileEntry)}
	{#if entry.is_dir}
		<ContextMenu.Root>
			<ContextMenu.Trigger class="w-full">
				<Collapsible.Root open>
					<Collapsible.Trigger
						class="flex w-full items-center gap-1 rounded-md px-1 py-0.5 text-sm hover:bg-accent [&[data-state=open]>svg:first-child]:rotate-90"
					>
						<ChevronRight class="h-3.5 w-3.5 shrink-0 transition-transform" />
						<FolderOpen class="h-4 w-4 shrink-0 text-muted-foreground" />
						<span class="truncate">{entry.name}</span>
					</Collapsible.Trigger>

					<Collapsible.Content class="pl-3">
						{#if entry.children}
							{#each entry.children as child}
								{@render fileNode(child)}
							{/each}
						{/if}
					</Collapsible.Content>
				</Collapsible.Root>
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<ContextMenu.Item onclick={() => startCreate(entry.path)}>
					<Plus class="mr-2 h-3.5 w-3.5" /> New File
				</ContextMenu.Item>
				<ContextMenu.Item onclick={() => startRename(entry)}>
					<Pencil class="mr-2 h-3.5 w-3.5" /> Rename
				</ContextMenu.Item>
				<ContextMenu.Separator />
				<ContextMenu.Item
					class="text-destructive"
					onclick={() => confirmDelete(entry.path, entry.name)}
				>
					<Trash2 class="mr-2 h-3.5 w-3.5" /> Delete
				</ContextMenu.Item>
			</ContextMenu.Content>
		</ContextMenu.Root>
	{:else}
		<ContextMenu.Root>
			<ContextMenu.Trigger class="w-full">
				<button
					class="flex w-full items-center gap-1 rounded-md px-1 py-0.5 text-sm hover:bg-accent"
					onclick={() => openFile(entry.path, entry.name)}
				>
					<FileText class="h-4 w-4 shrink-0 text-muted-foreground" />
					<span class="truncate">{entry.name}</span>
				</button>
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<ContextMenu.Item onclick={() => openFile(entry.path, entry.name)}>
					<FileText class="mr-2 h-3.5 w-3.5" /> Open
				</ContextMenu.Item>
				<ContextMenu.Separator />
				<ContextMenu.Item onclick={() => startRename(entry)}>
					<Pencil class="mr-2 h-3.5 w-3.5" /> Rename
				</ContextMenu.Item>
				<ContextMenu.Item
					class="text-destructive"
					onclick={() => confirmDelete(entry.path, entry.name)}
				>
					<Trash2 class="mr-2 h-3.5 w-3.5" /> Delete
				</ContextMenu.Item>
			</ContextMenu.Content>
		</ContextMenu.Root>
	{/if}
{/snippet}
