<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createMarkdownEditor, type VimMode } from '$lib/editor/setup';
	import type { EditorView } from '@codemirror/view';
	import { updateTabContent, saveActiveTab } from '$lib/stores/setup';
	import ContextMenuWrapper from '$lib/components/context-menu-wrapper.svelte';
	import WhichKey from '$lib/components/which-key.svelte';
	import { Copy, Scissors, ClipboardPaste, Search, Save, ListChecks } from '@lucide/svelte';

	let {
		path,
		content,
		oninput
	}: {
		path: string;
		content: string;
		oninput?: () => void;
	} = $props();

	let editorContainer: HTMLDivElement;
	let editor: EditorView | null = null;
	// svelte-ignore state_referenced_locally
	let lastPath = path;
	let vimMode = $state<VimMode>('normal');

	let whichKeyVisible = $state(false);
	let whichKeyKey = $state('');
	let whichKeyX = $state(0);
	let whichKeyY = $state(0);

	const whichKeyOperators = new Set([
		'd',
		'c',
		'y',
		'>',
		'<',
		'g',
		'z',
		"'",
		'm',
		'f',
		't',
		'F',
		'T'
	]);

	function getModeColor(mode: VimMode): string {
		if (mode.startsWith('visual')) return 'bg-purple-500/20 text-purple-400';
		if (mode === 'insert') return 'bg-blue-500/20 text-blue-400';
		if (mode === 'replace') return 'bg-red-500/20 text-red-400';
		if (mode === 'ex') return 'bg-amber-500/20 text-amber-400';
		return 'bg-emerald-500/20 text-emerald-400';
	}

	function getModeLabel(mode: VimMode): string {
		if (mode === 'visual') return 'VISUAL';
		if (mode === 'visual line') return 'V-LINE';
		if (mode === 'visual block') return 'V-BLOCK';
		return mode.toUpperCase();
	}

	function handleChange(value: string) {
		updateTabContent(path, value);
		oninput?.();
	}

	function handleVimModeChange(mode: VimMode) {
		vimMode = mode;
		if (mode !== 'normal') {
			whichKeyVisible = false;
		}
	}

	function getCursorScreenPos(): { x: number; y: number } {
		if (!editor) return { x: 0, y: 0 };
		const pos = editor.state.selection.main.head;
		const coords = editor.coordsAtPos(pos);
		if (coords) {
			return { x: coords.left, y: coords.bottom + 4 };
		}
		return { x: 0, y: 0 };
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (vimMode !== 'normal') return;
		if (whichKeyVisible) return;

		if (whichKeyOperators.has(e.key)) {
			const pos = getCursorScreenPos();
			whichKeyX = pos.x;
			whichKeyY = pos.y;
			whichKeyKey = e.key;
			whichKeyVisible = true;
		}
	}

	onMount(() => {
		if (editorContainer) {
			editor = createMarkdownEditor(editorContainer, content, handleChange, handleVimModeChange);
			editorContainer.addEventListener('keydown', handleKeyDown);
		}
	});

	onDestroy(() => {
		editorContainer?.removeEventListener('keydown', handleKeyDown);
		editor?.destroy();
	});

	$effect(() => {
		if (editor && lastPath !== path) {
			editor.dispatch({
				changes: { from: 0, to: editor.state.doc.length, insert: content }
			});
			lastPath = path;
		}
	});

	function handleCopy() {
		const sel = editor?.state.selection.main;
		if (sel && editor) {
			const text = editor.state.doc.sliceString(sel.from, sel.to);
			navigator.clipboard.writeText(text || editor.state.doc.toString());
		}
	}

	function handleCut() {
		const sel = editor?.state.selection.main;
		if (sel && editor) {
			const text = editor.state.doc.sliceString(sel.from, sel.to);
			navigator.clipboard.writeText(text);
			editor.dispatch({ changes: { from: sel.from, to: sel.to, insert: '' } });
		}
	}

	function handlePaste() {
		navigator.clipboard.readText().then((text) => {
			if (editor) {
				const sel = editor.state.selection.main;
				editor.dispatch({ changes: { from: sel.from, to: sel.to, insert: text } });
			}
		});
	}

	function handleSelectAll() {
		if (editor) {
			editor.dispatch({
				selection: { anchor: 0, head: editor.state.doc.length }
			});
		}
	}

	function handleFind() {
		editor?.dom.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true })
		);
	}

	function handleSave() {
		saveActiveTab();
	}

	const contextItems = [
		{ label: 'Cut', icon: Scissors, shortcut: 'Ctrl+X', action: handleCut },
		{ label: 'Copy', icon: Copy, shortcut: 'Ctrl+C', action: handleCopy },
		{ label: 'Paste', icon: ClipboardPaste, shortcut: 'Ctrl+V', action: handlePaste },
		{ separator: true, label: '' },
		{ label: 'Select All', icon: ListChecks, shortcut: 'Ctrl+A', action: handleSelectAll },
		{ label: 'Find', icon: Search, shortcut: 'Ctrl+F', action: handleFind },
		{ separator: true, label: '' },
		{ label: 'Save', icon: Save, shortcut: 'Ctrl+S', action: handleSave }
	];
</script>

<div class="flex h-full flex-col">
	<div class="flex items-center gap-2 border-b bg-background px-3 py-1">
		<span class="text-xs text-muted-foreground">Editor</span>
		<span
			class="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase leading-none {getModeColor(
				vimMode
			)}"
		>
			{getModeLabel(vimMode)}
		</span>
	</div>
	<ContextMenuWrapper items={contextItems} wrapperClass="flex-1 h-full w-full">
		<div bind:this={editorContainer} class="h-full w-full"></div>
	</ContextMenuWrapper>
</div>

<WhichKey
	bind:visible={whichKeyVisible}
	bind:triggerKey={whichKeyKey}
	bind:x={whichKeyX}
	bind:y={whichKeyY}
/>

<style>
	:global(.cm-editor) {
		height: 100% !important;
	}
	:global(.cm-scroller) {
		overflow: auto;
	}
</style>
