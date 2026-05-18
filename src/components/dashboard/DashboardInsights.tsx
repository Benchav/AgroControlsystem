import type { AppPageId } from "../../types/app";

type DashboardInsightsProps = {
  onNavigate: (page: AppPageId) => void;
};

export function DashboardInsights({ onNavigate }: DashboardInsightsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="rounded-[14px] border border-white/6 backdrop-blur p-5">
        <div className="text-[13.5px] font-semibold text-white">
          <img
            src="/icons/openai.svg"
            alt="IA Icon"
            className="inline-block h-4 w-4 mr-2 "
          />
          Diagnóstico IA
        </div>
        <p className="mt-2 text-[11.5px] text-slate-400">
          3 plantas analizadas hoy. 1 requiere atención.
        </p>
        <div className="mt-4 rounded-[8px] border border-red-400/15 bg-red-500/[0.07] p-3 text-[12px] text-slate-300">
          <i className="fa-solid fa-plant-wilt" />{" "}
          <strong className="text-white">Tomate Var. Cherry</strong> — Mildiu
          polvoroso (87% confianza)
        </div>
        <button
          type="button"
          onClick={() => onNavigate("ai")}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
        >
          <i className="fas fa-camera" /> Analizar planta
        </button>
      </div>

      <div className="rounded-[14px] border border-white/6 backdrop-blur p-5">
        <div className="text-[13.5px] font-semibold text-white">
          <img
            src="/icons/virtualAsistent.svg"
            alt="IA Icon"
            className="inline-block h-8 w-8 mr-2 "
          />{" "}
          Asistente Virtual
        </div>
        <p className="mt-2 text-[11.5px] text-slate-400">
          Groq · Llama 3 — Respuesta en ~0.3s
        </p>
        <div className="mt-4 rounded-[8px] border border-white/8 bg-[#2d2f45]/50 p-3 text-[12px] italic text-slate-300">
          &quot;¿Cuál es el mejor pesticida orgánico para el mildiu en
          tomates?&quot;
        </div>
        <button
          type="button"
          onClick={() => onNavigate("chat")}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
        >
          <i className="fas fa-comment-dots" /> Abrir chat
        </button>
      </div>

      <div className="rounded-[14px] border border-white/6 backdrop-blur p-5">
        <div className="text-[13.5px] font-semibold text-white">
          <img
            src="/icons/bitcoin.svg"
            alt="IA Icon"
            className="inline-block h-6 w-6 mr-2 "
          />{" "}
          Subastas
        </div>
        <p className="mt-2 text-[11.5px] text-slate-400">
          8 anuncios activos · 2 subastas hoy
        </p>
        <div className="mt-4 flex gap-3">
          <div className="flex-1 rounded-[8px] border border-white/10 bg-emerald-500/[0.08] p-4 text-center">
            <div className="font-mono text-[18px] font-bold text-emerald-300">
              $840
            </div>
            <div className="mt-1 text-[10px] text-slate-400">mayor oferta</div>
          </div>
          <div className="flex-1 rounded-[8px] border border-white/10 bg-emerald-500/[0.08] p-4 text-center">
            <div className="font-mono text-[18px] font-bold text-teal-300">
              3
            </div>
            <div className="mt-1 text-[10px] text-slate-400">tierras rent.</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("market")}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
        >
          <i className="fas fa-store" /> Ver subastas
        </button>
      </div>
    </div>
  );
}
