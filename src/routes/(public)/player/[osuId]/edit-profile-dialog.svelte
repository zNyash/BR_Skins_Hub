<script lang="ts">
	import { toast } from "svelte-sonner";
	import { invalidate } from "$app/navigation";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import * as Dialog from "$comp/ui/dialog";
	import { Input } from "$comp/ui/input";
	import * as Select from "$comp/ui/select";
	import { Textarea } from "$comp/ui/textarea";
	import { request } from "$lib/api";
	import type { LinkType } from "$lib/links";
	import type { PlayerWithSkins } from "$lib/types";

	let { player, open = $bindable() }: { player: PlayerWithSkins; open: boolean } = $props();

	const LINK_TYPES: LinkType[] = ["twitter", "twitch", "youtube", "github", "discord", "custom"];
	const BIO_MAX = 200;

	const fromPlayer = () => ({
		bio: player.bio ?? "",
		links: (player.links ?? []).map((link) => ({ ...link })),
		description: player.description ?? ""
	});

	// The dialog edits a copy, refreshed every time it opens so cancelled edits don't linger.
	let draft = $state(fromPlayer());
	$effect(() => {
		if (open) draft = fromPlayer();
	});

	let saving = $state(false);
	const bioTooLong = $derived(draft.bio.trim().length > BIO_MAX);

	async function save(event: SubmitEvent) {
		event.preventDefault();
		saving = true;
		try {
			await request("/api/me/profile", { method: "PATCH", body: draft });
			await invalidate(`app:player:${player.osu_id}`);
			open = false;
			toast.success("Profile saved");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't save your profile");
		} finally {
			saving = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto bg-layer-1 sm:max-w-xl">
		<Dialog.Header>
			<Dialog.Title>Edit profile</Dialog.Title>
		</Dialog.Header>

		<form id="edit-profile" class="flex flex-col gap-5" onsubmit={save}>
			<div class="flex flex-col gap-1">
				<span class="flex items-end justify-between">
					<label for="profile-bio" class="text-sm">Bio</label>
					<span class="text-xs {bioTooLong ? 'text-destructive' : 'text-text-muted'}">
						{draft.bio.trim().length}/{BIO_MAX}
					</span>
				</span>
				<Textarea
					id="profile-bio"
					rows={3}
					placeholder="A line or two about you"
					bind:value={draft.bio}
				/>
			</div>

			<div class="flex flex-col gap-2">
				<span class="text-sm">Links</span>
				{#each draft.links as link, i (i)}
					<span class="flex items-center gap-2">
						<Select.Root type="single" bind:value={link.type}>
							<Select.Trigger class="w-28 capitalize" aria-label="Link type">
								{link.type}
							</Select.Trigger>
							<Select.Content>
								{#each LINK_TYPES as type (type)}
									<Select.Item value={type} class="capitalize">{type}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						<Input aria-label="Link" bind:value={link.value} placeholder="URL or username" />
						<Button
							type="button"
							variant="secondary"
							size="icon-sm"
							aria-label="Remove link"
							onclick={() => draft.links.splice(i, 1)}
						>
							<Icon name="trash" />
						</Button>
					</span>
				{/each}
				<Button
					type="button"
					variant="secondary"
					class="w-fit"
					onclick={() => draft.links.push({ type: "custom", value: "" })}
				>
					<Icon name="plus" />
					Add link
				</Button>
			</div>

			<div class="flex flex-col gap-1">
				<label for="profile-description" class="text-sm">Description</label>
				<Textarea id="profile-description" rows={10} bind:value={draft.description} />
			</div>
		</form>

		<Dialog.Footer>
			<Dialog.Close>
				{#snippet child({ props })}
					<Button {...props} type="button" variant="secondary">Cancel</Button>
				{/snippet}
			</Dialog.Close>
			<Button form="edit-profile" type="submit" disabled={bioTooLong || saving}>
				{#if saving}
					<Icon name="loader-circle" class="animate-spin" />
					Saving
				{:else}
					Save
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
