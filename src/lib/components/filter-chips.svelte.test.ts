import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Harness, { calls } from "./filter-chips-harness.svelte";

describe("FilterChips", () => {
	beforeEach(() => {
		calls.length = 0;
	});

	it("selects All when no filter is on", async () => {
		render(Harness, { value: null });
		await expect
			.element(page.getByRole("radio", { name: /All/ }))
			.toHaveAttribute("aria-checked", "true");
	});

	it("reports the clicked filter", async () => {
		render(Harness, { value: null });
		await page.getByRole("radio", { name: /No setup/ }).click();
		expect(calls.at(-1)).toBe("no-setup");
	});

	it("clicking the selected filter clears it", async () => {
		render(Harness, { value: "no-setup" });
		await page.getByRole("radio", { name: /No setup/ }).click();
		expect(calls.at(-1)).toBeNull();
	});

	it("clicking All clears the filter", async () => {
		render(Harness, { value: "no-skins" });
		await page.getByRole("radio", { name: /All/ }).click();
		expect(calls.at(-1)).toBeNull();
	});

	it("shows counts", async () => {
		render(Harness, { value: null });
		await expect.element(page.getByRole("radio", { name: /All/ })).toHaveTextContent("60");
		await expect.element(page.getByRole("radio", { name: /No setup/ })).toHaveTextContent("54");
	});
});
