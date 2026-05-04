<script>
	import Icon from "./icon.svelte";
	import Button from "./ui/button/button.svelte";
</script>

<nav class="flex w-full items-center justify-center bg-card">
	<div class="flex w-full max-w-lg justify-between py-1">
		<div></div>
		<div class="flex">
			<Button variant="navigation" href="/">
				<Icon name="user-round" />
				Players
			</Button>
			<Button variant="navigation" href="/skins">
				<Icon name="brush" />
				Skins
			</Button>
			<Button variant="navigation" href="/dashboard">
				<Icon name="layout-dashboard" />
				Dashboard
			</Button>
		</div>
		<div></div>
	</div>
</nav>
