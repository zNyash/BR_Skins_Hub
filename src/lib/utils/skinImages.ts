/** A preview image in the editor: already uploaded, or a local file waiting to be uploaded on save. */
export type ImageItem =
	| { kind: "url"; url: string }
	| { kind: "file"; file: File; preview: string };

/** Returns a copy of `list` with the item at `from` moved to `to`. Out-of-range indexes change nothing. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
	const copy = [...list];
	const inRange = (i: number) => i >= 0 && i < list.length;
	if (!inRange(from) || !inRange(to)) return copy;

	const [item] = copy.splice(from, 1);
	copy.splice(to, 0, item);
	return copy;
}

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
