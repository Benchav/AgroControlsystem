import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { CustomTooltip, QualityBadge } from './ReportCommon';
import { Arduino } from '../../entities/arduino_model';
import { Sensor } from '../../entities/sensor_model';
import { PageSection } from '../layout/PageSection';
import { Parcel } from '../../entities/parcel_model';

interface ParcelasTabProps {
  visible: boolean;
  parcelaData: Parcel[];
  radarData: any[];
  arduinos: Arduino[];
  sensors: Sensor[];
  onExportCSV: (label: string, data: any[]) => void;
}

/**
 * Calcula dinámicamente el porcentaje de salud de la parcela en base a qué tan
 * óptimas son sus lecturas actuales de Humedad, Temperatura y Fertilidad.
 */
function calcularSaludAgro(humidity: number, temperature: number, fertility: number): number {
  let score = 100;

  //  Evaluación de Humedad (Ideal: 60% - 80%)
  if (humidity < 60) {
    score -= (60 - humidity) * 1.2; // Penaliza sequedad progresivamente
  } else if (humidity > 80) {
    score -= (humidity - 80) * 1.0; // Penaliza exceso de agua
  }

  // Evaluación de Temperatura (Ideal: 18°C - 30°C)
  if (temperature < 18) {
    score -= (18 - temperature) * 1.5; // Penaliza frío
  } else if (temperature > 30) {
    score -= (temperature - 30) * 1.8; // Penaliza estrés por calor
  }

  //  Evaluación de Fertilidad (Ideal: >= 70%)
  if (fertility < 70) {
    score -= (70 - fertility) * 0.8; // Penaliza falta de nutrientes
  }

  // Asegurar que el resultado final se mantenga en el rango [0, 100]
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function ParcelasTab({ visible, parcelaData, radarData, arduinos, sensors, onExportCSV }: ParcelasTabProps) {
  if (!visible) return null;

  // Generamos dinámicamente la data del radar 
  const realRadarData = parcelaData.map((p) => {
    const numericTemp = parseFloat(p.temperature) || 0;
    const numericHum = parseFloat(p.humidity) || 0;
    const numericFertility = parseFloat(p.fertility) || 0;

    const saludPct = calcularSaludAgro(numericHum, numericTemp, numericFertility);

    return {
      // Usamos p.area que coincide con el identificador visual en tu UI
      parcela: p.name, 
      "Salud": saludPct,
      "Humedad": numericHum,
      "Temperatura": numericTemp
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {parcelaData.map((p) => {

          // Parseamos los valores string a numbers seguros para lógica y comparaciones métricas
          const numericTemp = parseFloat(p.temperature) || 0;
          const numericHum = parseFloat(p.humidity) || 0;
          const numericFertility = parseFloat(p.fertility) || 0;

          // Obtenemos los sensores asociados a esta parcela en tiempo real para calcular la salud operativa
          const locSensors = sensors.filter((s) => s.location === p.name && s.value !== '---');
          const okSensors = locSensors.filter((s) => s.status === 'OK').length;

          // Calculamos el % de salud real basado en el estado de sus sensores
          const saludPct = calcularSaludAgro(numericHum, numericTemp, numericFertility);

          // Definición de color basado en la salud calculada
          const healthColor = saludPct >= 80 ? '#10b981' : saludPct >= 60 ? '#f59e0b' : '#ef4444';

          return (
            <div
              key={p.id}
              className="rounded-[14px] border border-white/8 bg-white/[0.03] p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  saludPct >= 80 ? 'rgba(16,185,129,0.15)' : saludPct >= 60 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="mt-1 text-base font-black text-white">{p.name}</h3>
                </div>
                <div className="flex px-4 py-1 items-center justify-center rounded-full" style={{ background: `${healthColor}18` }}>
                  <span className="text-md font-black" style={{ color: healthColor }}>{saludPct}%</span>
                </div>
              </div>
              <div className="mt-4 text-[10px] uppercase tracking-widest text-white mb-1">Índice de salud</div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${saludPct}%`, background: healthColor }} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: 'Humedad', value: numericHum > 0 ? `${numericHum}%` : 'N/A', icon: '💧', color: '#38bdf8' },
                  { label: 'Temperatura', value: numericTemp > 0 ? `${numericTemp}°C` : 'N/A', icon: '🌡️', color: '#f59e0b' },
                  { label: 'Fertilidad', value: numericFertility > 0 ? `${numericFertility.toString()}%` : 'N/A', icon: '⚗️', color: '#a78bfa' },
                  { label: 'Area', value: `${p.area}`, icon: '📡', color: '#10b981' },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-white/20 bg-black/50 p-2.5">
                    <div className="flex items-center gap-1 text-[10px] text-white/80"><span>{m.icon}</span>{m.label}</div>
                    <div className="mt-1 text-lg font-black" style={{ color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {arduinos.filter(a => sensors.some(s => s.location === p.id && s.arduinoId === a.id)).map(a => (
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
            <RadarChart data={realRadarData}>
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
                {['Parcela', 'Salud', 'Humedad', 'Temperatura', 'Fertilidad', 'Area', 'Estado'].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm text-slate-300">
              {parcelaData.map((p) => {
                // Volvemos a calcular bajo las mismas variables reales de arriba
                const numericTemp = parseFloat(p.temperature) || 0;
                const numericHum = parseFloat(p.humidity) || 0;
                const numericFertility = parseFloat(p.fertility) || 0;

                const locSensors = sensors.filter((s) => s.location === p.name && s.value !== '---');
                const saludPct = calcularSaludAgro(numericHum, numericTemp, numericFertility);

                return (
                  <tr key={p.id} className="border-t border-white/6 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/5">
                          <div className="h-full rounded-full" style={{ width: `${saludPct}%`, background: saludPct >= 80 ? '#10b981' : saludPct >= 60 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span className="font-mono font-bold text-white">{saludPct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sky-300">{numericHum > 0 ? `${numericHum}%` : '—'}</td>
                    <td className="px-4 py-3 font-mono text-amber-300">{numericTemp > 0 ? `${numericTemp}°C` : '—'}</td>
                    <td className="px-4 py-3 font-mono text-violet-300">{numericFertility > 0 ? `${numericFertility}%` : '—'}</td>
                    <td className="px-4 py-3 font-bold text-white">{p.area}</td>
                    <td className="px-4 py-3"><QualityBadge value={saludPct} thresholds={{ ok: 80, warn: 60 }} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </PageSection>
    </div>
  );
}