import { AuthService } from '$lib/server/service/auth.service';
import type { CustomSession } from '$lib/type/api.type';
import { CustomerService } from '@marcsimolduressonsardina/core/service';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session as CustomSession);
	if (!appUser || !appUser.priceManager) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const customerService = new CustomerService(AuthService.generateConfiguration(appUser));
	const { lastKey } = (await request.json()) as { lastKey?: Record<string, string | number> };
	const customerPaginated = await customerService.getAllCustomersPaginated(lastKey);
	return json({ customers: customerPaginated.customers, lastKey: customerPaginated.nextKey });
}
