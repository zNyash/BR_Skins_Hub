import { afterEach, describe, expect, it, vi } from "vitest";
import type { RequestEvent } from "@sveltejs/kit";
import { handleError } from "./hooks.server";

const event = { request: { method: "GET" }, url: new URL("http://localhost/nope") } as RequestEvent;

describe("handleError", () => {
	afterEach(() => vi.restoreAllMocks());

	it("passes 404s through without logging or a reference id", async () => {
		const log = vi.spyOn(console, "error").mockImplementation(() => {});
		const result = await handleError({
			error: new Error("x"),
			event,
			status: 404,
			message: "Not Found"
		});
		expect(result).toEqual({ message: "Not Found" });
		expect(log).not.toHaveBeenCalled();
	});

	it("logs crashes and returns a reference id", async () => {
		const log = vi.spyOn(console, "error").mockImplementation(() => {});
		const result = await handleError({
			error: new Error("boom"),
			event,
			status: 500,
			message: "Internal Error"
		});
		expect(result?.errorId).toMatch(/^[0-9a-f]{8}$/);
		expect(result?.message).toBe(`Internal Error (ref ${result?.errorId})`);
		expect(log).toHaveBeenCalledOnce();
	});
});
