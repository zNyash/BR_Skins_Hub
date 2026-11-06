<script lang="ts">
	import { untrack } from "svelte";
	import { toast } from "svelte-sonner";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import { Input } from "$comp/ui/input";
	import * as Select from "$comp/ui/select";
	import type { LinkType } from "$lib/links";
	import type { PlayerWithSkins } from "$lib/types";
	import { errorMessage, saveProfile } from "./save-profile";
	import SettingsCard from "./settings-card.svelte";
	import { guardUnsaved } from "./unsaved-guard.svelte";

	let { player }: { player: PlayerWithSkins } = $props();

	const LINK_TYPES: LinkType[] = ["twitter", "twitch", "youtube", "github", "discord", "custom"];

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
	// An empty row would be dropped silently on save, so it has to be filled in or removed first.
	const isBlank = (value: string) => value.trim() === "";
	const hasBlank = $derived(draft.some((link) => isBlank(link.value)));

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
	{#each draft as link, i (i)}
		<div class="flex items-center gap-2">
			<Select.Root type="single" bind:value={link.type}>
				<Select.Trigger class="w-28 capitalize" aria-label="Link type">{link.type}</Select.Trigger>
				<Select.Content>
					{#each LINK_TYPES as type (type)}
						<Select.Item value={type} class="capitalize">{type}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Input
				aria-label="Link"
				aria-invalid={isBlank(link.value) || undefined}
				bind:value={link.value}
				placeholder="URL or username"
			/>
			<Button
				variant="secondary"
				size="icon"
				aria-label="Remove link"
				onclick={() => draft.splice(i, 1)}
			>
				<Icon name="trash" />
			</Button>
		</div>
	{:else}
		<p class="text-sm text-text-muted">No links yet.</p>
	{/each}
	{#if hasBlank}
		<p class="text-xs text-destructive">Fill in or remove the empty link before saving.</p>
	{/if}
	<div class="mt-auto flex items-center justify-between gap-2 pt-1">
		<Button variant="secondary" onclick={() => draft.push({ type: "custom", value: "" })}>
			<Icon name="plus" />
			Add link
		</Button>
		<Button disabled={!dirty || hasBlank || saving} onclick={save}>
			{#if saving}<Icon name="loader-circle" class="animate-spin" />{/if}
			Save
		</Button>
	</div>
</SettingsCard>
