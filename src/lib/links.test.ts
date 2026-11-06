import { describe, expect, it } from "vitest";
import { linkTarget, type LinkType } from "./links";

describe("linkTarget", () => {
	it.each([
		["twitter", "foo", "https://x.com/foo", "@foo"],
		["twitter", "@foo", "https://x.com/foo", "@foo"],
		["twitter", "https://twitter.com/foo", "https://x.com/foo", "@foo"],
		["twitter", "https://x.com/foo/", "https://x.com/foo", "@foo"],
		["twitch", "https://www.twitch.tv/foo?x=1", "https://twitch.tv/foo", "foo"],
		["youtube", "https://youtube.com/@foo", "https://youtube.com/@foo", "@foo"],
		["youtube", "foo", "https://youtube.com/@foo", "@foo"],
		["github", "https://github.com/foo", "https://github.com/foo", "foo"],
		["discord", "foo", null, "foo"],
		["custom", "https://www.example.com/page", "https://www.example.com/page", "example.com"],
		["custom", "javascript:alert(1)", null, "javascript:alert(1)"],
		["custom", "not a url", null, "not a url"],
		["twitter", "https://evil.com/foo", null, "https://evil.com/foo"],
		["twitter", "javascript:alert(1)", null, "javascript:alert(1)"],
		["github", "", null, ""],
		[
			"youtube",
			"https://www.youtube.com/channel/UCabc123",
			"https://www.youtube.com/channel/UCabc123",
			"UCabc123"
		],
		["youtube", "https://youtube.com/c/Name", "https://youtube.com/c/Name", "Name"],
		["youtube", "https://youtube.com/user/Name", "https://youtube.com/user/Name", "Name"],
		[
			"youtube",
			"https://youtube.com/watch?v=abc",
			"https://youtube.com/watch?v=abc",
			"youtube.com"
		],
		["twitch", "https://twitch.tv/videos/123", "https://twitch.tv/videos/123", "twitch.tv"]
	])("%s %j", (type, value, href, label) => {
		expect(linkTarget(type as LinkType, value)).toEqual({ href, label });
	});
});
