<script lang="ts">
	import { getContext } from "svelte";
	import { toast } from "svelte-sonner";
	import { goto, invalidate } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import { request } from "$lib/api";
	import { osuAvatar } from "$lib/osu";
	import {
		parseTab,
		pickParams,
		setupFilled,
		step,
		stepPosition,
		type EditorTab
	} from "../../derive";
	import DeleteDialog from "../../dialogs/delete-dialog.svelte";
	import EditorFrame from "../../editor-frame.svelte";
	import type { PlayersContext } from "../+layout.svelte";

	let { data } = $props();

	const ctx = getContext<PlayersContext>("players-list");

	let deleteOpen = $state(false);

	// Looked up in the layout's data, so a deleted player or a mistyped id lands on "not found".
	const player = $derived(data.players.find((p) => p._id === page.params.id));
	const tab = $derived(parseTab(page.url.searchParams.get("tab")));

	const tabs = $derived.by((): { id: EditorTab; label: string }[] => {
		if (!player) return [];
		return [
			{ id: "profile", label: "Profile" },
			{ id: "skins", label: `Skins · ${ctx.skinCounts.get(player._id) ?? 0}` },
			{ id: "links", label: `Links · ${player.links?.length ?? 0}` },
			{ id: "setup", label: `Setup · ${setupFilled(player)}/6` }
		];
	});

	const PLACEHOLDER: Record<EditorTab, string> = {
		profile: "Profile editing arrives in the next step.",
		skins: "Skin editing arrives in the next step.",
		links: "Link editing arrives in the next step.",
		setup: "The setup summary arrives in the next step."
	};

	/** Next/previous player in the filtered, sorted list, keeping the filter and the tab. */
	function go(delta: 1 | -1) {
		if (!page.params.id) return;
		const id = step(ctx.results, page.params.id, delta);
		if (!id) return;
		const target = resolve(`/dashboard/players/${id}`);
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() plus a query string
		goto(target + pickParams(page.url.searchParams, ["filter", "tab"]));
	}

	async function sync() {
		if (!player) return;
		try {
			await request("/api/players/sync", { method: "POST", body: { osu_id: player.osu_id } });
			toast.success("Synced from osu!");
			await invalidate("app:players");
		} catch (e) {
			toast.error((e as Error).message);
		}
	}

	async function remove() {
		if (!player) return;
		// Rejections are shown by the dialog, which then stays open.
		await request(`/api/players/${player._id}`, { method: "DELETE" });
		toast.success("Player deleted");
		// Leave first, so the editor doesn't flash "doesn't exist anymore" once the list reloads.
		await goto(ctx.listHref());
		await Promise.all([invalidate("app:players"), invalidate("app:skins")]);
	}
</script>

{#if player}
	<EditorFrame
		title={player.name}
		subtitle="osu! #{player.osu_id}"
		cover={player.cover_url}
		position={stepPosition(ctx.results, player._id)}
		total={ctx.results.length}
		onPrev={() => go(-1)}
		onNext={() => go(1)}
		menu={[
			{ label: "Sync with osu!", onSelect: sync },
			{ label: "Delete…", onSelect: () => (deleteOpen = true), destructive: true }
		]}
		{tabs}
		{tab}
	>
		{#snippet avatar()}
			<img
				src={osuAvatar(player.osu_id)}
				alt=""
				class="size-10 rounded-full bg-layer-3 object-cover"
			/>
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
		<p class="text-sm text-text-muted">{PLACEHOLDER[tab]}</p>
	</EditorFrame>

	<DeleteDialog bind:open={deleteOpen} name={player.name} kind="player" onConfirm={remove} />
{:else}
	<div
		class="flex h-full flex-col items-center justify-center gap-4 rounded-2xl bg-layer-1 p-4 text-center"
	>
		<p class="text-text-muted">This player doesn't exist anymore.</p>
		<!-- listHref() is resolve() plus ?filter. -->
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href={ctx.listHref()} class="text-accent-color hover:underline">Back to players</a>
	</div>
{/if}
