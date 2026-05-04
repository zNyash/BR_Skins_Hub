<script lang="ts">
	let { data } = $props();
	console.log(() => data.skin);
</script>

<!-- your UI goes here -->
<main class="main">
	<div>{data.skin.name}</div>
</main>
