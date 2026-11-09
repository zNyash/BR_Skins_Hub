<script lang="ts">
	import { toast } from "svelte-sonner";
	import Card from "$comp/card.svelte";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import { Textarea } from "$comp/ui/textarea";
	import { hasDescription } from "$lib/profile-tabs";
	import type { PlayerWithSkins } from "$lib/types";
	import LinkButton from "./link-button.svelte";
	import { errorMessage, saveProfile } from "./save-profile";
	import { guardUnsaved } from "./unsaved-guard.svelte";

	let {
		player,
		isOwner,
		onReadMore
	}: { player: PlayerWithSkins; isOwner: boolean; onReadMore: () => void } = $props();

	const BIO_MAX = 200;
	const links = $derived(player.links ?? []);

	// Bio editing: a draft while the card is in edit mode.
	let editing = $state(false);
	let draft = $state("");
	let saving = $state(false);
	const length = $derived(draft.trim().length);

	function startEditing() {
		draft = player.bio ?? "";
		editing = true;
	}

	async function save() {
		saving = true;
		try {
			await saveProfile(player.osu_id, { bio: draft });
			editing = false;
		} catch (err) {
			toast.error(errorMessage(err, "Couldn't save your bio"));
		} finally {
			saving = false;
		}
	}

	guardUnsaved(
		() => editing && draft !== (player.bio ?? ""),
		() => (editing = false)
	);
</script>

<aside aria-label="Player" class="flex max-w-80 shrink-0 grow basis-64 flex-col gap-4 pt-4">
	{#if player.bio || hasDescription(player.description) || isOwner}
		<Card title="Bio" level={2}>
			{#snippet trailing()}
				{#if isOwner && !editing && player.bio}
					<Button variant="ghost" size="icon-sm" aria-label="Edit bio" onclick={startEditing}>
						<Icon name="pencil" />
					</Button>
				{/if}
			{/snippet}

			{#if editing}
				<Textarea aria-label="Bio" rows={4} class="bg-layer-2" bind:value={draft} />
				<div class="flex items-center gap-2">
					<span class="text-caption {length > BIO_MAX ? 'text-error' : 'text-text-muted'}">
						{length}/{BIO_MAX}
					</span>
					<Button variant="secondary" size="sm" class="ml-auto" onclick={() => (editing = false)}>
						Cancel
					</Button>
					<Button size="sm" disabled={saving || length > BIO_MAX} onclick={save}>
						{#if saving}<Icon name="loader-circle" class="animate-spin" />{/if}
						Save
					</Button>
				</div>
			{:else if player.bio}
				<p class="text-body whitespace-pre-line">{player.bio}</p>
			{:else if isOwner}
				<button
					type="button"
					class="w-fit text-body text-text-muted hover:text-text"
					onclick={startEditing}
				>
					Add a short bio
				</button>
			{/if}

			{#if !editing && hasDescription(player.description)}
				<button
					type="button"
					class="w-fit text-body-strong text-accent-color hover:underline"
					onclick={onReadMore}
				>
					Read more
				</button>
			{/if}
		</Card>
	{/if}

	{#if links.length > 0}
		<ul aria-label="Links" class="flex flex-wrap gap-2">
			{#each links as link, i (i)}
				<li><LinkButton type={link.type} value={link.value} /></li>
			{/each}
		</ul>
	{/if}
</aside>
