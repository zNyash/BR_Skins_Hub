/**
 * Reading OpenTabletDriver's tablet configs from GitHub. The branch is pinned, so a future OTD
 * version with a different file format can't break the import by surprise.
 */

export const OTD_REPO = "OpenTabletDriver/OpenTabletDriver";
export const OTD_BRANCH = "0.6.x";
export const OTD_DIR = "OpenTabletDriver.Configurations/Configurations/";

export type TreeEntry = { path: string; type: string; sha: string };
export type OtdEntry = { otdPath: string; sha: string };

/** The config files in a recursive git tree listing, as "<Vendor>/<Model>" paths with their blob sha. */
export function otdEntries(tree: { truncated: boolean; tree: TreeEntry[] }): OtdEntry[] {
	// A cut-off listing would look like removed tablets, so it fails the sync instead.
	if (tree.truncated) throw new Error("OTD tree is truncated");
	return tree.tree
		.filter((e) => e.type === "blob" && e.path.startsWith(OTD_DIR) && e.path.endsWith(".json"))
		.map((e) => ({ otdPath: e.path.slice(OTD_DIR.length, -".json".length), sha: e.sha }));
}

/** The entries that are new, or whose file changed since it was last imported. */
export function changedEntries(entries: OtdEntry[], stored: Map<string, string>): OtdEntry[] {
	return entries.filter((e) => stored.get(e.otdPath) !== e.sha);
}

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null;
const positive = (x: unknown): x is number => typeof x === "number" && x > 0;

/** The name and full active area (mm) of one config file, or null when it lacks them. */
export function parseOtdConfig(
	json: unknown
): { name: string; full_w: number; full_h: number } | null {
	if (!isRecord(json) || typeof json.Name !== "string" || json.Name.trim() === "") return null;
	const specs = json.Specifications;
	const digitizer = isRecord(specs) ? specs.Digitizer : undefined;
	if (!isRecord(digitizer)) return null;
	const { Width, Height } = digitizer;
	if (!positive(Width) || !positive(Height)) return null;
	return { name: json.Name.trim(), full_w: Width, full_h: Height };
}

/**
 * Where to download one config: by its blob sha, not by branch. A branch url can be served from a
 * cache for a few minutes, which would store an older file under the new sha.
 */
export function blobUrl(sha: string): string {
	return `https://api.github.com/repos/${OTD_REPO}/git/blobs/${sha}`;
}

/**
 * The config inside a git blob response (base64 JSON), or null when it can't be read. A broken
 * file is skipped like an incomplete one, so one bad upstream file never fails the whole sync.
 */
export function configFromBlob(blob: unknown): ReturnType<typeof parseOtdConfig> {
	if (!isRecord(blob) || blob.encoding !== "base64" || typeof blob.content !== "string") {
		return null;
	}
	try {
		const bytes = Uint8Array.from(atob(blob.content.replace(/\s/g, "")), (c) => c.charCodeAt(0));
		return parseOtdConfig(JSON.parse(new TextDecoder().decode(bytes)));
	} catch {
		return null;
	}
}

/**
 * Whether a synced file becomes a new row or updates the row that already has its path. Looked up
 * inside the mutation, so two overlapping syncs never create the same tablet twice.
 */
export function planOtdWrite(existing: { _id: string } | null): "insert" | "patch" {
	return existing ? "patch" : "insert";
}
