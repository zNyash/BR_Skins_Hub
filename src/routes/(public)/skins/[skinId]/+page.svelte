<script lang="ts">
	let { data } = $props();
	// data.skin  — { _id, name, author, download_url, preview_images, download_count }
	// data.players — array of players using this skin, each with { _id, osu_id, name, cover_url }
	console.log(() => data.skin);
</script>

<!-- your UI goes here -->
