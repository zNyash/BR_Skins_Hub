<script lang="ts">
	import { page } from "$app/state";
	import Icon from "$comp/icon.svelte";
	import Button from "$comp/ui/button/button.svelte";
	import UserIcon from "$comp/user-icon.svelte";

	let { isFloating }: { isFloating: boolean } = $props();

	const user = $derived(page.data.user);
</script>

<nav
	class="flex h-11 w-full items-center justify-center transition-all duration-300 {isFloating
		? 'max-w-5xl rounded-b-md bg-card/75 backdrop-blur-md'
		: 'max-w-[100vw] bg-card'}"
>
	<div
		class="flex w-full max-w-5xl items-center justify-between px-2 py-1 transition-all duration-300"
	>
		<div class="invisible">
			<UserIcon />
		</div>
		<div class="flex">
			<Button variant="ghost" href="/">
				<Icon name="user-round" />
				Players
			</Button>
			<Button variant="ghost" href="/skins">
				<Icon name="brush" />
				Skins
			</Button>
			{#if user?.isAdmin}
				<Button variant="ghost" href="/dashboard">
					<Icon name="layout-dashboard" />
					Dashboard
				</Button>
			{/if}
		</div>
		<div>
			<UserIcon />
		</div>
	</div>
</nav>

<style>
	nav {
		box-shadow: 0px 1px 0.5rem 0px var(--crust);
	}
</style>
