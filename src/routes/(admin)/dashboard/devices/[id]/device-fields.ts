import type { DeviceType } from "$convex/validators";
import type { Device } from "$lib/types";
import type { ImageItem } from "../../skin-images";

/** Everything the device editor edits. Sizes are text so an empty field means "unset". */
export type DeviceDraft = {
	name: string;
	type: DeviceType;
	full_w: string;
	full_h: string;
	/** The uploaded image, a pending file (uploaded on save), or none. */
	image: ImageItem | null;
};

export function snapshotFromDevice(d: Device): DeviceDraft {
	return {
		name: d.name,
		type: d.type,
		full_w: d.full_w?.toString() ?? "",
		full_h: d.full_h?.toString() ?? "",
		image: d.image_url ? { id: d.image_url, kind: "url", url: d.image_url } : null
	};
}

/** Whether the draft differs from the loaded device. Images compare by id (url or blob preview). */
export function draftChanged(draft: DeviceDraft, base: DeviceDraft): boolean {
	const plain = ({ image, ...rest }: DeviceDraft) => JSON.stringify({ ...rest, image: image?.id });
	return plain(draft) !== plain(base);
}

const badSize = (s: string) => s.trim() !== "" && !(Number(s) > 0);

/** Why the draft can't be saved yet, or null when it can. Sizes only matter on tablets. */
export function draftError(draft: DeviceDraft): string | null {
	if (draft.name.trim() === "") return "Give the device a name.";
	if (draft.type !== "tablet") return null;
	if (badSize(draft.full_w)) return "Width must be a positive number.";
	if (badSize(draft.full_h)) return "Height must be a positive number.";
	return null;
}

/** The PATCH body: the whole device. A missing image_url removes the image. */
export function deviceBody(draft: DeviceDraft, image_url: string | undefined) {
	const size = (s: string) => (draft.type === "tablet" && s.trim() !== "" ? Number(s) : undefined);
	const body = {
		name: draft.name.trim(),
		type: draft.type,
		full_w: size(draft.full_w),
		full_h: size(draft.full_h),
		image_url
	};
	// Leave out what's unset, so the body only carries real values.
	return Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined)) as {
		name: string;
		type: DeviceType;
		full_w?: number;
		full_h?: number;
		image_url?: string;
	};
}
