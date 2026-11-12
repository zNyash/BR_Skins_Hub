import { request } from "$lib/api";
import type { OptimizeMessage } from "$lib/osk-optimize.worker";

/** What a .osk upload is doing right now. `percent` is null while a step can't measure it. */
export type OskStatus = { label: string; percent: number | null };

/**
 * Losslessly shrinks a .osk and adds missing SD images, in a worker so the page stays responsive.
 * Optimizing is a bonus: if it fails, the original file is returned.
 */
function optimizeOsk(file: File, onStatus: (status: OskStatus) => void): Promise<File> {
	return new Promise((resolve) => {
		const worker = new Worker(new URL("./osk-optimize.worker.ts", import.meta.url), {
			type: "module"
		});
		const finish = (result: File) => {
			worker.terminate();
			resolve(result);
		};
		worker.onmessage = ({ data }: MessageEvent<OptimizeMessage>) => {
			if (data.type === "status") onStatus(data.status);
			else if (data.type === "done") {
				const optimized = new File([data.bytes as Uint8Array<ArrayBuffer>], file.name, {
					type: file.type
				});
				console.info(
					`[osk] ${file.size} → ${optimized.size} bytes, ${data.sdAdded} SD images added`
				);
				finish(optimized);
			} else {
				console.warn("[osk] optimizing failed, uploading the original:", data.message);
				finish(file);
			}
		};
		worker.onerror = (e) => {
			console.warn("[osk] optimizer worker crashed, uploading the original:", e.message);
			finish(file);
		};
		worker.postMessage(file);
	});
}

/** Sends the file to a Google Drive upload session, reporting progress. Resolves the new file id. */
function putFile(uploadUrl: string, file: File, onProgress: (percent: number) => void) {
	// fetch can't report upload progress, so this is the one place we use XMLHttpRequest.
	return new Promise<string>((resolve, reject) => {
		const fail = () => reject(new Error("Upload to Google Drive failed"));
		const xhr = new XMLHttpRequest();
		xhr.open("PUT", uploadUrl);
		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
		};
		xhr.onload = () => {
			if (xhr.status !== 200 && xhr.status !== 201) return fail();
			try {
				resolve(JSON.parse(xhr.responseText).id);
			} catch {
				fail();
			}
		};
		xhr.onerror = fail;
		xhr.send(file);
	});
}

/**
 * Optimizes a .osk (unless `optimize` is off), then uploads it to the admin's Google Drive (into the
 * skin's letter folder) and returns its public download link. The file goes from the browser straight
 * to Google, not through our server.
 */
export async function uploadOsk(
	file: File,
	skinName: string,
	{ optimize, onStatus }: { optimize: boolean; onStatus: (status: OskStatus) => void }
): Promise<string> {
	if (optimize) file = await optimizeOsk(file, onStatus);
	onStatus({ label: "Starting upload", percent: null });
	const { upload_url } = await request<{ upload_url: string }>("/api/skins/osk/start", {
		method: "POST",
		body: { file_name: file.name, size: file.size, skin_name: skinName }
	});
	const file_id = await putFile(upload_url, file, (percent) =>
		onStatus({ label: "Uploading to Google Drive", percent })
	);
	onStatus({ label: "Getting the download link", percent: null });
	const { download_url } = await request<{ download_url: string }>("/api/skins/osk/finish", {
		method: "POST",
		body: { file_id }
	});
	return download_url;
}
