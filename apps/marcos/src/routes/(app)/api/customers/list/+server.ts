import { AuthService } from '@/server/service/auth.service';
import { CustomerService } from '@marcsimolduressonsardina/core/service';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	if (!AuthService.isAdmin(locals.user)) {
		return json({ error: 'Unauthorized' }, { status: 403 });
	}

	const customerService = new CustomerService(AuthService.generateConfiguration(locals.user!));
	const { lastKey } = (await request.json()) as { lastKey?: Record<string, string | number> };
	const customerPaginated = await customerService.getAllCustomersPaginated(lastKey);
	return json({ customers: customerPaginated.customers, lastKey: customerPaginated.nextKey });
}
