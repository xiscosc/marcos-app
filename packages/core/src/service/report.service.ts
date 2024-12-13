import { DateTime } from "luxon";
import { OrderAuditTrailService } from "./order-audit-trail.service";
import { OrderService } from "./order.service";
import { CalculatedItemUtilities } from "../utilities/calculated-item.utilites";
import { DailyReport, MonthlyReport, WeeklyReport } from "../types/report.type";
import { S3Util } from "../data/s3.util";
import { S3Client } from "@aws-sdk/client-s3";
import { getClientConfiguration } from "../configuration/configuration.util";
import { createHash } from "crypto";
import {
  ICoreConfiguration,
  ICoreConfigurationForAWSLambda,
} from "../configuration/core-configuration.interface";
import { OrderAuditTrailType, OrderStatus } from "../types";

export class ReportService {
  private s3Client: S3Client;
  constructor(
    private readonly config:
      | ICoreConfiguration
      | ICoreConfigurationForAWSLambda,
    private orderAuditTrailService: OrderAuditTrailService,
    private orderService: OrderService
  ) {
    if (this.config.reportsBucket == null) {
      throw Error("reports bucket is mandatory");
    }

    this.s3Client = new S3Client(getClientConfiguration(config));
  }

  async generateAndStoreDailyReport(
    year: number,
    month: number,
    day: number
  ): Promise<DailyReport> {
    const today = DateTime.fromObject({
      day,
      month,
      year,
    });
    const entries =
      await this.orderAuditTrailService.getEntriesForDayWithoutDataType(
        today.toJSDate()
      );

    const filteredEntries = entries
      .filter((entry) => entry.type === OrderAuditTrailType.STATUS)
      .filter(
        (entry) =>
          (entry.oldValue == null || entry.oldValue == OrderStatus.QUOTE) &&
          entry.newValue === OrderStatus.PENDING
      );

    const orderIds = [
      ...new Set(filteredEntries.map((entry) => entry.orderId)),
    ];
    const orders = (
      await Promise.all(
        orderIds.map((orderId) => this.orderService.getFullOrderById(orderId))
      )
    ).filter((order) => order != null);

    const orderEntries = orders.map((fullOrder) => ({
      id: fullOrder.order.id,
      customerId: fullOrder.order.customer.id,
      total: CalculatedItemUtilities.getTotal(fullOrder.calculatedItem),
    }));

    const parts = orders
      .map((fullOrder) =>
        fullOrder.order.item.partsToCalculate.map((part) => ({
          id: part.id,
          count: part.quantity,
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
      count: partMap.get(id)!,
    }));

    const report: DailyReport = {
      hash: "",
      date: {
        day: today.get("day"),
        month: today.get("month"),
        year: today.get("year"),
      },
      orders: orderEntries,
      items: partEntries,
    };

    const hash = createHash("sha256");
    hash.update(JSON.stringify(report));
    report.hash = hash.digest("hex");
    await this.storeToS3(
      report,
      this.generateKeyForDailyReport(year, month, day)
    );
    return report;
  }

  async getDailyReport(
    year: number,
    month: number,
    day: number
  ): Promise<DailyReport> {
    const reportFromS3 = await this.getFromS3(
      this.generateKeyForDailyReport(year, month, day)
    );
    return reportFromS3 == null
      ? { date: { year, month, day }, orders: [], items: [], hash: "" }
      : (reportFromS3 as DailyReport);
  }

  async getWeeklyReport(year: number, week: number): Promise<WeeklyReport> {
    const reportFromS3 = await this.getFromS3(
      this.generateKeyForWeeklyReport(year, week)
    );
    return reportFromS3 == null
      ? { date: { year, week }, dailyReports: [] }
      : (reportFromS3 as WeeklyReport);
  }

  async geMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
    const reportFromS3 = await this.getFromS3(
      this.generateKeyForMonthlyReport(year, month)
    );
    return reportFromS3 == null
      ? { date: { year, month }, dailyReports: [] }
      : (reportFromS3 as MonthlyReport);
  }

  async upadateWeeklyReport(dailyReport: DailyReport) {
    const weekNumber = DateTime.fromObject({
      day: dailyReport.date.day,
      month: dailyReport.date.month,
      year: dailyReport.date.year,
    }).get("weekNumber");

    const report: WeeklyReport = await this.getWeeklyReport(
      dailyReport.date.year,
      weekNumber
    );
    report.dailyReports = this.updateReports(report.dailyReports, dailyReport);
    await this.storeToS3(
      report,
      this.generateKeyForWeeklyReport(dailyReport.date.year, weekNumber)
    );
  }

  async upadateMonthlyReport(dailyReport: DailyReport) {
    const report: MonthlyReport = await this.geMonthlyReport(
      dailyReport.date.year,
      dailyReport.date.month
    );
    report.dailyReports = this.updateReports(report.dailyReports, dailyReport);
    await this.storeToS3(
      report,
      this.generateKeyForMonthlyReport(
        dailyReport.date.year,
        dailyReport.date.month
      )
    );
  }

  private generateKeyForMonthlyReport(year: number, month: number): string {
    return `${this.config.storeId}/monthly/${year}/${month}/report.json`;
  }

  private generateKeyForWeeklyReport(year: number, week: number): string {
    return `${this.config.storeId}/weekly/${year}/${week}/report.json`;
  }

  private generateKeyForDailyReport(
    year: number,
    month: number,
    day: number
  ): string {
    return `${this.config.storeId}/daily/${year}/${month}/${day}/report.json`;
  }

  private updateReports(
    reports: DailyReport[],
    newReport: DailyReport
  ): DailyReport[] {
    const hashes = new Set(reports.map((report) => report.hash));
    if (hashes.has(newReport.hash)) {
      return reports;
    }

    return [...reports, newReport];
  }

  private async storeToS3(
    report: DailyReport | WeeklyReport | MonthlyReport,
    key: string
  ) {
    const jsonString = JSON.stringify(report);
    const buffer = Buffer.from(jsonString, "utf-8");
    await S3Util.uploadToS3(
      this.s3Client,
      this.config.reportsBucket!,
      key,
      buffer,
      "application/json"
    );
  }

  private async getFromS3(
    key: string
  ): Promise<DailyReport | WeeklyReport | MonthlyReport | undefined> {
    const result = await S3Util.getFileFromS3(
      this.s3Client,
      this.config.reportsBucket!,
      key
    );
    return result == null
      ? undefined
      : JSON.parse(result.file.toString("utf-8"));
  }
}
