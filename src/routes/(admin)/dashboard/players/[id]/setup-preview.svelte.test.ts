import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import "../../../../layout.css";
import type { Setup } from "$lib/setup";
import SetupPreview from "./setup-preview.svelte";

const setup: Setup = {
	keyboard: { model: "Wooting 60HE" },
	in_game: { sensitivity: 0.8 },
	pc: { cpu: "Ryzen 7 7800X3D" }
};

const columns = (el: Element) => getComputedStyle(el).gridTemplateColumns.split(" ").length;

describe("SetupPreview", () => {
	it("shows only filled cards, with no edit controls", async () => {
		render(SetupPreview, { setup, devices: {} });

		await expect.element(page.getByText("Wooting 60HE")).toBeVisible();
		await expect.element(page.getByText("In-game")).toBeVisible();
		await expect.element(page.getByText("Ryzen 7 7800X3D")).toBeVisible();
		expect(page.getByText("Monitor").elements()).toHaveLength(0);
		expect(page.getByRole("button", { name: /^Edit/ }).elements()).toHaveLength(0);
	});

	it("lays out by its own width, not the viewport's", async () => {
		const { container } = render(SetupPreview, { setup, devices: {} });
		const grid = container.querySelector(".grid")!;

		container.style.width = "400px";
		await expect.poll(() => columns(grid)).toBe(1);
		container.style.width = "800px";
		await expect.poll(() => columns(grid)).toBe(2);
	});
});
