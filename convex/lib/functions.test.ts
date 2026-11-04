import { describe, expect, it } from "vitest";
import { ConvexError } from "convex/values";
import { fail, parseAdminIds } from "./functions";

describe("parseAdminIds", () => {
	it("reads a comma separated list, ignoring junk and non-positive ids", () => {
		expect(parseAdminIds("1, 2,x,,-3")).toEqual(new Set([1, 2]));
	});

	it("is empty when the variable is missing", () => {
		expect(parseAdminIds(undefined)).toEqual(new Set());
	});
});

describe("fail", () => {
	it("throws a ConvexError carrying the status and message", () => {
		try {
			fail(404, "Skin not found");
			expect.unreachable();
		} catch (e) {
			expect(e).toBeInstanceOf(ConvexError);
			expect((e as ConvexError<unknown>).data).toEqual({ status: 404, message: "Skin not found" });
		}
	});
});
