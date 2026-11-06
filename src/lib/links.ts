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
	let user = USERNAME.exec(value)?.[1];
	if (!user) {
		const url = parseHttpUrl(value);
		if (!url || !platform.hosts.includes(bareHost(url))) return plain;
		user = url.pathname.split("/").filter(Boolean)[0]?.replace(/^@/, "");
	}
	return user ? { href: platform.url(user), label: platform.label(user) } : plain;
}
