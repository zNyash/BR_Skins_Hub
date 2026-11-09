<script lang="ts">
	import HuePicker from "$comp/hue-picker.svelte";
	import { Input } from "$comp/ui/input";
	import { Textarea } from "$comp/ui/textarea";
	import TagInput from "../../dialogs/tag-input.svelte";
	import type { PlayerDraft } from "./player-fields";

	let { draft = $bindable(), tagSuggestions }: { draft: PlayerDraft; tagSuggestions: string[] } =
		$props();

	const BIO_MAX = 200;
	const bioLength = $derived(draft.player.bio.trim().length);

	const setHue = (hue: number) => (draft.player.hue = hue);
</script>

<div class="form-grid">
	<div class="flex flex-col gap-2">
		<label for="player-name" class="text-label">Name</label>
		<Input
			id="player-name"
			class="h-11 bg-layer-2 min-[900px]:h-9"
			bind:value={draft.player.name}
		/>
	</div>

	<div class="flex flex-col gap-2">
		<label for="player-cover" class="text-label">Cover URL</label>
		<Input
			id="player-cover"
			class="h-11 bg-layer-2 min-[900px]:h-9"
			bind:value={draft.player.cover_url}
		/>
	</div>

	<div class="flex flex-col gap-2">
		<div class="flex items-end justify-between">
			<label for="player-bio" class="text-label">Bio</label>
			<span
				class="text-caption tabular-nums {bioLength > BIO_MAX ? 'text-error' : 'text-text-muted'}"
			>
				{bioLength}/{BIO_MAX}
			</span>
		</div>
		<Textarea id="player-bio" class="bg-layer-2" rows={3} bind:value={draft.player.bio} />
	</div>

	<div class="flex flex-col gap-2">
		<HuePicker value={draft.player.hue ?? 0} onPick={setHue} onSlide={setHue} />
	</div>

	<div class="full">
		<TagInput id="player-tags" bind:tags={draft.player.tags} suggestions={tagSuggestions} />
	</div>

	<div class="full flex flex-col gap-2">
		<label for="player-description" class="text-label">Description (About tab)</label>
		<Textarea
			id="player-description"
			class="bg-layer-2"
			rows={6}
			bind:value={draft.player.description}
		/>
	</div>
</div>

<style>
	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
	}

	.full {
		grid-column: 1 / -1;
	}

	/* Measured on the editor's content box (its column is the nearest size container). */
	@container (max-width: 560px) {
		.form-grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
