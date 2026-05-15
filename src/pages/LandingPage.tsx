import { SplineBackdrop } from '../components/layout/SplineBackdrop';

type LandingPageProps = {
  onEnterApp: () => void;
};

export function LandingPage({ onEnterApp }: LandingPageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <SplineBackdrop />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(30,30,47,0.4)_62%,rgba(30,30,47,0.95)_90%,#1e1e2f_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-4 py-5 md:px-8 md:py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-xl shadow-glow">
              🌱
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-tight">Agro Control</div>
              <div className="-mt-1 text-[10px] font-semibold uppercase tracking-[0.4em] text-emerald-300">
                Smart Farm Platform
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {['Módulos', 'Tecnología', 'Marketplace'].map((item) => (
              <span key={item} className="rounded-full px-4 py-2 text-sm font-medium text-slate-300/90 transition hover:bg-white/5 hover:text-white">
                {item}
              </span>
            ))}
            <button
              type="button"
              onClick={onEnterApp}
              className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition hover:border-emerald-300/40 hover:bg-emerald-500/15"
            >
              Ingresar al panel →
            </button>
          </nav>
        </header>

        <main className="flex flex-1 items-center px-4 pb-10 md:px-8 md:pb-14">
          <div className="max-w-3xl space-y-6 md:space-y-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Sistema Activo · 24 sensores en línea
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-[0.92] tracking-tight text-white md:text-7xl">
              Cultiva más
              <br />
              inteligente con <span className="font-serif italic text-emerald-400">IA</span>
            </h1>

            <p className="max-w-xl text-base leading-7 text-slate-300 md:text-lg">
              Monitoreo IoT en tiempo real, diagnóstico visual con Gemini, asistente Llama 3 y un ecosistema comercial para rentabilizar tus parcelas.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onEnterApp}
                className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-[0_10px_30px_rgba(16,185,129,0.28)] transition hover:brightness-110"
              >
                <i className="fas fa-arrow-right" />
                Ver demo del panel
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
              >
                <i className="fas fa-play-circle" />
                Ver video
              </button>
            </div>

            <div className="grid max-w-2xl grid-cols-2 gap-3 pt-4 sm:grid-cols-4">
              {[
                ['24', 'Sensores activos'],
                ['12km', 'Terreno monitoreado'],
                ['+150h', 'Uptime del sistema'],
                ['+4', 'Módulos integrados'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 backdrop-blur">
                  <div className="text-2xl font-black tracking-tight text-white md:text-3xl">{value}</div>
                  <div className="mt-1 text-xs text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
