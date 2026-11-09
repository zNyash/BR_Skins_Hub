<script lang="ts">
	import { Button, type ButtonProps } from "$comp/ui/button";
	import { cn } from "$lib/utils";

	type Direction = "top" | "bottom" | "left" | "right";

	// Where the fill grows from while holding.
	const FILL = {
		top: { origin: "origin-top", scale: "scaleY" },
		bottom: { origin: "origin-bottom", scale: "scaleY" },
		left: { origin: "origin-left", scale: "scaleX" },
		right: { origin: "origin-right", scale: "scaleX" }
	} as const satisfies Record<Direction, unknown>;

	let {
		duration = 1500,
		onComplete,
		class: className,
		children,
		fillColor = "bg-overlay",
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

	const fill = $derived(FILL[from]);
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
		class={cn("pointer-events-none absolute inset-0 z-0", fill.origin, fillColor)}
		style:transform="{fill.scale}({isHolding ? 1 : 0})"
		style:transition="transform {isHolding ? duration : 100}ms linear"
	></div>

	<span class="pointer-events-none relative z-10 flex items-center gap-2">
		{@render children?.()}
	</span>
</Button>
