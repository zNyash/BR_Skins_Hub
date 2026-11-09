<script lang="ts">
	import { resolve } from "$app/paths";
	import type { Doc } from "$convex/_generated/dataModel";
	import { hasSetup } from "$lib/setup";
	import SetupPreview from "./setup-preview.svelte";

	/** Read-only: the setup is edited on the player's own profile. */
	let { player }: { player: Doc<"players"> } = $props();

	const profileSetup = $derived(
		resolve("/(public)/player/[osuId]", { osuId: String(player.osu_id) }) + "?tab=setup"
	);
</script>

<div class="flex flex-col gap-4">
	{#if hasSetup(player.setup)}
		<!-- The profile's Setup tab, read-only and shrunk to read as a preview. -->
		<div class="[zoom:0.85]">
			<SetupPreview setup={player.setup ?? {}} />
		</div>
	{:else}
		<p class="text-body text-text-muted">No setup yet.</p>
	{/if}
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() plus ?tab -->
	<a href={profileSetup} target="_blank" class="text-body text-accent-color hover:underline">
		Edit on profile ↗
	</a>
</div>
