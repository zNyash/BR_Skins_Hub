import type { RequestEvent } from '@sveltejs/kit';

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
	const forwardedFor = event.request.headers.get('x-forwarded-for');
	if (forwardedFor) return forwardedFor.split(',')[0].trim();
	return event.getClientAddress();
}

function getBucketKey(key: string, ip: string): string {
	return `${key}:${ip}`;
}

function cleanupExpiredBuckets() {
	const now = Date.now();
	for (const [key, bucket] of buckets) {
		if (now > bucket.resetAt) buckets.delete(key);
	}
}

export function createRateLimiter({ key, maxRequests, windowMs }: RateLimiterOptions) {
	return {
		check(event: RequestEvent) {
			cleanupExpiredBuckets();

			const now = Date.now();
			const ip = getClientIp(event);
			const bucketKey = getBucketKey(key, ip);
			const existing = buckets.get(bucketKey);

			if (!existing || now > existing.resetAt) {
				buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
				return;
			}

			existing.count++;

			if (existing.count > maxRequests) {
				const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
				throw new Response(
					JSON.stringify({ message: 'Too many requests' }),
					{
						status: 429,
						headers: {
							'Content-Type': 'application/json',
							'Retry-After': String(retryAfterSeconds)
						}
					}
				);
			}
		}
	};
}
