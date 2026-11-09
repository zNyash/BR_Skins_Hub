import { isRedirect, type RequestEvent } from "@sveltejs/kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./+server";

const { authorize, mutate } = vi.hoisted(() => ({ authorize: vi.fn(), mutate: vi.fn() }));

vi.mock("$env/static/private", () => ({
	OSU_CLIENT_ID: "1",
	OSU_CLIENT_SECRET: "secret",
	CURRENT_DOMAIN: "https://brskins.com"
}));
vi.mock("osu-api-extended", () => ({ auth: { authorize } }));
vi.mock("$lib/server/convex", () => ({ mutate }));
vi.mock("$lib/server/auth", () => ({ createToken: async () => "token" }));

function callback(query: string, cookies: Record<string, string>) {
	const jar = new Map(Object.entries(cookies));
	const event = {
		url: new URL(`https://brskins.com/auth/callback?${query}`),
		cookies: {
			get: (name: string) => jar.get(name),
			set: (name: string, value: string) => jar.set(name, value),
			delete: (name: string) => jar.delete(name)
		}
	} as unknown as RequestEvent;
	return { event, jar };
}

async function location(event: RequestEvent) {
	try {
		await GET(event);
	} catch (err) {
		if (isRedirect(err)) return err.location;
		throw err;
	}
	throw new Error("expected a redirect");
}

beforeEach(() => {
	authorize.mockReset().mockResolvedValue({ id: 1, username: "Tester", cover_url: "" });
	mutate.mockReset();
});

describe("GET /auth/callback", () => {
	it("logs in when the state matches the cookie, and clears the cookie", async () => {
		const { event, jar } = callback("code=c&state=abc", { oauth_state: "abc" });
		expect(await location(event)).toBe("/");
		expect(jar.get("session")).toBe("token");
		expect(jar.has("oauth_state")).toBe(false);
	});

	it("restarts the login when the state doesn't match", async () => {
		const { event, jar } = callback("code=c&state=evil", { oauth_state: "abc" });
		expect(await location(event)).toBe("/auth/login");
		expect(authorize).not.toHaveBeenCalled();
		expect(jar.has("session")).toBe(false);
	});

	it("restarts the login without a state cookie", async () => {
		const { event } = callback("code=c&state=abc", {});
		expect(await location(event)).toBe("/auth/login");
		expect(authorize).not.toHaveBeenCalled();
	});
});
