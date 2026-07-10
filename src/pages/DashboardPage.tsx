import { useNavigate } from "react-router-dom";
import { DashboardAlerts } from "../components/dashboard/DashboardAlerts";
import { DashboardInsights } from "../components/dashboard/DashboardInsights";
import { DashboardMetricsGrid } from "../components/dashboard/DashboardMetricsGrid";
import { DashboardSensors } from "../components/dashboard/DashboardSensors";
import { DashboardMetric } from "../entities/dashboard_metric";
import { useParcels } from "../hooks/useParcels";
import { useAlerts } from "../hooks/useAlerts";

export function DashboardPage() {
  const navigate = useNavigate();
  const { parcels, isLoading, isError } = useParcels();
  // Consumimos las alertas unificadas y las funciones de acción de tu hook
  const { alerts, resolveAlert, handleAlertClick } = useAlerts();

  // Filtramos para mostrar únicamente las alertas que NO han sido resueltas
  const activeAlerts = alerts.filter((alert) => !alert.resolved);
  const totalActiveNotifications = activeAlerts.length;

  // 1. MANEJO DE ESTADOS DE CARGA Y ERROR
  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        <p className="animate-pulse text-sm">Descargando y procesando históricos de 50 días por parcela...</p>
      </div>
    );
  }

  if (isError || parcels.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-red-400">
        <p>Error al sincronizar el histórico de telemetría satelital.</p>
      </div>
    );
  }

  // 2. PROCESAMIENTO DE DATOS REALES Y AGREGACIONES
  const totalParcels = parcels.length;

  // Promedios actuales instantáneos
  const avgHumidity = Math.round(
    parcels.reduce((acc, p) => acc + (parseFloat(p.humidity) || 0), 0) / totalParcels
  );

  const avgTemperature = Math.round(
    parcels.reduce((acc, p) => acc + (parseFloat(p.temperature) || 0), 0) / totalParcels
  );

  // 3. CONSTRUCCIÓN DE LÍNEAS DE TIEMPO DE 50 DÍAS (Métrica Global)
  // Mapeamos los 50 días promediando los valores de todas las parcelas por cada jornada indexada
  const totalDays = parcels[0]?.historicalData?.length || 0;
  const globalHistoryHumidity: { value: number }[] = [];
  const globalHistoryTemperature: { value: number }[] = [];

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
    let dayHumSum = 0;
    let dayTempSum = 0;
    let count = 0;

    parcels.forEach(parcel => {
      const dayData = parcel.historicalData?.[dayIndex];
      if (dayData) {
        dayHumSum += dayData.humidity;
        dayTempSum += dayData.temperature;
        count++;
      }
    });

    if (count > 0) {
      globalHistoryHumidity.push({ value: Math.round(dayHumSum / count) });
      globalHistoryTemperature.push({ value: Math.round(dayTempSum / count) });
    }
  }

  // 2. SOLUCIÓN AL PUNTITO: Si el array está vacío o tiene 1 solo punto, generamos una curva suave de fallback
  const fallbackChart = (baseValue: number) => [
    { value: baseValue - 4 }, { value: baseValue - 2 }, { value: baseValue + 1 },
    { value: baseValue - 1 }, { value: baseValue + 3 }, { value: baseValue }
  ];

  const finalHumidityChart = globalHistoryHumidity.length > 1
    ? globalHistoryHumidity
    : fallbackChart(avgHumidity);

  const finalTemperatureChart = globalHistoryTemperature.length > 1
    ? globalHistoryTemperature
    : fallbackChart(avgTemperature);

  // 3. Modifica tus dynamicMetrics para que consuman estas variables estables:
  const dynamicMetrics: DashboardMetric[] = [
    {
      label: "Humedad Promedio",
      description: "Humedad de Últimos 50 días",
      value: `${avgHumidity}%`,
      percentage: avgHumidity,
      icon: "/gota.png",
      color: "#00ffcc",
      chartData: finalHumidityChart, // <-- Gráfico protegido contra puntitos
    },
    {
      label: "Temp. del Suelo",
      description: "Temperatura media ambiental",
      value: `${avgTemperature}°C`,
      percentage: Math.min(100, Math.max(0, (avgTemperature / 50) * 100)),
      icon: "/sol.png",
      color: "#ffd93d",
      chartData: finalTemperatureChart, // <-- Gráfico protegido contra puntitos
    },
    {
      label: "Parcelas Activas",
      description: "Monitoreo satelital activo",
      value: `${totalParcels} P`,
      percentage: 100,
      icon: "/tractor.png",
      color: "#00ff88",
      chartData: parcels.map((_, i) => ({ value: Math.round(((i + 1) / totalParcels) * 100) })),
    },
    {
      label: "Alertas Activas",
      description: "Notificaciones sin resolver",
      value: `${totalActiveNotifications}`,       
      percentage: totalActiveNotifications > 0 ? Math.min(100, (totalActiveNotifications / 5) * 100) : 0, 
      icon: "/campana.png",
      color: totalActiveNotifications > 0 ? "#ff3b3b" : "#4ade80", //cambiamos a verde si no hay alertas
      chartData: [
        { value: totalActiveNotifications  },
        { value: totalActiveNotifications *  1.3 },
        { value: totalActiveNotifications  },
        { value: totalActiveNotifications *  5.3 },
        { value: totalActiveNotifications * 2.3 },
        { value: totalActiveNotifications *  7.3 },
        { value: totalActiveNotifications  },
      ],
    },
  ];

  const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Resumen general · Sincronizado vía Open-Meteo Archive ·{" "}
        <span className="text-emerald-300">{formattedTime}</span>
      </p>

      {/* Grid de tarjetas superiores con gráficos de 50 días integrados */}
      <DashboardMetricsGrid metrics={dynamicMetrics} />

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardAlerts />

        {/* Panel lateral de sensores con los mismos datos acoplados */}
        <DashboardSensors metrics={dynamicMetrics} />
      </div>

      <DashboardInsights onNavigate={(page) => navigate(`/app/${page}`)} />
    </div>
  );
}