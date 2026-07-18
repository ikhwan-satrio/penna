<script lang="ts">
	import { tick } from 'svelte';

	let {
		triggerKey = $bindable(''),
		visible = $bindable(false),
		timeout = 3000,
		x = $bindable(0),
		y = $bindable(0)
	}: {
		triggerKey: string;
		visible: boolean;
		timeout?: number;
		x: number;
		y: number;
	} = $props();

	interface WhichKeyItem {
		key: string;
		label: string;
	}

	interface WhichKeyGroup {
		title: string;
		items: WhichKeyItem[];
	}

	const operatorMaps: Record<string, WhichKeyGroup[]> = {
		d: [
			{
				title: 'Delete',
				items: [
					{ key: 'w', label: 'word' },
					{ key: 'W', label: 'WORD' },
					{ key: 'e', label: 'end of word' },
					{ key: 'E', label: 'end of WORD' },
					{ key: 'b', label: 'back word' },
					{ key: 'B', label: 'back WORD' },
					{ key: '$', label: 'to end of line' },
					{ key: '0', label: 'to start of line' },
					{ key: '^', label: 'first non-blank' },
					{ key: 'd', label: 'line' },
					{ key: 'i', label: 'inner ...' },
					{ key: 'a', label: 'a ...' },
					{ key: 'f', label: 'to char (forward)' },
					{ key: 't', label: 'till char (forward)' },
					{ key: 'F', label: 'to char (backward)' },
					{ key: 'T', label: 'till char (backward)' },
					{ key: 'G', label: 'to end of file' },
					{ key: '}', label: 'next paragraph' },
					{ key: '{', label: 'prev paragraph' }
				]
			}
		],
		c: [
			{
				title: 'Change',
				items: [
					{ key: 'w', label: 'word' },
					{ key: 'W', label: 'WORD' },
					{ key: 'e', label: 'end of word' },
					{ key: 'E', label: 'end of WORD' },
					{ key: 'b', label: 'back word' },
					{ key: 'B', label: 'back WORD' },
					{ key: '$', label: 'to end of line' },
					{ key: '0', label: 'to start of line' },
					{ key: '^', label: 'first non-blank' },
					{ key: 'c', label: 'line' },
					{ key: 'i', label: 'inner ...' },
					{ key: 'a', label: 'a ...' },
					{ key: 'f', label: 'to char (forward)' },
					{ key: 't', label: 'till char (forward)' },
					{ key: 'F', label: 'to char (backward)' },
					{ key: 'T', label: 'till char (backward)' }
				]
			}
		],
		y: [
			{
				title: 'Yank',
				items: [
					{ key: 'w', label: 'word' },
					{ key: 'W', label: 'WORD' },
					{ key: 'e', label: 'end of word' },
					{ key: 'E', label: 'end of WORD' },
					{ key: 'b', label: 'back word' },
					{ key: 'B', label: 'back WORD' },
					{ key: '$', label: 'to end of line' },
					{ key: '0', label: 'to start of line' },
					{ key: '^', label: 'first non-blank' },
					{ key: 'y', label: 'line' },
					{ key: 'i', label: 'inner ...' },
					{ key: 'a', label: 'a ...' },
					{ key: 'f', label: 'to char (forward)' },
					{ key: 't', label: 'till char (forward)' },
					{ key: 'F', label: 'to char (backward)' },
					{ key: 'T', label: 'till char (backward)' }
				]
			}
		],
		'>': [
			{
				title: 'Indent',
				items: [
					{ key: '>', label: 'line' },
					{ key: 'w', label: 'word' },
					{ key: 'W', label: 'WORD' },
					{ key: 'i', label: 'inner ...' },
					{ key: 'a', label: 'a ...' }
				]
			}
		],
		'<': [
			{
				title: 'Unindent',
				items: [
					{ key: '<', label: 'line' },
					{ key: 'w', label: 'word' },
					{ key: 'W', label: 'WORD' },
					{ key: 'i', label: 'inner ...' },
					{ key: 'a', label: 'a ...' }
				]
			}
		],
		g: [
			{
				title: 'g...',
				items: [
					{ key: 'g', label: 'go to line' },
					{ key: 'w', label: 'next word (no wrap)' },
					{ key: 'e', label: 'end of word (no wrap)' },
					{ key: 'b', label: 'back word (no wrap)' },
					{ key: 'j', label: 'move line down' },
					{ key: 'k', label: 'move line up' },
					{ key: 'u', label: 'lowercase' },
					{ key: 'U', label: 'uppercase' },
					{ key: '~', label: 'toggle case' }
				]
			}
		],
		z: [
			{
				title: 'z...',
				items: [
					{ key: 'z', label: 'center cursor' },
					{ key: 't', label: 'cursor at top' },
					{ key: 'b', label: 'cursor at bottom' },
					{ key: 'H', label: 'cursor at top of screen' },
					{ key: 'M', label: 'cursor at middle of screen' },
					{ key: 'L', label: 'cursor at bottom of screen' },
					{ key: 'o', label: 'fold toggle' },
					{ key: 'O', label: 'fold toggle (recursive)' },
					{ key: 'a', label: 'spell suggest' },
					{ key: '=', label: 'indent' },
					{ key: '-', label: 'unindent' }
				]
			}
		],
		"'": [
			{
				title: 'Mark',
				items: [
					{ key: 'a-z', label: 'set mark a-z' },
					{ key: 'a-z', label: 'go to mark a-z' }
				]
			}
		],
		m: [
			{
				title: 'Mark',
				items: [{ key: 'a-z', label: 'set mark a-z' }]
			}
		],
		f: [
			{
				title: 'Find char forward',
				items: [{ key: '{char}', label: 'to next {char}' }]
			}
		],
		t: [
			{
				title: 'Till char forward',
				items: [{ key: '{char}', label: 'till next {char}' }]
			}
		],
		F: [
			{
				title: 'Find char backward',
				items: [{ key: '{char}', label: 'to prev {char}' }]
			}
		],
		T: [
			{
				title: 'Till char backward',
				items: [{ key: '{char}', label: 'till prev {char}' }]
			}
		]
	};

	let items = $derived(operatorMaps[triggerKey] ?? []);
	let timer: ReturnType<typeof setTimeout>;

	$effect(() => {
		if (visible) {
			clearTimeout(timer);
			timer = setTimeout(() => {
				visible = false;
			}, timeout);
		}
		return () => clearTimeout(timer);
	});

	function dismiss() {
		visible = false;
	}
</script>

{#if visible && items.length > 0}
	<div
		class="fixed z-[100] min-w-[180px] rounded-lg border bg-popover p-1.5 shadow-xl"
		style="left: {x}px; top: {y}px;"
		role="tooltip"
	>
		{#each items as group}
			<div
				class="mb-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
			>
				{group.title}
			</div>
			{#each group.items as item}
				<div class="flex items-center gap-2 rounded-md px-2 py-0.5 text-xs">
					<kbd
						class="inline-flex h-5 min-w-[20px] items-center justify-center rounded border bg-muted px-1 font-mono text-[10px] font-bold text-foreground"
					>
						{item.key}
					</kbd>
					<span class="text-muted-foreground">{item.label}</span>
				</div>
			{/each}
		{/each}
	</div>
{/if}
