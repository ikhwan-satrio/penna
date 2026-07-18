<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { settings, type ThemeMode, type ColorTheme, type FontSize } from '$lib/stores/settings';
	import { changeVault, vaultPath } from '$lib/stores/setup';
	import { Sun, Moon, Monitor, FolderOpen } from '@lucide/svelte';

	let {
		open = $bindable(false)
	}: {
		open: boolean;
	} = $props();

	const themeModes: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
		{ value: 'light', label: 'Light', icon: Sun },
		{ value: 'dark', label: 'Dark', icon: Moon },
		{ value: 'system', label: 'System', icon: Monitor }
	];

	const colorThemes: { value: ColorTheme; label: string; colors: string[] }[] = [
		{ value: 'default', label: 'Default', colors: ['#e5e5e5', '#171717', '#a3a3a3'] },
		{ value: 'tokyonight', label: 'Tokyo Night', colors: ['#7aa2f7', '#1a1b26', '#565f89'] },
		{ value: 'catppuccin', label: 'Catppuccin', colors: ['#cba6f7', '#1e1e2e', '#6c7086'] },
		{ value: 'rosepine', label: 'Rose Pine', colors: ['#eb6f92', '#191724', '#6e6a86'] }
	];

	const fontSizes: { value: FontSize; label: string; preview: string }[] = [
		{ value: 'sm', label: 'Small', preview: '13px' },
		{ value: 'base', label: 'Medium', preview: '14px' },
		{ value: 'lg', label: 'Large', preview: '16px' },
		{ value: 'xl', label: 'Extra Large', preview: '18px' }
	];

	async function handleChangeVault() {
		await changeVault();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Settings</Dialog.Title>
			<Dialog.Description>Customize your editor appearance</Dialog.Description>
		</Dialog.Header>

		<div class="flex flex-col gap-6 py-4">
			<div class="flex flex-col gap-3">
				<span class="text-sm font-medium">Vault</span>
				<div class="flex items-center gap-2">
					<div
						class="flex-1 truncate rounded border bg-muted px-3 py-1.5 text-sm text-muted-foreground"
					>
						{$vaultPath || 'No vault selected'}
					</div>
					<Button variant="outline" size="sm" onclick={handleChangeVault}>
						<FolderOpen class="mr-2 h-4 w-4" />
						Change
					</Button>
				</div>
			</div>

			<div class="flex flex-col gap-3">
				<span class="text-sm font-medium">Appearance</span>
				<div class="flex gap-2">
					{#each themeModes as mode}
						{@const Icon = mode.icon}
						<Button
							variant={$settings.themeMode === mode.value ? 'default' : 'outline'}
							class="flex-1"
							onclick={() => settings.setThemeMode(mode.value)}
						>
							<Icon class="mr-2 h-4 w-4" />
							{mode.label}
						</Button>
					{/each}
				</div>
			</div>

			<div class="flex flex-col gap-3">
				<span class="text-sm font-medium">Color Theme</span>
				<div class="grid grid-cols-2 gap-2">
					{#each colorThemes as theme}
						<Button
							variant={$settings.colorTheme === theme.value ? 'default' : 'outline'}
							class="flex items-center gap-2"
							onclick={() => settings.setColorTheme(theme.value)}
						>
							<div class="flex gap-0.5">
								{#each theme.colors as color}
									<div
										class="h-3 w-3 rounded-full border border-border"
										style="background-color: {color}"
									></div>
								{/each}
							</div>
							<span class="text-sm">{theme.label}</span>
						</Button>
					{/each}
				</div>
			</div>

			<div class="flex flex-col gap-3">
				<span class="text-sm font-medium">Editor Font Size</span>
				<div class="grid grid-cols-4 gap-2">
					{#each fontSizes as size}
						<Button
							variant={$settings.fontSize === size.value ? 'default' : 'outline'}
							class="flex flex-col items-center gap-1"
							onclick={() => settings.setFontSize(size.value)}
						>
							<span class="text-sm">{size.label}</span>
							<span class="text-xs text-muted-foreground">{size.preview}</span>
						</Button>
					{/each}
				</div>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => settings.reset()}>Reset to Default</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
