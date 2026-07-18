<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	let {
		open = $bindable(false),
		title,
		placeholder,
		value = $bindable(''),
		onconfirm
	}: {
		open: boolean;
		title: string;
		placeholder?: string;
		value: string;
		onconfirm: (value: string) => void;
	} = $props();

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (value.trim()) {
			onconfirm(value.trim());
			open = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[400px]">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
		</Dialog.Header>
		<form onsubmit={handleSubmit} class="flex flex-col gap-4">
			<Input {placeholder} bind:value autofocus />
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				<Button type="submit">Confirm</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
