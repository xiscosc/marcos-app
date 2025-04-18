// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { PosthogContext } from '@/server/shared/analytics/posthog';
import type { AppUser } from '@marcsimolduressonsardina/core/type';
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
