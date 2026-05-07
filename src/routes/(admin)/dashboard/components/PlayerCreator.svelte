<script lang="ts">
	import { invalidate } from "$app/navigation";
	import { Input } from "$comp/ui/input";
	import { Button } from "$comp/ui/button";

	type Props = {
		onsave?: () => void;
	};

	let { onsave = () => {} }: Props = $props();

	let osuId = $state<number | undefined>(undefined);
	let creating = $state(false);

	async function handleCreate() {
		if (!osuId) return;
		creating = true;
		try {
			await fetch(`/api/player/refresh?osu_id=${osuId}`);
			await invalidate("app:players");
			onsave();
		} finally {
			creating = false;
		}
	}
</script>

<div class="flex items-center justify-between">
	<h2 class="text-lg font-medium">New Player</h2>
	<Button onclick={handleCreate} disabled={!osuId || creating}>
		{creating ? "Fetching..." : "Add Player"}
	</Button>
</div>

<div class="flex flex-col gap-1">
	<label for="create_osu_id" class="text-sm">osu! ID</label>
	<Input id="create_osu_id" type="number" bind:value={osuId} />
</div>
