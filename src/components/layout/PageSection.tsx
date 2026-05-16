import type { ReactNode } from 'react';

type PageSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function PageSection({ title, subtitle, children, className = '' }: PageSectionProps) {
  return (
    <section className={`rounded-[14px] border border-white/6 bg-[#27293d] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.15)] md:p-6 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[13.5px] font-semibold tracking-tight text-white md:text-[14px]">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
