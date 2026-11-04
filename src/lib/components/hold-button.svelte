<script lang="ts">
	import { cn } from "$lib/utils";
	import { Button, type ButtonProps } from "$comp/ui/button";

	type Direction = "top" | "bottom" | "left" | "right";

	let {
		duration = 1500,
		onComplete,
		class: className,
		children,
		fillColor = "bg-black/10",
		from = "bottom",
		...rest
	}: ButtonProps & {
		duration?: number;
		onComplete?: () => void;
		fillColor?: string;
		from?: Direction;
	} = $props();

	let isHolding = $state(false);
	let completed = $state(false);
	let timer: ReturnType<typeof setTimeout> | null = null;

	function startHold() {
		if (completed) return;
		isHolding = true;

		timer = setTimeout(() => {
			if (isHolding) {
				completed = true;
				onComplete?.();
				setTimeout(() => {
					isHolding = false;
					completed = false;
				}, 200);
			}
		}, duration);
	}

	function cancelHold() {
		if (completed) return;
		isHolding = false;
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	}

	const transformStyles = $derived.by(() => {
		switch (from) {
			case "top":
				return {
					origin: "origin-top",
					transform: `scaleY(${isHolding ? 1 : 0})`
				};
			case "left":
				return {
					origin: "origin-left",
					transform: `scaleX(${isHolding ? 1 : 0})`
				};
			case "right":
				return {
					origin: "origin-right",
					transform: `scaleX(${isHolding ? 1 : 0})`
				};
			case "bottom":
			default:
				return {
					origin: "origin-bottom",
					transform: `scaleY(${isHolding ? 1 : 0})`
				};
		}
	});
</script>

<Button
	class={cn("relative overflow-hidden select-none", className)}
	onmousedown={startHold}
	onmouseup={cancelHold}
	onmouseleave={cancelHold}
	ontouchstart={(e) => {
		if (e.cancelable) e.preventDefault();
		startHold();
	}}
	ontouchend={cancelHold}
	{...rest}
>
	<div
		class={cn("pointer-events-none absolute inset-0 z-0", transformStyles.origin, fillColor)}
		style:transform={transformStyles.transform}
		style:transition="transform {isHolding ? duration : 100}ms linear"
	></div>

	<span class="pointer-events-none relative z-10 flex items-center gap-2">
		{@render children?.()}
	</span>
</Button>
