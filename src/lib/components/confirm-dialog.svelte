<script lang="ts">
	import Button from "$comp/ui/button/button.svelte";
	import * as Dialog from "$comp/ui/dialog";
	import { answerConfirm, confirmState } from "$lib/confirm.svelte";

	const pending = $derived(confirmState.pending);
</script>

<Dialog.Root
	open={pending !== null}
	onOpenChange={(open) => {
		if (!open) answerConfirm(false);
	}}
>
	<Dialog.Content class="bg-layer-1 sm:max-w-sm" showCloseButton={false}>
		{#if pending}
			<Dialog.Header>
				<Dialog.Title>{pending.title}</Dialog.Title>
				{#if pending.description}
					<Dialog.Description>{pending.description}</Dialog.Description>
				{/if}
			</Dialog.Header>
			<Dialog.Footer>
				<Button variant="secondary" onclick={() => answerConfirm(false)}>
					{pending.cancelLabel ?? "Cancel"}
				</Button>
				<Button
					variant={pending.destructive ? "destructive" : "default"}
					onclick={() => answerConfirm(true)}
				>
					{pending.confirmLabel ?? "Confirm"}
				</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
