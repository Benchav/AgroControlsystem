import { PageSection } from '../layout/PageSection';

export function DashboardAlerts() {
  return (
    <PageSection title="Alertas recientes" subtitle="Monitoreo automático 24/7">
      <div className="space-y-3">
        {[
          ['Plaga detectada — Parcela Norte', 'Anomalía en sensores S01 y S03', 'red'],
          ['Humedad baja — Sector 3B', 'Nivel al 34% — riego urgente', 'amber'],
          ['Informe semanal listo', 'Análisis de fertilidad disponible', 'sky'],
        ].map(([title, desc, tone]) => (
          <div
            key={title}
            className={`flex items-start gap-3 rounded-[10px] border p-4 ${tone === 'red' ? 'border-red-400/40 bg-red-500/25' : tone === 'amber' ? 'border-amber-400/40 bg-amber-500/25' : 'border-sky-400/40 bg-sky-500/25'}`}
          >
            <span className={`mt-1 text-[15px] ${tone === 'red' ? 'text-red-400' : tone === 'amber' ? 'text-amber-400' : 'text-sky-400'}`}>
              {tone === 'red' ? '🔴' : tone === 'amber' ? '🟡' : '🔵'}
            </span>
            <div>
              <div className="text-[12.5px] font-semibold text-white">{title}</div>
              <div className="mt-1 text-[11px] leading-5 text-slate-400">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </PageSection>
  );
}
