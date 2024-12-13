export type DailyReport = {
  hash: string;
  date: { day: number; month: number; year: number };
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
