import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearDeviceCache, loadDevices } from "./device-catalog";

describe("loadDevices", () => {
	beforeEach(() => clearDeviceCache());

	it("fetches once per type and reuses the cached list", async () => {
		const load = vi.fn().mockResolvedValue([{ _id: "d1", name: "Wacom CTL-472" }]);

		const first = await loadDevices("tablet", load);
		const second = await loadDevices("tablet", load);

		expect(load).toHaveBeenCalledTimes(1);
		expect(load).toHaveBeenCalledWith("/api/devices?type=tablet");
		expect(second).toBe(first);
	});

	it("fetches again for a different type", async () => {
		const load = vi.fn().mockResolvedValue([]);

		await loadDevices("tablet", load);
		await loadDevices("mouse", load);

		expect(load).toHaveBeenCalledTimes(2);
		expect(load).toHaveBeenLastCalledWith("/api/devices?type=mouse");
	});

	it("retries after a failed fetch", async () => {
		const load = vi.fn().mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce([]);

		await expect(loadDevices("keyboard", load)).rejects.toThrow("boom");
		await expect(loadDevices("keyboard", load)).resolves.toEqual([]);

		expect(load).toHaveBeenCalledTimes(2);
	});
});
