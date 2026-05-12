import { PageSection } from '../components/layout/PageSection';

export function AiPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div>
        <p className="mb-4 text-sm text-slate-400">Motor visual Gemini 2.5 Flash · Detección de plagas y enfermedades</p>
        <div className="rounded-[28px] border border-dashed border-emerald-400/20 bg-emerald-500/5 p-8 text-center">
          <div className="text-4xl">📷</div>
          <div className="mt-4 text-lg font-semibold text-white">Cargar imagen de planta</div>
          <div className="mt-2 text-sm text-slate-400">PNG · JPG · HEIC — Arrastra o haz clic para seleccionar</div>
          <button className="mt-5 inline-flex rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white" type="button">
            Seleccionar archivo
          </button>
        </div>

        <PageSection title="Diagnóstico detectado" subtitle="Análisis completado">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-3xl">🍅</div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">Tomate Var. Cherry</div>
              <div className="mt-1 text-xs text-slate-400">Solanum lycopersicum · confianza 87%</div>
              <div className="mt-3 h-1.5 rounded-full bg-white/6">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300" style={{ width: '87%' }} />
              </div>
              <div className="mt-3 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                Mildiu polvoroso detectado
              </div>
            </div>
          </div>
        </PageSection>
      </div>

      <div className="space-y-4">
        <PageSection title="Plan de acción" subtitle="Preventivo y correctivo">
          <ul className="space-y-3 text-sm text-slate-300">
            {[
              'Aplicar solución de bicarbonato de sodio (5g/L) en spray foliar, 2 veces por semana.',
              'Reducir humedad relativa del ambiente. Mejorar ventilación entre plantas.',
              'Eliminar y destruir hojas afectadas. No compostar material infectado.',
              'Aplicar fungicida orgánico a base de azufre si infección supera el 20% del follaje.',
              'Monitorear cada 48h y registrar evolución con nueva fotografía.',
            ].map((step, index) => (
              <li key={step} className="flex gap-3 rounded-2xl border border-white/6 bg-black/20 p-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-300">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </PageSection>

        <PageSection title="Enfermedades frecuentes" subtitle="Histórico de prevalencia">
          <div className="space-y-4 text-sm text-slate-300">
            {[
              ['Mildiu polvoroso', 68, 'red'],
              ['Defic. Nitrógeno', 45, 'amber'],
              ['Tizón tardío', 30, 'sky'],
              ['Podredumbre raíz', 18, 'emerald'],
            ].map(([label, value, tone]) => (
              <div key={label as string}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-slate-400">{label as string}</span>
                  <span className={`font-mono ${tone === 'red' ? 'text-red-300' : tone === 'amber' ? 'text-amber-300' : tone === 'sky' ? 'text-sky-300' : 'text-emerald-300'}`}>
                    {value as number}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/6">
                  <div
                    className={`h-2 rounded-full ${tone === 'red' ? 'bg-red-400' : tone === 'amber' ? 'bg-amber-400' : tone === 'sky' ? 'bg-sky-400' : 'bg-emerald-400'}`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </PageSection>
      </div>
    </div>
  );
}
