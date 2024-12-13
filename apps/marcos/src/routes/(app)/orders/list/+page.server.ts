import { AuthUtilities } from '$lib/server/shared/auth/auth.utilites';
import type { PageServerLoad } from './$types';
import { AuthService } from '$lib/server/service/auth.service';
import { OrderService } from '@marcsimolduressonsardina/core/service';
import { OrderStatus, type FullOrder } from '@marcsimolduressonsardina/core/type';

export const load = (async ({ locals, url }) => {
	const appUser = await AuthUtilities.checkAuth(locals);
	const allowedStatus = [OrderStatus.QUOTE, OrderStatus.PENDING, OrderStatus.FINISHED];
	let status = (url.searchParams.get('status') as OrderStatus) || OrderStatus.PENDING;
	if (allowedStatus.indexOf(status) === -1) {
		status = OrderStatus.PENDING;
	}

	const config = AuthService.generateConfiguration(appUser);
	const orderService = new OrderService(config);
	const emptyArrayPromise = new Promise<FullOrder[]>((resolve) => {
		resolve([]);
	});

	const orders = appUser.priceManager
		? orderService.getOrdersByStatus(status as OrderStatus)
		: emptyArrayPromise;
	return { orders, status };
}) satisfies PageServerLoad;
