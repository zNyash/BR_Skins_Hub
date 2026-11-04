<script lang="ts">
	import { toast } from "svelte-sonner";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as Dialog from "$comp/ui/dialog";
	import { Input } from "$comp/ui/input";

	type Props = {
		open: boolean;
		name: string;
		kind: "player" | "skin";
		/** Closes the dialog when it resolves; a rejection is shown as a toast and keeps it open. */
		onConfirm: () => Promise<void>;
	};

	let { open = $bindable(), name, kind, onConfirm }: Props = $props();

	let typed = $state("");
	let isDeleting = $state(false);

	const matches = $derived(typed === name);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!matches || isDeleting) return;

		isDeleting = true;
		try {
			await onConfirm();
			open = false;
		} catch (e) {
			toast.error((e as Error).message);
		} finally {
			isDeleting = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="bg-layer-1 sm:max-w-sm">
		<Dialog.Header>
			<Dialog.Title>Delete {kind}</Dialog.Title>
			<Dialog.Description>
				Type <strong class="text-foreground">{name}</strong> to delete this {kind}. This can't be undone.
			</Dialog.Description>
		</Dialog.Header>

		<form id="delete-form" onsubmit={handleSubmit}>
			<Input aria-label="Name to confirm" autocomplete="off" bind:value={typed} />
		</form>

		<Dialog.Footer>
			<Dialog.Close>
				{#snippet child({ props })}
					<Button {...props} type="button" variant="secondary">Cancel</Button>
				{/snippet}
			</Dialog.Close>
			<Button form="delete-form" type="submit" variant="destructive" disabled={!matches || isDeleting}>
				{#if isDeleting}
					<Icon name="loader-circle" class="animate-spin" />
					Deleting
				{:else}
					<Icon name="trash" />
					Delete
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
