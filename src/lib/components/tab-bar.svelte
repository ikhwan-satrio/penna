<script lang="ts">
	import { openTabs, activeTabPath, closeTab, saveActiveTab } from '$lib/stores/setup';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { X, Circle, FileText } from '@lucide/svelte';

	let confirmDialogOpen = $state(false);
	let pendingClosePath = $state('');

	function selectTab(path: string) {
		activeTabPath.set(path);
	}

	function handleClose(e: Event, path: string) {
		e.stopPropagation();
		const tab = $openTabs.find((t) => t.path === path);
		if (tab?.dirty) {
			pendingClosePath = path;
			confirmDialogOpen = true;
		} else {
			closeTab(path);
		}
	}

	function handleSaveAndClose() {
		const tab = $openTabs.find((t) => t.path === pendingClosePath);
		if (tab) {
			activeTabPath.set(pendingClosePath);
			saveActiveTab().then(() => {
				closeTab(pendingClosePath);
				pendingClosePath = '';
			});
		}
	}

	function handleDiscardAndClose() {
		closeTab(pendingClosePath);
		pendingClosePath = '';
	}
</script>

<div class="flex items-center overflow-x-auto border-b bg-background">
	{#each $openTabs as tab (tab.path)}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<div
					role="tab"
					tabindex="0"
					class="group flex cursor-pointer items-center gap-1.5 border-r px-3 py-2 text-sm transition-colors
						{tab.path === $activeTabPath
						? 'border-border bg-background text-foreground'
						: 'border-transparent text-muted-foreground hover:bg-accent'}"
					onclick={() => selectTab(tab.path)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') selectTab(tab.path);
					}}
				>
					{#if tab.dirty}
						<Circle class="h-2 w-2 fill-muted-foreground" />
					{:else}
						<FileText class="h-3.5 w-3.5 text-muted-foreground" />
					{/if}
					<span class="max-w-[120px] truncate">{tab.name}</span>
					<span
						role="button"
						tabindex="0"
						class="ml-1 hidden cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground group-hover:block"
						onclick={(e) => handleClose(e, tab.path)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') handleClose(e, tab.path);
						}}
					>
						<X class="h-3 w-3" />
					</span>
				</div>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Item onclick={() => saveActiveTab()}>Save</DropdownMenu.Item>
				<DropdownMenu.Item onclick={(e) => handleClose(e, tab.path)}>Close</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{/each}
</div>

<Dialog.Root bind:open={confirmDialogOpen}>
	<Dialog.Content class="sm:max-w-[400px]">
		<Dialog.Header>
			<Dialog.Title>Unsaved Changes</Dialog.Title>
			<Dialog.Description>
				"{pendingClosePath.split('/').pop() ?? ''}" has unsaved changes. What would you like to do?
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="flex flex-row gap-2 sm:justify-end">
			<Button variant="outline" onclick={() => (confirmDialogOpen = false)}>Cancel</Button>
			<Button variant="destructive" onclick={handleDiscardAndClose}>Discard</Button>
			<Button onclick={handleSaveAndClose}>Save & Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
