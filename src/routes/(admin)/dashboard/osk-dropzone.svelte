<script lang="ts">
	import { toast } from "svelte-sonner";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import { Progress } from "$comp/ui/progress";
	import { Switch } from "$comp/ui/switch";
	import type { OskStatus } from "$lib/drive-upload";
	import { MAX_OSK_BYTES } from "$lib/osk";
	import { cn } from "$lib/utils";

	/**
	 * Drop or pick one .osk. `onpick` runs after a valid file is chosen. While `status` is set, the
	 * upload's current step shows as a progress bar.
	 */
	let {
		file = $bindable(),
		optimize = $bindable(true),
		status = null,
		label = "Drop a .osk here, or click to choose it",
		onpick
	}: {
		file: File | null;
		optimize?: boolean;
		status?: OskStatus | null;
		label?: string;
		onpick?: (file: File) => void;
	} = $props();

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
	<div class="flex flex-col gap-3 rounded-lg bg-layer-2 p-3">
		<div class="flex items-center gap-3">
			<Icon name="file-archive" class="size-5 shrink-0 text-accent-color" />
			<div class="flex min-w-0 flex-1 flex-col">
				<span class="truncate text-body-strong">{file.name}</span>
				<span class="text-caption text-text-muted">{megabytes(file.size)}</span>
			</div>
			<Button
				variant="ghost"
				size="icon"
				aria-label="Remove file"
				disabled={status !== null}
				onclick={() => (file = null)}
			>
				<Icon name="x" />
			</Button>
		</div>

		{#if status}
			<div class="flex flex-col gap-2" aria-live="polite">
				<div class="flex justify-between gap-3 text-caption">
					<span class="truncate">{status.label}…</span>
					{#if status.percent !== null}
						<span class="text-text-muted tabular-nums">{status.percent}%</span>
					{/if}
				</div>
				{#if status.percent === null}
					<Progress value={100} class="animate-pulse opacity-50" />
				{:else}
					<Progress value={status.percent} />
				{/if}
			</div>
		{:else}
			<label class="flex items-center gap-3">
				<Switch bind:checked={optimize} size="sm" />
				<span class="flex flex-col">
					<span class="text-body">Optimize before upload</span>
					<span class="text-caption text-text-muted">
						Lossless image compression and missing SD images
					</span>
				</span>
			</label>
		{/if}
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
