import { beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import type { PlayerWithSkins } from "$lib/types";
import { fakeOpenTab, fakePage, navigation } from "./fake-page.svelte";
import ProfileTabs from "./profile-tabs.svelte";

const { openTab } = vi.hoisted(() => ({ openTab: vi.fn() }));

vi.mock("$app/state", async () => ({ page: (await import("./fake-page.svelte")).fakePage }));
vi.mock("./open-tab", () => ({ openTab }));

const player = {
	_id: "p1",
	osu_id: 1,
	name: "Tester",
	description: "",
	tab_order: ["skins", "about", "setup"],
	skins: []
} as unknown as PlayerWithSkins;

beforeEach(() => {
	fakePage.url = new URL("http://localhost/player/1?tab=skins");
	navigation.cancelled = false;
	openTab.mockReset();
	openTab.mockImplementation(fakeOpenTab);
});

describe("ProfileTabs", () => {
	it("tab triggers stay sortable and follow ?tab=", async () => {
		render(ProfileTabs, { player, isOwner: true, canEdit: true });

		const skins = page.getByRole("tab", { name: /Skins/ });
		const about = page.getByRole("tab", { name: "About" });
		const setup = page.getByRole("tab", { name: "Setup" });
		await expect.element(skins).toHaveAttribute("aria-selected", "true");

		// Each stored tab is a sortable item (its wrapper, so animate:flip can sit on it) and the
		// owner drags it by the trigger itself.
		for (const tab of [skins, about, setup]) {
			const el = tab.element();
			expect(el.closest("[data-sortable-item]")).not.toBeNull();
			expect(el.hasAttribute("data-sortable-handle")).toBe(true);
		}
		// Settings is never part of the stored order.
		const settings = page.getByRole("tab", { name: "Settings" }).element();
		expect(settings.closest("[data-sortable-item]")).toBeNull();

		await about.click();
		expect(openTab).toHaveBeenCalledWith("about");
		expect(fakePage.url.searchParams.get("tab")).toBe("about");
		await expect.element(about).toHaveAttribute("aria-selected", "true");
		await expect.element(skins).toHaveAttribute("aria-selected", "false");
	});

	it("stays on the current tab when the navigation is cancelled", async () => {
		navigation.cancelled = true; // e.g. "Keep editing" on the unsaved-changes prompt
		render(ProfileTabs, { player, isOwner: true, canEdit: true });

		const skins = page.getByRole("tab", { name: /Skins/ });
		const about = page.getByRole("tab", { name: "About" });
		await about.click();

		expect(openTab).toHaveBeenCalledWith("about");
		await expect.element(skins).toHaveAttribute("aria-selected", "true");
		await expect.element(about).toHaveAttribute("aria-selected", "false");
	});

	it("gives visitors no drag handles", async () => {
		render(ProfileTabs, { player, isOwner: false, canEdit: false });

		const skins = page.getByRole("tab", { name: /Skins/ });
		await expect.element(skins).toBeVisible();
		for (const tab of page.getByRole("tab").elements()) {
			expect(tab.hasAttribute("data-sortable-handle")).toBe(false);
		}
	});
});
