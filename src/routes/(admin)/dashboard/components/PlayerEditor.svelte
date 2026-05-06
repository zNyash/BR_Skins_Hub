<script lang="ts">
	import { superForm, defaults } from "sveltekit-superforms";
	import { valibot } from "sveltekit-superforms/adapters";
	import { invalidate } from "$app/navigation";
	import { playerSchema } from "../schemas";
	import type { Doc } from "$convex/_generated/dataModel";
	import { Input } from "$comp/ui/input";
	import { Button } from "$comp/ui/button";
	import * as Select from "$comp/ui/select";
	import { Textarea } from "$comp/ui/textarea";
	import type { InferInput } from "valibot";
	import Icon from "$comp/icon.svelte";
	import { untrack } from "svelte";

	type LinkType = NonNullable<Doc<"players">["links"]>[number]["type"];

	type Props = {
		player?: Doc<"players"> | null;
		onsave?: () => void;
		onassign?: () => void;
	};

	let { player = null, onsave = () => {}, onassign = () => {} }: Props = $props();

	const save = untrack(() => onsave);
	const LINK_TYPES: LinkType[] = ["twitch", "twitter", "youtube", "github", "discord", "custom"];

	const playerData = player
		? ({
				name: player.name,
				osu_id: player.osu_id,
				cover_url: player.cover_url,
				hue: player.hue,
				description: player.description,
				previous_usernames: player.previous_usernames,
				links: player.links
			} satisfies InferInput<typeof playerSchema>)
		: {};

	let saved = $state(false);

	const {
		form: formData,
		allErrors,
		errors,
		isTainted,
		tainted,
		enhance,
		reset,
		submitting
	} = superForm(defaults(playerData, valibot(playerSchema)), {
		SPA: true,
		validators: valibot(playerSchema),
		resetForm: false,
		onUpdate: async ({ form }) => {
			if (!form.valid) return;
			await fetch(player ? `/api/players/${player._id}` : "/api/players", {
				method: player ? "PATCH" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form.data)
			});
			await invalidate("app:players");
			reset({ data: form.data });
			saved = true;
			setTimeout(() => (saved = false), 2000);
			save();
		}
	});

	function addUsername() {
		$formData.previous_usernames = [...($formData.previous_usernames ?? []), ""];
	}

	function removeUsername(i: number) {
		$formData.previous_usernames = ($formData.previous_usernames ?? []).filter((_, j) => j !== i);
	}

	function addLink() {
		$formData.links = [...($formData.links ?? []), { type: "custom", value: "" }];
	}

	function removeLink(i: number) {
		$formData.links = ($formData.links ?? []).filter((_, j) => j !== i);
	}

	async function handleDelete() {
		if (!player) return;
		await fetch(`/api/players/${player._id}`, { method: "DELETE" });
		await invalidate("app:players");
	}
</script>

<div class="flex items-center justify-between">
	<span class="flex flex-col">
		<h2 class="text-lg font-medium">{player ? "Editing Player" : "New Player"}</h2>
		{#if player}
			<p class="text-xs font-normal">{player.name}</p>
		{/if}
	</span>
</div>

<form use:enhance class="flex flex-1 flex-col gap-2">
	<div class="flex flex-col">
		<label for="name" class="text-sm">Name</label>
		<Input id="name" bind:value={$formData.name} />
		{#if $errors.name}<p class="text-sm text-destructive">{$errors.name[0]}</p>{/if}
	</div>

	<div class="flex flex-col">
		<label for="osu_id" class="text-sm">osu! ID</label>
		<Input id="osu_id" type="number" bind:value={$formData.osu_id} disabled={!!player} />
		{#if $errors.osu_id}<p class="text-sm text-destructive">{$errors.osu_id[0]}</p>{/if}
	</div>

	<div class="flex flex-col">
		<label for="cover_url" class="text-sm">Cover URL</label>
		<Input id="cover_url" bind:value={$formData.cover_url} />
	</div>

	<div class="flex flex-col">
		<label for="hue" class="text-sm">Hue (0–360)</label>
		<Input id="hue" type="number" bind:value={$formData.hue} />
	</div>

	<div class="flex flex-col">
		<label for="description" class="text-sm">Description</label>
		<Textarea id="description" bind:value={$formData.description} />
	</div>

	<div class="flex flex-col gap-1">
		<div class="flex items-center justify-between">
			<label class="text-sm">Previous Usernames</label>
			<Button type="button" variant="ghost" size="icon-sm" onclick={addUsername}>
				<Icon name="plus" />
			</Button>
		</div>
		{#each $formData.previous_usernames ?? [] as username, i (i)}
			<div class="flex gap-1">
				<Input
					value={username}
					oninput={(e) => {
						const arr = [...($formData.previous_usernames ?? [])];
						arr[i] = e.currentTarget.value;
						$formData.previous_usernames = arr;
					}}
				/>
				<Button type="button" variant="ghost" size="icon-sm" onclick={() => removeUsername(i)}>
					<Icon name="x" />
				</Button>
			</div>
		{/each}
	</div>

	<div class="flex flex-col gap-1">
		<div class="flex items-center justify-between">
			<label class="text-sm">Links</label>
			<Button type="button" variant="ghost" size="icon-sm" onclick={addLink}>
				<Icon name="plus" />
			</Button>
		</div>
		{#each $formData.links ?? [] as link, i (i)}
			<div class="flex items-center gap-1">
				<Select.Root
					type="single"
					value={link.type}
					onValueChange={(v) => {
						const arr = [...($formData.links ?? [])];
						arr[i] = { ...arr[i], type: v as LinkType };
						$formData.links = arr;
					}}
				>
					<Select.Trigger class="w-32">
						{link.type ?? "Type"}
					</Select.Trigger>
					<Select.Content>
						{#each LINK_TYPES as type (type)}
							<Select.Item value={type}>{type}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<Input
					class="flex-1"
					value={link.value ?? ""}
					oninput={(e) => {
						const arr = [...($formData.links ?? [])];
						arr[i] = { ...arr[i], value: e.currentTarget.value };
						$formData.links = arr;
					}}
				/>
				<Button type="button" variant="ghost" size="icon-sm" onclick={() => removeLink(i)}>
					<Icon name="x" />
				</Button>
			</div>
		{/each}
	</div>

	<div class="flex gap-2">
		<Button
			type="submit"
			disabled={!($tainted && isTainted()) || $submitting || $allErrors.length > 0}
		>
			{#if $submitting}
				Saving...
			{:else if saved}
				Saved!
			{:else}
				{player ? "Save changes" : "Create player"}
			{/if}
		</Button>
		{#if player}
			<Button type="button" variant="secondary" onclick={onassign}>
				<Icon name="link" />
				Assign Skins
			</Button>
			<Button type="button" variant="destructive" onclick={handleDelete}>
				<Icon name="trash" />
			</Button>
		{/if}
	</div>
</form>
