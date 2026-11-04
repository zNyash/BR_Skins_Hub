<script lang="ts">
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as Select from "$comp/ui/select";
	import { Input } from "$comp/ui/input";
	import { Textarea } from "$comp/ui/textarea";
	import type { Doc, Id } from "$convex/_generated/dataModel";
	import { invalidate } from "$app/navigation";
	import AssignSkinsDialog from "./AssignSkinsDialog.svelte";

	type SkinWithPlayers = Doc<"skins"> & { players: Doc<"players">[] };

	type Props = {
		player: Doc<"players">;
		allSkins: SkinWithPlayers[];
		onSave: () => void;
	};

	type LinkType = NonNullable<Doc<"players">["links"]>[number]["type"];
	const LINK_TYPES: LinkType[] = ["twitch", "twitter", "youtube", "github", "discord", "custom"];

	let { player, onSave, allSkins }: Props = $props();

	function snapshotFromPlayer(p: Doc<"players">) {
		return {
			name: p.name,
			cover_url: p.cover_url,
			hue: p.hue,
			description: p.description,
			previous_usernames: p.previous_usernames ?? [],
			links: p.links ?? []
		} satisfies Partial<Doc<"players">>;
	}

	// svelte-ignore state_referenced_locally
	const initialPlayerSkins = allSkins.filter((skin) =>
		skin.players.some((assignedPlayer) => assignedPlayer._id === player._id)
	);

	// svelte-ignore state_referenced_locally
	const initialDraft = {
		player: snapshotFromPlayer(player),
		skinIds: initialPlayerSkins.map((skin) => skin._id)
	};
	let draft = $state(structuredClone(initialDraft));

	let isSaving = $state(false);
	let isRefreshing = $state(false);
	let errorMessage = $state<string | null>(null);

	let isDirty = $derived.by(() => {
		const current = $state.snapshot(draft);
		return (
			JSON.stringify(current.player) !== JSON.stringify(initialDraft.player) ||
			JSON.stringify([...current.skinIds].sort()) !==
				JSON.stringify([...initialDraft.skinIds].sort())
		);
	});

	let assignedSkins = $derived(allSkins.filter((skin) => draft.skinIds.includes(skin._id)));

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (!isDirty) return;
		isSaving = true;
		errorMessage = null;

		try {
			const playerResponse = await fetch(`/api/players/${player._id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ osu_id: player.osu_id, ...draft.player })
			});
			if (!playerResponse.ok) throw new Error(await playerResponse.text());

			const skinResponse = await fetch(`/api/player-skins/${player._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ skin_ids: draft.skinIds })
			});
			if (!skinResponse.ok) throw new Error(await skinResponse.text());

			onSave();
			await invalidate("app:players");
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : "Failed to save";
		} finally {
			isSaving = false;
		}
	}

	async function refreshFromOsu() {
		isRefreshing = true;
		errorMessage = null;
		try {
			const response = await fetch(`/api/player/refresh?osu_id=${player.osu_id}`);
			if (!response.ok) throw new Error(await response.text());
			// The page re-creates this editor when the player data changes, so the draft picks up the fresh data.
			await invalidate("app:players");
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : "Failed to refresh from osu!";
		} finally {
			isRefreshing = false;
		}
	}

	function discard() {
		draft = structuredClone(initialDraft);
	}

	function addUsername() {
		draft.player.previous_usernames.push("");
	}
	function removeUsername(index: number) {
		draft.player.previous_usernames.splice(index, 1);
	}

	function addLink() {
		draft.player.links.push({ type: "custom", value: "" });
	}
	function removeLink(index: number) {
		draft.player.links.splice(index, 1);
	}

	function addSkins(skinIds: Id<"skins">[]) {
		for (const id of skinIds) {
			if (!draft.skinIds.includes(id)) draft.skinIds.push(id);
		}
	}
	function removeSkin(skinId: Id<"skins">) {
		draft.skinIds = draft.skinIds.filter((id) => id !== skinId);
	}
</script>

