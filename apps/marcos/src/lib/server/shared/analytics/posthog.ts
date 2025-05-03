import { PostHog } from 'posthog-node';
import { PUBLIC_POSTHOG_KEY } from '$env/static/public';
import { ENV_NAME } from '$env/static/private';
import type { AppUser } from '@marcsimolduressonsardina/core/type';
import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';

export interface IServerEvent {
	event: string;
	properties?: Record<string, unknown>;
	orderId?: string;
	customerId?: string;
}

export interface PostHogContext {
	ip: string;
	user_agent: string | null;
	current_url: string;
	path: string;
	referrer: string | null;
}

export function buildPostHogServer() {
	return new PostHog(PUBLIC_POSTHOG_KEY, {
		host: 'https://eu.i.posthog.com',
		disableGeoip: false
	});
}

function getPropertiesFromContext(context: PostHogContext) {
	return {
		$ip: context.ip,
		$user_agent: context.user_agent,
		$referrer: context.referrer,
		$current_url: context.current_url,
		env: ENV_NAME
	};
}

function createAnonymousDistinctId(context: PostHogContext) {
	const distinctId = `${context.ip}-${context.user_agent || 'no-agent'}`;
	return distinctId;
}

export async function trackServerEvent(
	user: AppUser,
	event: IServerEvent,
	context: PostHogContext
) {
	if (dev) {
		return;
	}

	const client = buildPostHogServer();

	client.capture({
		distinctId: user.id,
		event: event.event,
		properties: {
			$set: { name: user.name },
			$set_once: { initial_url: '/' },
			...event.properties,
			orderId: event.orderId,
			customerId: event.customerId,
			...getPropertiesFromContext(context),
			store: user.storeId
		}
	});

	try {
		await client.shutdown();
	} catch (error) {
		console.error('Failed to shutdown PostHog client:', error);
	}
}

export async function trackAnonymousServerEvent(event: IServerEvent, context: PostHogContext) {
	if (dev || context.user_agent?.toLowerCase().includes('whatsapp')) {
		return;
	}

	const client = buildPostHogServer();

	client.capture({
		distinctId: createAnonymousDistinctId(context),
		event: event.event,
		properties: {
			$set: { name: 'Public user' },
			...event.properties,
			orderId: event.orderId,
			customerId: event.customerId,
			...getPropertiesFromContext(context)
		}
	});

	try {
		await client.shutdown();
	} catch (error) {
		console.error('Failed to shutdown PostHog client:', error);
	}
}

export const posthogContextHandle: Handle = async ({ event, resolve }) => {
	// Capture client context
	event.locals.posthog = {
		ip: event.getClientAddress(),
		user_agent: event.request.headers.get('user-agent'),
		current_url: event.url.toString(),
		path: event.url.pathname,
		referrer: event.request.headers.get('referer')
	};

	return resolve(event);
};
