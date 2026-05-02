import { redirect } from '@sveltejs/kit';

export async function POST(event) {
	event.cookies.delete('session', { path: '/' });
	redirect(302, '/');
}
