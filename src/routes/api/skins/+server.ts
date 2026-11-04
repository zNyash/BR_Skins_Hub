import { json } from "@sveltejs/kit";
import * as v from "valibot";
import { api } from "$convex/_generated/api";
import { requireAdmin } from "$lib/server/auth";
import { mutate } from "$lib/server/convex";
import { httpUrl, tags, trimmedString } from "$lib/server/schemas";
import { parseBody } from "$lib/server/validation";
import type { RequestHandler } from "./$types";

const CreateSkinBody = v.object({
	name: trimmedString,
	author: v.optional(v.pipe(v.string(), v.trim())),
	download_url: httpUrl,
	preview_images: v.optional(v.array(httpUrl), []),
	tags: v.optional(tags)
});

export const POST: RequestHandler = async (event) => {
	const admin = requireAdmin(event);
	const body = await parseBody(event.request, CreateSkinBody);

	const id = await mutate(api.skins.upsert, { actor_osu_id: admin.osu_id, ...body });
	return json({ id }, { status: 201 });
};
