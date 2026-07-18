<script lang="ts">
	import { open } from '@tauri-apps/plugin-dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { FolderOpen } from '@lucide/svelte';
	import { saveVaultPath } from '$lib/stores/setup';

	let { open: isOpen = $bindable(false) }: { open: boolean } = $props();

	let selectedPath = $state<string | null>(null);
	let isSaving = $state(false);

	async function selectDirectory() {
		const path = await open({
			directory: true,
			multiple: false,
			title: 'Pilih direktori untuk menyimpan catatan'
		});
		if (path) {
			selectedPath = path as string;
		}
	}

	async function confirmSelection() {
		if (!selectedPath) return;
		isSaving = true;
		const success = await saveVaultPath(selectedPath);
		isSaving = false;
		if (success) {
			isOpen = false;
		}
	}
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Selamat Datang di Penna</Dialog.Title>
			<Dialog.Description>
				Pilih direktori untuk menyimpan catatan markdown Anda. Direktori ini akan digunakan setiap
				kali Anda membuka aplikasi.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			{#if selectedPath}
				<div class="rounded-md bg-muted p-3 text-sm">
					<p class="font-medium">Direktori terpilih:</p>
					<p class="break-all text-muted-foreground">{selectedPath}</p>
				</div>
			{:else}
				<Button variant="outline" class="w-full justify-start gap-2" onclick={selectDirectory}>
					<FolderOpen class="h-4 w-4" />
					Pilih Direktori
				</Button>
			{/if}
		</div>

		<Dialog.Footer>
			{#if selectedPath}
				<Button variant="outline" onclick={selectDirectory}>Ganti Direktori</Button>
				<Button onclick={confirmSelection} disabled={isSaving}>
					{#if isSaving}
						Menyimpan...
					{:else}
						Konfirmasi
					{/if}
				</Button>
			{/if}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
