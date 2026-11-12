import { json } from "@sveltejs/kit";
import * as v from "valibot";
import { requireAdmin } from "$lib/server/auth";
import { getDrive } from "$lib/server/drive";
import { oskSize, trimmedString } from "$lib/server/schemas";
import { parseBody } from "$lib/server/validation";
import type { RequestHandler } from "./$types";

const StartBody = v.object({
	file_name: trimmedString,
	size: oskSize,
	skin_name: v.string()
});

/** Opens a Google Drive upload for a .osk; the browser then sends the file straight to `upload_url`. */
export const POST: RequestHandler = async (event) => {
	requireAdmin(event);
	const body = await parseBody(event.request, StartBody);

	const upload_url = await getDrive().startUpload({
		fileName: body.file_name,
		size: body.size,
		skinName: body.skin_name,
		origin: event.url.origin
	});
	return json({ upload_url });
};
