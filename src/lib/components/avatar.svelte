<script lang="ts">
	import * as Avatar from "$comp/ui/avatar";
	import { osuAvatar } from "$lib/osu";

	type Size = 28 | 40 | 56 | 80;

	let { osuId, size, alt = "" }: { osuId: number; size: Size; alt?: string } = $props();

	const sizes: Record<Size, string> = {
		28: "size-7",
		40: "size-10",
		56: "size-14",
		80: "size-20"
	};
</script>

<Avatar.Root class="{sizes[size]} shape-squircle rounded-md bg-layer-3 after:hidden">
	<Avatar.Image src={osuAvatar(osuId)} {alt} class="shape-squircle rounded-md" />
</Avatar.Root>
