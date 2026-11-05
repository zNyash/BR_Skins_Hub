/**
 * A preview image in the editor: already uploaded, or a local file waiting to be uploaded on save.
 * `id` (the url, or the blob preview for a pending file) is what the drag-and-drop list keys on.
 */
export type ImageItem =
	| { id: string; kind: "url"; url: string }
	| { id: string; kind: "file"; file: File; preview: string };

/**
 * Builds the final `preview_images` array: existing urls stay, and each file takes the next
 * uploaded url, so the order the admin arranged is kept.
 */
export function resolveImageUrls(items: readonly ImageItem[], uploadedUrls: readonly string[]) {
	const fileCount = items.filter((item) => item.kind === "file").length;
	if (fileCount !== uploadedUrls.length) {
		throw new Error(`Expected ${fileCount} uploaded images, got ${uploadedUrls.length}`);
	}

	let next = 0;
	return items.map((item) => (item.kind === "url" ? item.url : uploadedUrls[next++]));
}
