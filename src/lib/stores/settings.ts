import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSize = 'sm' | 'base' | 'lg' | 'xl';
export type ColorTheme = 'default' | 'tokyonight' | 'catppuccin' | 'rosepine';

export interface Settings {
	themeMode: ThemeMode;
	colorTheme: ColorTheme;
	fontSize: FontSize;
}

const defaultSettings: Settings = {
	themeMode: 'dark',
	colorTheme: 'default',
	fontSize: 'base'
};

function loadSettings(): Settings {
	if (!browser) return defaultSettings;
	try {
		const saved = localStorage.getItem('penna-settings');
		if (saved) {
			return { ...defaultSettings, ...JSON.parse(saved) };
		}
	} catch {
		// ignore
	}
	return defaultSettings;
}

function saveSettings(settings: Settings): void {
	if (!browser) return;
	localStorage.setItem('penna-settings', JSON.stringify(settings));
}

const colorThemes = {
	default: {
		dark: {
			'--background': 'oklch(0.07 0 0)',
			'--foreground': 'oklch(0.985 0 0)',
			'--card': 'oklch(0.10 0 0)',
			'--card-foreground': 'oklch(0.985 0 0)',
			'--popover': 'oklch(0.10 0 0)',
			'--popover-foreground': 'oklch(0.985 0 0)',
			'--primary': 'oklch(0.922 0 0)',
			'--primary-foreground': 'oklch(0.10 0 0)',
			'--secondary': 'oklch(0.15 0 0)',
			'--secondary-foreground': 'oklch(0.985 0 0)',
			'--muted': 'oklch(0.15 0 0)',
			'--muted-foreground': 'oklch(0.60 0 0)',
			'--accent': 'oklch(0.15 0 0)',
			'--accent-foreground': 'oklch(0.985 0 0)',
			'--destructive': 'oklch(0.60 0.191 22.216)',
			'--border': 'oklch(1 0 0 / 6%)',
			'--input': 'oklch(1 0 0 / 8%)',
			'--ring': 'oklch(0.45 0 0)'
		},
		light: {
			'--background': 'oklch(1 0 0)',
			'--foreground': 'oklch(0.145 0 0)',
			'--card': 'oklch(1 0 0)',
			'--card-foreground': 'oklch(0.145 0 0)',
			'--popover': 'oklch(1 0 0)',
			'--popover-foreground': 'oklch(0.145 0 0)',
			'--primary': 'oklch(0.205 0 0)',
			'--primary-foreground': 'oklch(0.985 0 0)',
			'--secondary': 'oklch(0.97 0 0)',
			'--secondary-foreground': 'oklch(0.205 0 0)',
			'--muted': 'oklch(0.97 0 0)',
			'--muted-foreground': 'oklch(0.556 0 0)',
			'--accent': 'oklch(0.97 0 0)',
			'--accent-foreground': 'oklch(0.205 0 0)',
			'--destructive': 'oklch(0.577 0.245 27.325)',
			'--border': 'oklch(0.922 0 0)',
			'--input': 'oklch(0.922 0 0)',
			'--ring': 'oklch(0.708 0 0)'
		}
	},
	tokyonight: {
		dark: {
			'--background': '#080812',
			'--foreground': '#c0caf5',
			'--card': '#0c0c1a',
			'--card-foreground': '#c0caf5',
			'--popover': '#0c0c1a',
			'--popover-foreground': '#c0caf5',
			'--primary': '#7aa2f7',
			'--primary-foreground': '#080812',
			'--secondary': '#161830',
			'--secondary-foreground': '#c0caf5',
			'--muted': '#161830',
			'--muted-foreground': '#565f89',
			'--accent': '#161830',
			'--accent-foreground': '#c0caf5',
			'--destructive': '#f7768e',
			'--border': '#242840',
			'--input': '#242840',
			'--ring': '#7aa2f7'
		},
		light: {
			'--background': '#f7f8fc',
			'--foreground': '#3760bf',
			'--card': '#ffffff',
			'--card-foreground': '#3760bf',
			'--popover': '#ffffff',
			'--popover-foreground': '#3760bf',
			'--primary': '#3760bf',
			'--primary-foreground': '#f7f8fc',
			'--secondary': '#e9e9ec',
			'--secondary-foreground': '#3760bf',
			'--muted': '#e9e9ec',
			'--muted-foreground': '#848cb5',
			'--accent': '#e9e9ec',
			'--accent-foreground': '#3760bf',
			'--destructive': '#8c4351',
			'--border': '#d5d6db',
			'--input': '#d5d6db',
			'--ring': '#3760bf'
		}
	},
	catppuccin: {
		dark: {
			'--background': '#0b0b14',
			'--foreground': '#cdd6f4',
			'--card': '#0e0e19',
			'--card-foreground': '#cdd6f4',
			'--popover': '#0e0e19',
			'--popover-foreground': '#cdd6f4',
			'--primary': '#cba6f7',
			'--primary-foreground': '#0b0b14',
			'--secondary': '#1a1a2a',
			'--secondary-foreground': '#cdd6f4',
			'--muted': '#1a1a2a',
			'--muted-foreground': '#6c7086',
			'--accent': '#1a1a2a',
			'--accent-foreground': '#cdd6f4',
			'--destructive': '#f38ba8',
			'--border': '#2a2a3a',
			'--input': '#2a2a3a',
			'--ring': '#cba6f7'
		},
		light: {
			'--background': '#eff1f5',
			'--foreground': '#4c4f69',
			'--card': '#e6e9ef',
			'--card-foreground': '#4c4f69',
			'--popover': '#e6e9ef',
			'--popover-foreground': '#4c4f69',
			'--primary': '#8839ef',
			'--primary-foreground': '#eff1f5',
			'--secondary': '#ccd0da',
			'--secondary-foreground': '#4c4f69',
			'--muted': '#ccd0da',
			'--muted-foreground': '#7c7f93',
			'--accent': '#ccd0da',
			'--accent-foreground': '#4c4f69',
			'--destructive': '#d20f39',
			'--border': '#bcc0cc',
			'--input': '#bcc0cc',
			'--ring': '#8839ef'
		}
	},
	rosepine: {
		dark: {
			'--background': '#0c0b17',
			'--foreground': '#e0def4',
			'--card': '#100f1c',
			'--card-foreground': '#e0def4',
			'--popover': '#100f1c',
			'--popover-foreground': '#e0def4',
			'--primary': '#eb6f92',
			'--primary-foreground': '#0c0b17',
			'--secondary': '#161425',
			'--secondary-foreground': '#e0def4',
			'--muted': '#161425',
			'--muted-foreground': '#6e6a86',
			'--accent': '#161425',
			'--accent-foreground': '#e0def4',
			'--destructive': '#eb6f92',
			'--border': '#242235',
			'--input': '#242235',
			'--ring': '#ebbcba'
		},
		light: {
			'--background': '#faf4ed',
			'--foreground': '#575279',
			'--card': '#fffaf3',
			'--card-foreground': '#575279',
			'--popover': '#fffaf3',
			'--popover-foreground': '#575279',
			'--primary': '#d7827e',
			'--primary-foreground': '#faf4ed',
			'--secondary': '#f2e9e1',
			'--secondary-foreground': '#575279',
			'--muted': '#f2e9e1',
			'--muted-foreground': '#9893a5',
			'--accent': '#f2e9e1',
			'--accent-foreground': '#575279',
			'--destructive': '#d7827e',
			'--border': '#e0def4',
			'--input': '#e0def4',
			'--ring': '#ebbcba'
		}
	}
};

