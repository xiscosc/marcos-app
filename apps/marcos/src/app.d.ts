// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { PosthogContext } from '@/server/shared/analytics/posthog';
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		interface Locals {
			posthog: PosthogContext;
			user?: AppUser;
		}
	}
}

export {};
