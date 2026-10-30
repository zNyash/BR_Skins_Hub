<script lang="ts">
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as Select from "$comp/ui/select";
	import { Input } from "$comp/ui/input";
	import { Textarea } from "$comp/ui/textarea";
	import type { Doc } from "$convex/_generated/dataModel";
	import { invalidate } from "$app/navigation";
	import { SKIN_SORT_OPTIONS, type OrderBy, type SkinSortBy } from "$lib/constants";
	import { useFuzzyFilter } from "$lib/utils/fuzzyFilter.svelte";
	import { useSorted } from "$lib/utils/sorted.svelte";
	import SearchSorted from "$comp/search-sorted.svelte";

	// ---------- Local Types ----------
	type SkinWithPlayers = Doc<"skins"> & { players: Doc<"players">[] };

	type Props = {
		player: Doc<"players">;
		allSkins: SkinWithPlayers[];
		onSave: () => void;
	};
	type LinkType = NonNullable<Doc<"players">["links"]>[number]["type"];
	const LINK_TYPES: LinkType[] = ["twitch", "twitter", "youtube", "github", "discord", "custom"];

	let { player, onSave, allSkins }: Props = $props();

	// const players = convex;
	// ---------- Helpers ----------
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

	// ---------- State ----------
	// svelte-ignore state_referenced_locally
	let original = $state(snapshotFromPlayer(player)); // dirty-check baseline
	// svelte-ignore state_referenced_locally
	let form = $state(snapshotFromPlayer(player)); // the live, editable state

	let isDirty = $derived(JSON.stringify($state.snapshot(form)) !== JSON.stringify(original));

	let isSaving = $state(false);
	let saveError = $state<string | null>(null);

	let inputValue = $state("");
	let sortBy = $state<SkinSortBy>("date");
	let orderBy = $state<OrderBy>("desc");

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

	// ---------- Handlers ----------
	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (!isDirty) return;
		isSaving = true;
		saveError = null;

		try {
			const res = await fetch(`/api/players/${player._id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ osu_id: player.osu_id, ...form })
			});
			if (!res.ok) throw new Error(await res.text());

			// Update the base state for comparison (isDirty check)
			original = $state.snapshot(form);

			onSave();
			await invalidate("app:players");
		} catch (e) {
			saveError = e instanceof Error ? e.message : "Failed to save";
		} finally {
			isSaving = false;
		}
	}

	function discard() {
		form = structuredClone(original);
	}

	function addUsername() {
		form.previous_usernames.push("");
	}
	function removeUsername(index: number) {
		form.previous_usernames.splice(index, 1);
	}
	function addLink() {
		form.links.push({ type: "custom", value: "" });
	}
	function removeLink(index: number) {
		form.links.splice(index, 1);
	}
</script>

<div class="flex flex-col gap-2">
	<!-- Header -->
	<span class="flex items-center justify-between">
		<div class="flex flex-col">
			<p class="text-lg font-medium">Editing player</p>
			<p class="text-xs font-normal">{player.name}</p>
			<p class="text-xs font-normal text-red-400">{saveError}</p>
		</div>

		<!-- Buttons -->
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

	<!-- Form -->
	<form onsubmit={handleSubmit} id="player-form">
		<span class="flex flex-col gap-2">
			<!-- Name and Profile Color -->
			<span class="grid grid-cols-2 gap-2">
				<div class="flex flex-col">
					<label for="name" class="text-sm">Name</label>
					<Input id="name" type="text" bind:value={form.name} />
				</div>

				<div class="flex flex-col">
					<label for="hue" class="text-sm">Profile Color</label>
					<Input id="hue" type="number" min="0" max="360" bind:value={form.hue} />
				</div>
			</span>

			<!-- Cover link/url -->
			<div class="flex flex-col">
				<label for="cover_url" class="text-sm">Cover</label>
				<Input id="cover_url" type="text" bind:value={form.cover_url} />
			</div>

			<!-- Description -->
			<div class="flex flex-col">
				<label for="description" class="text-sm">Description</label>
				<Textarea id="description" bind:value={form.description} />
			</div>

			<!-- Usernames -->
			<div class="flex flex-col gap-1">
				<span class="flex items-end justify-between">
					<span class="text-sm">Previous Usernames</span>
					<span class="flex gap-2">
						<Button type="button" variant="secondary" size="icon-sm" onclick={addUsername}>
							<Icon name="plus" />
						</Button>
					</span>
				</span>

				{#each form.previous_usernames, i (i)}
					<span class="flex items-center gap-2">
						<Input bind:value={form.previous_usernames[i]} />
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

			<!-- Links -->
			<div class="flex flex-col gap-1">
				<span class="flex items-end justify-between">
					<span class="text-sm">Links</span>
					<Button type="button" variant="secondary" size="icon-sm" onclick={addLink}>
						<Icon name="plus" />
					</Button>
				</span>

				{#each form.links as link, i (i)}
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

			<!-- Here will go the component for the player assignSkinAssignment -->
			<div class="flex w-full flex-col gap-1 p-1">
				<SearchSorted
					placeholder="Search skins by name..."
					sortOptions={SKIN_SORT_OPTIONS}
					bind:sortBy
					bind:orderBy
					bind:inputValue
				/>
				<!-- Badges with the name of the skins the current player already have attached to them         -->
				<div></div>

				<div class="grid h-fit grid-cols-2 flex-col gap-2">
					{#each sorted.results as skin}
						<div class="group/skin flex flex-col rounded bg-layer-2 hover:ring hover:ring-primary">
							<span class="relative">
								<img src={skin.preview_images[0]} alt="" class="rounded-t" />
								<div
									class="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover/skin:opacity-100"
								>
									<Button variant="secondary" class="bg-layer-3">
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
