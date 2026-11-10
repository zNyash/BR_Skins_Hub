<script lang="ts">
	import { untrack } from "svelte";
	import { toast } from "svelte-sonner";
	import { invalidate } from "$app/navigation";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as Dialog from "$comp/ui/dialog";
	import { Input } from "$comp/ui/input";
	import type { Doc, Id } from "$convex/_generated/dataModel";
	import { request } from "$lib/api";
	import { parseOsuId } from "$lib/osu";

	type Props = {
		open: boolean;
		onCreated: (playerId: Id<"players">) => void;
	};

	let { open = $bindable(), onCreated }: Props = $props();

	let input = $state("");
	let isCreating = $state(false);

	const osuId = $derived(parseOsuId(input));

	// Each opening starts fresh, whether from a trigger or from a bound `open`.
	$effect.pre(() => {
		if (open) untrack(() => (input = ""));
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!osuId || isCreating) return;

		isCreating = true;

		try {
			const { player, created } = await request<{ player: Doc<"players">; created: boolean }>(
				"/api/players",
				{ method: "POST", body: { osu_id: osuId } }
			);

			// Reload the player list first, so the editor can find the new player.
			await invalidate("app:players");
			if (created) toast.success(`${player.name} created`);
			else toast.info(`${player.name} already exists, opened their editor`);

			open = false;
			onCreated(player._id);
		} catch (e) {
			toast.error((e as Error).message);
		} finally {
			isCreating = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="bg-layer-1 sm:max-w-sm">
		<Dialog.Header>
			<Dialog.Title>New player</Dialog.Title>
			<Dialog.Description>
				Paste an osu! ID or profile link. Name, cover and previous usernames are fetched from osu!.
			</Dialog.Description>
		</Dialog.Header>

		<form id="player-creator-form" class="flex flex-col gap-2" onsubmit={handleSubmit}>
			<label for="create_osu_id" class="text-label">osu! ID or profile link</label>
			<Input
				id="create_osu_id"
				class="bg-layer-2"
				placeholder="7562902 or osu.ppy.sh/users/7562902"
				autocomplete="off"
				bind:value={input}
			/>
			{#if input && !osuId}
				<p class="text-caption text-text-muted">
					That doesn't look like an osu! ID or profile link.
				</p>
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
