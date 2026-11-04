import { describe, expect, it } from "vitest";
import { isHttpError } from "@sveltejs/kit";
import * as v from "valibot";
import { hue, httpUrl, tags, trimmedString } from "./schemas";
import { parseBody } from "./validation";

const post = (body: string) => new Request("http://localhost", { method: "POST", body });

async function rejection(promise: Promise<unknown>) {
	try {
		await promise;
	} catch (e) {
		if (isHttpError(e)) return { status: e.status, message: e.body.message };
		throw e;
	}
	throw new Error("expected parseBody to reject");
}

describe("parseBody", () => {
	it("rejects a body that isn't JSON", async () => {
		expect(await rejection(parseBody(post("{"), v.object({})))).toEqual({
			status: 400,
			message: "Request body must be valid JSON"
		});
	});

	it("reports the first problem with the field name", async () => {
		const schema = v.object({ download_url: httpUrl });
		expect(await rejection(parseBody(post('{"download_url":"nope"}'), schema))).toEqual({
			status: 400,
			message: "download_url must be a valid URL"
		});
	});

	it("strips fields the schema doesn't know", async () => {
		const schema = v.object({ name: trimmedString });
		const body = await parseBody(post('{"name":" a ","_id":"x","download_count":9}'), schema);
		expect(body).toEqual({ name: "a" });
	});

	it("reports a missing required field", async () => {
		const schema = v.object({ name: trimmedString });
		expect(await rejection(parseBody(post('{"name":"  "}'), schema))).toEqual({
			status: 400,
			message: "name is required"
		});
	});
});

describe("hue", () => {
	const schema = v.object({ hue });

	it("keeps null, which means clearing the color", async () => {
		expect(await parseBody(post('{"hue":null}'), schema)).toEqual({ hue: null });
	});

	it("accepts values from 0 to 360", async () => {
		expect(await parseBody(post('{"hue":120}'), schema)).toEqual({ hue: 120 });
	});

	it("rejects values outside 0 to 360", async () => {
		expect(await rejection(parseBody(post('{"hue":400}'), schema))).toEqual({
			status: 400,
			message: "hue must be between 0 and 360"
		});
	});
});

describe("tags", () => {
	it("normalizes and dedupes", async () => {
		const body = await parseBody(post('{"tags":[" Foo  Bar ","foo bar",""]}'), v.object({ tags }));
		expect(body).toEqual({ tags: ["foo bar"] });
	});
});
