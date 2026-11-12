import { onDestroy, tick, untrack } from "svelte";
import { toast } from "svelte-sonner";
import { invalidate } from "$app/navigation";
import { request } from "$lib/api";
import { uploadOsk, type OskStatus } from "$lib/drive-upload";
import type { SkinWithPlayers } from "$lib/types";
import { createUploadThing } from "$lib/uploadthing";
import { resolveImageUrls, type ImageItem } from "../../skin-images";
import {
	draftChanged,
	draftError,
	skinBody,
	snapshotFromSkin,
	type SkinDraft
} from "./skin-fields";

// Blob urls hold the file in memory until revoked, so free them whenever pending images go away.
function revokePreviews(items: ImageItem[]) {
	for (const item of items) if (item.kind === "file") URL.revokeObjectURL(item.preview);
}

/**
 * One editable copy of a skin, compared with the loaded skin to know whether there's anything to
 * save. Call it while a component initializes.
 */
export function createSkinDraft(skin: () => SkinWithPlayers) {
	const loaded = $derived(snapshotFromSkin(skin()));

	// The loaded data the draft was made from: Reset goes back to it.
	let base = $state.raw(untrack(() => loaded));
	let draft = $state<SkinDraft>(structuredClone(untrack(() => loaded)));

	const dirty = $derived(draftChanged(draft, base));

	// When the data reloads, an untouched draft follows it; one with edits is kept, and only
	// compared against the fresh data from now on.
	$effect.pre(() => {
		const next = loaded;
		untrack(() => {
			if (next === base) return;
			if (!dirty) draft = structuredClone(next);
			base = next;
		});
	});

	onDestroy(() => revokePreviews(draft.images));

	const { startUpload } = createUploadThing("imageUploader", {
		onUploadError: (error) => console.error("[uploadthing]", error)
	});

	function reset() {
		revokePreviews(draft.images);
		draft = structuredClone(base);
	}

	// Not part of the draft: neither makes the skin "changed".
	let optimizeOsk = $state(true);
	let oskStatus = $state<OskStatus | null>(null);

	/** Uploads a pending .osk to Google Drive and puts its link in the draft. */
	async function uploadPendingOsk() {
		if (!draft.osk) return;
		try {
			draft.skin.download_url = await uploadOsk(draft.osk, draft.skin.name.trim(), {
				optimize: optimizeOsk,
				onStatus: (status) => (oskStatus = status)
			});
			// Uploaded: saving again (e.g. after a failed PATCH) doesn't upload it twice.
			draft.osk = null;
		} finally {
			oskStatus = null;
		}
	}

	/** Uploads the pending files (in their current order) and swaps them for their urls. */
	async function uploadPending(): Promise<string[]> {
		const files = draft.images.flatMap((item) => (item.kind === "file" ? [item.file] : []));
		if (files.length === 0) return resolveImageUrls(draft.images, []);
		const uploaded = await startUpload(files);
		if (!uploaded) throw new Error("Image upload failed");
		const urls = resolveImageUrls(
			draft.images,
			uploaded.map((file) => file.ufsUrl)
		);
		// From here on they're ordinary uploaded images, so saving again doesn't upload them twice.
		revokePreviews(draft.images);
		draft.images = urls.map((url) => ({ id: url, kind: "url", url }));
		return urls;
	}

	// Never rejects: the bar awaits it, so every failure is a toast and the draft is kept.
	async function save() {
		const problem = draftError(draft);
		if (problem) {
			toast.error(problem);
			return;
		}
		try {
			await uploadPendingOsk();
			const preview_images = await uploadPending();
			await request(`/api/skins/${skin()._id}`, {
				method: "PATCH",
				body: skinBody($state.snapshot(draft), preview_images)
			});
		} catch (e) {
			toast.error((e as Error).message);
			return;
		}
		toast.success("Skin saved");
		try {
			await Promise.all([invalidate("app:skins"), invalidate("app:players")]);
		} catch (e) {
			// Saved, but the list couldn't reload; the draft stays until it does.
			toast.error((e as Error).message);
			return;
		}
		await tick();
		// The server tidies some values (trims), so take what it stored.
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
		get optimizeOsk() {
			return optimizeOsk;
		},
		set optimizeOsk(value) {
			optimizeOsk = value;
		},
		/** The pending .osk upload's current step, or null. */
		get oskStatus() {
			return oskStatus;
		},
		isDirty: () => dirty,
		reset,
		save
	};
}
