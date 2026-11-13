import { describe, expect, it } from "vitest";
import type { Id } from "../_generated/dataModel";
import { linkPatch, relinkSetup, unlinkDevice, type LinkDevice } from "./setup-links";

const id = (x: string) => x as Id<"devices">;
const ctl: LinkDevice = {
	_id: id("t1"),
	name: "Wacom CTL-472",
	type: "tablet",
	otd_path: "Wacom/CTL-472"
};
const mx: LinkDevice = { _id: id("m1"), name: "Logitech G Pro", type: "mouse" };
const devices = [ctl, mx];

describe("linkPatch", () => {
	it("auto-links a confident typed model", () =>
		expect(linkPatch({ tablet: { model: "ctl 472" } }, undefined, devices)).toEqual({
			patch: { tablet: { model: "ctl 472", device_id: "t1" } }
		}));
	it("keeps a picked device and drops a stray manual flag", () =>
		expect(
			linkPatch({ tablet: { model: "x", device_id: id("t1"), link: "manual" } }, undefined, devices)
		).toEqual({ patch: { tablet: { model: "x", device_id: "t1" } } }));
	it("keeps the link when other fields change", () =>
		expect(
			linkPatch(
				{ tablet: { model: "my ctl", device_id: id("t1"), area_w: 90 } },
				{ tablet: { model: "my ctl", device_id: id("t1"), area_w: 80 } },
				devices
			)
		).toEqual({ patch: { tablet: { model: "my ctl", device_id: "t1", area_w: 90 } } }));
	it("400 when the picked device is gone", () =>
		expect(linkPatch({ tablet: { device_id: id("gone") } }, undefined, devices)).toEqual({
			status: 400,
			message: "That device no longer exists"
		}));
	it("400 when the picked device is another type", () =>
		expect(linkPatch({ tablet: { device_id: id("m1") } }, undefined, devices)).toEqual({
			status: 400,
			message: "That device isn't a tablet"
		}));
	it("manual flag stays while the model is unchanged", () =>
		expect(
			linkPatch(
				{ tablet: { model: "ctl472", link: "manual" } },
				{ tablet: { model: "ctl472", link: "manual" } },
				devices
			)
		).toEqual({ patch: { tablet: { model: "ctl472", link: "manual" } } }));
	it("manual flag is dropped and matching runs when the model changes", () =>
		expect(
			linkPatch(
				{ tablet: { model: "wacom ctl-472", link: "manual" } },
				{ tablet: { model: "ctl472", link: "manual" } },
				devices
			)
		).toEqual({ patch: { tablet: { model: "wacom ctl-472", device_id: "t1" } } }));
	it("a new manual flag (Not my tablet / keep as typed) is kept", () =>
		expect(
			linkPatch(
				{ tablet: { model: "ctl472", link: "manual" } },
				{ tablet: { model: "ctl472", device_id: id("t1") } },
				devices
			)
		).toEqual({ patch: { tablet: { model: "ctl472", link: "manual" } } }));
	it("keeps a new manual flag on a never-saved card", () =>
		expect(linkPatch({ tablet: { model: "ctl472", link: "manual" } }, undefined, devices)).toEqual({
			patch: { tablet: { model: "ctl472", link: "manual" } }
		}));
	it("keeps a new manual flag when the stored card had none and another model", () =>
		expect(
			linkPatch(
				{ tablet: { model: "ctl472", link: "manual" } },
				{ tablet: { model: "old" } },
				devices
			)
		).toEqual({ patch: { tablet: { model: "ctl472", link: "manual" } } }));
	it("leaves null cards and non-linkable cards alone", () =>
		expect(linkPatch({ tablet: null, pc: { cpu: "R7" } }, undefined, devices)).toEqual({
			patch: { tablet: null, pc: { cpu: "R7" } }
		}));
});

describe("relinkSetup", () => {
	it("links only unlinked, unflagged cards", () => {
		expect(
			relinkSetup(
				{ tablet: { model: "ctl472" }, mouse: { model: "g pro", link: "manual" } },
				devices
			)
		).toEqual({
			tablet: { model: "ctl472", device_id: "t1" },
			mouse: { model: "g pro", link: "manual" }
		});
		expect(relinkSetup({ tablet: { model: "ctl472", device_id: id("t1") } }, devices)).toBeNull();
	});
});

describe("unlinkDevice", () => {
	it("clears only that device and sets no flag", () =>
		expect(
			unlinkDevice(
				{ tablet: { model: "x", device_id: id("t1") }, mouse: { device_id: id("m1") } },
				id("t1")
			)
		).toEqual({ tablet: { model: "x" }, mouse: { device_id: "m1" } }));
});
