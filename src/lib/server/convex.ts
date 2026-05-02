import { ConvexHttpClient } from 'convex/browser';
import { CONVEX_URL } from '$env/static/private';

export const convex = new ConvexHttpClient(CONVEX_URL);
