<script>
	import Button from "./ui/button/button.svelte";
</script>

<nav class="flex w-full items-center justify-center bg-card">
	<div class="flex w-full max-w-lg justify-between py-1">
		<div></div>
		<div class="flex">
			<Button variant="navigation" href="/">
				<span class="icon-[lucide--user-round]"></span>
				Players
			</Button>
			<Button variant="navigation" href="/skins">
				<span class="icon-[lucide--brush]"></span>
				Skins
			</Button>
			<Button variant="navigation" href="/dashboard">
				<span class="icon-[lucide--layout-dashboard]"></span>
				Dashboard
			</Button>
		</div>
		<div></div>
	</div>
</nav>
