import type { Id } from "$convex/_generated/dataModel";
import type { DeviceType } from "$convex/validators";
import { request } from "$lib/api";

export type PickerDevice = {
	_id: Id<"devices">;
	name: string;
	image_url?: string;
	full_w?: number;
	full_h?: number;
};

const cache = new Map<DeviceType, Promise<PickerDevice[]>>();

/** The catalog list for one device type, fetched once and reused by every dialog that opens. */
export function loadDevices(
	type: DeviceType,
	load: (url: string) => Promise<PickerDevice[]> = (url) => request<PickerDevice[]>(url)
): Promise<PickerDevice[]> {
	const cached = cache.get(type);
	if (cached) return cached;

	const promise = load(`/api/devices?type=${type}`);
	cache.set(type, promise);
	// A failed load must not stick: drop it so the next open tries again.
	promise.catch(() => {
		if (cache.get(type) === promise) cache.delete(type);
	});
	return promise;
}

export function clearDeviceCache() {
	cache.clear();
}
