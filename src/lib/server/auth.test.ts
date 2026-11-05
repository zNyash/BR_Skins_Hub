import { describe, expect, it } from "vitest";
import { createToken, getSessionUser } from "./auth";

const requestWithCookie = (cookie?: string) =>
	new Request("http://localhost", { headers: cookie ? { cookie } : {} });

describe("getSessionUser", () => {
	it("reads the user from a valid session cookie among others", async () => {
		const token = await createToken({ osu_id: 42 });
		const user = await getSessionUser(requestWithCookie(`a=1; session=${token}`));
		expect(user?.osu_id).toBe(42);
	});

	it("is null without a cookie header", async () => {
		expect(await getSessionUser(requestWithCookie())).toBeNull();
	});

	it("is null for a tampered session", async () => {
		expect(await getSessionUser(requestWithCookie("session=garbage"))).toBeNull();
	});
});
