<script lang="ts">
	import { flip } from "svelte/animate";
	import { dndzone } from "svelte-dnd-action";
	import { toast } from "svelte-sonner";
	import { invalidate } from "$app/navigation";
	import HoldButton from "$comp/hold-button.svelte";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import { Input } from "$comp/ui/input";
	import * as Select from "$comp/ui/select";
	import { Textarea } from "$comp/ui/textarea";
	import type { Doc, Id } from "$convex/_generated/dataModel";
	import { sortPlayerSkins } from "$convex/lib/order";
	import { request } from "$lib/api";
	import { DND_FLIP_MS, GHOST_CLASS, dndOptions, isGhost } from "$lib/dnd";
	import type { SkinWithPlayers } from "$lib/types";
	import { cn } from "$lib/utils";
	import AssignSkinsDialog from "./assign-skins-dialog.svelte";
	import { skinsChanged, type DraftSkin } from "./player-skins";
	import TagInput from "./tag-input.svelte";

	type Props = {
		player: Doc<"players">;
		allSkins: SkinWithPlayers[];
		/** Every tag already used on any player or skin, offered as autocomplete. */
		tagSuggestions: string[];
		onSave: () => void;
		/** Asks the page to confirm and delete this player. */
		onDelete: () => void;
	};

	type LinkType = NonNullable<Doc<"players">["links"]>[number]["type"];
	const LINK_TYPES: LinkType[] = ["twitch", "twitter", "youtube", "github", "discord", "custom"];

	let { player, allSkins, tagSuggestions, onSave, onDelete }: Props = $props();

	// --- Draft ---
	// The form edits a copy; comparing it to the initial copy tells whether there's anything to save.
	function snapshotFromPlayer(p: Doc<"players">) {
		return {
			name: p.name,
			cover_url: p.cover_url,
			hue: p.hue,
			description: p.description,
			previous_usernames: p.previous_usernames ?? [],
			links: p.links ?? [],
			tags: p.tags ?? []
		} satisfies Partial<Doc<"players">>;
	}

	// Each list item carries its skin doc: while dragging, the placeholder item gets a different id,
	// so the doc can't be looked up by id there.
	type SkinItem = DraftSkin & { skin: SkinWithPlayers };
	const toItem = (skin: SkinWithPlayers, hidden: boolean): SkinItem => ({
		id: skin._id,
		hidden,
		skin
	});

	// Same order as the profile page: the player's relation on each skin has its position and visibility.
	// svelte-ignore state_referenced_locally
	const initialSkins = sortPlayerSkins(
		allSkins.flatMap((skin) => {
			const relation = skin.players.find((p) => p._id === player._id);
			return relation ? [{ skin, position: relation.position, hidden: relation.hidden }] : [];
		})
	).map((e) => toItem(e.skin, e.hidden));

	// svelte-ignore state_referenced_locally
	const initialDraft = {
		player: snapshotFromPlayer(player),
		skins: initialSkins
	};
	let draft = $state(structuredClone(initialDraft));

	let isSaving = $state(false);
	let isRefreshing = $state(false);

	const isDirty = $derived.by(() => {
		const current = $state.snapshot(draft);
		return (
			JSON.stringify(current.player) !== JSON.stringify(initialDraft.player) ||
			skinsChanged(current.skins, initialDraft.skins)
		);
	});

	// --- Saving ---
	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (!isDirty) return;
		isSaving = true;

		try {
			// Fields and skin assignments are saved together, in one transaction.
			await request(`/api/players/${player._id}`, {
				method: "PATCH",
				body: {
					...draft.player,
					skins: draft.skins.map(({ id, hidden }) => ({ id, hidden }))
				}
			});
			toast.success("Player saved");
			onSave();
			await invalidate("app:players");
		} catch (e) {
			toast.error((e as Error).message);
		} finally {
			isSaving = false;
		}
	}

	async function refreshFromOsu() {
		isRefreshing = true;
		try {
			await request("/api/players/sync", { method: "POST", body: { osu_id: player.osu_id } });
			toast.success("Synced from osu!");
			// The page re-creates this editor when the player data changes, so the draft picks up the fresh data.
			await invalidate("app:players");
		} catch (e) {
			toast.error((e as Error).message);
		} finally {
			isRefreshing = false;
		}
	}

	function discard() {
		draft = structuredClone(initialDraft);
	}

	// --- Usernames and links ---
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

	// --- Skins ---
	// Newly assigned skins go on top, like on the profile page.
	function addSkins(skinIds: Id<"skins">[]) {
		const assigned = new Set(draft.skins.map((s) => s.id));
		const added = allSkins.filter((skin) => skinIds.includes(skin._id) && !assigned.has(skin._id));
		draft.skins = [...added.map((skin) => toItem(skin, false)), ...draft.skins];
	}
	function removeSkin(skinId: Id<"skins">) {
		draft.skins = draft.skins.filter((s) => s.id !== skinId);
	}
