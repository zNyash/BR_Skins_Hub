import { describe, expect, it } from "vitest";
import { isHttpError, type RequestEvent } from "@sveltejs/kit";
import { createRateLimiter } from "./rateLimit";

const fakeEvent = (ip: string) =>
	({
		request: new Request("http://localhost/", { headers: { "x-forwarded-for": ip } }),
		getClientAddress: () => ip
	}) as unknown as RequestEvent;

describe("createRateLimiter", () => {
	it("allows requests up to the limit", () => {
		const limiter = createRateLimiter({ key: "allow", maxRequests: 3, windowMs: 60_000 });
		const event = fakeEvent("1.1.1.1");
		expect(() => {
			limiter.check(event);
			limiter.check(event);
			limiter.check(event);
		}).not.toThrow();
	});

	it("throws a SvelteKit 429 error (not a Response) once over the limit", () => {
		const limiter = createRateLimiter({ key: "block", maxRequests: 1, windowMs: 60_000 });
		const event = fakeEvent("2.2.2.2");
		limiter.check(event);

		let thrown: unknown;
		try {
			limiter.check(event);
		} catch (e) {
			thrown = e;
		}

		expect(isHttpError(thrown, 429)).toBe(true);
		if (isHttpError(thrown)) expect(thrown.body.message).toMatch(/too many requests/i);
	});

	it("counts each ip separately", () => {
		const limiter = createRateLimiter({ key: "per-ip", maxRequests: 1, windowMs: 60_000 });
		limiter.check(fakeEvent("3.3.3.3"));
		expect(() => limiter.check(fakeEvent("4.4.4.4"))).not.toThrow();
	});
});
