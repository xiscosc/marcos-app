import { AuthService } from '@/server/service/auth.service';
import { trackServerEvent } from '@/server/shared/analytics/posthog';
import { FileService, OrderService } from '@marcsimolduressonsardina/core/service';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals, params }) {
	const { id } = params;
	const config = AuthService.generateConfiguration(locals.user!);
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
		locals.user!,
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
