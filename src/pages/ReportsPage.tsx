import { useState, useMemo } from 'react';
import { Arduino } from '../entities/arduino_model';
import { Sensor } from '../entities/sensor_model';
import { initialArduinos } from '../data/arduino_data';
import { initialSensors } from '../data/sensor_data';
import { generateDailyHistory } from '../utils/report_history_generator';
import { generateMultiSensorHistory } from '../utils/sensor_history_generator';
import { exportCSV, exportExcel, exportPDF } from '../utils/file_export_formats';
import {  PERIOD_DAYS, PERIOD_LABELS, ProgressBar, QualityBadge } from '../components/reports/ReportCommon';
import { OverviewTab } from '../components/reports/OverviewTab';
import { SensorsTab } from '../components/reports/SensorsTab';
import { ParcelasTab } from '../components/reports/ParcelsTab';
import { AlertsTab } from '../components/reports/AlertsTab';
import { useParcels } from '../hooks/useParcels';
import useAlerts from '../hooks/useAlerts';

export type Period = '7d' | '14d' | '30d';

// ─── Tipo de flash de exportación ────────────────────────────────────────────
type ExportFlash = null | 'csv' | 'excel' | 'pdf' | string;

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export function ReportsPage() {
  const [period, setPeriod] = useState<Period>('7d');
  const [activeTab, setActiveTab] = useState<'overview' | 'sensors' | 'parcelas' | 'alertas'>('overview');
  const [exportFlash, setExportFlash] = useState<ExportFlash>(null);

  // 1. Datos reales sincronizados desde los hooks unificados
  const { parcels, isLoading: loadingParcels, isError: errorParcels } = useParcels();
  const { alerts, resolveAlert } = useAlerts();

  // Leer datos sincronizados desde localStorage (IotPage)
  const arduinos: Arduino[] = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('ac_arduinos') || 'null') ?? initialArduinos; }
    catch { return initialArduinos; }
  }, []);

  const sensors: Sensor[] = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('ac_sensors') || 'null') ?? initialSensors; }
    catch { return initialSensors; }
  }, []);

  // Cargar umbrales dinámicos (Opcional, manteniendo compatibilidad de configuración)
  const systemSettings = useMemo(() => {
    try {
      const saved = localStorage.getItem('ac_settings');
      return saved ? JSON.parse(saved) : { humidityThreshold: 40, temperatureThreshold: 30, phThreshold: 6.0 };
    } catch {
      return { humidityThreshold: 40, temperatureThreshold: 30, phThreshold: 6.0 };
    }
  }, []);

  const days = PERIOD_DAYS[period];

  // Historiales memoizados por período
  const humidityHistory = useMemo(() => generateDailyHistory(days, 65, 18, 'Humedad'), [days]);
  const tempHistory = useMemo(() => generateDailyHistory(days, 26, 8, 'Temperatura'), [days]);
  const multiHistory = useMemo(() => generateMultiSensorHistory(days), [days]);
  const alertFreqHistory = useMemo(() =>
    generateDailyHistory(days, 1.5, 2, 'Eventos').map(d => ({ ...d, Eventos: Math.max(0, Number(d.Eventos)) })),
    [days]);

  // KPIs derivados del estado real
  const activeSensors = useMemo(() => sensors.filter((s) => s.value !== '---'), [sensors]);

  const avgHumidity = useMemo(() => {
    const hs = activeSensors.filter((s) => s.type === 'Humedad');
    return hs.length ? Math.round(hs.reduce((a, s) => a + s.numericValue, 0) / hs.length) : 0;
  }, [activeSensors]);

  const avgTemp = useMemo(() => {
    const ts = activeSensors.filter((s) => s.type === 'Temperatura');
    return ts.length ? Math.round(ts.reduce((a, s) => a + s.numericValue, 0) / ts.length * 10) / 10 : 0;
  }, [activeSensors]);

  const avgPH = useMemo(() => {
    const ps = activeSensors.filter((s) => s.type === 'pH');
    return ps.length ? Math.round(ps.reduce((a, s) => a + s.numericValue, 0) / ps.length * 10) / 10 : 0;
  }, [activeSensors]);

  const criticalAlerts = alerts.filter((a) => !a.resolved && a.severity === 'red').length;
  const totalAlerts = alerts.filter((a) => !a.resolved).length;
  const activeArduinos = arduinos.filter((a) => a.status === 'active').length;
  const activeArduinosCount = arduinos.filter((a) => a.status === "active").length;
  const systemHealth = Math.round(
    (activeSensors.filter(s => s.status === 'OK').length / Math.max(sensors.length, 1)) * 100
  );

  // Datos por parcela
  const locations = useMemo(() => Array.from(new Set(sensors.map((s) => s.location))), [sensors]);
  const parcelaData = useMemo(() => locations.map((loc) => {
    const locSensors = sensors.filter((s) => s.location === loc && s.value !== '---');
    const hum = locSensors.filter(s => s.type === 'Humedad');
    const temp = locSensors.filter(s => s.type === 'Temperatura');
    const ph = locSensors.filter(s => s.type === 'pH');
    const ok = locSensors.filter(s => s.status === 'OK').length;
    return {
      parcela: loc,
      sensores: locSensors.length,
      humedad: hum.length ? Math.round(hum.reduce((a, s) => a + s.numericValue, 0) / hum.length) : 0,
      temperatura: temp.length ? Math.round(temp.reduce((a, s) => a + s.numericValue, 0) / temp.length * 10) / 10 : 0,
      ph: ph.length ? Math.round(ph.reduce((a, s) => a + s.numericValue, 0) / ph.length * 10) / 10 : 0,
      saludPct: locSensors.length ? Math.round((ok / locSensors.length) * 100) : 100,
    };
  }), [sensors, locations]);

  const radarData = useMemo(() => parcelaData.map((p) => ({
    parcela: p.parcela.replace('Parcela ', '').replace('Sector ', 'S-').replace('Zona ', 'Z-'),
    Salud: p.saludPct,
    Humedad: p.humedad,
    Temperatura: Math.min(100, Math.round(p.temperatura * 2.5)),
  })), [parcelaData]);

  const alertDistribution = useMemo(() => [
    { name: 'Críticas', value: alerts.filter(a => a.severity === 'red' && !a.resolved).length, color: '#ef4444' },
    { name: 'Advertencias', value: alerts.filter(a => a.severity === 'amber' && !a.resolved).length, color: '#f59e0b' },
    { name: 'Resueltas', value: alerts.filter(a => a.resolved).length, color: '#10b981' },
  ], [alerts]);

  const sensorTypeData = useMemo(() => {
    const types = sensors.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(types).map(([type, count]) => ({ type, count }));
  }, [sensors]);

  // KPIs para PDF/Excel
  const kpisForExport = useMemo(() => [
    { label: 'Salud del Sistema', value: `${systemHealth}%`, sub: `${activeSensors.filter(s => s.status === 'OK').length} de ${sensors.length} sensores en estado OK` },
    { label: 'Humedad Promedio de Suelo', value: `${avgHumidity}%`, sub: `Calculado sobre ${activeSensors.filter(s => s.type === 'Humedad').length} sensores activos` },
    { label: 'Temperatura Promedio', value: `${avgTemp}°C`, sub: `Calculado sobre ${activeSensors.filter(s => s.type === 'Temperatura').length} sensores activos` },
    { label: 'pH Promedio del Suelo', value: avgPH > 0 ? `${avgPH}` : 'N/A', sub: `Calculado sobre ${activeSensors.filter(s => s.type === 'pH').length} sensores activos` },
    { label: 'Arduinos Activos', value: `${activeArduinos}/${arduinos.length}`, sub: `${arduinos.filter(a => a.status === 'inactive').length} placa(s) fuera de línea` },
    { label: 'Alertas Activas', value: `${totalAlerts}`, sub: `${criticalAlerts} crítica(s) · ${alerts.filter(a => a.resolved).length} resueltas` },
  ], [systemHealth, avgHumidity, avgTemp, avgPH, activeArduinos, totalAlerts, criticalAlerts, activeSensors, sensors, arduinos, alerts]);

  // Handlers de exportación con flash
  const triggerFlash = (type: ExportFlash) => {
    setExportFlash(type);
    setTimeout(() => setExportFlash(null), 2200);
  };

  const handleCSV = (label: string, data: any[]) => {
    exportCSV(data, `reporte-${label}`);
    triggerFlash(`csv-${label}`);
  };

  const handleExcel = () => {
    exportExcel(sensors, arduinos, alerts, parcelaData, multiHistory, PERIOD_LABELS[period], kpisForExport);
    triggerFlash('excel');
  };

  const handlePDF = () => {
    exportPDF(sensors, arduinos, alerts, parcelaData, PERIOD_LABELS[period], kpisForExport, systemHealth, avgHumidity, avgTemp, avgPH);
    triggerFlash('pdf');
  };

  const tabs = [
    { key: 'overview' as const, label: 'Resumen Ejecutivo', icon: 'fas fa-file' },
    { key: 'sensors' as const, label: 'Análisis de Sensores', icon: 'fas fa-temperature-half' },
    { key: 'parcelas' as const, label: 'Reporte por Parcela', icon: 'fas fa-folder' },
    { key: 'alertas' as const, label: 'Historial de Alertas', icon: 'fas fa-bell' },
  ];

  // KPI grid data
  const kpiGrid = [
    {
      label: 'Salud del Sistema', value: `${systemHealth}%`, icon: 'fa-heartbeat',
      color: systemHealth > 70 ? '#10b981' : '#f59e0b',
      sub: `${activeArduinos} de ${arduinos.length} sensores `,
      progress: systemHealth, progressMax: 100, thresholds: { ok: 80, warn: 60 },
    },
    {
      label: 'Humedad Promedio', value: `${avgHumidity}%`, icon: 'fa-tint', color: '#38bdf8',
      sub: `${activeArduinosCount} sensores activos`,
      progress: avgHumidity, progressMax: 100, thresholds: { ok: systemSettings.humidityThreshold + 15, warn: systemSettings.humidityThreshold },
    },
    {
      label: 'Arduinos Activos', value: `${activeArduinos}/${arduinos.length}`, icon: 'fa-microchip', color: '#a78bfa',
      sub: `${arduinos.filter(a => a.status === 'inactive').length} placa(s) fuera de línea`,
      progress: activeArduinos, progressMax: Math.max(arduinos.length, 1),
      thresholds: { ok: arduinos.length, warn: Math.floor(arduinos.length * 0.6) },
    },
    {
      label: 'Alertas Activas', value: `${totalAlerts}`, icon: 'fa-exclamation-triangle',
      color: criticalAlerts > 0 ? '#ef4444' : '#f59e0b',
      sub: `${criticalAlerts} crítica(s) · ${alerts.filter(a => a.resolved).length} resueltas`,
      progress: Math.max(0, 100 - totalAlerts * 20), progressMax: 100, thresholds: { ok: 80, warn: 60 },
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Encabezado con controles ── */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">Sistema de Reportes</h1>
          <p className="text-sm text-slate-400">Centro de Inteligencia Agrícola · Datos sincronizados en tiempo real</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de período */}
          <div className="flex rounded-xl  p-1">
            {(Object.keys(PERIOD_DAYS) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${period === p ? 'bg-emerald-500/40 text-emerald-300' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <div className="group relative">
            <button
              className="flex items-center gap-2 rounded-xl border border-blue-500/50 bg-blue-500/50 px-4 py-2 text-xs font-semibold text-white transition-all duration-300 "
            >
              <i className="fas fa-download" />
              Exportar
              <i className="fas fa-chevron-down text-[10px]" />
            </button>

            {/* Tooltip / Dropdown */}
            <div
              className="
                pointer-events-none absolute right-0 top-full z-50
                w-44 rounded-2xl border border-white/10
                bg-[#0f172a]/95 p-2 opacity-0 shadow-2xl
                backdrop-blur-xl transition-all duration-200
                group-hover:pointer-events-auto
                group-hover:translate-y-0
                group-hover:opacity-100
              "
            >
              {/* Excel */}
              <button
                onClick={handleExcel}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${exportFlash === 'excel'
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : 'text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300'
                  }`}
              >
                <i
                  className={`fas ${exportFlash === 'excel'
                    ? 'fa-check'
                    : 'fa-file-excel'
                    }`}
                />
                {exportFlash === 'excel'
                  ? '¡Descargado!'
                  : 'Descargar Excel'}
              </button>

              {/* PDF */}
              <button
                onClick={handlePDF}
                className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${exportFlash === 'pdf'
                  ? 'bg-red-500/15 text-red-300'
                  : 'text-slate-300 hover:bg-red-500/10 hover:text-red-300'
                  }`}
              >
                <i
                  className={`fas ${exportFlash === 'pdf'
                    ? 'fa-check'
                    : 'fa-file-pdf'
                    }`}
                />
                {exportFlash === 'pdf'
                  ? '¡Generado!'
                  : 'Generar PDF'}
              </button>

              {/* CSV */}
              <button
                onClick={() => handleCSV('telemetria', multiHistory)}
                className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${exportFlash?.toString().startsWith('csv')
                  ? 'bg-sky-500/15 text-sky-300'
                  : 'text-slate-300 hover:bg-sky-500/10 hover:text-sky-300'
                  }`}
              >
                <i
                  className={`fas ${exportFlash?.toString().startsWith('csv')
                    ? 'fa-check'
                    : 'fa-download'
                    }`}
                />
                {exportFlash?.toString().startsWith('csv')
                  ? '¡CSV listo!'
                  : 'Descargar CSV'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiGrid.map((kpi) => (
          <div key={kpi.label} className="group rounded-[14px] border border-white/8 bg-white/[0.03] p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05]">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: `${kpi.color}18` }}>
                <i className={`fas ${kpi.icon} text-sm`} style={{ color: kpi.color }} />
              </div>
              <QualityBadge value={kpi.progress} thresholds={kpi.thresholds} />
            </div>
            <div className="mt-4 text-[10px] uppercase tracking-[0.3em] text-slate-500">{kpi.label}</div>
            <div className="mt-1 text-3xl font-black tracking-tight text-white">{kpi.value}</div>
            <ProgressBar value={kpi.progress} max={kpi.progressMax} color={kpi.color} />
            <div className="mt-1.5 text-[11px] text-slate-500">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Pestañas ── */}
      <div className="flex flex-wrap gap-1 border-b border-white/8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-xs font-semibold transition-all duration-200  ${activeTab === tab.key ? 'bg-blue-500/50 text-white' : ' text-slate-400 hover:text-slate-200'}`}
          >
            <i className={`${tab.icon} text-sm`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════ TAB: RESUMEN EJECUTIVO ══════════ */}
      <OverviewTab
        visible={activeTab === 'overview'} periodLabel={PERIOD_LABELS[period]} multiHistory={multiHistory}
        humidityHistory={humidityHistory} tempHistory={tempHistory} alertDistribution={alertDistribution}
        sensorTypeData={sensorTypeData} systemSettings={systemSettings} days={days} onExportCSV={handleCSV}
      />

      <SensorsTab
        visible={activeTab === 'sensors'} days={days} multiHistory={multiHistory} sensors={sensors} onExportCSV={handleCSV}
      />

      <ParcelasTab
        visible={activeTab === 'parcelas'} parcelaData={parcels} radarData={radarData} arduinos={arduinos} sensors={sensors} onExportCSV={handleCSV}
      />

      <AlertsTab
        visible={activeTab === 'alertas'} alerts={alerts} alertFreqHistory={alertFreqHistory} onExportCSV={handleCSV}
      />

    </div >
  );
}