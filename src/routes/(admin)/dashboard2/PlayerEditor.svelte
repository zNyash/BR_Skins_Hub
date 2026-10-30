<script lang="ts">
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as Select from "$comp/ui/select";
	import { Input } from "$comp/ui/input";
	import { Textarea } from "$comp/ui/textarea";
	import type { Doc, Id } from "$convex/_generated/dataModel";
	import { invalidate } from "$app/navigation";
	import { SKIN_SORT_OPTIONS, type OrderBy, type SkinSortBy } from "$lib/constants";
	import { useFuzzyFilter } from "$lib/utils/fuzzyFilter.svelte";
	import { useSorted } from "$lib/utils/sorted.svelte";
	import SearchSorted from "$comp/search-sorted.svelte";
	import { Badge } from "$lib/components/ui/badge/index.js";

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

	let inputValue = $state("");
	let sortBy = $state<SkinSortBy>("date");
	let orderBy = $state<OrderBy>("desc");
	let isSaving = $state(false);
	let saveError = $state<string | null>(null);

	const filtered = useFuzzyFilter(
		() => allSkins,
		() => inputValue,
		{ keys: ["name"], threshold: 0.4 }
	);
	const sorted = useSorted(
		() => filtered.results,
		() => sortBy,
		() => orderBy,
		SKIN_SORT_OPTIONS
	);

	let isDirty = $derived.by(() => {
		const current = $state.snapshot(draft);
		return (
			JSON.stringify(current.player) !== JSON.stringify(initialDraft.player) ||
			JSON.stringify([...current.skinIds].sort()) !==
				JSON.stringify([...initialDraft.skinIds].sort())
		);
	});

	let assignedSkins = $derived(allSkins.filter((skin) => draft.skinIds.includes(skin._id)));
	let availableSkins = $derived(sorted.results.filter((skin) => !draft.skinIds.includes(skin._id)));

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (!isDirty) return;
		isSaving = true;
		saveError = null;

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
			saveError = e instanceof Error ? e.message : "Failed to save";
		} finally {
			isSaving = false;
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

	function addSkin(skinId: Id<"skins">) {
		draft.skinIds.push(skinId);
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
			<p class="text-xs font-normal text-red-400">{saveError}</p>
		</div>

		<div>
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

			<div class="flex w-full flex-col gap-1 p-1">
				<SearchSorted
					placeholder="Search skins by name..."
					sortOptions={SKIN_SORT_OPTIONS}
					bind:sortBy
					bind:orderBy
					bind:inputValue
				/>
				<div class="flex w-full flex-wrap gap-2 gap-y-1">
					{#each assignedSkins as skin}
						<Badge variant="outline"
							>{skin.name}
							<button type="button" onclick={() => removeSkin(skin._id)}>
								<Icon name="x" class="size-4 hover:brightness-125" />
							</button>
						</Badge>
					{/each}
				</div>

				<div class="grid h-fit grid-cols-2 flex-col gap-2">
					{#each availableSkins as skin}
						<div class="group/skin flex flex-col rounded bg-layer-2 hover:ring hover:ring-primary">
							<span class="relative">
								<img src={skin.preview_images[0]} alt="" class="rounded-t" />
								<div
									class="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover/skin:opacity-100"
								>
									<Button
										variant="secondary"
										class="bg-layer-3"
										type="button"
										onclick={() => addSkin(skin._id)}
									>
										<Icon name="plus" />
										Assign
									</Button>
								</div>
							</span>
							<p class="p-1">{skin.name}</p>
						</div>
					{/each}
				</div>
			</div>
		</span>
	</form>
</div>
