<script lang="ts">
	import { toast } from "svelte-sonner";
	import { invalidateAll } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import Icon from "$comp/icon.svelte";
	import IOsuStandard from "$comp/icons/i-osu-standard.svelte";
	import * as Avatar from "$comp/ui/avatar";
	import Button from "$comp/ui/button/button.svelte";
	import * as DropdownMenu from "$comp/ui/dropdown-menu";
	import { request } from "$lib/api";
	import { osuAvatar } from "$lib/osu";

	const user = $derived(page.data.user);
	const initials = $derived(user?.username?.slice(0, 2) ?? "");

	// Saved on the account, then the page data reloads so the site color switches right away.
	async function setUseMyColor(use_my_color: boolean) {
		try {
			await request("/api/me/preferences", { method: "PATCH", body: { use_my_color } });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't save that setting");
		}
		await invalidateAll();
	}

	async function logout() {
		await fetch("/auth/logout", { method: "POST" });
		window.location.href = "/";
	}

	async function login() {
		const currentUrl = window.location.href;
		const loginUrl = new URL("/auth/login", window.location.origin);
		loginUrl.searchParams.set("from", currentUrl);

		window.location.href = loginUrl.toString();
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
					<Avatar.Fallback>{initials}</Avatar.Fallback>
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
					{#if user.player_id}
						<DropdownMenu.CheckboxItem
							checked={user.useMyColor}
							closeOnSelect={false}
							onCheckedChange={setUseMyColor}
							title="Show your profile color on every page except other players' profiles"
							class="whitespace-nowrap"
						>
							<Icon name="palette" class="size-4" />
							My color everywhere
						</DropdownMenu.CheckboxItem>
						<DropdownMenu.Separator />
					{/if}
					<DropdownMenu.Item onSelect={logout}>
						<Icon name="log-out" class="size-4" />
						Logout
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	{:else}
		<Button onclick={login}>
			Login
			<Icon name="log-in" />
		</Button>
	{/if}
</div>
