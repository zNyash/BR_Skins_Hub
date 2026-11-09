import { describe, expect, it } from "vitest";
import { isRedirect } from "@sveltejs/kit";
import { ADMIN_OSU_IDS } from "$env/static/private";
import { assertAdminPage, createToken, getSessionUser } from "./auth";

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

describe("assertAdminPage", () => {
	const adminId = Number(ADMIN_OSU_IDS.split(",")[0]);
	const redirectTarget = (locals: App.Locals) => {
		try {
			assertAdminPage(locals);
		} catch (e) {
			if (isRedirect(e)) return e.location;
			throw e;
		}
		return null;
	};

	it("sends visitors without a session to the login", () => {
		expect(redirectTarget({ user: null })).toBe("/auth/login");
	});

	it("sends non-admins to the home page", () => {
		expect(redirectTarget({ user: { osu_id: adminId + 1 } })).toBe("/");
	});

	it("lets admins through", () => {
		expect(redirectTarget({ user: { osu_id: adminId } })).toBeNull();
	});
});
