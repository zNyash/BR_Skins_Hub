import { describe, expect, it } from "vitest";
import type { Id } from "../_generated/dataModel";
import type { DatabaseWriter } from "../_generated/server";
import { deleteRelations, setPlayerSkins, setSkinPlayers } from "./relations";

type Row = { _id: string; player_id: string; skin_id: string };

// Just enough of ctx.db for the relation helpers: index queries on playerSkins, insert and delete.
function fakeDb(initial: Omit<Row, "_id">[]) {
	let nextId = 0;
	const rows: Row[] = initial.map((row) => ({ _id: `r${nextId++}`, ...row }));

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
				return {
					collect: async () =>
						rows.filter((row) =>
							Object.entries(filters).every(([field, value]) => row[field as keyof Row] === value)
						)
				};
			}
		}),
		insert: async (_table: string, doc: Omit<Row, "_id">) => {
			const _id = `r${nextId++}`;
			rows.push({ _id, ...doc });
			return _id;
		},
		delete: async (id: string) => {
			rows.splice(
				rows.findIndex((row) => row._id === id),
				1
			);
		}
	};

	return { db: db as unknown as DatabaseWriter, rows };
}

const pairs = (rows: Row[]) => rows.map((row) => `${row.player_id}-${row.skin_id}`).sort();
const player = (id: string) => id as Id<"players">;
const skin = (id: string) => id as Id<"skins">;

describe("setPlayerSkins", () => {
	it("inserts missing and deletes removed relations", async () => {
		const { db, rows } = fakeDb([
			{ player_id: "p1", skin_id: "s1" },
			{ player_id: "p1", skin_id: "s2" }
		]);
		const keptId = rows[1]._id;

		await setPlayerSkins(db, player("p1"), [skin("s2"), skin("s3")]);

		expect(pairs(rows)).toEqual(["p1-s2", "p1-s3"]);
		expect(rows.find((row) => row.skin_id === "s2")?._id).toBe(keptId);
	});

	it("ignores duplicate ids", async () => {
		const { db, rows } = fakeDb([]);
		await setPlayerSkins(db, player("p1"), [skin("s1"), skin("s1")]);
		expect(pairs(rows)).toEqual(["p1-s1"]);
	});

	it("leaves other players' relations alone", async () => {
		const { db, rows } = fakeDb([{ player_id: "p2", skin_id: "s1" }]);
		await setPlayerSkins(db, player("p1"), []);
		expect(pairs(rows)).toEqual(["p2-s1"]);
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
