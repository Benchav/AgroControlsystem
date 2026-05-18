import { DashboardMetricsGridProps } from "../../entities/dashboard_metric";

export function DashboardMetricsGrid({ metrics }: DashboardMetricsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 ">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-[14px] border border-white/6 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur bg-emerald-400/10">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-500/10 text-[17px] text-emerald-300">
            <i className={`fa ${metric.icon}`} />
          </div>
          <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/80">{metric.label}</div>
          <div className="text-[32px] font-bold leading-none tracking-[-1px] text-white">{metric.value}</div>
        </div>
      ))}
    </div>
  );
}
