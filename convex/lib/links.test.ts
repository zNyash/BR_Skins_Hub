import { describe, expect, it } from "vitest";
import { directDriveLink } from "./links";

const direct = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`;

describe("directDriveLink", () => {
	it("turns a /file/d/ share link into a direct download", () => {
		expect(
			directDriveLink(
				"https://drive.google.com/file/d/1CNxsbtF4ZCzWYf3NkW7tT1tHJW7Yz-2t/view?usp=sharing"
			)
		).toBe(direct("1CNxsbtF4ZCzWYf3NkW7tT1tHJW7Yz-2t"));
		expect(directDriveLink("https://drive.google.com/file/d/abc")).toBe(direct("abc"));
	});

	it("leaves open?id= links alone, since they can be folders", () => {
		const url = "https://drive.google.com/open?id=abc&usp=drive_fs";
		expect(directDriveLink(url)).toBe(url);
	});

	it("leaves links that are already direct exactly as they are", () => {
		const withExtra = `${direct("abc")}&usp=drive_fs`;
		expect(directDriveLink(withExtra)).toBe(withExtra);
		expect(directDriveLink(direct("abc"))).toBe(direct("abc"));
	});

	it("leaves folders, other hosts, look-alikes and junk unchanged", () => {
		const unchanged = [
			"https://drive.google.com/drive/folders/1l_4W?usp=sharing",
			"https://drive.proton.me/urls/S7PWSGAFRM#5TJpnq4KJdOk",
			"https://notshigetora.s-ul.eu/MBtiDXCn",
			"https://drive.google.com.evil.com/file/d/abc/view",
			"not a url"
		];
		for (const url of unchanged) expect(directDriveLink(url)).toBe(url);
	});
});
