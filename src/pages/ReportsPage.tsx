import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PolarRadiusAxis,
  LineChart, Line, ReferenceLine,
} from 'recharts';
import { PageSection } from '../components/layout/PageSection';

// ─── Interfaces (same as IotPage) ────────────────────────────────────────────
interface Arduino {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  baudRate: number;
  frequency: number;
  description: string;
}

interface Sensor {
  id: string;
  name: string;
  type: string;
  value: string;
  numericValue: number;
  unit: string;
  location: string;
  status: 'OK' | 'Atención' | 'Crítico';
  tone: 'emerald' | 'amber' | 'red' | 'cyan';
  arduinoId: string;
}

interface Alert {
  id: string;
  emoji: string;
  title: string;
  description: string;
  time: string;
  severity: 'red' | 'amber';
  resolved: boolean;
}

// ─── Seed de datos fallback ───────────────────────────────────────────────────
const fallbackArduinos: Arduino[] = [
  { id: 'ARD-MEGA-01', name: 'Arduino Mega - Principal', location: 'Parcela Norte', status: 'active', baudRate: 115200, frequency: 2, description: 'Controlador principal.' },
  { id: 'ARD-UNO-02', name: 'Arduino Uno - Invernadero', location: 'Sector 2A', status: 'active', baudRate: 9600, frequency: 5, description: 'Invernadero.' },
  { id: 'ARD-NANO-03', name: 'Arduino Nano - Riego', location: 'Zona Crítica', status: 'inactive', baudRate: 9600, frequency: 10, description: 'Control de riego.' },
];

const fallbackSensors: Sensor[] = [
  { id: 'S01', name: 'Humedad del Suelo', type: 'Humedad', value: '68%', numericValue: 68, unit: '%', location: 'Parcela Norte', status: 'OK', tone: 'emerald', arduinoId: 'ARD-MEGA-01' },
  { id: 'S05', name: 'Temperatura Suelo', type: 'Temperatura', value: '28°C', numericValue: 28, unit: '°C', location: 'Sector 2A', status: 'Atención', tone: 'amber', arduinoId: 'ARD-UNO-02' },
  { id: 'S09', name: 'Humedad Zona Crítica', type: 'Humedad', value: '34%', numericValue: 34, unit: '%', location: 'Zona Crítica', status: 'Crítico', tone: 'red', arduinoId: 'ARD-NANO-03' },
  { id: 'S12', name: 'pH del Suelo', type: 'pH', value: '7.2 pH', numericValue: 7.2, unit: ' pH', location: 'Parcela Sur', status: 'OK', tone: 'cyan', arduinoId: 'ARD-MEGA-01' },
  { id: 'S14', name: 'Nitrógeno (N)', type: 'Nutrientes', value: '185 mg/kg', numericValue: 185, unit: ' mg/kg', location: 'Parcela Norte', status: 'OK', tone: 'emerald', arduinoId: 'ARD-MEGA-01' },
  { id: 'S18', name: 'CO₂ del Suelo', type: 'Gas', value: '820 ppm', numericValue: 820, unit: ' ppm', location: 'Sector 2A', status: 'Atención', tone: 'amber', arduinoId: 'ARD-UNO-02' },
];

const fallbackAlerts: Alert[] = [
  { id: 'A01', emoji: '🐛', title: 'Anomalía de presión — Posible plaga subterránea', description: 'Parcela Norte: Variación anormal en sensores S01, S03.', time: 'hace 12m', severity: 'red', resolved: false },
  { id: 'A02', emoji: '🦗', title: 'Posible actividad de insectos — Sector 2A', description: 'Temperatura de suelo elevada con patrón de vibración en sensor S05.', time: 'hace 58m', severity: 'amber', resolved: false },
  { id: 'A03', emoji: '💧', title: 'Humedad crítica — Zona Crítica', description: 'Sensor S09 reporta humedad por debajo del umbral mínimo (40%).', time: 'hace 3h', severity: 'red', resolved: true },
];

// ─── Generador de historial sintético por días ────────────────────────────────
function generateDailyHistory(days: number, base: number, variance: number, label: string) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayLabel = d.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
    data.push({
      day: dayLabel,
      [label]: Math.max(0, Math.round((base + (Math.random() - 0.5) * variance * 2) * 10) / 10),
    });
  }
  return data;
}

