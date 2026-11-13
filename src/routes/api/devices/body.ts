import * as v from "valibot";
import { deviceType, httpUrl, positiveMm, trimmedString } from "$lib/server/schemas";

/** A whole device, for create and edit. A missing image_url removes the image. */
export const DeviceBody = v.object({
	name: trimmedString,
	type: deviceType,
	full_w: positiveMm,
	full_h: positiveMm,
	image_url: v.optional(httpUrl)
});
