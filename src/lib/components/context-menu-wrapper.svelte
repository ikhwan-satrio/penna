<script lang="ts">
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import type { Snippet } from 'svelte';
	import type { Component } from 'svelte';

	let {
		children,
		items,
		wrapperClass = ''
	}: {
		children: Snippet;
		items: {
			label: string;
			icon?: Component;
			shortcut?: string;
			action?: () => void;
			variant?: 'default' | 'destructive';
			disabled?: boolean;
			separator?: boolean;
		}[];
		wrapperClass?: string;
	} = $props();
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger class={wrapperClass}>
		{@render children()}
	</ContextMenu.Trigger>
	<ContextMenu.Content>
		{#each items as item}
			{#if item.separator}
				<ContextMenu.Separator />
			{:else}
				<ContextMenu.Item
					class={item.variant === 'destructive' ? 'text-destructive' : ''}
					disabled={item.disabled}
					onclick={item.action}
				>
					{#if item.icon}
						{@const Icon = item.icon}
						<Icon class="mr-2 h-3.5 w-3.5" />
					{/if}
					{item.label}
					{#if item.shortcut}
						<ContextMenu.Shortcut>{item.shortcut}</ContextMenu.Shortcut>
					{/if}
				</ContextMenu.Item>
			{/if}
		{/each}
	</ContextMenu.Content>
</ContextMenu.Root>
