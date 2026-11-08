import { error, type RequestEvent } from "@sveltejs/kit";

type RateLimiterOptions = {
	key: string;
	maxRequests: number;
	windowMs: number;
};

type Bucket = {
	count: number;
	resetAt: number;
};

const buckets = new Map<string, Bucket>();

function getClientIp(event: RequestEvent): string {
	const forwardedFor = event.request.headers.get("x-forwarded-for");
	if (forwardedFor) return forwardedFor.split(",")[0].trim();
	return event.getClientAddress();
}

function getBucketKey(key: string, ip: string, scope?: string): string {
	return scope ? `${key}:${scope}:${ip}` : `${key}:${ip}`;
}

function cleanupExpiredBuckets() {
	const now = Date.now();
	for (const [key, bucket] of buckets) {
		if (now > bucket.resetAt) buckets.delete(key);
	}
}

export function createRateLimiter({ key, maxRequests, windowMs }: RateLimiterOptions) {
	return {
		/** `scope` splits the limit further, e.g. per player instead of per ip alone. */
		check(event: RequestEvent, scope?: string) {
			cleanupExpiredBuckets();

			const now = Date.now();
			const ip = getClientIp(event);
			const bucketKey = getBucketKey(key, ip, scope);
			const existing = buckets.get(bucketKey);

			if (!existing || now > existing.resetAt) {
				buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
				return;
			}

			existing.count++;

			if (existing.count > maxRequests) {
				const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
				// Must be SvelteKit's error(): any other thrown value (like a Response) is treated
				// as a crash and turns into an opaque 500 "Error: {}".
				error(429, `Too many requests, try again in ${retryAfterSeconds}s`);
			}
		}
	};
}
