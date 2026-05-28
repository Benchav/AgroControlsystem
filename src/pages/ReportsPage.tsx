import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PolarRadiusAxis,
  LineChart, Line, ReferenceLine,
} from 'recharts';
import { PageSection } from '../components/layout/PageSection';

import { Arduino } from '../entities/arduino_model';
import { Sensor } from '../entities/sensor_model';
import { Alert } from '../entities/alert_model';
import { initialArduinos } from '../data/arduino_data';
import { initialSensors } from '../data/sensor_data';
import { initialAlerts } from '../data/alert_data';
import { generateDailyHistory } from '../utils/report_history_generator';
import { generateMultiSensorHistory } from '../utils/sensor_history_generator';
import { exportCSV, exportExcel, exportPDF } from '../utils/file_export_formats';

// ─── Tooltip personalizado ────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0f1117]/95 p-3 shadow-2xl backdrop-blur-md">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-white">{entry.value}{entry.unit ?? ''}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Badge de calidad ─────────────────────────────────────────────────────────
function QualityBadge({ value, thresholds }: { value: number; thresholds: { ok: number; warn: number } }) {
  if (value >= thresholds.ok) return <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">Óptimo</span>;
  if (value >= thresholds.warn) return <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">Atención</span>;
  return <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-400">Crítico</span>;
}

