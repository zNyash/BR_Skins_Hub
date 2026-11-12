<script lang="ts">
	import * as Avatar from "$comp/ui/avatar";
	import { osuAvatar } from "$lib/osu";

	/** sm: list rows (40px), md: editor header (56px), lg: profile header (128px). */
	type Size = "sm" | "md" | "lg";

	let { osuId, size, alt = "" }: { osuId: number; size: Size; alt?: string } = $props();

	const sizes: Record<Size, string> = {
		sm: "size-10",
		md: "size-14",
		lg: "size-32"
	};
</script>

<Avatar.Root class="{sizes[size]} shape-squircle rounded-md bg-layer-3 after:hidden">
	<Avatar.Image src={osuAvatar(osuId)} {alt} class="shape-squircle rounded-md" />
</Avatar.Root>
