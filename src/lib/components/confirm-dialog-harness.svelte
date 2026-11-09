<script lang="ts">
	// Stacking is decided by CSS, so the app's styles are needed here.
	import "../../routes/layout.css";
	import ConfirmDialog from "$comp/confirm-dialog.svelte";
	import * as Dialog from "$comp/ui/dialog";
	import { askConfirm } from "$lib/confirm.svelte";

	let { onAnswer }: { onAnswer: (confirmed: boolean) => void } = $props();
</script>

<!-- Mounted first, like in the root layout, so its portal sits earlier in <body>. -->
<ConfirmDialog />
<Dialog.Root open>
	<Dialog.Content showCloseButton={false}>
		<Dialog.Title>Editor</Dialog.Title>
		<button
			onclick={async () =>
				onAnswer(await askConfirm({ title: "Discard?", cancelLabel: "Keep editing" }))}
		>
			Ask
		</button>
	</Dialog.Content>
</Dialog.Root>