// ─── Barra de progreso ────────────────────────────────────────────────────────
function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, max > 0 ? Math.round((value / max) * 100) : 0);
  return (
    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ─── Tipos de período ─────────────────────────────────────────────────────────
export type Period = '7d' | '14d' | '30d';
const PERIOD_DAYS: Record<Period, number> = { '7d': 7, '14d': 14, '30d': 30 };
export const PERIOD_LABELS: Record<Period, string> = { '7d': 'Última semana', '14d': 'Últimas 2 semanas', '30d': 'Último mes' };



// ─── Tipo de flash de exportación ────────────────────────────────────────────
type ExportFlash = null | 'csv' | 'excel' | 'pdf' | string;

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export function ReportsPage() {
  const [period, setPeriod] = useState<Period>('7d');
  const [activeTab, setActiveTab] = useState<'overview' | 'sensors' | 'parcelas' | 'alertas'>('overview');
  const [exportFlash, setExportFlash] = useState<ExportFlash>(null);

  // Leer datos sincronizados desde localStorage (IotPage)
  const arduinos: Arduino[] = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('ac_arduinos') || 'null') ?? initialArduinos; }
    catch { return initialArduinos; }
  }, []);

  const sensors: Sensor[] = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('ac_sensors') || 'null') ?? initialSensors; }
    catch { return initialSensors; }
  }, []);

  const alerts: Alert[] = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('ac_alerts') || 'null') ?? initialAlerts; }
    catch { return initialAlerts; }
  }, []);

  // Cargar umbrales dinámicos desde localStorage
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
    { key: 'overview' as const, label: 'Resumen Ejecutivo', icon: '📊' },
    { key: 'sensors' as const, label: 'Análisis de Sensores', icon: '🔬' },
    { key: 'parcelas' as const, label: 'Reporte por Parcela', icon: '🌾' },
    { key: 'alertas' as const, label: 'Historial de Alertas', icon: '🚨' },
  ];

  // KPI grid data
  const kpiGrid = [
    {
      label: 'Salud del Sistema', value: `${systemHealth}%`, icon: 'fa-heartbeat',
      color: systemHealth > 70 ? '#10b981' : '#f59e0b',
      sub: `${activeSensors.filter(s => s.status === 'OK').length} de ${sensors.length} sensores OK`,
      progress: systemHealth, progressMax: 100, thresholds: { ok: 80, warn: 60 },
    },
    {
      label: 'Humedad Promedio', value: `${avgHumidity}%`, icon: 'fa-tint', color: '#38bdf8',
      sub: `${activeSensors.filter(s => s.type === 'Humedad').length} sensores activos`,
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
            className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-xs font-semibold transition-all duration-200 border-b-2 ${activeTab === tab.key ? 'border-emerald-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════ TAB: RESUMEN EJECUTIVO ══════════ */}
      <div className={activeTab === 'overview' ? 'space-y-6' : 'hidden'}>
        <PageSection title={`Telemetría Histórica — ${PERIOD_LABELS[period]}`} subtitle="Correlación de sensores activos en el período seleccionado">
          <div className="mb-3 flex flex-wrap gap-4">
            {[{ key: 'Humedad', color: '#38bdf8' }, { key: 'Temperatura', color: '#f59e0b' }, { key: 'pH', color: '#a78bfa' }].map((s) => (
              <div key={s.key} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                {s.key}
              </div>
            ))}
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={multiHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Humedad" stroke="#38bdf8" strokeWidth={2.5} dot={false} name="Humedad" />
                <Line type="monotone" dataKey="Temperatura" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Temperatura" />
                <Line type="monotone" dataKey="pH" stroke="#a78bfa" strokeWidth={2.5} dot={false} name="pH" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex justify-end">
            <button onClick={() => handleCSV('telemetria', multiHistory)} className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">
              <i className="fas fa-download text-[10px]" /> Exportar telemetría como CSV
            </button>
          </div>
        </PageSection>

        <div className="grid gap-6 lg:grid-cols-2">
          <PageSection title="Tendencia de Humedad" subtitle={`Promedio del suelo · ${days} días`}>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={humidityHistory}>
                  <defs>
                    <linearGradient id="ghum2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} domain={[20, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={systemSettings.humidityThreshold + 15} stroke="#38bdf8" strokeDasharray="4 2" strokeOpacity={0.3} label={{ value: 'Óptimo', position: 'right', fill: '#38bdf8', fontSize: 9 }} />
                  <ReferenceLine y={systemSettings.humidityThreshold} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.3} label={{ value: 'Crítico', position: 'right', fill: '#ef4444', fontSize: 9 }} />
                  <Area type="monotone" dataKey="Humedad" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#ghum2)" name="Humedad" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </PageSection>

          <PageSection title="Tendencia de Temperatura" subtitle={`Suelo agrícola · ${days} días`}>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tempHistory}>
                  <defs>
                    <linearGradient id="gtemp2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} domain={[10, 45]} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={systemSettings.temperatureThreshold} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.3} label={{ value: 'Estrés', position: 'right', fill: '#ef4444', fontSize: 9 }} />
                  <Area type="monotone" dataKey="Temperatura" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#gtemp2)" name="Temperatura" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </PageSection>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <PageSection title="Distribución de Alertas" subtitle="Estado actual del sistema de detección">
            <div className="space-y-3">
              {alertDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-slate-400">{item.name}</div>
                  <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(5, (item.value / Math.max(...alertDistribution.map(a => a.value), 1)) * 100)}%`, background: item.color }} />
                  </div>
                  <div className="w-8 text-right text-sm font-black text-white">{item.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {alertDistribution.map((item) => (
                <div key={item.name} className="rounded-2xl border border-white/6 bg-white/[0.02] p-3 text-center">
                  <div className="text-2xl font-black" style={{ color: item.color }}>{item.value}</div>
                  <div className="mt-0.5 text-[10px] text-slate-500">{item.name}</div>
                </div>
              ))}
            </div>
          </PageSection>

          <PageSection title="Inventario de Sensores" subtitle="Distribución por tipo de medición">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sensorTypeData} layout="vertical">
                  <XAxis type="number" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis dataKey="type" type="category" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PageSection>
        </div>
      </div>

      {/* ══════════ TAB: ANÁLISIS DE SENSORES ══════════ */}
      <div className={activeTab === 'sensors' ? 'space-y-6' : 'hidden'}>
        <PageSection title="Evolución de CO₂ en Suelo" subtitle={`Concentración de dióxido de carbono · ${days} días`}>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={multiHistory}>
                <defs>
                  <linearGradient id="gco2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={1000} stroke="#f59e0b" strokeDasharray="4 2" strokeOpacity={0.5} label={{ value: 'Límite seguro', position: 'right', fill: '#f59e0b', fontSize: 9 }} />
                <Area type="monotone" dataKey="CO2" stroke="#a78bfa" strokeWidth={2.5} fillOpacity={1} fill="url(#gco2)" name="CO₂ (ppm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PageSection>

        <PageSection title="Inventario Completo de Sensores" subtitle="Lecturas actuales y estado de todos los nodos">
          <div className="mb-3 flex justify-end">
            <button onClick={() => handleCSV('sensores', sensors.map(s => ({ id: s.id, nombre: s.name, tipo: s.type, ubicacion: s.location, lectura: s.value, estado: s.status, arduino: s.arduinoId })))}
              className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">
              <i className="fas fa-download text-[10px]" /> Exportar tabla CSV
            </button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/8">
            <table className="w-full border-collapse text-left min-w-[720px]">
              <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  {['ID', 'Nombre', 'Tipo', 'Ubicación', 'Placa Arduino', 'Lectura actual', 'Estado', 'Salud'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm text-slate-300">
                {sensors.map((sensor) => {
                  const isOffline = sensor.value === '---';
                  const statusColors: Record<string, string> = { OK: 'bg-emerald-500/10 text-emerald-300', 'Atención': 'bg-amber-500/10 text-amber-300', 'Crítico': 'bg-red-500/10 text-red-300' };
                  return (
                    <tr key={sensor.id} className="border-t border-white/6 transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-[11px] text-emerald-300">{sensor.id}</td>
                      <td className="px-4 py-3 font-medium text-white">{sensor.name}</td>
                      <td className="px-4 py-3 text-slate-400">{sensor.type}</td>
                      <td className="px-4 py-3"><span className="rounded-lg bg-white/5 px-2 py-0.5 text-xs">{sensor.location}</span></td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{sensor.arduinoId}</td>
                      <td className="px-4 py-3 font-mono font-bold text-white">
                        {isOffline ? <span className="text-slate-600">— Sin señal —</span> : sensor.value}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isOffline ? 'bg-slate-700/40 text-slate-500' : statusColors[sensor.status]}`}>
                          {isOffline ? 'Offline' : sensor.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {!isOffline && (
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/5">
                            <div className="h-full rounded-full" style={{
                              width: sensor.status === 'OK' ? '100%' : sensor.status === 'Atención' ? '55%' : '20%',
                              background: sensor.tone === 'emerald' ? '#10b981' : sensor.tone === 'amber' ? '#f59e0b' : sensor.tone === 'red' ? '#ef4444' : '#38bdf8'
                            }} />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PageSection>
      </div>

      {/* ══════════ TAB: REPORTE POR PARCELA ══════════ */}
      <div className={activeTab === 'parcelas' ? 'space-y-6' : 'hidden'}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {parcelaData.map((p) => {
            const healthColor = p.saludPct >= 80 ? '#10b981' : p.saludPct >= 60 ? '#f59e0b' : '#ef4444';
            return (
              <div key={p.parcela} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 shadow-md transition-all duration-300 hover:border-white/15 hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">Parcela</div>
                    <h3 className="mt-1 text-base font-black text-white">{p.parcela}</h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${healthColor}18` }}>
                    <span className="text-lg font-black" style={{ color: healthColor }}>{p.saludPct}%</span>
                  </div>
                </div>
                <div className="mt-4 text-[10px] uppercase tracking-widest text-slate-600 mb-1">Índice de salud</div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p.saludPct}%`, background: healthColor }} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { label: 'Humedad', value: p.humedad > 0 ? `${p.humedad}%` : 'N/A', icon: '💧', color: '#38bdf8' },
                    { label: 'Temperatura', value: p.temperatura > 0 ? `${p.temperatura}°C` : 'N/A', icon: '🌡️', color: '#f59e0b' },
                    { label: 'pH Suelo', value: p.ph > 0 ? p.ph.toString() : 'N/A', icon: '⚗️', color: '#a78bfa' },
                    { label: 'Sensores', value: p.sensores.toString(), icon: '📡', color: '#10b981' },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl border border-white/6 bg-white/[0.02] p-2.5">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500"><span>{m.icon}</span>{m.label}</div>
                      <div className="mt-1 text-lg font-black" style={{ color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {arduinos.filter(a => sensors.some(s => s.location === p.parcela && s.arduinoId === a.id)).map(a => (
                    <span key={a.id} className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${a.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                      {a.id}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <PageSection title="Análisis Comparativo de Parcelas — Radar" subtitle="Comparativa multidimensional de salud e indicadores por zona">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="parcela" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
                <Radar name="Salud %" dataKey="Salud" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Humedad %" dataKey="Humedad" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.1} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span className="text-xs text-slate-400">{v}</span>} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </PageSection>

        <PageSection title="Tabla Comparativa de Parcelas" subtitle="Resumen ejecutivo de fertilidad por zona de cultivo">
          <div className="mb-3 flex justify-end">
            <button onClick={() => handleCSV('parcelas', parcelaData)} className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">
              <i className="fas fa-download text-[10px]" /> Exportar CSV
            </button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/8">
            <table className="w-full border-collapse text-left min-w-[600px]">
              <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  {['Parcela', 'Salud', 'Humedad', 'Temperatura', 'pH', 'Sensores', 'Estado'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm text-slate-300">
                {parcelaData.map((p) => (
                  <tr key={p.parcela} className="border-t border-white/6 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{p.parcela}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/5">
                          <div className="h-full rounded-full" style={{ width: `${p.saludPct}%`, background: p.saludPct >= 80 ? '#10b981' : p.saludPct >= 60 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span className="font-mono font-bold text-white">{p.saludPct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sky-300">{p.humedad > 0 ? `${p.humedad}%` : '—'}</td>
                    <td className="px-4 py-3 font-mono text-amber-300">{p.temperatura > 0 ? `${p.temperatura}°C` : '—'}</td>
                    <td className="px-4 py-3 font-mono text-violet-300">{p.ph > 0 ? p.ph : '—'}</td>
                    <td className="px-4 py-3 text-center font-bold text-white">{p.sensores}</td>
                    <td className="px-4 py-3"><QualityBadge value={p.saludPct} thresholds={{ ok: 80, warn: 60 }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageSection>
      </div>

      {/* ══════════ TAB: HISTORIAL DE ALERTAS ══════════ */}
      <div className={activeTab === 'alertas' ? 'space-y-6' : 'hidden'}>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Alertas Críticas', value: alerts.filter(a => a.severity === 'red').length, color: '#ef4444', icon: 'fa-fire' },
            { label: 'Advertencias', value: alerts.filter(a => a.severity === 'amber').length, color: '#f59e0b', icon: 'fa-exclamation-circle' },
            { label: 'Resueltas', value: alerts.filter(a => a.resolved).length, color: '#10b981', icon: 'fa-check-circle' },
          ].map((k) => (
            <div key={k.label} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: `${k.color}18` }}>
                  <i className={`fas ${k.icon}`} style={{ color: k.color }} />
                </div>
                <div>
                  <div className="text-2xl font-black" style={{ color: k.color }}>{k.value}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">{k.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <PageSection title="Registro Cronológico de Eventos" subtitle="Historial completo de alertas y anomalías detectadas">
          <div className="mb-3 flex justify-end">
            <button onClick={() => handleCSV('alertas', alerts.map(a => ({ id: a.id, titulo: a.title, descripcion: a.description, severidad: a.severity, tiempo: a.time, resuelta: a.resolved })))}
              className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">
              <i className="fas fa-download text-[10px]" /> Exportar registro CSV
            </button>
          </div>
          <div className="relative space-y-1 pl-6 before:absolute before:left-2 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-white/10">
            {alerts.map((alert) => (
              <div key={alert.id}
                className={`relative rounded-2xl border p-4 transition-all duration-200 hover:bg-white/[0.02] ${alert.resolved ? 'border-white/6 bg-white/[0.01] opacity-60' : alert.severity === 'red' ? 'border-red-500/15 bg-red-500/5' : 'border-amber-500/15 bg-amber-500/5'}`}>
                <div className={`absolute -left-4 top-5 h-3 w-3 rounded-full border-2 border-[#0f1117] ${alert.resolved ? 'bg-emerald-500' : alert.severity === 'red' ? 'bg-red-500' : 'bg-amber-500'}`} />
                <div className="flex items-start gap-3">
                  <span className="text-xl">{alert.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">{alert.title}</span>
                      {alert.resolved
                        ? <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-400">Resuelta</span>
                        : <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${alert.severity === 'red' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {alert.severity === 'red' ? 'Crítico' : 'Advertencia'}
                        </span>
                      }
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{alert.description}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-slate-500">{alert.time}</div>
                    <div className="mt-1 font-mono text-[9px] text-slate-600">#{alert.id}</div>
                  </div>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center">
                <p className="text-sm text-slate-500">🟢 No hay alertas registradas en el sistema.</p>
              </div>
            )}
          </div>
        </PageSection>

        <PageSection title="Frecuencia Diaria de Eventos" subtitle="Actividad de alertas en el período seleccionado">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertFreqHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Eventos" fill="#ef4444" fillOpacity={0.7} radius={[4, 4, 0, 0]} name="Eventos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PageSection>
      </div>

    </div >
  );
}