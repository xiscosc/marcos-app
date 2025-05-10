import { Customer } from './customer.type';
import { Order } from './order.type';

export type ReportDate = { day: number; month: number; year: number };

export type DailyReport = {
	hash: string;
	date: ReportDate;
	orders: {
		id: string;
		customerId: string;
		total: number;
	}[];
	items: {
		id: string;
		count: number;
	}[];
};

export type WeeklyReport = {
	date: { year: number; week: number };
	dailyReports: DailyReport[];
};

export type MonthlyReport = {
	date: { year: number; month: number };
	dailyReports: DailyReport[];
};

export type DashboardReport = {
	startDate: ReportDate;
	endDate: ReportDate;
	dailyCash: { date: ReportDate; total: number }[];
	dailyOrders: { date: ReportDate; total: number }[];
	totalOrders: number;
	totalCash: number;
	totalCustomers: number;
	totalItems: number;
	topOrders: { order: Order; total: number }[];
	topCustomers: { customer: Customer; total: number }[];
	topItems: {
		id: string;
		count: number;
	}[];
};
