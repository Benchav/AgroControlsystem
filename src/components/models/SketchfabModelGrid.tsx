type SketchfabModel = {
  title: string;
  author: string;
  embedUrl: string;
  sourceUrl: string;
};

type SketchfabModelGridProps = {
  models: SketchfabModel[];
};

export function SketchfabModelGrid({ models }: SketchfabModelGridProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {models.map((model) => (
        <div key={model.title} className="overflow-hidden rounded-[14px] border border-white/6 bg-[#27293d] p-4 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <div>
              <div className="text-[12.5px] font-semibold text-white">{model.title}</div>
              <div className="text-[11px] text-slate-500">by {model.author}</div>
            </div>
            <a className="text-[11px] font-semibold text-emerald-300 hover:text-emerald-200" href={model.sourceUrl} target="_blank" rel="noreferrer">
              Abrir fuente
            </a>
          </div>

          <div className="relative h-[340px] overflow-hidden rounded-[10px] border border-white/8 bg-[#1e1e2f]">
            <iframe
              src={model.embedUrl}
              title={model.title}
              allow="autoplay; fullscreen; vr"
              allowFullScreen
              loading="eager"
              className="h-full w-full border-0"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
