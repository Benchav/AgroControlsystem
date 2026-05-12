type DashboardMetric = {
  label: string;
  value: string;
  icon: string;
};

type DashboardMetricsGridProps = {
  metrics: DashboardMetric[];
};

export function DashboardMetricsGrid({ metrics }: DashboardMetricsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-[14px] border border-white/6 bg-[#27293d] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-500/10 text-[17px] text-emerald-300">
            <i className={`fas ${metric.icon}`} />
          </div>
          <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">{metric.label}</div>
          <div className="text-[32px] font-bold leading-none tracking-[-1px] text-white">{metric.value}</div>
          <div className="mt-4 flex h-9 items-end gap-[3px]">
            <div className="h-[60%] flex-1 rounded-t-[3px] bg-emerald-500/12" />
            <div className="h-[45%] flex-1 rounded-t-[3px] bg-emerald-500/12" />
            <div className="h-[70%] flex-1 rounded-t-[3px] bg-emerald-500/12" />
            <div className="h-[55%] flex-1 rounded-t-[3px] bg-emerald-500/12" />
            <div className="h-[68%] flex-1 rounded-t-[3px] bg-emerald-500" />
          </div>
        </div>
      ))}
    </div>
  );
}
