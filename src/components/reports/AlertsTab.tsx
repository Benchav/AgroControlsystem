import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CustomTooltip } from './ReportCommon';
import { PageSection } from '../layout/PageSection';
import { Alert } from '../../entities/alert_model';

interface AlertsTabProps {
  visible: boolean;
  alerts: Alert[];
  alertFreqHistory: any[];
  onExportCSV: (label: string, data: any[]) => void;
}

export function AlertsTab({ visible, alerts, alertFreqHistory, onExportCSV }: AlertsTabProps) {
  if (!visible) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Alertas Críticas', value: alerts.filter(a => a.severity === 'red').length, color: '#ef4444', icon: 'fa-fire' },
          { label: 'Advertencias', value: alerts.filter(a => a.severity === 'amber').length, color: '#f59e0b', icon: 'fa-exclamation-circle' },
          { label: 'Resueltas', value: alerts.filter(a => a.resolved).length, color: '#10b981', icon: 'fa-check-circle' },
        ].map((k) => (
          <div key={k.label} className="rounded-[14px] border border-white/8 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: `${k.color}18` }}>
                <i className={`fas ${k.icon}`} style={{ color: k.color }} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-white">{k.label}</div>
                <div className="text-2xl font-black" style={{ color: k.color }}>{k.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PageSection title="Registro Cronológico de Eventos" subtitle="Historial completo de alertas y anomalías detectadas">
        <div className="mb-3 flex justify-end">
          <button onClick={() => onExportCSV('alertas', alerts.map(a => ({ id: a.id, titulo: a.title, descripcion: a.description, severidad: a.severity, tiempo: a.time, resuelta: a.resolved })))}
            className="text-xs text-white hover:text-emerald-400 flex items-center gap-1 transition-colors">
            <i className="fas fa-download text-[10px] " /> Exportar registro CSV
          </button>
        </div>
        <div className="relative space-y-1 pl-6 before:absolute before:left-2 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-white/10">
          {alerts.map((alert) => (
            <div key={alert.id}
              className={`relative rounded-2xl border p-4 transition-all duration-200 hover:bg-white/[0.02] ${alert.resolved ? 'border-white/6 bg-white/[0.01] opacity-60' : alert.severity === 'red' ? 'border-red-500/15 bg-red-500/5' : 'border-amber-500/15 bg-amber-500/5'}`}>
              <div className={`absolute -left-4 top-5 h-3 w-3 rounded-full border-2 border-[#0f1117] ${alert.resolved ? 'bg-emerald-500' : alert.severity === 'red' ? 'bg-red-500' : 'bg-amber-500'}`} />
              <div className="flex items-start gap-3">
                <i className={`${alert.emoji}`} style={{ fontSize: "20px" }} />
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
                  <div className="text-xs text-white">{alert.time}</div>
                  <div className="mt-1 font-mono text-[9px] text-white/50">#{alert.id}</div>
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
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16,185,129,0.08)' }}/>
              <Bar dataKey="Eventos" fill="#ef4444" fillOpacity={0.7} radius={[4, 4, 0, 0]} name="Eventos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PageSection>
    </div>
  );
}