import type { PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { AuthService } from '$lib/server/service/auth.service';
import { CustomerService, OrderService } from '@marcsimolduressonsardina/core/service';
import { OrderUtilities } from '@marcsimolduressonsardina/core/util';
import { trackServerEvent } from '@/server/shared/analytics/posthog';

export const load = (async ({ params, locals }) => {
	const { id, customerId } = params;
	const config = AuthService.generateConfiguration(locals.user!);
	const customerService = new CustomerService(config);
	const orderService = new OrderService(config, customerService);

	const customer = await customerService.getCustomerById(customerId);

	if (customer == null) {
		fail(404, { missing: true });
	}

	const order = await orderService.getOrderById(id);
	if (!order || !OrderUtilities.isOrderTemp(order)) {
		fail(404, { missing: true });
	}

	await orderService.addCustomerToTemporaryOrder(customer!, order!);
	await trackServerEvent(
		locals.user!,
		{
			event: 'order_customer_linked_from_search',
			orderId: order!.id,
			customerId: customer!.id
		},
		locals.posthog
	);

	redirect(302, `/orders/${id}/files`);
}) satisfies PageServerLoad;
