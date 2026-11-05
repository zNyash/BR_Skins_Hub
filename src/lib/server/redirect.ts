/** Where to send the user after login: `from` if it points at this site, otherwise the home page. */
export function safeRedirectTarget(from: string | null, siteUrl: string): string {
	if (!from || !URL.canParse(from, siteUrl)) return "/";

	const target = new URL(from, siteUrl);
	return target.origin === new URL(siteUrl).origin ? target.href : "/";
}
