import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { CustomTooltip, QualityBadge } from './ReportCommon';
import { Arduino } from '../../entities/arduino_model';
import { Sensor } from '../../entities/sensor_model';
import { PageSection } from '../layout/PageSection';

interface ParcelasTabProps {
  visible: boolean;
  parcelaData: any[];
  radarData: any[];
  arduinos: Arduino[];
  sensors: Sensor[];
  onExportCSV: (label: string, data: any[]) => void;
}

export function ParcelasTab({ visible, parcelaData, radarData, arduinos, sensors, onExportCSV }: ParcelasTabProps) {
  if (!visible) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {parcelaData.map((p) => {
          const healthColor = p.saludPct >= 80 ? '#10b981' : p.saludPct >= 60 ? '#f59e0b' : '#ef4444';
          return (
            <div 
              key={p.parcela} 
              className="rounded-[14px] border border-white/8 bg-white/[0.03] p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur" 
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  p.saludPct >= 80 ? 'rgba(16,185,129,0.15)' : p.saludPct >= 60 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="mt-1 text-base font-black text-white">{p.parcela}</h3>
                </div>
                <div className="flex px-4 py-1 items-center justify-center rounded-full" style={{ background: `${healthColor}18` }}>
                  <span className="text-md font-black" style={{ color: healthColor }}>{p.saludPct}%</span>
                </div>
              </div>
              <div className="mt-4 text-[10px] uppercase tracking-widest text-white mb-1">Índice de salud</div>
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
                  <div key={m.label} className="rounded-xl border border-white/20 bg-black/50 p-2.5">
                    <div className="flex items-center gap-1 text-[10px] text-white/80"><span>{m.icon}</span>{m.label}</div>
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
              <Legend formatter={(v) => <span className="text-xs text-white">{v}</span>} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </PageSection>

      <PageSection title="Tabla Comparativa de Parcelas" subtitle="Resumen ejecutivo de fertilidad por zona de cultivo">
        <div className="mb-3 flex justify-end">
          <button onClick={() => onExportCSV('parcelas', parcelaData)} className="text-xs text-white hover:text-emerald-400 flex items-center gap-1 transition-colors">
            <i className="fas fa-download text-[10px]" /> Exportar CSV
          </button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full border-collapse text-left min-w-[600px]">
            <thead className="bg-blue-600/50 text-[10px] uppercase tracking-[0.2em] text-white">
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
  );
}