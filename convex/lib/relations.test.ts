import { describe, expect, it } from "vitest";
import type { Id } from "../_generated/dataModel";
import type { DatabaseWriter } from "../_generated/server";
import {
	deleteRelations,
	reorderSkins,
	setPlayerSkins,
	setSkinHidden,
	setSkinPlayers
} from "./relations";

type Row = {
	_id: string;
	player_id: string;
	skin_id: string;
	position?: number;
	hidden?: boolean;
};

// Just enough of ctx.db for the relation helpers: index queries on playerSkins, insert, patch, delete.
function fakeDb(initial: Omit<Row, "_id">[]) {
	let nextId = 0;
	const rows: Row[] = initial.map((row) => ({ _id: `r${nextId++}`, ...row }));
	const patched: string[] = [];

	const db = {
		query: () => ({
			withIndex: (_index: string, build: (q: unknown) => unknown) => {
				const filters: Record<string, string> = {};
				const q = {
					eq(field: string, value: string) {
						filters[field] = value;
						return q;
					}
				};
				build(q);
				const matching = () =>
					rows.filter((row) =>
						Object.entries(filters).every(([field, value]) => row[field as keyof Row] === value)
					);
				return {
					collect: async () => matching(),
					unique: async () => matching()[0] ?? null
				};
			}
		}),
		insert: async (_table: string, doc: Omit<Row, "_id">) => {
			const _id = `r${nextId++}`;
			rows.push({ _id, ...doc });
			return _id;
		},
		patch: async (id: string, fields: Partial<Row>) => {
			patched.push(id);
			Object.assign(rows.find((row) => row._id === id)!, fields);
		},
		delete: async (id: string) => {
			rows.splice(
				rows.findIndex((row) => row._id === id),
				1
			);
		}
	};

	return { db: db as unknown as DatabaseWriter, rows, patched };
}

const pairs = (rows: Row[]) => rows.map((row) => `${row.player_id}-${row.skin_id}`).sort();
const at = (rows: Row[], skinId: string) =>
	rows.find((row) => row.player_id === "p1" && row.skin_id === skinId);
const player = (id: string) => id as Id<"players">;
const skin = (id: string) => id as Id<"skins">;
const entry = (id: string, hidden = false) => ({ id: skin(id), hidden });

describe("setPlayerSkins", () => {
	it("inserts missing and deletes removed relations", async () => {
		const { db, rows } = fakeDb([
			{ player_id: "p1", skin_id: "s1" },
			{ player_id: "p1", skin_id: "s2" }
		]);
		const keptId = rows[1]._id;

		await setPlayerSkins(db, player("p1"), [entry("s2"), entry("s3")]);

		expect(pairs(rows)).toEqual(["p1-s2", "p1-s3"]);
		expect(rows.find((row) => row.skin_id === "s2")?._id).toBe(keptId);
	});

	it("ignores duplicate ids", async () => {
		const { db, rows } = fakeDb([]);
		await setPlayerSkins(db, player("p1"), [entry("s1"), entry("s1", true)]);
		expect(pairs(rows)).toEqual(["p1-s1"]);
		expect(at(rows, "s1")).toMatchObject({ position: 0, hidden: false });
	});

	it("leaves other players' relations alone", async () => {
		const { db, rows } = fakeDb([{ player_id: "p2", skin_id: "s1" }]);
		await setPlayerSkins(db, player("p1"), []);
		expect(pairs(rows)).toEqual(["p2-s1"]);
	});

	it("saves array order as position and hidden flags", async () => {
		const { db, rows } = fakeDb([{ player_id: "p1", skin_id: "s1" }]);
		await setPlayerSkins(db, player("p1"), [entry("s2", true), entry("s1")]);
		expect(at(rows, "s2")).toMatchObject({ position: 0, hidden: true });
		expect(at(rows, "s1")).toMatchObject({ position: 1, hidden: false });
	});

	it("patches only rows whose position or hidden changed", async () => {
		const { db, rows, patched } = fakeDb([
			{ player_id: "p1", skin_id: "s1", position: 0, hidden: false },
			{ player_id: "p1", skin_id: "s2", position: 1, hidden: false }
		]);
		await setPlayerSkins(db, player("p1"), [entry("s1"), entry("s2", true)]);
		expect(patched).toEqual([at(rows, "s2")?._id]);
	});
});