function generateMultiSensorHistory(days: number) {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    const dayLabel = d.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
    return {
      day: dayLabel,
      Humedad: Math.round(55 + (Math.random() - 0.5) * 30),
      Temperatura: Math.round(24 + (Math.random() - 0.5) * 10),
      pH: Math.round((7.0 + (Math.random() - 0.5) * 1.5) * 10) / 10,
      CO2: Math.round(750 + (Math.random() - 0.5) * 400),
    };
  });
}

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
            <span className="text-white">{entry.value}{entry.unit || ''}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Componente de estado de calidad ─────────────────────────────────────────
function QualityBadge({ value, thresholds }: { value: number; thresholds: { ok: number; warn: number } }) {
  if (value >= thresholds.ok) return <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">Óptimo</span>;
  if (value >= thresholds.warn) return <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">Atención</span>;
  return <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-400">Crítico</span>;
}

// ─── Barra de progreso visual ─────────────────────────────────────────────────
function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ─── Tipos de período ─────────────────────────────────────────────────────────
type Period = '7d' | '14d' | '30d';
const PERIOD_DAYS: Record<Period, number> = { '7d': 7, '14d': 14, '30d': 30 };
const PERIOD_LABELS: Record<Period, string> = { '7d': 'Última semana', '14d': 'Últimas 2 semanas', '30d': 'Último mes' };

