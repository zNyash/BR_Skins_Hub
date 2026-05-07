<script lang="ts">
	import { page } from "$app/state";

	type Props = {
		title: string;
		titleSufix?: string;
		description?: string;
		image?: string;
	};

	let {
		title,
		titleSufix = "BRSkinsHub",
		description = "Skins Hub for Brazilian players",
		image = ""
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	const fullTitle = `${title} | ${titleSufix}`;
</script>

<svelte:head>
	<!-- HTML Meta Tags -->
	<title>{fullTitle}</title>
	<meta name="description" content={description} />

	<!-- Open Graph Meta Tags -->
	<meta property="og:url" content={page.url.href} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={image} />
</svelte:head>
