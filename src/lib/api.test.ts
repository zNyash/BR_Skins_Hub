import { afterEach, describe, expect, it, vi } from "vitest";
import { readErrorMessage, request } from "./api";

const response = (body: string, status: number, contentType = "application/json") =>
	new Response(body, { status, headers: { "Content-Type": contentType } });

describe("readErrorMessage", () => {
	it("uses the message from a SvelteKit error() json body", async () => {
		const res = response(JSON.stringify({ message: "Too many requests, try again in 42s" }), 429);
		expect(await readErrorMessage(res)).toBe("Too many requests, try again in 42s");
	});

	it("uses plain text bodies as they are", async () => {
		expect(await readErrorMessage(response("osu! user not found", 404, "text/plain"))).toBe(
			"osu! user not found"
		);
	});

	it("falls back to the status when the body is empty or unhelpful", async () => {
		expect(await readErrorMessage(response("", 500, "text/plain"))).toBe("Request failed (500)");
		expect(await readErrorMessage(response("{}", 502))).toBe("Request failed (502)");
	});
});

describe("request", () => {
	afterEach(() => vi.unstubAllGlobals());

	const stubFetch = (res: Response) => {
		const fetch = vi.fn().mockResolvedValue(res);
		vi.stubGlobal("fetch", fetch);
		return fetch;
	};

	it("resolves undefined for 204 No Content", async () => {
		stubFetch(new Response(null, { status: 204 }));
		expect(await request("/api/x", { method: "DELETE" })).toBeUndefined();
	});

	it("resolves the parsed JSON body", async () => {
		stubFetch(response(JSON.stringify({ id: "x" }), 201));
		expect(await request("/api/x", { method: "POST", body: {} })).toEqual({ id: "x" });
	});

	it("rejects with the backend's message", async () => {
		stubFetch(response(JSON.stringify({ message: "download_url must be a valid URL" }), 400));
		await expect(request("/api/x", { method: "PATCH", body: {} })).rejects.toThrow(
			"download_url must be a valid URL"
		);
	});

	it("sends the body as JSON", async () => {
		const fetch = stubFetch(new Response(null, { status: 204 }));
		await request("/api/x", { method: "PATCH", body: { a: 1 } });
		expect(fetch).toHaveBeenCalledWith("/api/x", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: '{"a":1}'
		});
	});
});
