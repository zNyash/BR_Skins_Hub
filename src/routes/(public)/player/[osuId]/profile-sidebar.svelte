<script lang="ts">
	import { toast } from "svelte-sonner";
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
		<section aria-labelledby="bio-heading" class="flex flex-col gap-2 rounded-xl bg-card px-4 py-3">
			<div class="flex min-h-8 items-center justify-between">
				<h2 id="bio-heading" class="text-xs font-semibold tracking-wider text-text-muted uppercase">
					Bio
				</h2>
				{#if isOwner && !editing && player.bio}
					<Button variant="ghost" size="icon-sm" aria-label="Edit bio" onclick={startEditing}>
						<Icon name="pencil" />
					</Button>
				{/if}
			</div>

			{#if editing}
				<Textarea aria-label="Bio" rows={4} bind:value={draft} />
				<div class="flex items-center gap-2">
					<span class="text-xs {length > BIO_MAX ? 'text-destructive' : 'text-text-muted'}">
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
				<p class="text-sm leading-relaxed whitespace-pre-line">{player.bio}</p>
			{:else if isOwner}
				<button
					type="button"
					class="w-fit text-sm text-text-muted hover:text-foreground"
					onclick={startEditing}
				>
					Add a short bio
				</button>
			{/if}

			{#if !editing && hasDescription(player.description)}
				<button
					type="button"
					class="w-fit text-sm font-medium text-primary hover:underline"
					onclick={onReadMore}
				>
					Read more
				</button>
			{/if}
		</section>
	{/if}

	{#if links.length > 0}
		<ul aria-label="Links" class="flex flex-wrap gap-1.5">
			{#each links as link, i (i)}
				<li><LinkButton type={link.type} value={link.value} /></li>
			{/each}
		</ul>
	{/if}
</aside>
