import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Harness from "./popover-harness.svelte";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Popover", () => {
	it("opens on hover and closes after leaving", async () => {
		render(Harness);
		await page.getByRole("button", { name: "Open" }).hover();
		await expect.element(page.getByText("Inside")).toBeVisible();
		await page.getByRole("button", { name: "Outside" }).hover();
		await wait(200);
		await expect.element(page.getByText("Inside")).not.toBeVisible();
	});

	it("pins on click and closes on outside click", async () => {
		render(Harness);
		await page.getByRole("button", { name: "Open" }).click();
		await page.getByRole("button", { name: "Outside" }).hover();
		await wait(200);
		await expect.element(page.getByText("Inside")).toBeVisible();
		await page.getByRole("button", { name: "Outside" }).click();
		await expect.element(page.getByText("Inside")).not.toBeVisible();
	});

	it("closes when the trigger is clicked again", async () => {
		render(Harness);
		const open = page.getByRole("button", { name: "Open" });
		await open.click();
		await expect.element(page.getByText("Inside")).toBeVisible();
		await open.click();
		await wait(50);
		await expect.element(page.getByText("Inside")).not.toBeVisible();
	});

	it("closes on Escape", async () => {
		render(Harness);
		await page.getByRole("button", { name: "Open" }).click();
		await expect.element(page.getByText("Inside")).toBeVisible();
		await userEvent.keyboard("{Escape}");
		await expect.element(page.getByText("Inside")).not.toBeVisible();
	});
});
