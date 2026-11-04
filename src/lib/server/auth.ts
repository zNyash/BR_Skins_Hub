import { error, type RequestEvent } from "@sveltejs/kit";
import { SignJWT, jwtVerify } from "jose";
import { ADMIN_OSU_IDS, JWT_SECRET } from "$env/static/private";

type SessionUser = { osu_id: number };

// --- Session tokens ---

const secret = new TextEncoder().encode(JWT_SECRET);

export async function createToken(payload: SessionUser) {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("30d")
		.sign(secret);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
	try {
		const { payload } = await jwtVerify(token, secret);
		return payload as SessionUser;
	} catch {
		return null;
	}
}

/** For handlers that only get a plain Request (UploadThing). SvelteKit routes use locals.user. */
export async function getSessionUser(request: Request): Promise<SessionUser | null> {
	const token = request.headers.get("cookie")?.match(/(?:^|;\s*)session=([^;]+)/)?.[1];
	return token ? verifyToken(decodeURIComponent(token)) : null;
}

// --- Guards ---

const adminIds = new Set(ADMIN_OSU_IDS.split(",").map(Number).filter(Boolean));

export const isAdmin = (osuId: number) => adminIds.has(osuId);

export function requireUser(event: RequestEvent): SessionUser {
	if (!event.locals.user) error(401, "You need to log in first");
	return event.locals.user;
}

export function requireAdmin(event: RequestEvent): SessionUser {
	const user = requireUser(event);
	if (!isAdmin(user.osu_id)) error(403, "Only admins can do this");
	return user;
}
