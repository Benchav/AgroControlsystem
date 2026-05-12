import { PageSection } from '../components/layout/PageSection';

export function ReportsPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">Análisis histórico · Proyecciones · Exportar datos</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Salud Promedio', '82%', 'fa-leaf', 'emerald'],
          ['Agua Utilizada', '1,240 L', 'fa-tint', 'sky'],
          ['Incidentes Plaga', '4 eventos', 'fa-bug', 'amber'],
          ['Ingresos Marketplace', '$3,840', 'fa-dollar-sign', 'teal'],
        ].map(([label, value, icon, tone]) => (
          <div key={label} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${tone === 'emerald' ? 'bg-emerald-500/10 text-emerald-300' : tone === 'sky' ? 'bg-sky-500/10 text-sky-300' : tone === 'amber' ? 'bg-amber-500/10 text-amber-300' : 'bg-teal-500/10 text-teal-300'}`}>
              <i className={`fas ${icon}`} />
            </div>
            <div className="mt-4 text-sm text-slate-400">{label}</div>
            <div className="mt-2 text-3xl font-black text-white">{value}</div>
          </div>
        ))}
      </div>

      <PageSection title="Reporte de fertilidad del suelo — Mayo 2026" subtitle="Datos históricos compilados por sensores IoT">
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <table className="w-full border-collapse text-left text-sm text-slate-300">
            <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Parcela</th>
                <th className="px-4 py-3 font-semibold">Fertilidad</th>
                <th className="px-4 py-3 font-semibold">pH</th>
                <th className="px-4 py-3 font-semibold">Humedad</th>
                <th className="px-4 py-3 font-semibold">Temperatura</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Parcela Norte', '94%', '6.8', '68%', '22°C'],
                ['Sector 2A', '87%', '7.1', '62%', '28°C'],
                ['Zona Crítica', '71%', '6.2', '34%', '31°C'],
                ['Parcela Sur', '89%', '7.2', '71%', '21°C'],
              ].map(([parcel, fertility, ph, humidity, temp]) => (
                <tr key={parcel} className="border-t border-white/6">
                  <td className="px-4 py-3">{parcel}</td>
                  <td className="px-4 py-3 font-mono text-emerald-300">{fertility}</td>
                  <td className="px-4 py-3 font-mono">{ph}</td>
                  <td className="px-4 py-3 font-mono">{humidity}</td>
                  <td className="px-4 py-3 font-mono">{temp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageSection>
    </div>
  );
}
