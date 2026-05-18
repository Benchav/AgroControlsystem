import { useNavigate } from 'react-router-dom';
import { DashboardAlerts } from '../components/dashboard/DashboardAlerts';
import { DashboardInsights } from '../components/dashboard/DashboardInsights';
import { DashboardMetricsGrid } from '../components/dashboard/DashboardMetricsGrid';
import { DashboardSensors } from '../components/dashboard/DashboardSensors';

const metrics = [
  { label: 'Humedad Promedio', value: '68%', icon: 'fa-tint' },
  { label: 'Temp. del Suelo', value: '24°C', icon: 'fa-thermometer-half' },
  { label: 'Parcelas Activas', value: '12 H', icon: 'fa-seedling' },
  { label: 'Alertas Activas', value: '3', icon: 'fa-exclamation-triangle' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6 ">
      <p className="text-sm text-slate-400">Resumen general · Última actualización hace 2 min · <span className="text-emerald-300">10:24 AM</span></p>

      <DashboardMetricsGrid metrics={metrics} />

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardAlerts />

        <DashboardSensors />
      </div>

      <DashboardInsights onNavigate={(page) => navigate(`/app/${page}`)} />
    </div>
  );
}
