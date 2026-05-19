export type DashboardMetric = {
  label: string;
  value: string;
  icon: string;
};

export type DashboardMetricsGridProps = {
  metrics: DashboardMetric[];
};
