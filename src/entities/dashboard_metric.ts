import { color } from "./../../node_modules/@types/d3-color/index.d";
export type DashboardMetric = {
  label: string;
  value: string;
  description?: string;
  color: string;
  chartData: { value: number }[];
  icon: string;
};

export type DashboardMetricsGridProps = {
  metrics: DashboardMetric[];
};
