import { describe, expect, it } from "vitest";
import { readErrorMessage } from "./http";

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