// ─── Exportar CSV ─────────────────────────────────────────────────────────────
function exportCSV(data: any[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map((row) => Object.values(row).join(',')).join('\n');
  const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export function ReportsPage() {
  const [period, setPeriod] = useState<Period>('7d');
  const [activeTab, setActiveTab] = useState<'overview' | 'sensors' | 'parcelas' | 'alertas'>('overview');
  const [exportFlash, setExportFlash] = useState(false);

  // Leer datos de localStorage (correlacionados con IotPage)
  const arduinos: Arduino[] = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('ac_arduinos') || 'null') ?? fallbackArduinos; } catch { return fallbackArduinos; }
  }, []);

  const sensors: Sensor[] = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('ac_sensors') || 'null') ?? fallbackSensors; } catch { return fallbackSensors; }
  }, []);

  const alerts: Alert[] = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('ac_alerts') || 'null') ?? fallbackAlerts; } catch { return fallbackAlerts; }
  }, []);

  const days = PERIOD_DAYS[period];

  // Historial generado dinámicamente según el período
  const humidityHistory = useMemo(() => generateDailyHistory(days, 65, 18, 'Humedad'), [days]);
  const tempHistory = useMemo(() => generateDailyHistory(days, 26, 8, 'Temperatura'), [days]);
  const multiHistory = useMemo(() => generateMultiSensorHistory(days), [days]);

  // ── KPIs derivados del estado real ──
  const activeSensors = sensors.filter((s) => s.value !== '---');
  const avgHumidity = useMemo(() => {
    const hs = activeSensors.filter((s) => s.type === 'Humedad');
    return hs.length ? Math.round(hs.reduce((a, s) => a + s.numericValue, 0) / hs.length) : 0;
  }, [sensors]);

  const avgTemp = useMemo(() => {
    const ts = activeSensors.filter((s) => s.type === 'Temperatura');
    return ts.length ? Math.round(ts.reduce((a, s) => a + s.numericValue, 0) / ts.length * 10) / 10 : 0;
  }, [sensors]);

  const avgPH = useMemo(() => {
    const ps = activeSensors.filter((s) => s.type === 'pH');
    return ps.length ? Math.round(ps.reduce((a, s) => a + s.numericValue, 0) / ps.length * 10) / 10 : 0;
  }, [sensors]);

  const criticalAlerts = alerts.filter((a) => !a.resolved && a.severity === 'red').length;
  const totalAlerts = alerts.filter((a) => !a.resolved).length;
  const activeArduinos = arduinos.filter((a) => a.status === 'active').length;
  const systemHealth = Math.round(((activeSensors.filter(s => s.status === 'OK').length) / Math.max(sensors.length, 1)) * 100);

  // ── Datos por parcela ──
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

  // ── Radar data para salud de parcelas ──
  const radarData = useMemo(() => parcelaData.map((p) => ({
    parcela: p.parcela.replace('Parcela ', '').replace('Sector ', 'S-').replace('Zona ', 'Z-'),
    Salud: p.saludPct,
    Humedad: p.humedad,
    Temperatura: Math.min(100, Math.round(p.temperatura * 2.5)),
  })), [parcelaData]);

  // ── Distribución de alertas ──
  const alertDistribution = [
    { name: 'Críticas', value: alerts.filter(a => a.severity === 'red' && !a.resolved).length, color: '#ef4444' },
    { name: 'Advertencias', value: alerts.filter(a => a.severity === 'amber' && !a.resolved).length, color: '#f59e0b' },
    { name: 'Resueltas', value: alerts.filter(a => a.resolved).length, color: '#10b981' },
  ];

  // ── Tipo de sensores ──
  const sensorTypeData = useMemo(() => {
    const types = sensors.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(types).map(([type, count]) => ({ type, count }));
  }, [sensors]);

  const handleExport = (label: string, data: any[]) => {
    exportCSV(data, `reporte-${label}`);
    setExportFlash(true);
    setTimeout(() => setExportFlash(false), 2000);
  };

  const tabs: { key: typeof activeTab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Resumen Ejecutivo', icon: '📊' },
    { key: 'sensors', label: 'Análisis de Sensores', icon: '🔬' },
    { key: 'parcelas', label: 'Reporte por Parcela', icon: '🌾' },
    { key: 'alertas', label: 'Historial de Alertas', icon: '🚨' },
  ];

  return (
    <div className="space-y-6">

      {/* ── Encabezado ── */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-sm text-slate-400">Centro de Inteligencia Agrícola · Datos en tiempo real</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">Sistema de Reportes</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de período */}
          <div className="flex rounded-xl border border-white/8 bg-white/[0.03] p-1">
            {(Object.keys(PERIOD_DAYS) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${period === p
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          {/* Botón Exportar */}
          <button
            onClick={() => handleExport('general', multiHistory)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all duration-300 ${exportFlash
              ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 scale-95'
              : 'border-white/10 bg-white/5 text-slate-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300'
              }`}
          >
            <i className={`fas ${exportFlash ? 'fa-check' : 'fa-download'}`} />
            {exportFlash ? '¡Exportado!' : 'Exportar CSV'}
          </button>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Salud del Sistema', value: `${systemHealth}%`, icon: 'fa-heartbeat', color: systemHealth > 70 ? '#10b981' : '#f59e0b',
            sub: `${activeSensors.filter(s => s.status === 'OK').length} de ${sensors.length} sensores OK`,
            progress: systemHealth, progressMax: 100, thresholds: { ok: 80, warn: 60 },
          },
          {
            label: 'Humedad Promedio', value: `${avgHumidity}%`, icon: 'fa-tint', color: '#38bdf8',
            sub: `${activeSensors.filter(s => s.type === 'Humedad').length} sensores activos`,
            progress: avgHumidity, progressMax: 100, thresholds: { ok: 60, warn: 40 },
          },
          {
            label: 'Arduinos Activos', value: `${activeArduinos}/${arduinos.length}`, icon: 'fa-microchip', color: '#a78bfa',
            sub: `${arduinos.filter(a => a.status === 'inactive').length} placa(s) fuera de línea`,
            progress: activeArduinos, progressMax: arduinos.length, thresholds: { ok: arduinos.length, warn: Math.floor(arduinos.length * 0.6) },
          },
          {
            label: 'Alertas Activas', value: `${totalAlerts}`, icon: 'fa-exclamation-triangle', color: criticalAlerts > 0 ? '#ef4444' : '#f59e0b',
            sub: `${criticalAlerts} crítica(s) · ${alerts.filter(a => a.resolved).length} resueltas`,
            progress: Math.max(0, 100 - totalAlerts * 20), progressMax: 100, thresholds: { ok: 80, warn: 60 },
          },
        ].map((kpi) => (
          <div key={kpi.label} className="group rounded-[28px] border border-white/8 bg-white/[0.03] p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05]">
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
      <div className="flex flex-wrap gap-1 border-b border-white/8 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-xs font-semibold transition-all duration-200 border-b-2 ${activeTab === tab.key
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════ TAB: RESUMEN EJECUTIVO ══════════════════ */}
      <div className={activeTab === 'overview' ? 'space-y-6' : 'hidden'}>

        {/* Gráfico principal: Multi-sensor histórico */}
        <PageSection
          title={`Telemetría Histórica — ${PERIOD_LABELS[period]}`}
          subtitle="Correlación de todos los sensores activos en el período seleccionado"
        >
          <div className="mb-3 flex flex-wrap gap-4">
            {[
              { key: 'Humedad', color: '#38bdf8', unit: '%' },
              { key: 'Temperatura', color: '#f59e0b', unit: '°C' },
              { key: 'pH', color: '#a78bfa', unit: '' },
            ].map((s) => (
              <div key={s.key} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                {s.key}{s.unit && ` (${s.unit})`}
              </div>
            ))}
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={multiHistory}>
                <defs>
                  {[['#38bdf8', 'hum'], ['#f59e0b', 'temp'], ['#a78bfa', 'ph']].map(([c, id]) => (
                    <linearGradient key={id} id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
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
            <button
              onClick={() => handleExport('telemetria', multiHistory)}
              className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <i className="fas fa-download text-[10px]" /> Exportar datos de telemetría
            </button>
          </div>
        </PageSection>

        {/* Segunda fila: Humedad detallada + Temp detallada */}
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
                  <ReferenceLine y={60} stroke="#38bdf8" strokeDasharray="4 2" strokeOpacity={0.3} label={{ value: 'Óptimo', position: 'right', fill: '#38bdf8', fontSize: 9 }} />
                  <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.3} label={{ value: 'Crítico', position: 'right', fill: '#ef4444', fontSize: 9 }} />
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
                  <ReferenceLine y={32} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.3} label={{ value: 'Estrés', position: 'right', fill: '#ef4444', fontSize: 9 }} />
                  <Area type="monotone" dataKey="Temperatura" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#gtemp2)" name="Temperatura" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </PageSection>
        </div>

        {/* Tercera fila: Distribución de Alertas + Tipos de Sensor */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PageSection title="Distribución de Alertas" subtitle="Estado actual del sistema de detección">
            <div className="space-y-3">
              {alertDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-slate-400">{item.name}</div>
                  <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(5, (item.value / Math.max(...alertDistribution.map(a => a.value), 1)) * 100)}%`, background: item.color }}
                    />
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

      {/* ══════════════════ TAB: ANÁLISIS DE SENSORES ══════════════════ */}
      <div className={activeTab === 'sensors' ? 'space-y-6' : 'hidden'}>

        {/* CO2 History */}
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
                <ReferenceLine y={1000} stroke="#f59e0b" strokeDasharray="4 2" strokeOpacity={0.5} label={{ value: 'Límite', position: 'right', fill: '#f59e0b', fontSize: 9 }} />
                <Area type="monotone" dataKey="CO2" stroke="#a78bfa" strokeWidth={2.5} fillOpacity={1} fill="url(#gco2)" name="CO₂ (ppm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PageSection>

        {/* Tabla de sensores completa */}
        <PageSection title="Inventario Completo de Sensores" subtitle="Lecturas actuales y estado de todos los nodos">
          <div className="mb-3 flex justify-end">
            <button
              onClick={() => handleExport('sensores', sensors.map(s => ({ id: s.id, nombre: s.name, tipo: s.type, ubicacion: s.location, lectura: s.value, estado: s.status, arduino: s.arduinoId })))}
              className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <i className="fas fa-download text-[10px]" /> Exportar tabla
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
                  const statusColors: Record<string, string> = {
                    OK: 'bg-emerald-500/10 text-emerald-300',
                    'Atención': 'bg-amber-500/10 text-amber-300',
                    Crítico: 'bg-red-500/10 text-red-300',
                  };
                  return (
                    <tr key={sensor.id} className="border-t border-white/6 transition-colors hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-[11px] text-emerald-300">{sensor.id}</td>
                      <td className="px-4 py-3 font-medium text-white">{sensor.name}</td>
                      <td className="px-4 py-3 text-slate-400">{sensor.type}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-lg bg-white/5 px-2 py-0.5 text-xs">{sensor.location}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{sensor.arduinoId}</td>
                      <td className="px-4 py-3 font-mono font-bold text-white">{isOffline ? <span className="text-slate-600">— Sin señal —</span> : sensor.value}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isOffline ? 'bg-slate-700/40 text-slate-500' : statusColors[sensor.status]}`}>
                          {isOffline ? 'Offline' : sensor.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {!isOffline && (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/5">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: sensor.status === 'OK' ? '100%' : sensor.status === 'Atención' ? '55%' : '20%',
                                  background: sensor.tone === 'emerald' ? '#10b981' : sensor.tone === 'amber' ? '#f59e0b' : sensor.tone === 'red' ? '#ef4444' : '#38bdf8'
                                }}
                              />
                            </div>
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

      {/* ══════════════════ TAB: REPORTE POR PARCELA ══════════════════ */}
      <div className={activeTab === 'parcelas' ? 'space-y-6' : 'hidden'}>

        {/* Cards por parcela */}
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
                    <span className="text-xl font-black" style={{ color: healthColor }}>{p.saludPct}%</span>
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
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <span>{m.icon}</span>{m.label}
                      </div>
                      <div className="mt-1 text-lg font-black" style={{ color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2">
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

        {/* Radar de comparativa */}
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

        {/* Tabla comparativa */}
        <PageSection title="Tabla Comparativa de Parcelas" subtitle="Resumen ejecutivo de fertilidad por zona de cultivo">
          <div className="mb-3 flex justify-end">
            <button
              onClick={() => handleExport('parcelas', parcelaData)}
              className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <i className="fas fa-download text-[10px]" /> Exportar tabla
            </button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/8">
            <table className="w-full border-collapse text-left min-w-[600px]">
              <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  {['Parcela', 'Salud', 'Humedad', 'Temperatura', 'pH', 'Sensores Activos', 'Estado'].map((h) => (
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
                    <td className="px-4 py-3">
                      <QualityBadge value={p.saludPct} thresholds={{ ok: 80, warn: 60 }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageSection>
      </div>

      {/* ══════════════════ TAB: HISTORIAL DE ALERTAS ══════════════════ */}
      <div className={activeTab === 'alertas' ? 'space-y-6' : 'hidden'}>

        {/* KPIs de alertas */}
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

        {/* Timeline de alertas */}
        <PageSection title="Registro Cronológico de Eventos" subtitle="Historial completo de alertas y anomalías detectadas">
          <div className="mb-3 flex justify-end">
            <button
              onClick={() => handleExport('alertas', alerts.map(a => ({ id: a.id, titulo: a.title, descripcion: a.description, severidad: a.severity, tiempo: a.time, resuelta: a.resolved })))}
              className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <i className="fas fa-download text-[10px]" /> Exportar registro
            </button>
          </div>
          <div className="relative space-y-1 pl-6 before:absolute before:left-2 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-white/10">
            {alerts.map((alert, idx) => (
              <div
                key={alert.id}
                className={`relative rounded-2xl border p-4 transition-all duration-200 hover:bg-white/[0.02] ${alert.resolved
                  ? 'border-white/6 bg-white/[0.01] opacity-60'
                  : alert.severity === 'red'
                    ? 'border-red-500/15 bg-red-500/5'
                    : 'border-amber-500/15 bg-amber-500/5'
                  }`}
              >
                {/* Timeline dot */}
                <div className={`absolute -left-4 top-5 h-3 w-3 rounded-full border-2 border-[#0f1117] ${alert.resolved ? 'bg-emerald-500' : alert.severity === 'red' ? 'bg-red-500' : 'bg-amber-500'}`} />

                <div className="flex items-start gap-3">
                  <span className="text-xl">{alert.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">{alert.title}</span>
                      {alert.resolved
                        ? <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-400">Resuelta</span>
                        : <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${alert.severity === 'red' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>{alert.severity === 'red' ? 'Crítico' : 'Advertencia'}</span>
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

        {/* Frecuencia de alertas por día (simulada) */}
        <PageSection title="Frecuencia Diaria de Eventos" subtitle="Actividad de alertas en el período seleccionado">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={generateDailyHistory(days, 1.5, 2, 'Eventos').map(d => ({ ...d, Eventos: Math.max(0, d.Eventos) }))}>
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

    </div>
  );
}