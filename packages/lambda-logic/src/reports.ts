import { ICoreConfigurationForAWSLambda } from '@marcsimolduressonsardina/core/config';
import {
	OrderAuditTrailService,
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
		priceManager: true
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
	const orderService = new OrderService(configuration, undefined, orderAuditTrailService);
	const reportService = new ReportService(configuration, orderAuditTrailService, orderService);

	const dailyReport = await reportService.generateAndStoreDailyReport(
		DateTime.now().get('year'),
		DateTime.now().get('month'),
		DateTime.now().get('day')
	);

	await reportService.upadateWeeklyReport(dailyReport);
	await reportService.upadateMonthlyReport(dailyReport);
}
