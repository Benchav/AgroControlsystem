import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CustomTooltip } from './ReportCommon';
import { Sensor } from '../../entities/sensor_model';
import { PageSection } from '../layout/PageSection';

interface SensorsTabProps {
  visible: boolean;
  days: number;
  multiHistory: any[];
  sensors: Sensor[];
  onExportCSV: (label: string, data: any[]) => void;
}

export function SensorsTab({ visible, days, multiHistory, sensors, onExportCSV }: SensorsTabProps) {
  if (!visible) return null;

  return (
    <div className="space-y-6">
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
              <XAxis dataKey="day" stroke="#ffffff" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={1000} stroke="#f59e0b" strokeDasharray="4 2" strokeOpacity={0.5} label={{ value: 'Límite seguro', position: 'right', fill: '#f59e0b', fontSize: 9 }} />
              <Area type="monotone" dataKey="CO2" stroke="#a78bfa" strokeWidth={2.5} fillOpacity={1} fill="url(#gco2)" name="CO₂ (ppm)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PageSection>

      <PageSection title="Inventario Completo de Sensores" subtitle="Lecturas actuales y estado de todos los nodos">
        <div className="mb-3 flex justify-end">
          <button onClick={() => onExportCSV('sensores', sensors.map(s => ({ id: s.id, nombre: s.name, tipo: s.type, ubicacion: s.location, lectura: s.value, estado: s.status, arduino: s.arduinoId })))}
            className="text-xs text-white hover:text-emerald-400 flex items-center gap-1 transition-colors">
            <i className="fas fa-download text-[10px]" /> Exportar tabla CSV
          </button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full border-collapse text-left min-w-[720px]">
            <thead className="bg-blue-500/50 text-[10px] uppercase tracking-[0.2em] text-white">
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
  );
}