import { DateTime } from 'luxon';
import { OrderAuditTrailService } from './order-audit-trail.service';
import { OrderService } from './order.service';
import { CalculatedItemUtilities } from '../utilities/calculated-item.utilites';
import {
	DailyReport,
	DashboardReport,
	MonthlyReport,
	ReportDate,
	WeeklyReport
} from '../types/report.type';
import { S3Util } from '../data/s3.util';
import { S3Client } from '@aws-sdk/client-s3';
import { getClientConfiguration } from '../configuration/configuration.util';
import { createHash } from 'crypto';
import {
	ICoreConfiguration,
	ICoreConfigurationForAWSLambda
} from '../configuration/core-configuration.interface';
import { Customer, Order, OrderAuditTrailType, OrderStatus } from '../types';
import { CustomerService } from './customer.service';

export class ReportService {
	private s3Client: S3Client;
	constructor(
		private readonly config: ICoreConfiguration | ICoreConfigurationForAWSLambda,
		private orderAuditTrailService: OrderAuditTrailService,
		private customerService: CustomerService,
		private orderService: OrderService
	) {
		if (this.config.reportsBucket == null) {
			throw Error('reports bucket is mandatory');
		}

		this.s3Client = new S3Client(getClientConfiguration(config));
	}

	async generateAndStoreDailyReport(date: ReportDate): Promise<DailyReport> {
		const today = ReportService.getDateTimeFromReportDate(date);
		const entries = await this.orderAuditTrailService.getEntriesForDayWithoutDataType(
			today.toJSDate()
		);

		const filteredEntries = entries
			.filter((entry) => entry.type === OrderAuditTrailType.STATUS)
			.filter(
				(entry) =>
					(entry.oldValue == null || entry.oldValue == OrderStatus.QUOTE) &&
					entry.newValue === OrderStatus.PENDING
			);

		const orderIds = [...new Set(filteredEntries.map((entry) => entry.orderId))];
		const orders = (
			await Promise.all(orderIds.map((orderId) => this.orderService.getFullOrderById(orderId)))
		).filter((order) => order != null);

		const orderEntries = orders.map((fullOrder) => ({
			id: fullOrder.order.id,
			customerId: fullOrder.order.customer.id,
			total: CalculatedItemUtilities.getTotal(fullOrder.calculatedItem)
		}));

		const parts = orders
			.map((fullOrder) =>
				fullOrder.order.item.partsToCalculate.map((part) => ({
					id: part.id,
					count: part.quantity
				}))
			)
			.flat();

		const partMap = new Map<string, number>();
		parts.forEach((part) => {
			let count = part.count;
			if (partMap.get(part.id) != null) {
				count += partMap.get(part.id)!;
			}

			partMap.set(part.id, count);
		});

		const partEntries = [...partMap.keys()].map((id) => ({
			id,
			count: partMap.get(id)!
		}));

		const report: DailyReport = {
			hash: '',
			date: {
				day: today.get('day'),
				month: today.get('month'),
				year: today.get('year')
			},
			orders: orderEntries,
			items: partEntries
		};

		const hash = createHash('sha256');
		hash.update(JSON.stringify(report));
		report.hash = hash.digest('hex');
		await this.storeToS3(report, this.generateKeyForDailyReport(date));
		return report;
	}

	async getDailyReport({ year, month, day }: ReportDate): Promise<DailyReport> {
		const reportFromS3 = await this.getFromS3(this.generateKeyForDailyReport({ year, month, day }));
		return reportFromS3 == null
			? { date: { year, month, day }, orders: [], items: [], hash: '' }
			: (reportFromS3 as DailyReport);
	}

	async getWeeklyReport(year: number, week: number): Promise<WeeklyReport> {
		const reportFromS3 = await this.getFromS3(this.generateKeyForWeeklyReport(year, week));
		return reportFromS3 == null
			? { date: { year, week }, dailyReports: [] }
			: (reportFromS3 as WeeklyReport);
	}

