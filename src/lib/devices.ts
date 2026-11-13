import type { DeviceType } from "$convex/validators";

export const DEVICE_LABELS: Record<DeviceType, { one: string; many: string }> = {
	tablet: { one: "Tablet", many: "Tablets" },
	keyboard: { one: "Keyboard", many: "Keyboards" },
	mouse: { one: "Mouse", many: "Mice" },
	monitor: { one: "Monitor", many: "Monitors" }
};

/** Lucide icon per device type, shown when a device has no image. */
export const DEVICE_ICONS: Record<DeviceType, string> = {
	tablet: "tablet",
	keyboard: "keyboard",
	mouse: "mouse",
	monitor: "monitor"
};
