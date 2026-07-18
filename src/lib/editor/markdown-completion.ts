import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import { getWikiLinkCandidates } from '$lib/stores/setup';

let cachedCandidates: { name: string; path: string }[] = [];
let cacheLoaded = false;

export async function preloadWikiCandidates(): Promise<void> {
	if (cacheLoaded) return;
	cachedCandidates = await getWikiLinkCandidates();
	cacheLoaded = true;
}

export function invalidateWikiCache(): void {
	cacheLoaded = false;
	cachedCandidates = [];
}

function markdownCompletionSource(context: CompletionContext): CompletionResult | null {
	const line = context.state.doc.lineAt(context.pos);
	const textBefore = line.text.slice(0, context.pos - line.from);

	const atLineStart = textBefore.trim().length === 0 && textBefore.length === 0;

	if (atLineStart) {
		return {
			from: context.pos,
			options: [
				{ label: '# ', detail: 'Heading 1', type: 'keyword' },
				{ label: '## ', detail: 'Heading 2', type: 'keyword' },
				{ label: '### ', detail: 'Heading 3', type: 'keyword' },
				{ label: '#### ', detail: 'Heading 4', type: 'keyword' },
				{ label: '- ', detail: 'List item', type: 'keyword' },
				{ label: '* ', detail: 'List item', type: 'keyword' },
				{ label: '1. ', detail: 'Ordered list', type: 'keyword' },
				{ label: '- [ ] ', detail: 'Task (unchecked)', type: 'keyword' },
				{ label: '- [x] ', detail: 'Task (checked)', type: 'keyword' },
				{ label: '> ', detail: 'Blockquote', type: 'keyword' },
				{ label: '```', detail: 'Code block', type: 'keyword' },
				{ label: '---', detail: 'Horizontal rule', type: 'keyword' },
				{ label: '[[', detail: 'Wikilink', type: 'keyword' },
				{ label: '> [!note] ', detail: 'Callout', type: 'keyword' },
				{ label: '> [!tip] ', detail: 'Callout', type: 'keyword' },
				{ label: '> [!warning] ', detail: 'Callout', type: 'keyword' }
			]
		};
	}

	const wikiMatch = textBefore.match(/\[\[([^\]]*)$/);
	if (wikiMatch) {
		const query = wikiMatch[1].toLowerCase();
		const options: Completion[] = cachedCandidates
			.filter((c) => c.name.toLowerCase().includes(query))
			.slice(0, 20)
			.map((c) => ({
				label: c.name + ']]',
				detail: c.path,
				type: 'text'
			}));

		if (options.length === 0) {
			options.push({ label: ']]', detail: 'Close wikilink', type: 'text' });
		}

		return {
			from: context.pos - wikiMatch[1].length,
			options,
			validFor: /\[\[[^\]]*$/
		};
	}

	const inlineMatch = textBefore.match(/(^|\s)\[([^\]]*)$/);
	if (inlineMatch && !textBefore.endsWith('![')) {
		const query = inlineMatch[2];
		if (query.length === 0) {
			return {
				from: context.pos,
				options: [
					{ label: '](url)', detail: 'Markdown link', type: 'text' },
					{ label: '](url "title")', detail: 'Link with title', type: 'text' }
				],
				validFor: /\[[^\]]*$/
			};
		}
	}

	if (textBefore.endsWith('![', 2)) {
		return {
			from: context.pos,
			options: [{ label: '](url)', detail: 'Image', type: 'text' }],
			validFor: /!\[[^\]]*$/
		};
	}

	if (textBefore.endsWith('`')) {
		return {
			from: context.pos,
			options: [{ label: '`', detail: 'Close inline code', type: 'text' }],
			validFor: /`[^`]*$/
		};
	}

	if (textBefore.endsWith('**')) {
		return {
			from: context.pos,
			options: [{ label: '**', detail: 'Close bold', type: 'text' }],
			validFor: /\*\*[^*]*$/
		};
	}

	if (textBefore.endsWith('~')) {
		return {
			from: context.pos,
			options: [{ label: '~~', detail: 'Close strikethrough', type: 'text' }],
			validFor: /~~[^~]*$/
		};
	}

	return null;
}

export function markdownAutocomplete() {
	return markdownCompletionSource;
}
