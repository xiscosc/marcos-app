import { AuthService } from '@/server/service/auth.service';
import { CustomerService } from '@marcsimolduressonsardina/core/service';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	const customerService = new CustomerService(AuthService.generateConfiguration(locals.user!));
	const { query } = (await request.json()) as { query: string };
	const customers = await customerService.searchCustomers(query);
	return json({ customers });
}
