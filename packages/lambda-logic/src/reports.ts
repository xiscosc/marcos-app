import { ICoreConfigurationForAWSLambda } from '@marcsimolduressonsardina/core/config';
import {
	OrderAuditTrailService,
	CustomerService,
	OrderService,
	ReportService
} from '@marcsimolduressonsardina/core/service';
import { AppUser } from '@marcsimolduressonsardina/core/type';
import { DateTime } from 'luxon';

export async function lambdaGenerateReports(
	storeId?: string,
	oderAuditTrailTableName?: string,
	orderTableName?: string,
	customerTableName?: string,
	reportsBucketName?: string,
	calculatedItemTableName?: string
): Promise<void> {
	const user: AppUser = {
		id: 'automation@lambda.aws',
		storeId: storeId ?? '',
		name: 'AWS LAMBDA',
		priceManager: true,
		priceMarkUp: 0
	};

	const configuration: ICoreConfigurationForAWSLambda = {
		runInAWSLambda: true,
		storeId: user.storeId,
		orderAuditTrailTable: oderAuditTrailTableName,
		orderTable: orderTableName,
		customerTable: customerTableName,
		reportsBucket: reportsBucketName,
		calculatedItemTable: calculatedItemTableName,
		listPricingTable: 'no-needed',
		user
	};

	const orderAuditTrailService = new OrderAuditTrailService(configuration);
	const customerService = new CustomerService(configuration);
	const orderService = new OrderService(configuration, customerService, orderAuditTrailService);
	const reportService = new ReportService(
		configuration,
		orderAuditTrailService,
		customerService,
		orderService
	);

	const dailyReport = await reportService.generateAndStoreDailyReport({
		year: DateTime.now().get('year'),
		month: DateTime.now().get('month'),
		day: DateTime.now().get('day')
	});

	await reportService.upadateWeeklyReport(dailyReport);
	await reportService.upadateMonthlyReport(dailyReport);
}
