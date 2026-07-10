import { Period } from "../../pages/ReportsPage";

// ─── Tooltip personalizado ────────────────────────────────────────────────────
export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0f1117]/95 p-3 shadow-2xl backdrop-blur-md">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-white">{entry.value}{entry.unit ?? ''}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Badge de calidad ─────────────────────────────────────────────────────────
export function QualityBadge({ value, thresholds }: { value: number; thresholds: { ok: number; warn: number } }) {
  if (value >= thresholds.ok) return <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">Óptimo</span>;
  if (value >= thresholds.warn) return <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">Atención</span>;
  return <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-400">Crítico</span>;
}

// ─── Barra de progreso ────────────────────────────────────────────────────────
export function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, max > 0 ? Math.round((value / max) * 100) : 0);
  return (
    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export const PERIOD_DAYS: Record<Period, number> = { '7d': 7, '14d': 14, '30d': 30 };
export const PERIOD_LABELS: Record<Period, string> = { '7d': 'Última semana', '14d': 'Últimas 2 semanas', '30d': 'Último mes' };