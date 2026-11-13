import { onDestroy, tick, untrack } from "svelte";
import { toast } from "svelte-sonner";
import { invalidate } from "$app/navigation";
import { request } from "$lib/api";
import type { Device } from "$lib/types";
import { createUploadThing } from "$lib/uploadthing";
import type { ImageItem } from "../../skin-images";
import {
	deviceBody,
	draftChanged,
	draftError,
	snapshotFromDevice,
	type DeviceDraft
} from "./device-fields";

// A blob url holds the file in memory until revoked.
function revokePreview(item: ImageItem | null) {
	if (item?.kind === "file") URL.revokeObjectURL(item.preview);
}

/**
 * One editable copy of a device, compared with the loaded device to know whether there's anything
 * to save. Call it while a component initializes. Mirrors the skin draft.
 */
export function createDeviceDraft(device: () => Device) {
	const loaded = $derived(snapshotFromDevice(device()));

	let base = $state.raw(untrack(() => loaded));
	let draft = $state<DeviceDraft>(structuredClone(untrack(() => loaded)));

	const dirty = $derived(draftChanged(draft, base));

	// When the data reloads, an untouched draft follows it; one with edits is kept.
	$effect.pre(() => {
		const next = loaded;
		untrack(() => {
			if (next === base) return;
			if (!dirty) draft = structuredClone(next);
			base = next;
		});
	});

	onDestroy(() => revokePreview(draft.image));

	const { startUpload } = createUploadThing("imageUploader", {
		onUploadError: (error) => console.error("[uploadthing]", error)
	});

	function reset() {
		revokePreview(draft.image);
		draft = structuredClone(base);
	}

	/** Uploads a pending image and swaps it for its url. */
	async function uploadPending(): Promise<string | undefined> {
		const image = draft.image;
		if (!image) return undefined;
		if (image.kind === "url") return image.url;
		const uploaded = await startUpload([image.file]);
		const url = uploaded?.[0]?.ufsUrl;
		if (!url) throw new Error("Image upload failed");
		// From here on it's an ordinary uploaded image, so saving again doesn't upload it twice.
		revokePreview(image);
		draft.image = { id: url, kind: "url", url };
		return url;
	}

	// Never rejects: the bar awaits it, so every failure is a toast and the draft is kept.
	async function save() {
		const problem = draftError(draft);
		if (problem) {
			toast.error(problem);
			return;
		}
		try {
			const image_url = await uploadPending();
			await request(`/api/devices/${device()._id}`, {
				method: "PATCH",
				body: deviceBody($state.snapshot(draft) as DeviceDraft, image_url)
			});
		} catch (e) {
			toast.error((e as Error).message);
			return;
		}
		toast.success("Device saved");
		try {
			await invalidate("app:devices");
		} catch (e) {
			toast.error((e as Error).message);
			return;
		}
		await tick();
		// The server tidies some values (trims, drops sizes off non-tablets), so take what it stored.
		base = loaded;
		reset();
	}

	return {
		get draft() {
			return draft;
		},
		set draft(value) {
			draft = value;
		},
		isDirty: () => dirty,
		reset,
		save
	};
}
