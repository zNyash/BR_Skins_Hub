import { request } from "$lib/api";

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
 * Uploads a .osk to the admin's Google Drive (into the skin's letter folder) and returns its public
 * download link. The file goes from the browser straight to Google, not through our server.
 */
export async function uploadOsk(
	file: File,
	skinName: string,
	onProgress: (percent: number) => void
): Promise<string> {
	const { upload_url } = await request<{ upload_url: string }>("/api/skins/osk/start", {
		method: "POST",
		body: { file_name: file.name, size: file.size, skin_name: skinName }
	});
	onProgress(0);
	const file_id = await putFile(upload_url, file, onProgress);
	const { download_url } = await request<{ download_url: string }>("/api/skins/osk/finish", {
		method: "POST",
		body: { file_id }
	});
	return download_url;
}
