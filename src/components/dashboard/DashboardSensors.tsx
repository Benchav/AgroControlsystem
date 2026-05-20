import { DashboardMetricsGridProps } from "../../entities/dashboard_metric";
import { GaugeSensorChart } from "../../utils/gauge_sensor_chart";
import { MiniSensorChart } from "../../utils/wave_recharts";
import { PageSection } from "../layout/PageSection";

export function DashboardSensors({ metrics }: DashboardMetricsGridProps) {
  return (
    <PageSection title="Estado sensores" subtitle="En línea">
      <div className="space-y-4">
        {metrics.map((item) => (
          <div key={item.label} className="flex flex-col">
            <div className="flex flex-row items-center justify-between">
              <span className="font-medium text-white">{item.label}</span>
              <span
                className={`font-mono font-bold ${item.color === "red" ? "text-red-300" : item.color === "amber" ? "text-amber-300" : item.color === "cyan" ? "text-cyan-300" : "text-emerald-300"}`}
              >
                {item.percentage ? `${item.percentage}%` : item.value}
              </span>
            </div>
            <div className="mb-2 flex items-center justify-between text-[12.5px] gap-4">
              <GaugeSensorChart
                percentage={item.percentage ?? 0}
                color={item.color}
              />
              <MiniSensorChart data={item.chartData} color={item.color} />
            </div>
            <div className="h-[3px] rounded-[2px] bg-white/5">
              <div
                className={`h-[3px] rounded-[2px] `}
                style={{
                  width: `${item.percentage ?? 0}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </PageSection>
  );
}
