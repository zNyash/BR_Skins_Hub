<script lang="ts">
	import Icon from "$comp/icon.svelte";
	import { Input } from "$comp/ui/input";
	import * as Command from "$comp/ui/command";
	import { Command as CommandPrimitive } from "bits-ui";
	import type { Id } from "$convex/_generated/dataModel";
	import type { DeviceType } from "$convex/validators";
	import type { PickerDevice } from "$lib/device-catalog";
	import { DEVICE_ICONS, DEVICE_LABELS } from "$lib/devices";

	let {
		type,
		devices,
		query = $bindable(""),
		inline = true,
		pinned,
		onPick,
		onKeepTyped,
		onFocus,
		inputId
	}: {
		type: DeviceType;
		devices: PickerDevice[] | "loading" | "error";
		query: string;
		/** true: the list floats under the input and opens on focus. false: the list is always shown. */
		inline?: boolean;
		/** Shown first, e.g. the dashboard's "Closest" match. */
		pinned?: Id<"devices">;
		onPick: (device: PickerDevice) => void;
		/** Shows the "Not listed?" row while there is typed text. */
		onKeepTyped?: () => void;
		onFocus?: () => void;
		inputId?: string;
	} = $props();

	let open = $state(false);
	let root = $state<HTMLElement | null>(null);
	const showList = $derived(!inline || open);

	const matches = $derived.by(() => {
		if (typeof devices === "string") return [];
		const needle = query.trim().toLowerCase();
		const found = needle ? devices.filter((d) => d.name.toLowerCase().includes(needle)) : devices;
		const first = found.find((d) => d._id === pinned);
		return first ? [first, ...found.filter((d) => d !== first)] : found;
	});

	const caption = $derived(
		`${matches.length} ${DEVICE_LABELS[type][matches.length === 1 ? "one" : "many"].toLowerCase()}`
	);

	function pick(device: PickerDevice) {
		onPick(device);
		open = false;
	}

	function keepTyped() {
		onKeepTyped?.();
		open = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape" && inline && open) {
			// Close only the list: the dialog around us stays open and the typed text stays.
			event.stopPropagation();
			event.preventDefault();
			open = false;
		} else if (inline && !open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
			open = true;
		}
	}

	function handleFocusout(event: FocusEvent) {
		if (!root?.contains(event.relatedTarget as Node | null)) open = false;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={root}
	class="relative"
	onfocusin={() => {
		open = true;
		onFocus?.();
	}}
	onfocusout={handleFocusout}
	onkeydown={handleKeydown}
>
	<Command.Root shouldFilter={false} class="gap-1 bg-transparent p-0">
		<CommandPrimitive.Input>
			{#snippet child({ props })}
				<Input
					{...props}
					bind:value={query}
					id={inputId ?? props.id}
					autocomplete="off"
					oninput={() => (open = true)}
				/>
			{/snippet}
		</CommandPrimitive.Input>

		{#if showList}
			<!-- Keeps the input focused while a row is clicked, so blur only means "clicked elsewhere". -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class={[
					"flex flex-col gap-1 rounded-md bg-layer-2 p-1",
					inline && "absolute inset-x-0 top-full z-50 mt-1 shadow-float"
				]}
				onmousedown={(event) => event.preventDefault()}
			>
				{#if devices === "loading"}
					<p class="p-2 text-body text-text-muted">Loading devices…</p>
				{:else if devices === "error"}
					<p class="p-2 text-body text-text-muted">
						Couldn't load the list. You can still type the model.
					</p>
				{:else}
					<p class="px-2 pt-1 text-caption text-text-muted">{caption}</p>
					<Command.List>
						{#each matches as device (device._id)}
							<Command.Item value={device._id} onSelect={() => pick(device)}>
								<div
									class="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-layer-4 text-text-muted"
								>
									{#if device.image_url}
										<img src={device.image_url} alt="" class="size-full object-cover" />
									{:else}
										<Icon name={DEVICE_ICONS[type]} class="size-4" />
									{/if}
								</div>
								<div class="flex min-w-0 flex-col">
									<span class="truncate text-body-strong">{device.name}</span>
									{#if type === "tablet" && device.full_w && device.full_h}
										<span class="text-caption text-text-muted">
											{device.full_w} × {device.full_h} mm
										</span>
									{/if}
								</div>
							</Command.Item>
						{/each}
						{#if onKeepTyped && query.trim()}
							{#if matches.length}
								<div class="mx-2 my-1 h-px bg-layer-5"></div>
							{/if}
							<Command.Item value="keep-typed" onSelect={keepTyped}>
								<span class="text-body text-text-muted">
									Not listed? Keep <span class="text-text">"{query.trim()}"</span> as typed
								</span>
							</Command.Item>
						{/if}
					</Command.List>
				{/if}
				<p class="px-2 pb-1 text-caption text-text-muted">↑ ↓ move · Enter choose · Esc close</p>
			</div>
		{/if}
	</Command.Root>
</div>