function applySettings(settings: Settings): void {
	if (!browser) return;

	const root = document.documentElement;
	root.classList.remove('light', 'dark');

	let effectiveTheme: 'light' | 'dark';
	if (settings.themeMode === 'system') {
		effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	} else {
		effectiveTheme = settings.themeMode;
	}
	root.classList.add(effectiveTheme);

	const themeColors =
		colorThemes[settings.colorTheme]?.[effectiveTheme] ?? colorThemes.default.dark;
	for (const [key, value] of Object.entries(themeColors)) {
		root.style.setProperty(key, value);
	}

	const fontSizeMap: Record<FontSize, string> = {
		sm: '13px',
		base: '14px',
		lg: '16px',
		xl: '18px'
	};
	root.style.setProperty('--editor-font-size', fontSizeMap[settings.fontSize]);
}

function createSettingsStore() {
	const { subscribe, set, update } = writable<Settings>(loadSettings());

	if (browser) {
		subscribe((settings) => {
			applySettings(settings);
			saveSettings(settings);
		});
	}

	return {
		subscribe,
		setThemeMode: (themeMode: ThemeMode) => {
			update((s) => ({ ...s, themeMode }));
		},
		setColorTheme: (colorTheme: ColorTheme) => {
			update((s) => ({ ...s, colorTheme }));
		},
		setFontSize: (fontSize: FontSize) => {
			update((s) => ({ ...s, fontSize }));
		},
		reset: () => {
			set(defaultSettings);
		}
	};
}

export const settings = createSettingsStore();