describe("setSkinPlayers", () => {
	it("mirrors setPlayerSkins from the skin side", async () => {
		const { db, rows } = fakeDb([
			{ player_id: "p1", skin_id: "s1" },
			{ player_id: "p2", skin_id: "s1" }
		]);
		await setSkinPlayers(db, skin("s1"), [player("p2")]);
		expect(pairs(rows)).toEqual(["p2-s1"]);
	});

	it("puts a new relation on top of a player's custom order", async () => {
		const { db, rows } = fakeDb([
			{ player_id: "p1", skin_id: "s1", position: 0 },
			{ player_id: "p1", skin_id: "s2", position: 1 }
		]);
		await setSkinPlayers(db, skin("s3"), [player("p1")]);
		expect(at(rows, "s3")?.position).toBe(-1);
	});

	it("leaves position empty when the player has no custom order", async () => {
		const { db, rows } = fakeDb([{ player_id: "p1", skin_id: "s1" }]);
		await setSkinPlayers(db, skin("s2"), [player("p1")]);
		expect(at(rows, "s2")?.position).toBeUndefined();
	});
});

describe("reorderSkins", () => {
	it("sets positions from the given order and keeps hidden", async () => {
		const { db, rows } = fakeDb([
			{ player_id: "p1", skin_id: "s1", hidden: true },
			{ player_id: "p1", skin_id: "s2" }
		]);
		await reorderSkins(db, player("p1"), [skin("s2"), skin("s1")]);
		expect(at(rows, "s2")?.position).toBe(0);
		expect(at(rows, "s1")).toMatchObject({ position: 1, hidden: true });
	});

	it.each([
		["missing", ["s1"]],
		["extra", ["s1", "s2", "s3"]],
		["duplicate", ["s1", "s1"]]
	])("rejects a list with a %s id without writing", async (_, list) => {
		const { db, patched } = fakeDb([
			{ player_id: "p1", skin_id: "s1" },
			{ player_id: "p1", skin_id: "s2" }
		]);
		await expect(reorderSkins(db, player("p1"), list.map(skin))).rejects.toMatchObject({
			data: { status: 400 }
		});
		expect(patched).toEqual([]);
	});
});

describe("setSkinHidden", () => {
	it("toggles hidden", async () => {
		const { db, rows } = fakeDb([{ player_id: "p1", skin_id: "s1" }]);
		await setSkinHidden(db, player("p1"), skin("s1"), true);
		expect(at(rows, "s1")?.hidden).toBe(true);
	});

	it("rejects a skin the player doesn't use", async () => {
		const { db } = fakeDb([{ player_id: "p2", skin_id: "s1" }]);
		await expect(setSkinHidden(db, player("p1"), skin("s1"), true)).rejects.toMatchObject({
			data: { status: 404 }
		});
	});
});

describe("deleteRelations", () => {
	it("removes only the given player's relations", async () => {
		const { db, rows } = fakeDb([
			{ player_id: "p1", skin_id: "s1" },
			{ player_id: "p2", skin_id: "s1" }
		]);
		await deleteRelations(db, { player: player("p1") });
		expect(pairs(rows)).toEqual(["p2-s1"]);
	});

	it("removes only the given skin's relations", async () => {
		const { db, rows } = fakeDb([
			{ player_id: "p1", skin_id: "s1" },
			{ player_id: "p1", skin_id: "s2" }
		]);
		await deleteRelations(db, { skin: skin("s1") });
		expect(pairs(rows)).toEqual(["p1-s2"]);
	});
});