	async getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
		const reportFromS3 = await this.getFromS3(this.generateKeyForMonthlyReport(year, month));
		return reportFromS3 == null
			? { date: { year, month }, dailyReports: [] }
			: (reportFromS3 as MonthlyReport);
	}

	async upadateWeeklyReport(dailyReport: DailyReport) {
		const weekNumber = DateTime.fromObject({
			day: dailyReport.date.day,
			month: dailyReport.date.month,
			year: dailyReport.date.year
		}).get('weekNumber');

		const report: WeeklyReport = await this.getWeeklyReport(dailyReport.date.year, weekNumber);
		report.dailyReports = this.updateReports(report.dailyReports, dailyReport);
		await this.storeToS3(
			report,
			this.generateKeyForWeeklyReport(dailyReport.date.year, weekNumber)
		);
	}

	async upadateMonthlyReport(dailyReport: DailyReport) {
		const report: MonthlyReport = await this.getMonthlyReport(
			dailyReport.date.year,
			dailyReport.date.month
		);
		report.dailyReports = this.updateReports(report.dailyReports, dailyReport);
		await this.storeToS3(
			report,
			this.generateKeyForMonthlyReport(dailyReport.date.year, dailyReport.date.month)
		);
	}

	async getDashboardReport(startDate: ReportDate, endDate: ReportDate): Promise<DashboardReport> {
		const topItemsCount = 25;
		const topCustomersCount = 15;
		const topOrdersCount = 15;
		const today = DateTime.now().startOf('day');
		const start = ReportService.getDateTimeFromReportDate(startDate);
		const end =
			ReportService.getDateTimeFromReportDate(endDate).startOf('day') > today
				? today
				: ReportService.getDateTimeFromReportDate(endDate).startOf('day');
		const dailyReports = await this.getDailyReportsBetweenDates(start, end);

		const dailyCash = dailyReports.map((report) => ({
			date: report.date,
			total: report.orders.reduce((a, b) => a + b.total, 0)
		}));

		const dailyOrders = dailyReports.map((report) => ({
			date: report.date,
			total: report.orders.length
		}));

		const totalOrders = dailyOrders.reduce((acc, report) => acc + report.total, 0);
		const totalCash = dailyCash.reduce((acc, report) => acc + report.total, 0);

		const totalCustomers = [
			...new Set(dailyReports.flatMap((report) => report.orders.map((order) => order.customerId)))
		].length;

		const flatItems = dailyReports
			.flatMap((report) => report.items)
			.filter((item) => !ReportService.isExcludedItem(item.id));

		const totalItems = flatItems.reduce((acc, item) => acc + item.count, 0);
		const topItems = [
			...flatItems
				.reduce((acc, item) => {
					if (acc.has(item.id)) {
						acc.get(item.id)!.count += item.count;
					} else {
						acc.set(item.id, { id: item.id, count: item.count });
					}

					return acc;
				}, new Map<string, { id: string; count: number }>())
				.values()
		]
			.sort((a, b) => b.count - a.count)
			.slice(0, topItemsCount);

		const topOrders = dailyReports
			.flatMap((report) => report.orders)
			.sort((a, b) => b.total - a.total)
			.slice(0, topOrdersCount);

		// customers by total
		const topCustomers: { customerId: string; total: number }[] = [
			...dailyReports
				.flatMap((report) => report.orders)
				.reduce((acc, order) => {
					if (acc.has(order.customerId)) {
						acc.get(order.customerId)!.total += order.total;
					} else {
						acc.set(order.customerId, { customerId: order.customerId, total: order.total });
					}

					return acc;
				}, new Map<string, { customerId: string; total: number }>())
				.values()
		]
			.sort((a, b) => b.total - a.total)
			.slice(0, topCustomersCount);

		const topOrderIds = topOrders.map((order) => order.id);
		const topCustomerIds = topCustomers.map((customer) => customer.customerId);

		const orderPromises = topOrderIds.map((orderId) => this.orderService.getOrderById(orderId));

		const customerPromises = topCustomerIds.map((customerId) =>
			this.customerService.getCustomerById(customerId)
		);

		const orders = (await Promise.all(orderPromises)).filter((order) => order != null);
		const customers = (await Promise.all(customerPromises)).filter((customer) => customer != null);

		const topEnrichedOrders: { order: Order; total: number }[] = [];
		for (const order of orders) {
			const orderTotal = topOrders.find((o) => o.id === order.id)?.total ?? 0;
			topEnrichedOrders.push({ order, total: orderTotal });
		}

		const topEnrichedCustomers: { customer: Customer; total: number }[] = [];
		for (const customer of customers) {
			const customerTotal = topCustomers.find((o) => o.customerId === customer.id)?.total ?? 0;
			topEnrichedCustomers.push({ customer, total: customerTotal });
		}

		return {
			startDate,
			endDate,
			dailyCash,
			dailyOrders,
			totalOrders,
			totalCash,
			totalCustomers,
			totalItems,
			topOrders: topEnrichedOrders.sort((a, b) => b.total - a.total),
			topCustomers: topEnrichedCustomers.sort((a, b) => b.total - a.total),
			topItems
		};
	}

	private generateKeyForMonthlyReport(year: number, month: number): string {
		return `${this.config.storeId}/monthly/${year}/${month}/report.json`;
	}

	private generateKeyForWeeklyReport(year: number, week: number): string {
		return `${this.config.storeId}/weekly/${year}/${week}/report.json`;
	}

	private generateKeyForDailyReport({ year, month, day }: ReportDate): string {
		return `${this.config.storeId}/daily/${year}/${month}/${day}/report.json`;
	}

	private updateReports(reports: DailyReport[], newReport: DailyReport): DailyReport[] {
		const hashes = new Set(reports.map((report) => report.hash));
		if (hashes.has(newReport.hash)) {
			return reports;
		}

		return [...reports, newReport];
	}

	private async storeToS3(report: DailyReport | WeeklyReport | MonthlyReport, key: string) {
		const jsonString = JSON.stringify(report);
		const buffer = Buffer.from(jsonString, 'utf-8');
		await S3Util.uploadToS3(
			this.s3Client,
			this.config.reportsBucket!,
			key,
			buffer,
			'application/json'
		);
	}

	private async getFromS3(
		key: string
	): Promise<DailyReport | WeeklyReport | MonthlyReport | undefined> {
		const result = await S3Util.getFileFromS3(this.s3Client, this.config.reportsBucket!, key);
		return result == null ? undefined : JSON.parse(result.file.toString('utf-8'));
	}

	private async getDailyReportsBetweenDates(
		start: DateTime,
		end: DateTime
	): Promise<DailyReport[]> {
		const dailyReports: DailyReport[] = [];

		// Check if both dates are on the same day
		if (ReportService.areDatesInSameDay(start, end)) {
			const dailyReport = await this.getDailyReport({
				year: start.year,
				month: start.month,
				day: start.day
			});
			return [dailyReport];
		}

		// Check if both dates are in the same week
		if (ReportService.areDatesInSameWeek(start, end)) {
			const weeklyReport = await this.getWeeklyReport(start.year, start.weekNumber);
			return ReportService.filterReportsByRange(weeklyReport.dailyReports, start, end);
		}

		// Check if both dates are in the same month
		if (ReportService.areDatesInSameMonth(start, end)) {
			const monthlyReport = await this.getMonthlyReport(start.year, start.month);
			return ReportService.filterReportsByRange(monthlyReport.dailyReports, start, end);
		}

		// Fetch all relevant months
		let currentMonth = start.startOf('month');
		while (currentMonth <= end.startOf('month')) {
			const monthlyReport: MonthlyReport = await this.getMonthlyReport(
				currentMonth.year,
				currentMonth.month
			);
			dailyReports.push(
				...ReportService.filterReportsByRange(monthlyReport.dailyReports, start, end)
			);
			currentMonth = currentMonth.plus({ months: 1 });
		}
		return dailyReports;
	}

	private static isExcludedItem(itemId: string): boolean {
		const exclusions = ['sin_', 'cliente', 'espacio_blanco', 'fabric'];
		return exclusions.some((exclusion) => itemId.toLocaleLowerCase().includes(exclusion));
	}

	private static areDatesInSameDay(date1: DateTime, date2: DateTime): boolean {
		return date1.hasSame(date2, 'day');
	}

	private static areDatesInSameWeek(date1: DateTime, date2: DateTime): boolean {
		const startOfWeek1 = date1.startOf('week');
		const startOfWeek2 = date2.startOf('week');

		return startOfWeek1.hasSame(startOfWeek2, 'day');
	}

	private static areDatesInSameMonth(date1: DateTime, date2: DateTime): boolean {
		return date1.hasSame(date2, 'month');
	}

	private static filterReportsByRange(
		reports: DailyReport[],
		startDate: DateTime,
		endDate: DateTime
	): DailyReport[] {
		return reports.filter((report) => {
			const reportDate = DateTime.local(report.date.year, report.date.month, report.date.day);
			return reportDate >= startDate && reportDate <= endDate;
		});
	}

	private static getDateTimeFromReportDate({ year, month, day }: ReportDate): DateTime {
		return DateTime.fromObject({
			day,
			month,
			year
		});
	}
}
