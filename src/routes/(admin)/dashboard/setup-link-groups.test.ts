import { describe, expect, it } from "vitest";
import type { Doc } from "$convex/_generated/dataModel";
import type { Device } from "$lib/types";
import { linkGroups } from "./setup-link-groups";

const player = (id: string, setup: Doc<"players">["setup"]) =>
	({ _id: id, _creationTime: 0, name: id, osu_id: 1, setup }) as Doc<"players">;

const device = (id: string, name: string, type: Device["type"] = "tablet") =>
	({ _id: id, _creationTime: 0, name, type }) as Device;

describe("linkGroups", () => {
	it("groups spelling variants of one model", () => {
		const groups = linkGroups(
			[
				player("a", { tablet: { model: "ctl 4100" } }),
				player("b", { tablet: { model: "CTL4100" } })
			],
			[]
		);
		expect(groups).toHaveLength(1);
		expect(groups[0].label).toBe("CTL 4100");
		expect(groups[0].variants.toSorted()).toEqual(["CTL4100", "ctl 4100"]);
		expect(groups[0].cards).toEqual([
			{ player_id: "a", card: "tablet" },
			{ player_id: "b", card: "tablet" }
		]);
		expect(groups[0].allKept).toBe(false);
	});

	it("skips linked cards, confident matches and empty models", () => {
		const devices = [device("d1", "Wacom CTL-4100")];
		const groups = linkGroups(
			[
				player("a", { tablet: { model: "x", device_id: "d1" as never } }),
				player("b", { tablet: { model: "wacom ctl4100" } }),
				player("c", { tablet: { model: " - " } })
			],
			devices
		);
		expect(groups).toEqual([]);
	});

	it("keeps a flagged card that matches confidently", () => {
		const groups = linkGroups(
			[player("a", { tablet: { model: "Wacom CTL-4100", link: "manual" } })],
			[device("d1", "Wacom CTL-4100")]
		);
		expect(groups).toHaveLength(1);
		expect(groups[0].allKept).toBe(true);
		expect(groups[0].closest?._id).toBe("d1");
	});

	it("groups per type", () => {
		const groups = linkGroups(
			[player("a", { mouse: { model: "g pro" }, keyboard: { model: "g pro" } })],
			[]
		);
		expect(groups.map((g) => g.type).toSorted()).toEqual(["keyboard", "mouse"]);
	});

	it("finds the closest device of the same type", () => {
		const devices = [
			device("d1", "Wacom CTL-4100WL"),
			device("d2", "Wacom CTL-4100WL", "mouse"),
			device("d3", "Huion H640P")
		];
		const [group] = linkGroups([player("a", { tablet: { model: "ctl 4100" } })], devices);
		expect(group.closest?._id).toBe("d1");
		const [none] = linkGroups([player("a", { keyboard: { model: "ctl 4100" } })], devices);
		expect(none.closest).toBeNull();
	});

	it("sorts by size then label", () => {
		const groups = linkGroups(
			[
				player("a", { tablet: { model: "bbb" } }),
				player("b", { tablet: { model: "aaa" } }),
				player("c", { tablet: { model: "ccc" } }),
				player("d", { tablet: { model: "ccc" } })
			],
			[]
		);
		expect(groups.map((g) => g.label)).toEqual(["CCC", "AAA", "BBB"]);
	});
});
