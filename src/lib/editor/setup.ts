import {
	EditorView,
	keymap,
	lineNumbers,
	highlightActiveLine,
	highlightActiveLineGutter
} from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import {
	defaultKeymap,
	indentWithTab,
	history,
	historyKeymap,
	moveLineUp,
	moveLineDown
} from '@codemirror/commands';
import { syntaxHighlighting, HighlightStyle, bracketMatching } from '@codemirror/language';
import { autocompletion, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { oneDark } from '@codemirror/theme-one-dark';
import { tags } from '@lezer/highlight';
import { vim, getCM, Vim } from '@replit/codemirror-vim';
import { markdownAutocomplete, preloadWikiCandidates } from './markdown-completion';

export type VimMode = 'normal' | 'insert' | 'visual' | 'replace' | 'ex' | (string & {});

const pennaHighlightStyle = HighlightStyle.define([
	{ tag: tags.heading1, class: 'cm-heading1' },
	{ tag: tags.heading2, class: 'cm-heading2' },
	{ tag: tags.heading3, class: 'cm-heading3' },
	{ tag: tags.heading4, class: 'cm-heading4' },
	{ tag: tags.heading5, class: 'cm-heading5' },
	{ tag: tags.heading6, class: 'cm-heading6' },
	{ tag: tags.strong, class: 'cm-strong' },
	{ tag: tags.emphasis, class: 'cm-emphasis' },
	{ tag: tags.strikethrough, class: 'cm-strikethrough' },
	{ tag: tags.link, class: 'cm-link' },
	{ tag: tags.url, class: 'cm-url' },
	{ tag: tags.keyword, class: 'cm-keyword' },
	{ tag: tags.atom, class: 'cm-atom' },
	{ tag: tags.bool, class: 'cm-bool' },
	{ tag: tags.string, class: 'cm-string' },
	{ tag: tags.number, class: 'cm-number' },
	{ tag: tags.comment, class: 'cm-comment' },
	{ tag: tags.meta, class: 'cm-meta' },
	{ tag: tags.monospace, class: 'cm-code' }
]);

const pennaTheme = EditorView.theme({
	'&': {
		fontFamily: "'JetBrains Mono Variable', monospace",
		fontSize: 'var(--editor-font-size, 14px)',
		height: '100%',
		background: 'transparent'
	},
	'.cm-scroller': {
		overflow: 'auto',
		padding: '8px 0'
	},
	'.cm-content': {
		caretColor: 'var(--foreground)',
		padding: '0 16px'
	},
	'.cm-cursor, .cm-dropCursor': {
		borderLeftColor: 'var(--foreground)',
		borderLeftWidth: '2px'
	},
	'&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
		backgroundColor: 'hsl(210 100% 40% / 0.3)'
	},
	'.cm-panels': {
		backgroundColor: 'var(--background)',
		color: 'var(--foreground)'
	},
	'.cm-panels.cm-panels-top': {
		borderBottom: '1px solid var(--border)'
	},
	'.cm-panels.cm-panels-bottom': {
		borderTop: '1px solid var(--border)'
	},
	'.cm-searchMatch': {
		backgroundColor: 'hsl(48 96% 53% / 0.2)',
		outline: '1px solid hsl(48 96% 53% / 0.4)'
	},
	'.cm-searchMatch.cm-searchMatch-selected': {
		backgroundColor: 'hsl(48 96% 53% / 0.35)'
	},
	'.cm-activeLine': {
		backgroundColor: 'hsl(0 0% 100% / 0.03)'
	},
	'.cm-selectionMatch': {
		backgroundColor: 'hsl(0 0% 100% / 0.08)'
	},
	'&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
		backgroundColor: 'hsl(48 96% 53% / 0.2)',
		outline: '1px solid hsl(48 96% 53% / 0.4)'
	},
	'.cm-gutters': {
		backgroundColor: 'var(--muted)',
		color: 'var(--muted-foreground)',
		border: 'none',
		borderRight: '1px solid var(--border)',
		padding: '0 4px'
	},
	'.cm-activeLineGutter': {
		backgroundColor: 'hsl(0 0% 100% / 0.03)',
		color: 'var(--foreground)'
	},
	'.cm-foldPlaceholder': {
		backgroundColor: 'hsl(0 0% 100% / 0.06)',
		border: '1px solid var(--border)',
		color: 'var(--muted-foreground)'
	},
	'.cm-tooltip': {
		border: '1px solid var(--border)',
		backgroundColor: 'var(--popover)'
	},
	'.cm-tooltip .cm-tooltip-arrow:before': {
		borderTopColor: 'var(--border)',
		borderBottomColor: 'var(--border)'
	},
	'.cm-tooltip .cm-tooltip-arrow:after': {
		borderTopColor: 'var(--popover)',
		borderBottomColor: 'var(--popover)'
	},
	'.cm-tooltip-autocomplete': {
		'& > ul > li': {
			padding: '4px 8px',
			fontFamily: "'JetBrains Mono Variable', monospace",
			fontSize: '13px'
		},
		'& > ul > li[aria-selected]': {
			backgroundColor: 'var(--accent)',
			color: 'var(--accent-foreground)'
		}
	},
	'.cm-heading1': { fontSize: '1.4em', fontWeight: 'bold', color: 'var(--foreground)' },
	'.cm-heading2': { fontSize: '1.2em', fontWeight: 'bold', color: 'var(--foreground)' },
	'.cm-heading3': { fontSize: '1.1em', fontWeight: 'bold', color: 'var(--foreground)' },
	'.cm-heading4': { fontSize: '1em', fontWeight: 'bold', color: 'var(--foreground)' },
	'.cm-heading5': { fontSize: '0.9em', fontWeight: 'bold', color: 'var(--foreground)' },
	'.cm-heading6': { fontSize: '0.85em', fontWeight: 'bold', color: 'var(--foreground)' },
	'.cm-strong': { fontWeight: 'bold' },
	'.cm-emphasis': { fontStyle: 'italic' },
	'.cm-strikethrough': { textDecoration: 'line-through' },
	'.cm-link': { color: 'hsl(210 100% 60%)', textDecoration: 'underline' },
	'.cm-url': { color: 'hsl(210 100% 60%)' },
	'.cm-code': {
		backgroundColor: 'hsl(0 0% 100% / 0.06)',
		padding: '1px 4px',
		borderRadius: '3px',
		fontSize: '0.9em'
	},
	'.cm-meta': { color: 'var(--muted-foreground)' },
	'.cm-keyword': { color: 'hsl(210 100% 70%)' },
	'.cm-atom': { color: 'hsl(210 100% 70%)' },
	'.cm-bool': { color: 'hsl(210 100% 70%)' },
	'.cm-string': { color: 'hsl(150 60% 55%)' },
	'.cm-number': { color: 'hsl(25 80% 60%)' },
	'.cm-comment': { color: 'var(--muted-foreground)', fontStyle: 'italic' },
	'.cm-vimMode .cm-selectionBackground, .cm-vimMode.cm-focused .cm-selectionBackground': {
		backgroundColor: 'hsl(270 60% 50% / 0.35) !important',
		outline: '1px solid hsl(270 60% 60% / 0.5)'
	},
	'.cm-vimMode .cm-content ::selection': {
		backgroundColor: 'hsl(270 60% 50% / 0.35) !important'
	},
	'.cm-vimMode .cm-cursorLayer': {
		borderLeftColor: 'hsl(270 60% 60%) !important'
	}
});

