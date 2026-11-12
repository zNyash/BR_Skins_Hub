<script lang="ts">
	import { toast } from "svelte-sonner";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import { MAX_OSK_BYTES } from "$lib/osk";
	import { cn } from "$lib/utils";

	/** Drop or pick one .osk. `onpick` runs after a valid file is chosen. */
	let {
		file = $bindable(),
		label = "Drop a .osk here, or click to choose it",
		onpick
	}: { file: File | null; label?: string; onpick?: (file: File) => void } = $props();

	let dragging = $state(false);

	function pick(next: File | undefined) {
		if (!next) return;
		if (!/\.osk$/i.test(next.name)) {
			toast.error("That isn't a .osk file.");
			return;
		}
		if (next.size > MAX_OSK_BYTES) {
			toast.error("That .osk is over 300 MB.");
			return;
		}
		file = next;
		onpick?.(next);
	}

	const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
</script>

{#if file}
	<div class="flex items-center gap-3 rounded-lg bg-layer-2 py-2 pr-2 pl-3">
		<Icon name="file-archive" class="size-5 shrink-0 text-accent-color" />
		<div class="flex min-w-0 flex-1 flex-col">
			<span class="truncate text-body-strong">{file.name}</span>
			<span class="text-caption text-text-muted">{megabytes(file.size)}</span>
		</div>
		<Button variant="ghost" size="icon" aria-label="Remove file" onclick={() => (file = null)}>
			<Icon name="x" />
		</Button>
	</div>
{:else}
	<label
		class={cn(
			"flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-layer-5 p-4 text-center text-body text-text-muted transition-colors duration-fast hover:bg-layer-2 hover:text-text",
			dragging && "bg-layer-2 text-text"
		)}
		ondragover={(e) => {
			e.preventDefault();
			dragging = true;
		}}
		ondragleave={() => (dragging = false)}
		ondrop={(e) => {
			e.preventDefault();
			dragging = false;
			pick(e.dataTransfer?.files[0]);
		}}
	>
		<Icon name="file-archive" class="size-6" />
		{label}
		<input
			type="file"
			accept=".osk"
			class="hidden"
			onchange={(e) => {
				pick(e.currentTarget.files?.[0]);
				e.currentTarget.value = ""; // allow picking the same file again
			}}
		/>
	</label>
{/if}
