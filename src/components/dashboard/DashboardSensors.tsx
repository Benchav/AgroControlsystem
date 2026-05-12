import { PageSection } from '../layout/PageSection';

export function DashboardSensors() {
  return (
    <PageSection title="Estado sensores" subtitle="En línea">
      <div className="space-y-4">
        {[
          ['Humedad S1', 68, 'emerald'],
          ['pH Suelo S2', 72, 'cyan'],
          ['Temperatura S3', 48, 'amber'],
          ['Humedad S4', 34, 'red'],
        ].map(([label, value, tone]) => (
          <div key={label as string}>
            <div className="mb-2 flex items-center justify-between text-[12.5px]">
              <span className="font-medium text-white">{label as string}</span>
              <span className={`font-mono font-bold ${tone === 'red' ? 'text-red-300' : tone === 'amber' ? 'text-amber-300' : tone === 'cyan' ? 'text-cyan-300' : 'text-emerald-300'}`}>
                {value as number}%
              </span>
            </div>
            <div className="h-[3px] rounded-[2px] bg-white/5">
              <div
                className={`h-[3px] rounded-[2px] ${tone === 'red' ? 'bg-red-400' : tone === 'amber' ? 'bg-amber-400' : tone === 'cyan' ? 'bg-cyan-400' : 'bg-emerald-400'}`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </PageSection>
  );
}
