<script lang="ts">
	import Icon from "./icon.svelte";
	import Button from "./ui/button/button.svelte";
	import type { AuthUser } from "$lib/types";
	import UserIcon from "./user-icon.svelte";
	import { page } from "$app/state";

	let user = page.data.user as AuthUser | null;
	let { isFloating } = $props();
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
			<Button variant="navigation" href="/">
				<Icon name="user-round" />
				Players
			</Button>
			<Button variant="navigation" href="/skins">
				<Icon name="brush" />
				Skins
			</Button>
			{#if user?.isAdmin}
				<Button variant="navigation" href="/dashboard">
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
