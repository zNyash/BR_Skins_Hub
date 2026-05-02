import { SignJWT, jwtVerify } from 'jose';
import { JWT_SECRET } from '$env/static/private';

const secret = new TextEncoder().encode(JWT_SECRET);

export async function createToken(payload: { osu_id: number }) {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('30d')
		.sign(secret);
}

export async function verifyToken(token: string): Promise<{ osu_id: number } | null> {
	try {
		const { payload } = await jwtVerify(token, secret);
		return payload as { osu_id: number };
	} catch {
		return null;
	}
}
