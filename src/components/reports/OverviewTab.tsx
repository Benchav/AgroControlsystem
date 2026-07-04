import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine, BarChart, Bar } from 'recharts';
import { CustomTooltip } from './ReportCommon';
import { PageSection } from '../layout/PageSection';

interface OverviewTabProps {
  visible: boolean;
  periodLabel: string;
  multiHistory: any[];
  humidityHistory: any[];
  tempHistory: any[];
  alertDistribution: any[];
  sensorTypeData: any[];
  systemSettings: any;
  days: number;
  onExportCSV: (label: string, data: any[]) => void;
}

export function OverviewTab({
  visible, periodLabel, multiHistory, humidityHistory, tempHistory,
  alertDistribution, sensorTypeData, systemSettings, days, onExportCSV
}: OverviewTabProps) {
  if (!visible) return null;

  return (
    <div className="space-y-6">
      <PageSection title={`Telemetría Histórica — ${periodLabel}`} subtitle="Correlación de sensores activos en el período seleccionado">
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
              <XAxis dataKey="day" stroke="#ffffff" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Humedad" stroke="#38bdf8" strokeWidth={2.5} dot={false} name="Humedad" />
              <Line type="monotone" dataKey="Temperatura" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Temperatura" />
              <Line type="monotone" dataKey="pH" stroke="#a78bfa" strokeWidth={2.5} dot={false} name="pH" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex justify-end">
          <button onClick={() => onExportCSV('telemetria', multiHistory)} className="text-xs text-white hover:text-emerald-400 flex items-center gap-1 transition-colors">
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
                <XAxis dataKey="day" stroke="#ffffff" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff" fontSize={9} tickLine={false} axisLine={false} domain={[20, 100]} />
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
                <XAxis dataKey="day" stroke="#ffffff" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff" fontSize={9} tickLine={false} axisLine={false} domain={[10, 45]} />
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
              <div key={item.name} className="rounded-2xl bg-black/50 p-3 text-center">
                <div className="text-2xl font-black" style={{ color: item.color }}>{item.value}</div>
                <div className="mt-0.5 text-[10px] text-white/80">{item.name}</div>
              </div>
            ))}
          </div>
        </PageSection>

        <PageSection title="Inventario de Sensores" subtitle="Distribución por tipo de medición">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sensorTypeData} layout="vertical">
                <XAxis type="number" stroke="#ffffff" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis dataKey="type" type="category" stroke="#ffffff" fontSize={9} tickLine={false} axisLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16,185,129,0.08)' }} />
                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PageSection>
      </div>
    </div>
  );
}