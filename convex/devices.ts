import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
	internalAction,
	internalMutation,
	internalQuery,
	query,
	type QueryCtx
} from "./_generated/server";
import { cleanDevice, deleteError, deviceEditError } from "./lib/devices";
import { adminMutation, fail } from "./lib/functions";
import {
	OTD_BRANCH,
	OTD_REPO,
	changedEntries,
	otdEntries,
	parseOtdConfig,
	planOtdWrite,
	rawUrl
} from "./lib/otd";
import { deviceFields } from "./validators";

function normalizeDeviceId(ctx: QueryCtx, id: string): Id<"devices"> {
	return ctx.db.normalizeId("devices", id) ?? fail(404, "Device not found");
}

/** All devices. A few hundred small rows, loaded whole like players and skins. */
export const list = query({
	args: {},
	handler: (ctx) => ctx.db.query("devices").collect()
});

/** The last OpenTabletDriver sync's outcome, or null before the first one. */
export const lastSync = query({
	args: {},
	handler: async (ctx) => (await ctx.db.query("deviceSync").order("desc").first()) ?? null
});

/** Creates the device when no id is given, otherwise replaces its editable fields. */
export const upsert = adminMutation({
	args: { id: v.optional(v.string()), ...deviceFields },
	handler: async (ctx, { id, ...input }) => {
		const current = id === undefined ? null : await ctx.db.get(normalizeDeviceId(ctx, id));
		if (id !== undefined && !current) fail(404, "Device not found");

		const all = await ctx.db.query("devices").collect();
		const problem = deviceEditError(input, current, all);
		if (problem) fail(problem.status, problem.message);

		const device = { ...cleanDevice(input), updated_at: Date.now() };
		if (!current) return await ctx.db.insert("devices", device);

		// replace() drops what isn't sent (a removed image, sizes of a non-tablet); OTD bookkeeping stays.
		await ctx.db.replace(current._id, {
			...device,
			otd_path: current.otd_path,
			otd_sha: current.otd_sha
		});
		return current._id;
	}
});

/** Deletes a hand-made device. Returns its image url so the caller can delete the file. */
export const remove = adminMutation({
	args: { id: v.string() },
	handler: async (ctx, { id }) => {
		const device = await ctx.db.get(normalizeDeviceId(ctx, id));
		if (!device) fail(404, "Device not found");
		const problem = deleteError(device);
		if (problem) fail(problem.status, problem.message);
		await ctx.db.delete(device._id);
		return { image_url: device.image_url };
	}
});

/** "Sync now": runs the OpenTabletDriver sync in the background, right away. */
export const requestSync = adminMutation({
	args: {},
	handler: async (ctx) => {
		await ctx.scheduler.runAfter(0, internal.devices.syncOtd, {});
	}
});

/* -------------------------- */
/* OpenTabletDriver sync      */
/* -------------------------- */

/** otd_path → otd_sha of every imported tablet. */
export const otdShas = internalQuery({
	args: {},
	handler: async (ctx) => {
		const devices = await ctx.db.query("devices").collect();
		const shas: Record<string, string> = {};
		for (const d of devices) if (d.otd_path && d.otd_sha) shas[d.otd_path] = d.otd_sha;
		return shas;
	}
});

const otdRow = v.object({
	otd_path: v.string(),
	otd_sha: v.string(),
	name: v.string(),
	full_w: v.number(),
	full_h: v.number()
});

/** Writes the synced tablets. Only OTD's fields are touched: image and admin edit time stay. */
export const applyOtdBatch = internalMutation({
	args: { rows: v.array(otdRow) },
	handler: async (ctx, { rows }) => {
		let added = 0;
		let updated = 0;
		for (const row of rows) {
			const existing = await ctx.db
				.query("devices")
				.withIndex("by_otd_path", (q) => q.eq("otd_path", row.otd_path))
				.first();
			if (planOtdWrite(existing) === "insert") {
				await ctx.db.insert("devices", { ...row, type: "tablet" });
				added++;
			} else {
				await ctx.db.patch(existing!._id, row);
				updated++;
			}
		}
		return { added, updated };
	}
});

/** Keeps a single row: the newest run. */
export const recordSync = internalMutation({
	args: {
		ran_at: v.number(),
		ok: v.boolean(),
		added: v.number(),
		updated: v.number(),
		skipped: v.array(v.string()),
		error: v.optional(v.string())
	},
	handler: async (ctx, run) => {
		for (const old of await ctx.db.query("deviceSync").collect()) await ctx.db.delete(old._id);
		await ctx.db.insert("deviceSync", run);
	}
});

const DOWNLOADS_IN_FLIGHT = 8;

function githubHeaders(): Record<string, string> {
	const headers: Record<string, string> = { "User-Agent": "br-skins-hub" };
	// The repo is public, but Convex's shared IPs exhaust GitHub's anonymous limit (60/hour per IP).
	const token = process.env.GITHUB_TOKEN;
	if (token) headers.Authorization = `Bearer ${token}`;
	return headers;
}

async function fetchJson(url: string, headers: Record<string, string>): Promise<unknown> {
	const res = await fetch(url, { headers });
	if (!res.ok) {
		// GitHub explains rate limits and auth problems in the body's "message".
		const detail = ((await res.json().catch(() => null)) as { message?: string } | null)?.message;
		throw new Error(`GitHub ${res.status} for ${url}${detail ? `: ${detail}` : ""}`);
	}
	return res.json();
}

/** Runs `fn` over `items` with at most `limit` running at once. */
async function mapLimited<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
	const results: R[] = new Array(items.length);
	let next = 0;
	async function worker() {
		while (next < items.length) {
			const i = next++;
			results[i] = await fn(items[i]);
		}
	}
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
	return results;
}

/**
 * Imports new and changed tablet configs from OpenTabletDriver. One API call lists every file with
 * its sha; only files whose sha differs from the stored one are downloaded.
 */
export const syncOtd = internalAction({
	args: {},
	handler: async (ctx) => {
		const ran_at = Date.now();
		try {
			const headers = githubHeaders();
			const tree = (await fetchJson(
				`https://api.github.com/repos/${OTD_REPO}/git/trees/${OTD_BRANCH}?recursive=1`,
				{ ...headers, Accept: "application/vnd.github+json" }
			)) as Parameters<typeof otdEntries>[0];
			const stored = new Map(Object.entries(await ctx.runQuery(internal.devices.otdShas, {})));
			const changed = changedEntries(otdEntries(tree), stored);

			const parsed = await mapLimited(changed, DOWNLOADS_IN_FLIGHT, async (entry) => ({
				entry,
				config: parseOtdConfig(await fetchJson(rawUrl(entry.otdPath), headers))
			}));

			// A file that doesn't parse is skipped: no row, or its old row and sha stay, so it's retried next run.
			const skipped = parsed.filter((p) => !p.config).map((p) => p.entry.otdPath);
			const rows = parsed.flatMap(({ entry, config }) =>
				config ? [{ otd_path: entry.otdPath, otd_sha: entry.sha, ...config }] : []
			);

			const { added, updated } = await ctx.runMutation(internal.devices.applyOtdBatch, { rows });
			await ctx.runMutation(internal.devices.recordSync, {
				ran_at,
				ok: true,
				added,
				updated,
				skipped
			});
		} catch (e) {
			await ctx.runMutation(internal.devices.recordSync, {
				ran_at,
				ok: false,
				added: 0,
				updated: 0,
				skipped: [],
				error: (e as Error).message
			});
			throw e;
		}
	}
});
