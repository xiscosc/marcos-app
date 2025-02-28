import { AuthService } from '@/server/service/auth.service';
import type { CustomSession } from '@/type/api.type';
import { CustomerService } from '@marcsimolduressonsardina/core/service';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session as CustomSession);
	if (!appUser) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const customerService = new CustomerService(AuthService.generateConfiguration(appUser));
	const { query } = (await request.json()) as { query: string };
	const customers = await customerService.searchCustomers(query);
	return json({ customers });
}