<div class="flex flex-col gap-2">
	<span class="flex items-center justify-between">
		<div class="flex flex-col">
			<p class="text-lg font-medium">Editing player</p>
			<p class="text-xs font-normal">{player.name}</p>
			<p class="text-xs font-normal text-red-400">{errorMessage}</p>
		</div>

		<div class="flex gap-2">
			<Button
				type="button"
				variant="secondary"
				disabled={isDirty || isRefreshing}
				title={isDirty
					? "Save or discard your changes first"
					: "Fetch name, cover and usernames from osu!"}
				onclick={refreshFromOsu}
			>
				<Icon name="refresh-cw" class={isRefreshing ? "animate-spin" : ""} />
				Refresh from osu!
			</Button>
			{#if isDirty}
				<Button type="button" variant="secondary" onclick={discard}>
					<Icon name="brush-cleaning" />
					Discard
				</Button>
			{/if}
			<Button form="player-form" type="submit" disabled={!isDirty || isSaving}>
				{#if isSaving}
					<Icon name="loader-circle" class="animate-spin" />
					Saving
				{:else}
					<Icon name="save" />
					Save changes
				{/if}
			</Button>
		</div>
	</span>

	<form onsubmit={handleSubmit} id="player-form">
		<span class="flex flex-col gap-2">
			<span class="grid grid-cols-2 gap-2">
				<div class="flex flex-col">
					<label for="name" class="text-sm">Name</label>
					<Input id="name" type="text" bind:value={draft.player.name} />
				</div>

				<div class="flex flex-col">
					<label for="hue" class="text-sm">Profile Color</label>
					<Input id="hue" type="number" min="0" max="360" bind:value={draft.player.hue} />
				</div>
			</span>

			<div class="flex flex-col">
				<label for="cover_url" class="text-sm">Cover</label>
				<Input id="cover_url" type="text" bind:value={draft.player.cover_url} />
			</div>

			<div class="flex flex-col">
				<label for="description" class="text-sm">Description</label>
				<Textarea id="description" bind:value={draft.player.description} />
			</div>

			<div class="flex flex-col gap-1">
				<span class="flex items-end justify-between">
					<span class="text-sm">Previous Usernames</span>
					<span class="flex gap-2">
						<Button type="button" variant="secondary" size="icon-sm" onclick={addUsername}>
							<Icon name="plus" />
						</Button>
					</span>
				</span>

				{#each draft.player.previous_usernames, i (i)}
					<span class="flex items-center gap-2">
						<Input bind:value={draft.player.previous_usernames[i]} />
						<Button
							type="button"
							variant="secondary"
							size="icon-sm"
							onclick={() => removeUsername(i)}
						>
							<Icon name="trash" />
						</Button>
					</span>
				{/each}
			</div>

			<div class="flex flex-col gap-1">
				<span class="flex items-end justify-between">
					<span class="text-sm">Links</span>
					<Button type="button" variant="secondary" size="icon-sm" onclick={addLink}>
						<Icon name="plus" />
					</Button>
				</span>

				{#each draft.player.links as link, i (i)}
					<span class="flex items-center gap-2">
						<Select.Root type="single" bind:value={link.type}>
							<Select.Trigger class="w-28 capitalize">
								{link.type}
							</Select.Trigger>
							<Select.Content>
								{#each LINK_TYPES as type (type)}
									<Select.Item value={type} class="capitalize">{type}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>

						<Input bind:value={link.value} placeholder="URL or value" />

						<Button type="button" variant="secondary" size="icon-sm" onclick={() => removeLink(i)}>
							<Icon name="trash" />
						</Button>
					</span>
				{/each}
			</div>

			<div class="mt-2 flex flex-col gap-2 border-t border-border pt-3">
				<span class="flex items-center justify-between">
					<span class="flex items-center gap-2 text-sm font-medium">
						Skins
						<span class="rounded-full bg-primary/20 px-2 text-xs">{assignedSkins.length}</span>
					</span>
					<AssignSkinsDialog
						{allSkins}
						assignedIds={draft.skinIds}
						playerName={draft.player.name}
						onAssign={addSkins}
					/>
				</span>

				{#if assignedSkins.length === 0}
					<p class="py-4 text-center text-sm text-muted-foreground">No skins assigned yet.</p>
				{:else}
					<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
						{#each assignedSkins as skin (skin._id)}
							<div
								class="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md bg-layer-2/50 p-1.5"
							>
								<img
									src={skin.preview_images[0]}
									alt=""
									class="aspect-video w-16 rounded object-cover"
								/>
								<div class="min-w-0">
									<p class="truncate text-sm">{skin.name}</p>
									<p class="truncate text-xs text-muted-foreground">
										by {skin.author ?? "Unknown"}
									</p>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									aria-label="Remove {skin.name}"
									onclick={() => removeSkin(skin._id)}
								>
									<Icon name="x" />
								</Button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</span>
	</form>
</div>
