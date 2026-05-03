<script lang="ts">
	let { data } = $props();
</script>

<main class="main">
	<div class="grid w-full max-w-5xl grid-cols-1 gap-2 p-2 md:grid-cols-2 lg:grid-cols-3">
		{#each data.skins as skin (skin._id)}
			<div>
				<p>{skin.name}</p>
			</div>
		{/each}
	</div>
</main>
