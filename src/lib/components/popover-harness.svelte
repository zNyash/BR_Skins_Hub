<script lang="ts">
	// Test-only: a Popover with a trigger, plus a button outside it.
	import Popover from "./popover.svelte";
</script>

<Popover class="p-3">
	{#snippet trigger(props)}
		<button {...props}>Open</button>
	{/snippet}
	<p>Inside</p>
</Popover>
<button style="margin-top: 400px">Outside</button>
