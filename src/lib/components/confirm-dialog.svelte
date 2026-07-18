<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	let {
		open = $bindable(false),
		title,
		message,
		confirmText = 'yes',
		onconfirm
	}: {
		open: boolean;
		title: string;
		message: string;
		confirmText?: string;
		onconfirm: () => void;
	} = $props();

	let inputValue = $state('');

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (inputValue === confirmText) {
			onconfirm();
			open = false;
			inputValue = '';
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[400px]">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>{message}</Dialog.Description>
		</Dialog.Header>
		<form onsubmit={handleSubmit} class="flex flex-col gap-4">
			<div>
				<p class="mb-2 text-sm text-muted-foreground">
					Type <span class="font-mono font-bold">{confirmText}</span> to confirm:
				</p>
				<Input placeholder={confirmText} bind:value={inputValue} autofocus />
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				<Button type="submit" variant="destructive">Delete</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
