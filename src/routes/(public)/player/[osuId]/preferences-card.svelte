<script lang="ts">
	import { toast } from "svelte-sonner";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/state";
	import { request } from "$lib/api";
	import { cn } from "$lib/utils";
	import { errorMessage } from "./save-profile";
	import Card from "$comp/card.svelte";

	const useMyColor = $derived(page.data.user?.useMyColor ?? true);
	let saving = $state(false);

	// Saved right away; reloading all data applies it to the site color (and restores it on failure).
	async function toggle() {
		saving = true;
		try {
			await request("/api/me/preferences", {
				method: "PATCH",
				body: { use_my_color: !useMyColor }
			});
		} catch (err) {
			toast.error(errorMessage(err, "Couldn't save that setting"));
		}
		await invalidateAll();
		saving = false;
	}
</script>

<Card title="Preferences" level={2}>
	<div class="flex items-center gap-4">
		<div class="flex flex-1 flex-col gap-1">
			<span id="pref-my-color" class="text-body-strong">My color everywhere</span>
			<span class="text-body text-text-muted">
				Use your profile color on every page, except other players' profiles.
			</span>
		</div>
		<button
			type="button"
			role="switch"
			aria-checked={useMyColor}
			aria-labelledby="pref-my-color"
			disabled={saving}
			class={cn(
				"relative h-7 w-12 shrink-0 rounded-full transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-color disabled:opacity-60",
				useMyColor ? "bg-accent-color" : "bg-layer-3"
			)}
			onclick={toggle}
		>
			<span
				class={cn(
					"absolute top-1 size-5 rounded-full bg-text transition-[left] duration-fast",
					useMyColor ? "left-6" : "left-1"
				)}
			></span>
		</button>
	</div>
	<p class="text-caption text-text-muted">Toggles save as soon as you flip them.</p>
</Card>
