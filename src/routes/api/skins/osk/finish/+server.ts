import { json } from "@sveltejs/kit";
import * as v from "valibot";
import { requireAdmin } from "$lib/server/auth";
import { getDrive } from "$lib/server/drive";
import { trimmedString } from "$lib/server/schemas";
import { parseBody } from "$lib/server/validation";
import type { RequestHandler } from "./$types";

const FinishBody = v.object({ file_id: trimmedString });

/** Makes an uploaded .osk public and returns its download link. */
export const POST: RequestHandler = async (event) => {
	requireAdmin(event);
	const { file_id } = await parseBody(event.request, FinishBody);
	return json({ download_url: await getDrive().publish(file_id) });
};
