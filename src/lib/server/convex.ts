import { error } from "@sveltejs/kit";
import { ConvexHttpClient } from "convex/browser";
import { ConvexError } from "convex/values";
import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";
import { CONVEX_SERVER_SECRET } from "$env/static/private";
import { PUBLIC_CONVEX_URL } from "$env/static/public";

/** For public queries. Protected functions go through serverQuery/mutate, which add the secret. */
export const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);

type WithoutSecret<F extends FunctionReference<"query" | "mutation">> = Omit<
	FunctionArgs<F>,
	"secret"
>;

export async function serverQuery<F extends FunctionReference<"query">>(
	fn: F,
	args: WithoutSecret<F>
): Promise<FunctionReturnType<F>> {
	try {
		return await convex.query(fn, { ...args, secret: CONVEX_SERVER_SECRET } as FunctionArgs<F>);
	} catch (e) {
		rethrowAsHttpError(e);
	}
}

export async function mutate<F extends FunctionReference<"mutation">>(
	fn: F,
	args: WithoutSecret<F>
): Promise<FunctionReturnType<F>> {
	try {
		return await convex.mutation(fn, { ...args, secret: CONVEX_SERVER_SECRET } as FunctionArgs<F>);
	} catch (e) {
		rethrowAsHttpError(e);
	}
}

/** Convex functions fail with { status, message } (see convex/lib/functions.ts); send those to the client as is. */
export function rethrowAsHttpError(e: unknown): never {
	if (e instanceof ConvexError) {
		const { data } = e;
		if (typeof data?.status === "number" && typeof data?.message === "string") {
			error(data.status, data.message);
		}
	}
	throw e;
}
