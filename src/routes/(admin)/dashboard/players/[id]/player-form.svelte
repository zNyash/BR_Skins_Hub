<script lang="ts">
	import { getContext } from "svelte";
	import { toast } from "svelte-sonner";
	import { goto, invalidate } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import type { Doc } from "$convex/_generated/dataModel";
	import Avatar from "$comp/avatar.svelte";
	import { request } from "$lib/api";
	import type { SkinWithPlayers } from "$lib/types";
	import { parseTab, setupFilled, type EditorTab } from "../../derive";
	import DeleteDialog from "../../dialogs/delete-dialog.svelte";
	import EditorFrame from "../../editor-frame.svelte";
	import { registerEditor, unsaved } from "../../unsaved.svelte";
	import type { PlayersContext } from "../+layout.svelte";
	import LinksTab from "./links-tab.svelte";
	import { createPlayerDraft } from "./player-draft.svelte";
	import ProfileTab from "./profile-tab.svelte";
	import SetupTab from "./setup-tab.svelte";
	import SkinsTab from "./skins-tab.svelte";

	/** The editor for one existing player: frame, tabs and the draft they all edit. */
	let {
		player,
		players,
		skins
	}: { player: Doc<"players">; players: Doc<"players">[]; skins: SkinWithPlayers[] } = $props();

	const ctx = getContext<PlayersContext>("players-list");

	const editor = createPlayerDraft(
		() => player,
		() => skins
	);
	registerEditor(editor);

	let deleteOpen = $state(false);

	const tab = $derived(parseTab(page.url.searchParams.get("tab")));

	// Counts follow the draft, so assigning skins or adding links shows up before saving.
	const tabs = $derived<{ id: EditorTab; label: string }[]>([
		{ id: "profile", label: "Profile" },
		{ id: "skins", label: `Skins · ${editor.draft.skins.length}` },
		{ id: "links", label: `Links · ${editor.draft.player.links.length}` },
		{ id: "setup", label: `Setup · ${setupFilled(player)}/6` }
	]);

	const tagSuggestions = $derived(
		[...new Set([...players, ...skins].flatMap((doc) => doc.tags ?? []))].sort()
	);

	async function sync() {
		// The reload would leave edits compared against data they weren't made from.
		if (unsaved.dirty) {
			unsaved.shake();
			return;
		}
		try {
			await request("/api/players/sync", { method: "POST", body: { osu_id: player.osu_id } });
			toast.success("Synced from osu!");
			await invalidate("app:players");
		} catch (e) {
			toast.error((e as Error).message);
		}
	}

	async function remove() {
		// Rejections are shown by the dialog, which then stays open.
		await request(`/api/players/${player._id}`, { method: "DELETE" });
		toast.success("Player deleted");
		// Edits to a deleted player have nowhere to go; dropping them lets the navigation through.
		editor.reset();
		// Leave first, so the editor doesn't flash "doesn't exist anymore" once the list reloads.
		await goto(ctx.listHref());
		await Promise.all([invalidate("app:players"), invalidate("app:skins")]);
	}
</script>

<EditorFrame
	title={player.name}
	subtitle="osu! #{player.osu_id}"
	cover={player.cover_url}
	menu={[
		{ label: "Sync with osu!", onSelect: sync },
		{ label: "Delete…", onSelect: () => (deleteOpen = true), destructive: true }
	]}
	{tabs}
	{tab}
>
	{#snippet avatar()}
		<Avatar osuId={player.osu_id} size={56} />
	{/snippet}
	{#snippet actions()}
		<a
			href={resolve("/(public)/player/[osuId]", { osuId: String(player.osu_id) })}
			target="_blank"
			class="shrink-0 text-accent-color hover:underline"
		>
			View profile ↗
		</a>
	{/snippet}
	{#if tab === "profile"}
		<ProfileTab bind:draft={editor.draft} {tagSuggestions} />
	{:else if tab === "skins"}
		<SkinsTab bind:draft={editor.draft} allSkins={skins} />
	{:else if tab === "links"}
		<LinksTab bind:draft={editor.draft} />
	{:else}
		<SetupTab {player} />
	{/if}
</EditorFrame>

<DeleteDialog bind:open={deleteOpen} name={player.name} kind="player" onConfirm={remove} />
