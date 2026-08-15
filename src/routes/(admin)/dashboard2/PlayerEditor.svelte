<script lang="ts">
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as Select from "$comp/ui/select";
	import { Input } from "$comp/ui/input";
	import { Textarea } from "$comp/ui/textarea";
	import type { Doc, Id } from "$convex/_generated/dataModel";

	// ---------- Local Types ----------
	type Props = {
		player: Doc<"players">;
		onSave: (updated: {
			_id: Id<"players">;
			name: Doc<"players">["name"];
			hue: Doc<"players">["hue"];
			cover_url: Doc<"players">["cover_url"];
			description: Doc<"players">["description"];
			previous_usernames: Doc<"players">["previous_usernames"];
			links: Doc<"players">["links"];
		}) => void;
	};
	type LinkType = NonNullable<Doc<"players">["links"]>[number]["type"];
	const LINK_TYPES: LinkType[] = ["twitch", "twitter", "youtube", "github", "discord", "custom"];

	let { player, onSave }: Props = $props();

	// ---------- Constant State ----------
	// svelte-ignore state_referenced_locally
	const original = {
		name: player.name,
		cover_url: player.cover_url,
		hue: player.hue,
		description: player.description,
		previous_usernames: player.previous_usernames ?? [],
		links: player.links ?? []
	} satisfies Partial<Doc<"players">>;

	// ---------- Input State ----------
	let name = $state(original.name);
	let cover_url = $state(original.cover_url);
	let hue = $state(original.hue);
	let description = $state(original.description);
	let previous_usernames = $state(original.previous_usernames);
	let links = $state(original.links);

	let isDirty = $derived.by(() => {
		const current = {
			name,
			cover_url,
			hue,
			description,
			previous_usernames: $state.snapshot(previous_usernames),
			links: $state.snapshot(links)
		};
		return JSON.stringify(current) !== JSON.stringify(original);
	});

	// ---------- Handlers ----------
	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		onSave({ _id: player._id, name, hue, description, previous_usernames, links, cover_url });
		discard();
	}

	function discard() {
		name = original.name;
		cover_url = original.cover_url;
		hue = original.hue;
		description = original.description;
		previous_usernames = [...(original.previous_usernames ?? [])];
		links = structuredClone(original.links);
	}

	function addUsername() {
		previous_usernames.push("");
	}
	function removeUsername(index: number) {
		previous_usernames.splice(index, 1);
	}
	function addLink() {
		links.push({ type: "custom", value: "" });
	}

	function removeLink(index: number) {
		links.splice(index, 1);
	}
</script>

<div class="flex flex-col gap-2">
	<!-- Header -->
	<span class="flex items-center justify-between">
		<div class="flex flex-col">
			<p class="text-lg font-medium">Editing player</p>
			<p class="text-xs font-normal">{player.name}</p>
		</div>
		<div>
			{#if isDirty}
				<Button type="button" variant="secondary" onclick={discard}>
					<Icon name="brush-cleaning" />
					Discard
				</Button>
			{/if}
			<Button form="player-form" type="submit" onclick={() => handleSubmit}>
				<Icon name="save" />
				Save changes
			</Button>
		</div>
	</span>

	<!-- Form -->
	<form onsubmit={handleSubmit} id="player-form">
		<span class="flex flex-col gap-2">
			<span class="grid grid-cols-2 gap-2">
				<div class="flex flex-col">
					<label for="name" class="text-sm">Name</label>
					<Input id="name" type="text" bind:value={name} />
				</div>
				<div class="flex flex-col">
					<label for="hue" class="text-sm">Profile Color</label>
					<Input id="hue" type="number" min="0" max="360" bind:value={hue} />
				</div>
			</span>

			<div class="flex flex-col">
				<label for="cover_url" class="text-sm">Cover</label>
				<Input id="cover_url" type="text" bind:value={cover_url} />
			</div>

			<div class="flex flex-col">
				<label for="description" class="text-sm">Description</label>
				<Textarea id="description" bind:value={description} />
			</div>

			<div class="flex flex-col gap-1">
				<span class="flex items-end justify-between">
					<label for="previous_usernames" class="text-sm">Previous Usernames</label>
					<span class="flex gap-2">
						<Button type="button" variant="secondary" size="icon-sm" onclick={addUsername}>
							<Icon name="plus" />
						</Button>
					</span>
				</span>

				{#each previous_usernames, i (i)}
					<span class="flex items-center gap-2">
						<Input bind:value={previous_usernames[i]} />
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
					<label for="links" class="text-sm">Links</label>
					<Button type="button" variant="secondary" size="icon-sm" onclick={addLink}>
						<Icon name="plus" />
					</Button>
				</span>

				{#each links as link, i (i)}
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
		</span>
	</form>
</div>
