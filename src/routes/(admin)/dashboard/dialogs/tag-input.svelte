<script lang="ts">
	import Icon from "$comp/icon.svelte";
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

<div class="flex flex-col gap-1">
	<label for={id} class="text-sm">
		Tags <span class="text-xs text-muted-foreground">(search only, not shown publicly)</span>
	</label>
	<Input
		{id}
		list="{id}-suggestions"
		placeholder="Type a tag and press Enter"
		autocomplete="off"
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
		<div class="flex flex-wrap gap-1">
			{#each tags as tag (tag)}
				<span class="flex items-center gap-1 rounded-full bg-layer-2 py-0.5 pr-1 pl-2.5 text-xs">
					{tag}
					<button
						type="button"
						aria-label="Remove tag {tag}"
						class="rounded-full p-0.5 hover:bg-layer-3"
						onclick={() => removeTag(tag)}
					>
						<Icon name="x" class="size-3" />
					</button>
				</span>
			{/each}
		</div>
	{/if}
</div>
