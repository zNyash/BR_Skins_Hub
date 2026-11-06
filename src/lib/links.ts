import type { Doc } from "$convex/_generated/dataModel";

export type LinkType = NonNullable<Doc<"players">["links"]>[number]["type"];

export const LINK_ICONS: Record<LinkType, string> = {
	twitter: "simple-icons:x",
	twitch: "simple-icons:twitch",
	youtube: "simple-icons:youtube",
	github: "simple-icons:github",
	discord: "simple-icons:discord",
	custom: "link"
};

type Platform = Exclude<LinkType, "discord" | "custom">;

const PLATFORMS: Record<
	Platform,
	{ hosts: string[]; url: (user: string) => string; label: (user: string) => string }
> = {
	twitter: {
		hosts: ["x.com", "twitter.com"],
		url: (u) => `https://x.com/${u}`,
		label: (u) => `@${u}`
	},
	twitch: { hosts: ["twitch.tv"], url: (u) => `https://twitch.tv/${u}`, label: (u) => u },
	youtube: {
		hosts: ["youtube.com"],
		url: (u) => `https://youtube.com/@${u}`,
		label: (u) => `@${u}`
	},
	github: { hosts: ["github.com"], url: (u) => `https://github.com/${u}`, label: (u) => u }
};

/** A bare username, optionally with a leading @. Anything with ":" or "/" is not one. */
const USERNAME = /^@?([\w.-]+)$/;

function parseHttpUrl(value: string): URL | null {
	try {
		const url = new URL(value);
		return url.protocol === "http:" || url.protocol === "https:" ? url : null;
	} catch {
		return null;
	}
}

const bareHost = (url: URL) => url.hostname.replace(/^www\./, "");

/**
 * Turns a stored link (a full URL or a bare username, both exist in the data) into what the
 * profile shows. Anything that doesn't parse as expected gets no href, so it's never clickable.
 */
export function linkTarget(type: LinkType, value: string): { href: string | null; label: string } {
	const plain = { href: null, label: value };

	if (type === "discord") return plain; // no profile URL: the button copies the username
	if (type === "custom") {
		const url = parseHttpUrl(value);
		return url ? { href: url.href, label: bareHost(url) } : plain;
	}

	const platform = PLATFORMS[type];
	const profile = (user: string) => ({ href: platform.url(user), label: platform.label(user) });

	const bare = USERNAME.exec(value)?.[1];
	if (bare) return profile(bare);

	const url = parseHttpUrl(value);
	if (!url || !platform.hosts.includes(bareHost(url))) return plain;

	// Only a single path segment is a profile (`x.com/foo`, `youtube.com/@foo`). Longer paths
	// (`youtube.com/channel/UC…`, `twitch.tv/videos/123`) point at something else, so they keep
	// their own URL instead of being rewritten into a profile link for the wrong account.
	const segments = url.pathname.split("/").filter(Boolean);
	if (segments.length === 0) return plain;
	if (type === "youtube") {
		if (segments.length === 1 && segments[0].startsWith("@")) return profile(segments[0].slice(1));
		const legacy = ["channel", "c", "user"].includes(segments[0]) && segments[1];
		return { href: url.href, label: legacy ? segments[1] : bareHost(url) };
	}
	return segments.length === 1
		? profile(segments[0].replace(/^@/, ""))
		: { href: url.href, label: bareHost(url) };
}
