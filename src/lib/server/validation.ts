import { error } from "@sveltejs/kit";
import * as v from "valibot";

/** Reads a JSON body and validates it. Fails with a 400 whose message names the first bad field. */
export async function parseBody<S extends v.GenericSchema>(
	request: Request,
	schema: S
): Promise<v.InferOutput<S>> {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		error(400, "Request body must be valid JSON");
	}

	const result = v.safeParse(schema, body);
	if (!result.success) {
		const [issue] = result.issues;
		const field = v.getDotPath(issue);
		error(400, field ? `${field} ${issue.message}` : issue.message);
	}
	return result.output;
}
