import { describe, expect, it } from "vitest";
import { getUploadThingKey } from "./uploadthing";

describe("getUploadThingKey", () => {
	it("extracts the key from current ufs.sh urls", () => {
		expect(getUploadThingKey("https://4z8saciasg.ufs.sh/f/abc123.png")).toBe("abc123.png");
		expect(getUploadThingKey("https://7mc9fusyoy.ufs.sh/f/xyz")).toBe("xyz");
	});

	it("extracts the key from legacy urls", () => {
		expect(getUploadThingKey("https://utfs.io/f/legacy1")).toBe("legacy1");
		expect(getUploadThingKey("https://app.ufs.uploadthing.com/f/legacy2")).toBe("legacy2");
	});

	it("ignores query strings and hashes", () => {
		expect(getUploadThingKey("https://abc.ufs.sh/f/key1?w=200#x")).toBe("key1");
	});

	it("returns null for urls not hosted on UploadThing", () => {
		expect(getUploadThingKey("https://drive.google.com/file/d/123/view")).toBeNull();
		expect(getUploadThingKey("https://nyashss.s-ul.eu/abc.png")).toBeNull();
		// Look-alikes must not match: the host has to *end* with an UploadThing domain.
		expect(getUploadThingKey("https://ufs.sh.evil.com/f/key")).toBeNull();
		expect(getUploadThingKey("https://notufs.sh/f/key")).toBeNull();
	});

	it("returns null for invalid urls or urls without a key", () => {
		expect(getUploadThingKey("not a url")).toBeNull();
		expect(getUploadThingKey("https://abc.ufs.sh/")).toBeNull();
	});
});
