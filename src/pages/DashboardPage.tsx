import { useNavigate } from "react-router-dom";
import { DashboardAlerts } from "../components/dashboard/DashboardAlerts";
import { DashboardInsights } from "../components/dashboard/DashboardInsights";
import { DashboardMetricsGrid } from "../components/dashboard/DashboardMetricsGrid";
import { DashboardSensors } from "../components/dashboard/DashboardSensors";
import { DashboardMetric } from "../entities/dashboard_metric";

const metrics: DashboardMetric[] = [
  {
    label: "Humedad Promedio",
    description: "Humedad del aire",
    value: "68%",
    icon: "/gota.png",
    color: "#00ffcc",
    chartData: [
      { value: 42 },
      { value: 58 },
      { value: 51 },
      { value: 67 },
      { value: 49 },
      { value: 73 },
      { value: 61 },
      { value: 80 },
      { value: 55 },
      { value: 69 },
      { value: 47 },
      { value: 76 },
      { value: 63 },
      { value: 84 },
      { value: 59 },
      { value: 71 },
      { value: 53 },
      { value: 88 },
      { value: 66 },
      { value: 74 },
    ],
  },

  {
    label: "Temp. del Suelo",
    description: "Temperatura promedio",
    value: "24°C",
    icon: "/sol.png",
    color: "#ffd93d",
    chartData: [
      { value: 91 },
      { value: 42 },
      { value: 78 },
      { value: 25 },
      { value: 84 },
      { value: 53 },
      { value: 97 },
      { value: 38 },
      { value: 69 },
      { value: 18 },
      { value: 88 },
      { value: 47 },
      { value: 76 },
      { value: 29 },
      { value: 95 },
      { value: 34 },
      { value: 67 },
      { value: 21 },
      { value: 82 },
      { value: 40 },
    ],
  },

  {
    label: "Parcelas Activas",
    description: "Monitoreo en curso",
    value: "12 H",
    icon: "/tractor.png",
    color: "#00ff88",
    chartData: [
      { value: 12 },
      { value: 48 },
      { value: 21 },
      { value: 67 },
      { value: 35 },
      { value: 82 },
      { value: 44 },
      { value: 93 },
      { value: 38 },
      { value: 76 },
      { value: 55 },
      { value: 97 },
      { value: 49 },
      { value: 88 },
      { value: 62 },
      { value: 100 },
      { value: 71 },
      { value: 92 },
      { value: 84 },
      { value: 98 },
    ],
  },

  {
    label: "Alertas Activas",
    description: "Críticas del sistema",
    value: "3",
    icon: "/campana.png",
    color: "#ff3b3b",
    chartData: [
      { value: 96 },
      { value: 58 },
      { value: 89 },
      { value: 34 },
      { value: 77 },
      { value: 92 },
      { value: 41 },
      { value: 68 },
      { value: 23 },
      { value: 85 },
      { value: 37 },
      { value: 74 },
      { value: 18 },
      { value: 63 },
      { value: 49 },
      { value: 95 },
      { value: 27 },
      { value: 57 },
      { value: 11 },
      { value: 72 },
    ],
  },
];

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 ">
      <p className="text-sm text-slate-400">
        Resumen general · Última actualización hace 2 min ·{" "}
        <span className="text-emerald-300">10:24 AM</span>
      </p>

      <DashboardMetricsGrid metrics={metrics} />

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardAlerts />

        <DashboardSensors />
      </div>

      <DashboardInsights onNavigate={(page) => navigate(`/app/${page}`)} />
    </div>
  );
}
