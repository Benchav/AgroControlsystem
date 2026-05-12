import { PageSection } from '../components/layout/PageSection';
import type { AppPageId } from '../types/app';

type ModulePageProps = {
  page: AppPageId;
  title: string;
  subtitle: string;
};

export function ModulePage({ page, title, subtitle }: ModulePageProps) {
  return (
    <PageSection title={title} subtitle={subtitle}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <div className="text-sm font-semibold text-white">Vista modular</div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Esta página corresponde a <span className="text-emerald-300">{page}</span> y ya vive como componente React independiente.
          </p>
        </div>
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <div className="text-sm font-semibold text-white">Diseño conservado</div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            El estilo visual se mantiene sin depender del HTML original.
          </p>
        </div>
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <div className="text-sm font-semibold text-white">Base escalable</div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Aquí puedes enchufar tu API, stores y hooks por módulo.
          </p>
        </div>
      </div>
    </PageSection>
  );
}
