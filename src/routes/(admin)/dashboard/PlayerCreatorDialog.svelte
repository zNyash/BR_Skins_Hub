<script lang="ts">
	import { readErrorMessage } from "$lib/utils/http";
	import { invalidate } from "$app/navigation";
	import { toast } from "svelte-sonner";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as Dialog from "$comp/ui/dialog";
	import { Input } from "$comp/ui/input";
	import type { Id } from "$convex/_generated/dataModel";
	import { parseOsuId } from "$lib/utils/osu";

	type Props = {
		open: boolean;
		onCreated: (playerId: Id<"players">) => void;
	};

	let { open = $bindable(), onCreated }: Props = $props();

	let input = $state("");
	let isCreating = $state(false);
	let errorMessage = $state<string | null>(null);

	const osuId = $derived(parseOsuId(input));

	function handleOpenChange(isOpen: boolean) {
		if (isOpen) {
			input = "";
			errorMessage = null;
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!osuId || isCreating) return;

		isCreating = true;
		errorMessage = null;

		try {
			const response = await fetch("/api/players", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ osu_id: osuId })
			});
			if (response.status === 404) throw new Error("osu! user not found");
			if (!response.ok) throw new Error(await readErrorMessage(response));

			const { id, name, existed } = (await response.json()) as {
				id: Id<"players">;
				name: string;
				existed: boolean;
			};

			// Reload the player list first, so the editor can find the new player.
			await invalidate("app:players");
			if (existed) toast.info(`${name} already exists, opened their editor`);

			open = false;
			onCreated(id);
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : "Failed to create player";
		} finally {
			isCreating = false;
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Content class="bg-layer-1 sm:max-w-sm">
		<Dialog.Header>
			<Dialog.Title>New player</Dialog.Title>
			<Dialog.Description>
				Paste an osu! ID or profile link. Name, cover and previous usernames are fetched from osu!.
			</Dialog.Description>
		</Dialog.Header>

		<form id="player-creator-form" class="flex flex-col gap-1" onsubmit={handleSubmit}>
			<label for="create_osu_id" class="text-sm">osu! ID or profile link</label>
			<Input
				id="create_osu_id"
				placeholder="7562902 or osu.ppy.sh/users/7562902"
				autocomplete="off"
				bind:value={input}
			/>
			{#if input && !osuId}
				<p class="text-xs text-muted-foreground">
					That doesn't look like an osu! ID or profile link.
				</p>
			{/if}
			{#if errorMessage}
				<p class="text-xs text-red-400">{errorMessage}</p>
			{/if}
		</form>

		<Dialog.Footer>
			<Dialog.Close>
				{#snippet child({ props })}
					<Button {...props} type="button" variant="secondary">Cancel</Button>
				{/snippet}
			</Dialog.Close>
			<Button form="player-creator-form" type="submit" disabled={!osuId || isCreating}>
				{#if isCreating}
					<Icon name="loader-circle" class="animate-spin" />
					Fetching from osu!
				{:else}
					<Icon name="user-plus" />
					Create
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
