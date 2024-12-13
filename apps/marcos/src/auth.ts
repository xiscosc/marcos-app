import { SvelteKitAuth } from '@auth/sveltekit';
import Auth0 from '@auth/sveltekit/providers/auth0';

import type { Provider } from '@auth/sveltekit/providers';
import { AUTH_DEBUG } from '$env/static/private';
import type { WithMetadata, UserMetadata } from '$lib/type/api.type';

const providers: Provider[] = [Auth0];

const { handle } = SvelteKitAuth({
	providers,
	theme: {
		colorScheme: 'light',
		logo: 'https://marcsimoldures.com/wp-content/uploads/2017/02/MMlogo111.png'
	},
	callbacks: {
		async jwt({ token, profile }) {
			if (profile) {
				token.app_metadata = profile.app_metadata as UserMetadata;
			}
			return token;
		},
		async session({ session, token }) {
			type CustomSessionCallback = typeof session & WithMetadata;
			(session as CustomSessionCallback).userMetadata = token.app_metadata as UserMetadata;
			return session;
		}
	},
	trustHost: true,
	debug: AUTH_DEBUG === 'debug'
});

export const authHandle = handle;
