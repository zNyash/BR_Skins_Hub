<script lang="ts">
	import { page } from "$app/state";

	type Props = {
		title: string;
		titleSuffix?: string;
		description?: string;
		image?: string;
	};

	let {
		title,
		titleSuffix = "BRSkinsHub",
		description = "Skins Hub for Brazilian players",
		image = ""
	}: Props = $props();

	const fullTitle = $derived(`${title} | ${titleSuffix}`);
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
