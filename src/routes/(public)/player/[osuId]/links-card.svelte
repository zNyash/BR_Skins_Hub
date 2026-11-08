<script lang="ts">
	import { untrack } from "svelte";
	import { toast } from "svelte-sonner";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import LinksEditor from "$comp/links-editor.svelte";
	import { hasBlankLink } from "$lib/links";
	import type { PlayerWithSkins } from "$lib/types";
	import { errorMessage, saveProfile } from "./save-profile";
	import SettingsCard from "./settings-card.svelte";
	import { guardUnsaved } from "./unsaved-guard.svelte";

	let { player }: { player: PlayerWithSkins } = $props();

	const copyOf = (links: PlayerWithSkins["links"]) => (links ?? []).map((link) => ({ ...link }));
	const saved = $derived(JSON.stringify(player.links ?? []));

	// The editor works on a copy, refreshed only when the saved links themselves change. Other saves
	// on the page (color, bio) reload the player too, and must not wipe links being typed.
	// `saved` is a string, so the effect reruns only when its content differs.
	// svelte-ignore state_referenced_locally
	let draft = $state(copyOf(player.links));
	$effect(() => {
		void saved;
		untrack(() => (draft = copyOf(player.links)));
	});

	let saving = $state(false);
	const dirty = $derived(JSON.stringify(draft) !== saved);
	const hasBlank = $derived(hasBlankLink(draft));

	async function save() {
		saving = true;
		try {
			await saveProfile(player.osu_id, { links: draft });
			toast.success("Links saved");
		} catch (err) {
			toast.error(errorMessage(err, "Couldn't save your links"));
		} finally {
			saving = false;
		}
	}

	guardUnsaved(
		() => dirty,
		() => (draft = copyOf(player.links))
	);
</script>

<SettingsCard title="Links">
	<LinksEditor bind:links={draft}>
		<Button disabled={!dirty || hasBlank || saving} onclick={save}>
			{#if saving}<Icon name="loader-circle" class="animate-spin" />{/if}
			Save
		</Button>
	</LinksEditor>
</SettingsCard>
