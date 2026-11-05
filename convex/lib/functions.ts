import { customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";

/**
 * Access levels for Convex functions:
 * - public: plain `query` from _generated/server, for data that is public anyway.
 * - server: only our SvelteKit server can call it, proven by CONVEX_SERVER_SECRET.
 * - admin: server, plus the acting user (passed by the server) must be in ADMIN_OSU_IDS.
 */

export type ErrorData = { status: number; message: string };

/** Throws an error the SvelteKit server turns into a response with this status and message. */
export function fail(status: number, message: string): never {
	throw new ConvexError<ErrorData>({ status, message });
}

export function parseAdminIds(raw: string | undefined): Set<number> {
	const ids = (raw ?? "").split(",").map((id) => Number(id.trim()));
	return new Set(ids.filter((id) => Number.isInteger(id) && id > 0));
}

function checkSecret(secret: string) {
	const expected = process.env.CONVEX_SERVER_SECRET;
	if (!expected || secret !== expected) fail(401, "Invalid server secret");
}

function checkAdmin(actorOsuId: number) {
	if (!parseAdminIds(process.env.ADMIN_OSU_IDS).has(actorOsuId)) {
		fail(403, "Only admins can do this");
	}
}

const serverOnly = {
	args: { secret: v.string() },
	input: (_ctx: unknown, { secret }: { secret: string }) => {
		checkSecret(secret);
		return { ctx: {}, args: {} };
	}
};

const adminOnly = {
	args: { secret: v.string(), actor_osu_id: v.number() },
	input: (_ctx: unknown, { secret, actor_osu_id }: { secret: string; actor_osu_id: number }) => {
		checkSecret(secret);
		checkAdmin(actor_osu_id);
		return { ctx: {}, args: {} };
	}
};

export const serverQuery = customQuery(query, serverOnly);
export const serverMutation = customMutation(mutation, serverOnly);
export const adminMutation = customMutation(mutation, adminOnly);
