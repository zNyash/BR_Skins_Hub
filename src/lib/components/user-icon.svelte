<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { page } from "$app/state";
	import type { AuthUser } from "$lib/types";
	import Button from "./ui/button/button.svelte";
	import Icon from "./icon.svelte";
	import IOsuStandard from "./icons/i-osu-standard.svelte";
	import { resolve } from "$app/paths";
	import { osuAvatar } from "$lib/utils/osu";

	let user = page.data.user as AuthUser | null;

	let username = $derived.by(() => {
		if (user) {
			const tempUsername = user.username?.split("");

			return `${tempUsername?.[0]}${tempUsername?.[1]}`;
		}
		return "";
	});

	async function logout() {
		await fetch("/auth/logout", { method: "POST" });
		window.location.href = "/";
	}
</script>

<div>
	{#if user}
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="group/avatar flex items-center justify-center rounded-md p-1 hover:bg-popover"
			>
				<Avatar.Root class="group-hover/avatar:brightness-110">
					<Avatar.Image src={osuAvatar(user.osu_id)} alt={user.username} />
					<Avatar.Fallback>{username}</Avatar.Fallback>
				</Avatar.Root>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Group>
					<a
						href={resolve("/(public)/player/[osuId]", { osuId: String(user.osu_id) })}
						class="contents"
					>
						<DropdownMenu.Item>
							<Icon name="user-round" class="size-4" />
							Skin Page
						</DropdownMenu.Item>
					</a>
					<a href="https://osu.ppy.sh/users/{user.osu_id}" target="_blank" class="contents">
						<DropdownMenu.Item>
							<IOsuStandard class="size-4" />
							osu! Profile
						</DropdownMenu.Item>
					</a>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onSelect={logout}>
						<Icon name="log-out" class="size-4" />
						Logout
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{:else}
		<Button href="/login">
			Login
			<Icon name="log-in" />
		</Button>
	{/if}
</div>
