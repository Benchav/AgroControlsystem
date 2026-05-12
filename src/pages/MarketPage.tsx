import { PageSection } from '../components/layout/PageSection';

export function MarketPage() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">Tierras en alquiler · Cultivos en venta · Subastas activas</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          ['Parcela Norte', '4.2 ha', '$320/mes', 'Disponible', '🌾'],
          ['Parcela Sur', '2.8 ha', '$210/mes', 'Disponible', '🏡'],
          ['Zona Crítica', '1.6 ha', '$95/mes', 'En tratamiento', '🚧'],
          ['Tomate Cherry', '1,200 kg', '$4.20/kg', 'Tratamiento activo', '🍅'],
          ['Lechuga Batavia', '800 kg', '$1.80/kg', 'Saludable', '🥬'],
          ['Maíz Dulce', '2,400 kg', '$0.85/kg', 'Deficiencia N', '🌽'],
        ].map(([name, meta, price, status, icon]) => (
          <div key={name} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
            <div className="flex h-28 items-center justify-center rounded-2xl border border-white/8 bg-black/20 text-5xl">{icon}</div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold text-emerald-300">{status}</span>
              <span className="text-xs text-slate-500">{meta}</span>
            </div>
            <div className="mt-3 text-lg font-semibold text-white">{name}</div>
            <div className="mt-1 text-2xl font-black tracking-tight text-emerald-300">{price}</div>
            <button className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300" type="button">
              Ver detalles
            </button>
          </div>
        ))}
      </div>

      <PageSection title="Subastas activas" subtitle="Finalizando pronto">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <div className="text-sm font-semibold text-white">Huerto Premium — Sector 2A</div>
            <div className="mt-2 text-xs text-slate-400">4 ofertas · Finaliza en 02:14:33</div>
            <div className="mt-4 text-3xl font-black text-amber-300">$840</div>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <div className="text-sm font-semibold text-white">Parcela Norte — Lote completo</div>
            <div className="mt-2 text-xs text-slate-400">7 ofertas · Finaliza en 05:42:18</div>
            <div className="mt-4 text-3xl font-black text-red-300">$2,340</div>
          </div>
        </div>
      </PageSection>
    </div>
  );
}