function debounce<T extends string>(fn: (value: T) => void, ms: number): (value: T) => void {
	let timer: ReturnType<typeof setTimeout>;
	return (value: T) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(value), ms);
	};
}

export function createMarkdownEditor(
	parent: HTMLElement,
	content: string,
	onChange: (value: string) => void,
	onVimModeChange?: (mode: VimMode) => void
): EditorView {
	preloadWikiCandidates();

	const debouncedChange = debounce((value: string) => onChange(value), 50);

	const state = EditorState.create({
		doc: content,
		extensions: [
			vim(),
			lineNumbers(),
			highlightActiveLine(),
			highlightActiveLineGutter(),
			history(),
			bracketMatching(),
			closeBrackets(),
			highlightSelectionMatches(),
			autocompletion({
				override: [markdownAutocomplete()],
				activateOnTyping: true,
				maxRenderedOptions: 15
			}),
			markdown({ base: markdownLanguage }),
			syntaxHighlighting(pennaHighlightStyle),
			pennaTheme,
			oneDark,
			keymap.of([
				...defaultKeymap,
				...historyKeymap,
				...closeBracketsKeymap,
				...searchKeymap,
				indentWithTab,
				{
					key: 'Alt-ArrowUp',
					run: moveLineUp
				},
				{
					key: 'Alt-ArrowDown',
					run: moveLineDown
				}
			]),
			EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					debouncedChange(update.state.doc.toString());
				}
			})
		]
	});

	const view = new EditorView({
		state,
		parent
	});

	// Clipboard integration: y/p/x/d use system clipboard via "+ register
	const cm = getCM(view);
	if (cm) {
		Vim.map('y', '"+y', 'normal');
		Vim.map('Y', '"+Y', 'normal');
		Vim.map('p', '"+p', 'normal');
		Vim.map('P', '"+P', 'normal');
		Vim.map('x', '"+x', 'normal');
		Vim.map('d', '"+d', 'normal');
		Vim.map('y', '"+y', 'visual');
		Vim.map('d', '"+d', 'visual');
		Vim.map('x', '"+x', 'visual');
	}

	if (onVimModeChange) {
		const cm = getCM(view);
		if (cm) {
			cm.on('vim-mode-change', (e: { mode: string; subMode?: string }) => {
				let mode = e.mode as VimMode;
				if (e.subMode) {
					mode = `${e.mode} ${e.subMode}` as VimMode;
				}
				onVimModeChange(mode);
			});
		}
	}

	return view;
}
