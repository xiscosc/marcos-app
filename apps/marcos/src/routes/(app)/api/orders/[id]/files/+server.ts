import { AuthService } from '@/server/service/auth.service';
import type { CustomSession } from '@/type/api.type';
import { trackServerEvent } from '@/server/shared/analytics/posthog';
import { FileService, OrderService } from '@marcsimolduressonsardina/core/service';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals, params }) {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session as CustomSession);
	if (!appUser) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id } = params;
	const config = AuthService.generateConfiguration(appUser);
	const fileService = new FileService(config);
	const orderService = new OrderService(config);
	const order = await orderService.getOrderById(id);
	if (order == null) {
		return json({ error: 'Order not found' }, { status: 404 });
	}

	const { filename } = (await request.json()) as { filename: string };
	if (filename == null) {
		return json({ error: 'Filename is required' }, { status: 400 });
	}

	const file = await fileService.createFile(id, filename);
	await trackServerEvent(
		appUser,
		{
			event: 'order_file_created',
			orderId: id,
			properties: {
				fileId: file.id
			}
		},
		locals.posthog
	);

	return json(file);
}
