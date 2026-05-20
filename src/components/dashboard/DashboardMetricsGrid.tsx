import { DashboardMetricsGridProps } from "../../entities/dashboard_metric";
import { MiniSensorChart } from "../../utils/wave_recharts";

export function DashboardMetricsGrid({ metrics }: DashboardMetricsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 ">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className=" flex flex-col rounded-[14px] border border-white/6 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur bg-emerald-400/10"
        >
          <div className="flex flex-row">
            <div className="flex h-20 w-20 items-center justify-center">
              <img
                src={metric.icon}
                alt={metric.label}
                className="object-contain h-full w-full"
              />
            </div>
            <div className="flex flex-col items-start justify-center ml-4">
              <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/80">
                {metric.label}
              </div>
              <div className="text-[32px] font-bold leading-none tracking-[-1px] text-white">
                {metric.value}
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <div className="text-xs text-slate-400 min-w-[150px]">{metric.description}</div>
            <MiniSensorChart data={metric.chartData} color={metric.color} />
          </div>
        </div>
      ))}
    </div>
  );
}
