import { useNavigate } from 'react-router-dom';
import { DashboardAlerts } from '../components/dashboard/DashboardAlerts';
import { DashboardInsights } from '../components/dashboard/DashboardInsights';
import { DashboardMetricsGrid } from '../components/dashboard/DashboardMetricsGrid';
import { DashboardSensors } from '../components/dashboard/DashboardSensors';
import type { AppPageId } from '../types/app';

const metrics = [
  { label: 'Humedad Promedio', value: '68%', icon: 'fa-tint', tone: 'text-emerald-300' },
  { label: 'Temp. del Suelo', value: '24°C', icon: 'fa-thermometer-half', tone: 'text-amber-300' },
  { label: 'Parcelas Activas', value: '12 ha', icon: 'fa-seedling', tone: 'text-sky-300' },
  { label: 'Alertas Activas', value: '3', icon: 'fa-exclamation-triangle', tone: 'text-red-300' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
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
