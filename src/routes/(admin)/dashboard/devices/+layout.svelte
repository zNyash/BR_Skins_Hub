<script module lang="ts">
	import type { Device } from "$lib/types";

	/** What the editor pages read from this layout (the stepper walks the filtered, sorted list). */
	export type DevicesContext = {
		results: Device[];
		openCreator: () => void;
		listHref: () => string;
	};
</script>

<script lang="ts">
	import { setContext } from "svelte";
	import { toast } from "svelte-sonner";
	import { goto, invalidate } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import FilterChips from "$comp/filter-chips.svelte";
	import Icon from "$comp/icon.svelte";
	import SearchToolbar from "$comp/search-toolbar.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import { request } from "$lib/api";
	import { DEVICE_LIST, useListQuery } from "$lib/hooks/list-query.svelte";
	import { DEVICE_FILTERS, parseFilter, setParam, syncSummary } from "../derive";
	import DeviceCreatorDialog from "../dialogs/device-creator-dialog.svelte";
	import ListPane from "../list-pane.svelte";
	import { unsaved } from "../unsaved.svelte";
	import DeviceRow from "./device-row.svelte";

	let { data, children } = $props();

	let creatorOpen = $state(false);
	let syncing = $state(false);

	// Opening the creator would navigate away from unsaved changes: point at the bar instead.
	function openCreator() {
		if (unsaved.dirty || unsaved.saving) unsaved.shake();
		else creatorOpen = true;
	}

	/** Starts the sync in the background; the list reloads once, a few seconds later, to show it. */
	async function syncNow() {
		syncing = true;
		try {
			await request("/api/devices/sync", { method: "POST" });
			toast.success("Sync started");
			setTimeout(() => invalidate("app:devices"), 5000);
		} catch (e) {
			toast.error((e as Error).message);
		} finally {
			syncing = false;
		}
	}

	const sync = $derived(syncSummary(data.deviceSync, Date.now()));

	const filter = $derived(parseFilter("devices", page.url.searchParams.get("filter")));

	// Chip counts and the filtered list share one pass over the filters.
	const chips = $derived(
		DEVICE_FILTERS.map((f) => ({ id: f.id, label: f.label, matches: data.devices.filter(f.test) }))
	);
	const filtered = $derived(chips.find((c) => c.id === filter)?.matches ?? data.devices);

	const listQuery = useListQuery(() => filtered, DEVICE_LIST);

	// --- URLs ---
	function filterQuery(): string {
		return filter ? `?filter=${filter}` : "";
	}

	function chipHref(id: string | null): string {
		return page.url.pathname + setParam(page.url.searchParams, "filter", id);
	}

	function deviceHref(id: string): string {
		return resolve(`/dashboard/devices/${id}`) + filterQuery();
	}

	setContext<DevicesContext>("devices-list", {
		get results() {
			return listQuery.results;
		},
		openCreator,
		listHref: () => resolve("/dashboard/devices") + filterQuery()
	});
</script>

<!-- URLs here are resolve() plus a query string (or the current path with a new query), which the rule can't follow. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->

<ListPane
	hasItem={page.params.id !== undefined}
	onClose={() => goto(resolve("/dashboard/devices") + filterQuery())}
>
	{#snippet list()}
		{@render header()}
		<ul class="scroll-list flex min-h-0 flex-1 flex-col gap-2">
			{#each listQuery.results as device (device._id)}
				<li>
					<DeviceRow
						{device}
						href={deviceHref(device._id)}
						current={device._id === page.params.id}
					/>
				</li>
			{:else}
				<li class="p-4 text-center text-body text-text-muted">No devices match.</li>
			{/each}
		</ul>
	{/snippet}
	{#snippet editor()}
		{@render children()}
	{/snippet}
</ListPane>

{#snippet header()}
	<div class="flex shrink-0 flex-col gap-3">
		<div class="flex items-center justify-between gap-3">
			<h1 class="text-page-title">Devices</h1>
			<div class="flex items-center gap-2">
				<Button variant="secondary" onclick={syncNow} disabled={syncing}>
					<Icon name="refresh-cw" class={syncing ? "animate-spin" : ""} />
					Sync now
				</Button>
				<Button onclick={openCreator}>
					<Icon name="plus" />
					New
				</Button>
			</div>
		</div>
		<p
			class="text-caption {sync.error ? 'text-error' : 'text-text-muted'}"
			title={data.deviceSync?.skipped.join("\n") || undefined}
		>
			{sync.text}
		</p>
		<SearchToolbar list={listQuery} placeholder="Search devices" total={data.devices.length}>
			<FilterChips
				label="Filter devices"
				chips={chips.map((c) => ({ id: c.id, label: c.label, count: c.matches.length }))}
				value={filter}
				total={data.devices.length}
				onchange={(id) =>
					goto(chipHref(id), { replaceState: true, noScroll: true, keepFocus: true })}
			/>
		</SearchToolbar>
	</div>
{/snippet}

<DeviceCreatorDialog
	bind:open={creatorOpen}
	onCreated={(id) => goto(resolve(`/dashboard/devices/${id}`) + filterQuery())}
/>
