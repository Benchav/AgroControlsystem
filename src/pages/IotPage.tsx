import { PageSection } from '../components/layout/PageSection';

export function IotPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">Integración Arduino · 24 sensores · Datos en tiempo real</p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ['Humedad del Suelo', '68%', 'Parcela Norte · S01', '✔ Nivel óptimo', 'emerald'],
          ['Temperatura Suelo', '28°C', 'Sector 2A · S05', '⚠ Ligeramente alta', 'amber'],
          ['Humedad Zona Crítica', '34%', 'Zona Crítica · S09', '🔴 Riego urgente', 'red'],
          ['pH del Suelo', '7.2 pH', 'Parcela Sur · S12', '✔ Óptimo', 'cyan'],
          ['Nitrógeno (N)', '185 mg/kg', 'Parcela Norte · S14', '✔ Buena disponibilidad', 'emerald'],
          ['CO₂ del Suelo', '820 ppm', 'Sector 3B · S18', '⚠ Actividad microbiana alta', 'amber'],
        ].map(([title, value, meta, state, tone]) => (
          <div key={title} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
            <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500">{title}</div>
            <div className="mt-3 text-4xl font-black tracking-tight text-white">{value}</div>
            <div className="mt-2 text-xs text-slate-400">{meta}</div>
            <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone === 'red' ? 'bg-red-500/10 text-red-300' : tone === 'amber' ? 'bg-amber-500/10 text-amber-300' : tone === 'cyan' ? 'bg-cyan-500/10 text-cyan-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
              {state}
            </div>
          </div>
        ))}
      </div>

      <PageSection title="Detección de plagas terrestres" subtitle="Análisis de anomalías · Alertas automáticas">
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-500/5 p-4">
            <span className="mt-1 text-lg text-red-300">🐛</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">Anomalía de presión — Posible plaga subterránea</div>
              <div className="mt-1 text-sm text-slate-400">
                Parcela Norte: Variación anormal en sensores S01, S03. Patrón consistente con actividad de roedores o insectos.
              </div>
            </div>
            <div className="text-xs text-slate-500">hace 12m</div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/15 bg-amber-500/5 p-4">
            <span className="mt-1 text-lg text-amber-300">🦗</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">Posible actividad de insectos — Sector 2A</div>
              <div className="mt-1 text-sm text-slate-400">
                Temperatura de suelo elevada con patrón de vibración en sensor S05. Monitoreo continuo activo.
              </div>
            </div>
            <div className="text-xs text-slate-500">hace 58m</div>
          </div>
        </div>
      </PageSection>

      <PageSection title="Todos los sensores" subtitle="Lista completa">
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <table className="w-full border-collapse text-left">
            <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Sensor</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Ubicación</th>
                <th className="px-4 py-3 font-semibold">Lectura</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-300">
              {[
                ['S01', 'Humedad', 'Parcela Norte', '68%', 'OK', 'emerald'],
                ['S05', 'Temperatura', 'Sector 2A', '28°C', 'Atención', 'amber'],
                ['S09', 'Humedad', 'Zona Crítica', '34%', 'Crítico', 'red'],
                ['S12', 'pH', 'Parcela Sur', '7.2 pH', 'OK', 'emerald'],
                ['S14', 'Nitrógeno', 'Parcela Norte', '185 mg/kg', 'OK', 'emerald'],
              ].map(([sensor, type, location, reading, status, tone]) => (
                <tr key={sensor} className="border-t border-white/6 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-emerald-300">{sensor}</td>
                  <td className="px-4 py-3">{type}</td>
                  <td className="px-4 py-3">{location}</td>
                  <td className="px-4 py-3 font-mono">{reading}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone === 'red' ? 'bg-red-500/10 text-red-300' : tone === 'amber' ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                      {status}
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
}
