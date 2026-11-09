<script lang="ts">
	import type { Snippet } from "svelte";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import { Input } from "$comp/ui/input";
	import * as Select from "$comp/ui/select";
	import { hasBlankLink, isBlankLink, type LinkType } from "$lib/links";

	// `children` is an optional action (e.g. a Save button) shown opposite "Add link".
	let {
		links = $bindable(),
		children
	}: { links: { type: LinkType; value: string }[]; children?: Snippet } = $props();

	const LINK_TYPES: LinkType[] = ["twitter", "twitch", "youtube", "github", "discord", "custom"];
</script>

{#each links as link, i (i)}
	<div class="flex items-center gap-2">
		<Select.Root type="single" bind:value={link.type}>
			<Select.Trigger
				class="w-28 bg-layer-2 capitalize hover:bg-layer-3 data-[state=open]:bg-layer-3"
				aria-label="Link type">{link.type}</Select.Trigger
			>
			<Select.Content>
				{#each LINK_TYPES as type (type)}
					<Select.Item value={type} class="capitalize">{type}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
		<Input
			aria-label="Link"
			aria-invalid={isBlankLink(link) || undefined}
			bind:value={link.value}
			placeholder="URL or username"
			class="bg-layer-2"
		/>
		<Button
			variant="secondary"
			size="icon"
			aria-label="Remove link"
			onclick={() => links.splice(i, 1)}
		>
			<Icon name="trash" />
		</Button>
	</div>
{:else}
	<p class="text-body text-text-muted">No links yet.</p>
{/each}
{#if hasBlankLink(links)}
	<p class="text-caption text-error">Fill in or remove the empty link before saving.</p>
{/if}
<div class="mt-auto flex items-center justify-between gap-2 pt-1">
	<Button variant="secondary" onclick={() => links.push({ type: "custom", value: "" })}>
		<Icon name="plus" />
		Add link
	</Button>
	{@render children?.()}
</div>
