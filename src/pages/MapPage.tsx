import { PageSection } from '../components/layout/PageSection';
import { FarmInteractiveMap } from '../components/map/FarmInteractiveMap';

export function MapPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">Delimitación de áreas en tiempo real · Censado de terreno</p>

      <FarmInteractiveMap />

      <PageSection title="Parcelas destacadas" subtitle="Lecturas clave">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Parcela Norte', '4.2 ha', 'Óptimo', 'emerald'],
            ['Zona Crítica', '1.6 ha', 'Crítico', 'red'],
            ['Sector 3B', '3.1 ha', 'Atención', 'amber'],
          ].map(([name, area, status, tone]) => (
            <div key={name} className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              <div className="text-sm font-semibold text-white">{name}</div>
              <div className="mt-2 text-xs text-slate-400">{area} · Coord. 14.07 N / 87.20 O</div>
              <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone === 'red' ? 'bg-red-500/10 text-red-300' : tone === 'amber' ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{status}</div>
            </div>
          ))}
        </div>
      </PageSection>
    </div>
  );
}
