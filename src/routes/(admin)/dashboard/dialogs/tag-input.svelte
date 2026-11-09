<script lang="ts">
	import TagChip from "$comp/tag-chip.svelte";
	import { Input } from "$comp/ui/input";
	import { normalizeTags } from "$lib/tags";

	type Props = {
		tags: string[];
		/** Every tag already used on any player or skin, offered as autocomplete. */
		suggestions: string[];
		id: string;
	};

	let { tags = $bindable(), suggestions, id }: Props = $props();

	let input = $state("");
	const unusedSuggestions = $derived(suggestions.filter((tag) => !tags.includes(tag)));

	function addTag() {
		// normalizeTags also dedupes, so re-adding an existing tag is a no-op.
		tags = normalizeTags([...tags, input]);
		input = "";
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Enter" || event.key === ",") {
			event.preventDefault(); // Enter would otherwise submit the whole form
			addTag();
		}
	}

	function removeTag(tag: string) {
		tags = tags.filter((t) => t !== tag);
	}
</script>

<div class="flex flex-col gap-2">
	<label for={id} class="text-label">
		Tags <span class="text-caption text-text-muted">(search only, not shown publicly)</span>
	</label>
	<Input
		{id}
		list="{id}-suggestions"
		placeholder="Type a tag and press Enter"
		autocomplete="off"
		class="bg-layer-2"
		bind:value={input}
		onkeydown={handleKeydown}
		onblur={() => input.trim() && addTag()}
	/>
	<datalist id="{id}-suggestions">
		{#each unusedSuggestions as tag (tag)}
			<option value={tag}></option>
		{/each}
	</datalist>
	{#if tags.length > 0}
		<!-- The x buttons are 44px tall inside 28px chips on phones: the row gap keeps them apart. -->
		<div class="flex flex-wrap gap-x-2 gap-y-4 min-[900px]:gap-y-2">
			{#each tags as tag (tag)}
				<TagChip onremove={() => removeTag(tag)} removeLabel="Remove {tag}">{tag}</TagChip>
			{/each}
		</div>
	{/if}
</div>
