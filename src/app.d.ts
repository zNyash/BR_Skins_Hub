// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
			/** Short reference logged with unexpected errors, so a user report can be found in the logs. */
			errorId?: string;
		}
		interface Locals {
			user: { osu_id: number } | null;
		}
		interface PageData {
			user: import("$lib/types").AuthUser | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
