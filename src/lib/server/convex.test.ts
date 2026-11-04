import { describe, expect, it } from "vitest";
import { isHttpError } from "@sveltejs/kit";
import { ConvexError } from "convex/values";
import { rethrowAsHttpError } from "./convex";

function thrownBy(fn: () => void) {
	try {
		fn();
	} catch (e) {
		return e;
	}
	throw new Error("expected the function to throw");
}

describe("rethrowAsHttpError", () => {
	it("turns a ConvexError with status and message into a SvelteKit error", () => {
		const e = thrownBy(() =>
			rethrowAsHttpError(new ConvexError({ status: 404, message: "Skin not found" }))
		);
		expect(isHttpError(e)).toBe(true);
		if (!isHttpError(e)) return;
		expect(e.status).toBe(404);
		expect(e.body.message).toBe("Skin not found");
	});

	it("rethrows other errors unchanged", () => {
		const original = new Error("boom");
		expect(thrownBy(() => rethrowAsHttpError(original))).toBe(original);
	});

	it("rethrows ConvexErrors without status data unchanged", () => {
		const original = new ConvexError("plain string");
		expect(thrownBy(() => rethrowAsHttpError(original))).toBe(original);
	});
});
