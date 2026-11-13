<script lang="ts">
	import { getContext } from "svelte";
	import { page } from "$app/state";
	import EmptyState from "$comp/empty-state.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import type { DevicesContext } from "../+layout.svelte";
	import DeviceForm from "./device-form.svelte";

	let { data } = $props();

	const ctx = getContext<DevicesContext>("devices-list");

	// Looked up in the layout's data, so a deleted device or a mistyped id lands on "not found".
	const device = $derived(data.devices.find((d) => d._id === page.params.id));
</script>

{#if device}
	<!-- A new device gets a new form, so its draft starts from that device. -->
	{#key device._id}
		<DeviceForm {device} />
	{/key}
{:else}
	<div class="flex h-full items-center justify-center rounded-xl bg-layer-1">
		<EmptyState icon="search-x" title="This device doesn't exist anymore">
			{#snippet action()}
				<Button variant="link" href={ctx.listHref()}>Back to devices</Button>
			{/snippet}
		</EmptyState>
	</div>
{/if}
