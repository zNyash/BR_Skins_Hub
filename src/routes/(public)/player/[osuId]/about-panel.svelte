<script lang="ts">
	import { toast } from "svelte-sonner";
	import Card from "$comp/card.svelte";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import { Textarea } from "$comp/ui/textarea";
	import { hasDescription } from "$lib/profile-tabs";
	import type { PlayerWithSkins } from "$lib/types";
	import { errorMessage, saveProfile } from "./save-profile";
	import { guardUnsaved } from "./unsaved-guard.svelte";

	let { player, isOwner }: { player: PlayerWithSkins; isOwner: boolean } = $props();

	let editing = $state(false);
	let draft = $state("");
	let saving = $state(false);

	function startEditing() {
		draft = player.description ?? "";
		editing = true;
	}

	async function save() {
		saving = true;
		try {
			await saveProfile(player.osu_id, { description: draft });
			editing = false;
		} catch (err) {
			toast.error(errorMessage(err, "Couldn't save your description"));
		} finally {
			saving = false;
		}
	}

	guardUnsaved(
		() => editing && draft !== (player.description ?? ""),
		() => (editing = false)
	);
</script>

<div role="tabpanel">
	{#if editing}
		<div class="flex flex-col gap-3">
			<div class="flex items-center gap-2">
				<Button variant="secondary" class="ml-auto" onclick={() => (editing = false)}>Cancel</Button
				>
				<Button disabled={saving} onclick={save}>
					{#if saving}<Icon name="loader-circle" class="animate-spin" />{/if}
					Save
				</Button>
			</div>
			<Textarea aria-label="Description" rows={14} class="font-mono" bind:value={draft} />
		</div>
	{:else}
		{#snippet editButton()}
			<Button variant="secondary" onclick={startEditing}>
				<Icon name="pencil" />
				Edit
			</Button>
		{/snippet}
		<Card
			class="max-w-3xl"
			trailing={isOwner && hasDescription(player.description) ? editButton : undefined}
		>
			{#if hasDescription(player.description)}
				<p class="text-body whitespace-pre-wrap">{player.description}</p>
			{:else}
				<button
					type="button"
					class="w-fit text-body text-text-muted hover:text-text"
					onclick={startEditing}
				>
					Add a description
				</button>
			{/if}
		</Card>
	{/if}
</div>
