import { AuthService } from '@/server/service/auth.service';
import {
	OrderService,
	CustomerService,
	OrderAuditTrailService,
	ReportService
} from '@marcsimolduressonsardina/core/service';
import type { ReportDate } from '@marcsimolduressonsardina/core/type';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	if (!AuthService.isAdmin(locals.user)) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const authConfiguration = AuthService.generateConfiguration(locals.user!);
	const orderAuditTrailService = new OrderAuditTrailService(authConfiguration);
	const customerService = new CustomerService(authConfiguration);
	const orderService = new OrderService(authConfiguration, customerService, orderAuditTrailService);
	const reportService = new ReportService(
		authConfiguration,
		orderAuditTrailService,
		customerService,
		orderService
	);
	const { startDate, endDate } = (await request.json()) as {
		startDate: ReportDate;
		endDate: ReportDate;
	};
	const report = await reportService.getDashboardReport(startDate, endDate);
	return json(report);
}
