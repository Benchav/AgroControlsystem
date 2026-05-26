import React from 'react';
import { PageSection } from '../../components/layout/PageSection';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Sensor } from '../../entities/sensor_model';
import { Alert } from '../../entities/alert_model';

type Props = {
  humidityHistory: { time: string; value: number }[];
  sensors: Sensor[];
  alerts: Alert[];
  handleResolveAlert: (id: string) => void;
};

export const MonitorContent: React.FC<Props> = ({ humidityHistory, sensors, alerts, handleResolveAlert }) => {
  return (
    <div className="space-y-6">
      <PageSection title="Telemetría de Humedad en Tiempo Real" subtitle="Fluctuación del promedio de humedad del suelo en parcelas monitoreadas">
        <div className="h-[240px] w-full rounded-2xl bg-black/50 p-2 border border-white/5 ">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={humidityHistory}>
              <defs>
                <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#ffffff" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff" fontSize={10} tickLine={false} axisLine={false} domain={[30, 90]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e1e2f', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                itemStyle={{ color: '#10b981', fontSize: '13px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorHumidity)" name="Humedad Promedio" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PageSection>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sensors.map((sensor) => (
          <div key={sensor.id} className="rounded-[14px] border border-white/8 bg-emerald-400/10 p-5 shadow-sm backdrop-blur">
            <div className="flex justify-between items-start">
              <div className="text-[10px] uppercase tracking-[0.35em] text-white">{sensor.name}</div>
              <span className="text-[10px] font-mono text-white px-2 py-0.5 rounded border border-white/5 bg-emerald-500/20">{sensor.arduinoId}</span>
            </div>
            <div className="mt-3 text-4xl font-black tracking-tight text-white">{sensor.value}</div>
            <div className="mt-2 text-xs text-white/80">{sensor.location} · {sensor.id}</div>
            <div className="mt-4 flex justify-between items-center">
              <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${sensor.tone === 'red'
                  ? 'bg-red-500/10 text-red-300'
                  : sensor.tone === 'amber'
                    ? 'bg-amber-500/10 text-amber-300'
                    : sensor.tone === 'cyan'
                      ? 'bg-cyan-500/10 text-cyan-300'
                      : 'bg-emerald-500/10 text-emerald-300'
                }`}>
                {sensor.value === '---' ? 'Placa Desconectada' : `✔ ${sensor.status}`}
              </div>
            </div>
          </div>
        ))}
      </div>

      <PageSection title="Detección de anomalías y plagas" subtitle="Análisis en tiempo real · Alertas automáticas">
        <div className="space-y-3">
          {alerts.filter(a => !a.resolved).length === 0 ? (
            <div className="text-center py-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
              <p className="text-sm text-white">No hay anomalías activas detectadas en el sistema.</p>
            </div>
          ) : (
            alerts
              .filter((a) => !a.resolved)
              .map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-4 rounded-2xl border p-4 transition-all duration-200 ${alert.severity === 'red'
                      ? 'border-red-400/15 bg-red-500/20 hover:bg-red-500/50'
                      : 'border-amber-400/15 bg-amber-500/20 hover:bg-amber-500/50'
                    }`}
                >
                  <i className={`${alert.emoji}`} style={{ fontSize: "20px" }} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{alert.title}</div>
                    <div className="mt-1 text-sm text-slate-400">{alert.description}</div>
                    <button onClick={() => handleResolveAlert(alert.id)} className="mt-2 text-xs text-emerald-400 font-semibold hover:underline">Marcar como atendido / corregido</button>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white">{alert.time}</div>
                    <span className={`mt-1 inline-block text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${alert.severity === 'red' ? 'bg-red-500/25 text-red-200' : 'bg-amber-500/25 text-amber-200'}`}>{alert.severity === 'red' ? 'Crítico' : 'Advertencia'}</span>
                  </div>
                </div>
              ))
          )}
        </div>
      </PageSection>

      <PageSection title="Todos los sensores" subtitle="Inventario y lecturas detalladas de hardware">
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full border-collapse text-left min-w-[600px]">
            <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Sensor</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Ubicación</th>
                <th className="px-4 py-3 font-semibold">Placa Arduino</th>
                <th className="px-4 py-3 font-semibold">Lectura</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-300">
              {sensors.map((sensor) => (
                <tr key={sensor.id} className="border-t border-white/6 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-emerald-300">{sensor.id}</td>
                  <td className="px-4 py-3">{sensor.name}</td>
                  <td className="px-4 py-3">{sensor.location}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{sensor.arduinoId}</td>
                  <td className="px-4 py-3 font-mono">{sensor.value}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${sensor.value === '---' ? 'bg-slate-500/10 text-slate-400' : sensor.tone === 'red' ? 'bg-red-500/10 text-red-300' : sensor.tone === 'amber' ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                      {sensor.value === '---' ? 'Inactivo' : sensor.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageSection>
    </div>
  );
};

export default MonitorContent;
