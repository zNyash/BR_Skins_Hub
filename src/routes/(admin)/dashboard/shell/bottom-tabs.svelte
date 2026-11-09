<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import Icon from "$comp/icon.svelte";

	const tabs = [
		{ href: resolve("/dashboard"), label: "Home", icon: "house", exact: true },
		{ href: resolve("/dashboard/players"), label: "Players", icon: "users" },
		{ href: resolve("/dashboard/skins"), label: "Skins", icon: "palette" }
	];

	const isActive = (tab: { href: string; exact?: boolean }) =>
		tab.exact ? page.url.pathname === tab.href : page.url.pathname.startsWith(tab.href);
</script>

<nav
	aria-label="Dashboard"
	class="grid shrink-0 grid-cols-3 bg-layer-1 pb-[env(safe-area-inset-bottom)]"
>
	{#each tabs as tab (tab.href)}
		<a
			href={tab.href}
			class="flex min-h-14 flex-col items-center justify-center gap-1 text-label {isActive(tab)
				? 'bg-layer-3 text-accent-color'
				: 'text-text-muted'}"
			aria-current={isActive(tab) ? "page" : undefined}
		>
			<Icon name={tab.icon} class="size-5" />
			{tab.label}
		</a>
	{/each}
</nav>
