<script lang="ts">
	import { Marked as MarkedParser } from 'marked';
	import { gfmHeadingId } from 'marked-gfm-heading-id';
	import { markedHighlight } from 'marked-highlight';
	import { openFile } from '$lib/stores/setup';
	import { open } from '@tauri-apps/plugin-shell';
	import hljs from 'highlight.js';
	import ContextMenuWrapper from '$lib/components/context-menu-wrapper.svelte';
	import { Copy, ListChecks, ZoomIn, ZoomOut, RotateCcw } from '@lucide/svelte';

	const marked = new MarkedParser(
		gfmHeadingId(),
		markedHighlight({
			langPrefix: 'hljs language-',
			highlight(code, lang) {
				if (lang && hljs.getLanguage(lang)) {
					try {
						return hljs.highlight(code, { language: lang }).value;
					} catch {
						// fallback
					}
				}
				return hljs.highlightAuto(code).value;
			}
		})
	);

	let { content }: { content: string } = $props();
	let zoomLevel = $state(100);

	function processWikiLinks(html: string): string {
		return html.replace(/\[\[([^\]]+)\]\]/g, (_match, linkName) => {
			return `<a class="wiki-link" data-link="${linkName}" href="javascript:void(0)">${linkName}</a>`;
		});
	}

	let html = $derived(processWikiLinks(marked.parse(content) as string));

	function handleClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.classList.contains('wiki-link')) {
			const linkName = target.getAttribute('data-link');
			if (linkName) {
				resolveAndOpen(linkName);
			}
			return;
		}
		if (target.tagName === 'A') {
			const href = target.getAttribute('href');
			if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
				e.preventDefault();
				open(href);
			}
		}
	}

	async function resolveAndOpen(linkName: string) {
		try {
			const { resolveWikiLink } = await import('$lib/stores/setup');
			const filePath = await resolveWikiLink(linkName);
			if (filePath) {
				const name = filePath.split('/').pop() ?? linkName;
				await openFile(filePath, name);
			} else {
				console.warn('Wiki link not found:', linkName);
			}
		} catch (e) {
			console.error('Failed to resolve wiki link:', e);
		}
	}

	function handleCopy() {
		const selection = window.getSelection();
		if (selection) {
			navigator.clipboard.writeText(selection.toString());
		}
	}

	function handleSelectAll() {
		const range = document.createRange();
		const el = document.querySelector('.prose');
		if (el) {
			range.selectNodeContents(el);
			const selection = window.getSelection();
			selection?.removeAllRanges();
			selection?.addRange(range);
		}
	}

	function handleZoomIn() {
		zoomLevel = Math.min(zoomLevel + 10, 200);
	}

	function handleZoomOut() {
		zoomLevel = Math.max(zoomLevel - 10, 50);
	}

	function handleZoomReset() {
		zoomLevel = 100;
	}

	const contextItems = [
		{ label: 'Copy', icon: Copy, shortcut: 'Ctrl+C', action: handleCopy },
		{ label: 'Select All', icon: ListChecks, shortcut: 'Ctrl+A', action: handleSelectAll },
		{ separator: true, label: '' },
		{ label: 'Zoom In', icon: ZoomIn, shortcut: 'Ctrl++', action: handleZoomIn },
		{ label: 'Zoom Out', icon: ZoomOut, shortcut: 'Ctrl+-', action: handleZoomOut },
		{ label: 'Reset Zoom', icon: RotateCcw, shortcut: 'Ctrl+0', action: handleZoomReset }
	];
</script>

<div class="flex h-full flex-col">
	<div class="flex items-center border-b bg-background px-3 py-1">
		<span class="text-xs text-muted-foreground">Preview</span>
		<span class="ml-auto text-xs text-muted-foreground">{zoomLevel}%</span>
	</div>
	<ContextMenuWrapper items={contextItems} wrapperClass="flex-1 h-full w-full">
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="prose prose-base dark:prose-invert max-w-none h-full w-full overflow-auto p-4"
			style="zoom: {zoomLevel / 100}"
			role="article"
			tabindex="-1"
			onclick={handleClick}
			onkeydown={() => {}}
		>
			{@html html}
		</div>
	</ContextMenuWrapper>
</div>

<style>
	:global(.wiki-link) {
		color: var(--color-primary);
		text-decoration: underline;
		cursor: pointer;
	}
	:global(.wiki-link:hover) {
		color: oklch(from var(--color-primary) l c h / 0.7);
	}
</style>
