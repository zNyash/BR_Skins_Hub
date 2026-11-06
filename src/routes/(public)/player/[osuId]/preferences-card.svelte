<script lang="ts">
	import { toast } from "svelte-sonner";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/state";
	import { request } from "$lib/api";
	import { cn } from "$lib/utils";
	import { errorMessage } from "./save-profile";
	import SettingsCard from "./settings-card.svelte";

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

<SettingsCard title="Preferences">
	<div class="flex items-center gap-4">
		<div class="flex flex-1 flex-col gap-0.5">
			<span id="pref-my-color" class="font-medium">My color everywhere</span>
			<span class="text-sm text-text-muted">
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
				"relative h-6.5 w-11.5 shrink-0 rounded-full transition-colors disabled:opacity-60",
				useMyColor ? "bg-primary" : "bg-layer-3"
			)}
			onclick={toggle}
		>
			<span
				class={cn(
					"absolute top-0.75 size-5 rounded-full bg-foreground transition-[left]",
					useMyColor ? "left-5.75" : "left-0.75"
				)}
			></span>
		</button>
	</div>
	<p class="text-xs text-text-muted">Toggles save as soon as you flip them.</p>
</SettingsCard>
