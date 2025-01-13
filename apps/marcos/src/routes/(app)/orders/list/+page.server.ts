import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import type { PageServerLoad } from './$types';
import { OrderStatus } from '@marcsimolduressonsardina/core/type';

export const load = (async ({ locals, url }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const allowedStatus = [OrderStatus.QUOTE, OrderStatus.PENDING, OrderStatus.FINISHED];
	let status = (url.searchParams.get('status') as OrderStatus) || OrderStatus.PENDING;
	if (allowedStatus.indexOf(status) === -1) {
		status = OrderStatus.PENDING;
	}

	return { status, priceManager: appUser.priceManager };
}) satisfies PageServerLoad;
