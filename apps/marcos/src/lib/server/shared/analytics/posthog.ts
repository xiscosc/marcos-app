import { PostHog } from 'posthog-node';
import { PUBLIC_POSTHOG_KEY } from '$env/static/public';
import { ENV_NAME } from '$env/static/private';
import type { AppUser } from '@marcsimolduressonsardina/core/type';

function buildPostHogServer() {
	return new PostHog(PUBLIC_POSTHOG_KEY, {
		host: 'https://eu.i.posthog.com',
		disableGeoip: false
	});
}

export interface IServerEvent {
	event: string;
	properties?: Record<string, unknown>;
}

export async function trackServerEvents(
	user: AppUser,
	events: IServerEvent[],
	orderId?: string,
	customerId?: string,
	url?: string
) {
	const client = buildPostHogServer();

	for (const event of events) {
		client.capture({
			distinctId: user.id,
			event: event.event,
			properties: {
				$set: { name: user.name },
				$set_once: { initial_url: '/' },
				...event.properties,
				orderId,
				customerId,
				$current_url: url,
				env: ENV_NAME,
				store: 'main'
			}
		});
	}

	await client.shutdown();
}

export async function trackAnonymousServerEvents(
	events: IServerEvent[],
	orderId?: string,
	customerId?: string,
	url?: string
) {
	const client = buildPostHogServer();

	for (const event of events) {
		client.capture({
			distinctId: 'anonymous',
			event: event.event,
			properties: {
				...event.properties,
				orderId,
				customerId,
				$current_url: url,
				env: ENV_NAME,
				store: 'main'
			}
		});
	}

	await client.shutdown();
}