</script>

<div class="flex flex-col gap-2">
	<span class="flex items-center justify-between">
		<div class="flex flex-col">
			<p class="text-lg font-medium">Editing player</p>
			<p class="text-xs font-normal">{player.name}</p>
		</div>

		<div class="flex gap-2">
			<HoldButton
				variant="destructive"
				duration={1500}
				fillColor="bg-black/40"
				size="icon"
				title="Hold to delete"
				onComplete={onDelete}
			>
				<Icon name="trash" />
			</HoldButton>
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

			<TagInput id="player-tags" bind:tags={draft.player.tags} suggestions={tagSuggestions} />

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
						<span class="rounded-full bg-primary/20 px-2 text-xs">{draft.skins.length}</span>
					</span>
					<AssignSkinsDialog
						{allSkins}
						assignedIds={draft.skins.map((s) => s.id)}
						playerName={draft.player.name}
						onAssign={addSkins}
					/>
				</span>

				{#if draft.skins.length === 0}
					<p class="py-4 text-center text-sm text-muted-foreground">No skins assigned yet.</p>
				{:else}
					<p class="text-xs text-muted-foreground">Drag to reorder · top-left shows first</p>
				{/if}
				<div
					class="grid grid-cols-1 gap-2 sm:grid-cols-2"
					use:dndzone={dndOptions(draft.skins)}
					onconsider={(e) => (draft.skins = e.detail.items)}
					onfinalize={(e) => (draft.skins = e.detail.items)}
				>
					{#each draft.skins as item (item.id)}
						<div
							animate:flip={{ duration: DND_FLIP_MS }}
							class={cn(
								"grid cursor-grab grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-md bg-layer-2/50 p-1.5",
								isGhost(item) && GHOST_CLASS
							)}
						>
							<img
								src={item.skin.preview_images[0]}
								alt=""
								draggable="false"
								class={cn(
									"aspect-video w-16 rounded object-cover",
									item.hidden && "brightness-60 grayscale"
								)}
							/>
							<div class={cn("min-w-0", item.hidden && "opacity-50")}>
								<p class="truncate text-sm">{item.skin.name}</p>
								<p class="truncate text-xs text-muted-foreground">
									by {item.skin.author ?? "Unknown"}{item.hidden ? " · hidden" : ""}
								</p>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label="{item.hidden ? 'Show' : 'Hide'} {item.skin.name}"
								aria-pressed={item.hidden}
								class={cn(item.hidden && "text-primary")}
								onclick={() => (item.hidden = !item.hidden)}
							>
								<Icon name={item.hidden ? "eye-off" : "eye"} />
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label="Remove {item.skin.name}"
								onclick={() => removeSkin(item.id)}
							>
								<Icon name="x" />
							</Button>
						</div>
					{/each}
				</div>
			</div>
		</span>
	</form>
</div>
