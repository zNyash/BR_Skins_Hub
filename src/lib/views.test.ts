import { describe, expect, it } from "vitest";
import { claimView } from "./views";

function fakeStorage(): Storage {
	const items = new Map<string, string>();
	return {
		getItem: (key) => items.get(key) ?? null,
		setItem: (key, value) => void items.set(key, value)
	} as Storage;
}

describe("claimView", () => {
	it("counts the first visit and not a repeat", () => {
		const storage = fakeStorage();
		expect(claimView("a", () => storage)).toBe(true);
		expect(claimView("a", () => storage)).toBe(false);
	});

	it("counts each player separately", () => {
		const storage = fakeStorage();
		claimView("a", () => storage);
		expect(claimView("b", () => storage)).toBe(true);
	});

	it("still counts when storage is unavailable", () => {
		const blocked = () => {
			throw new Error("SecurityError");
		};
		expect(claimView("a", blocked)).toBe(true);
	});

	it("starts over when the stored value is corrupt", () => {
		const storage = fakeStorage();
		storage.setItem("viewed-players", "{not json");
		expect(claimView("a", () => storage)).toBe(true);
		expect(claimView("a", () => storage)).toBe(false);
	});
});
