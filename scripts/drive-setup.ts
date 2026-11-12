/**
 * One-time Google Drive setup: logs in with Google and prints the refresh token the server uses
 * to upload skins. Usage: bun scripts/drive-setup.ts <client_id> <client_secret>
 *
 * The OAuth client must be a "Desktop app" client, so Google accepts the localhost redirect.
 */

const [clientId, clientSecret] = process.argv.slice(2);
if (!clientId || !clientSecret) {
	console.error("Usage: bun scripts/drive-setup.ts <client_id> <client_secret>");
	process.exit(1);
}

let redirectUri = "";

const server = Bun.serve({
	hostname: "127.0.0.1",
	port: 0,
	async fetch(req) {
		const url = new URL(req.url);
		const code = url.searchParams.get("code");
		const denied = url.searchParams.get("error");
		if (!code && !denied) return new Response("Waiting for Google…");

		if (denied) {
			console.error(`\nGoogle said: ${denied}`);
		} else {
			const response = await fetch("https://oauth2.googleapis.com/token", {
				method: "POST",
				body: new URLSearchParams({
					code: code!,
					client_id: clientId,
					client_secret: clientSecret,
					redirect_uri: redirectUri,
					grant_type: "authorization_code"
				})
			});
			const body = await response.json();
			if (body.refresh_token) {
				console.log("\nAdd this to .env and to the Vercel env vars:\n");
				console.log(`GOOGLE_REFRESH_TOKEN=${body.refresh_token}\n`);
			} else {
				console.error("\nNo refresh token in Google's answer:", body);
			}
		}

		setTimeout(() => server.stop(), 100);
		return new Response("Done, you can close this tab and go back to the terminal.");
	}
});

redirectUri = `http://127.0.0.1:${server.port}`;

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.search = new URLSearchParams({
	client_id: clientId,
	redirect_uri: redirectUri,
	response_type: "code",
	scope: "https://www.googleapis.com/auth/drive",
	access_type: "offline",
	// Always ask, so Google sends a refresh token even if this app was approved before.
	prompt: "consent"
}).toString();

console.log("Open this link and log in with the Google account that owns the skins folder:\n");
console.log(authUrl.toString());
console.log(
	'\nGoogle will warn that the app isn\'t verified: click "Advanced", then "Go to … (unsafe)".'
);

try {
	Bun.spawn(["xdg-open", authUrl.toString()], { stdout: "ignore", stderr: "ignore" });
} catch {
	// No browser opener: the printed link is enough.
}
