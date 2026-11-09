import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import type { PlayerWithSkins } from "$lib/types";
import ProfileTabs from "./profile-tabs.svelte";

const { openTab } = vi.hoisted(() => ({ openTab: vi.fn() }));

vi.mock("$app/state", () => ({
	page: { url: new URL("http://localhost/player/1?tab=skins") }
}));
vi.mock("./open-tab", () => ({ openTab }));

const player = {
	_id: "p1",
	osu_id: 1,
	name: "Tester",
	description: "",
	tab_order: ["skins", "about", "setup"],
	skins: []
} as unknown as PlayerWithSkins;

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
		await expect.element(about).toHaveAttribute("aria-selected", "true");
		await expect.element(skins).toHaveAttribute("aria-selected", "false");
		expect(openTab).toHaveBeenCalledWith("about");
	});
});
