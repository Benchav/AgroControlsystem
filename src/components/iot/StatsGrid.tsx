import React from 'react';

type Props = {
  activeArduinosCount: number;
  totalArduinosCount: number;
  avgHumidity: number;
  humiditySensorsCount: number;
  onlineSensorsCount: number;
  totalSensors: number;
  activeAlertsCount: number;
};

export const StatsGrid: React.FC<Props> = ({
  activeArduinosCount,
  totalArduinosCount,
  avgHumidity,
  humiditySensorsCount,
  onlineSensorsCount,
  totalSensors,
  activeAlertsCount,
}) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 shadow-lg backdrop-blur-md">
        <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Placas Arduino</div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-white">{activeArduinosCount}</span>
          <span className="text-sm text-slate-500">/ {totalArduinosCount} Activas</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${activeArduinosCount === totalArduinosCount ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          <span className="text-xs text-slate-400">{activeArduinosCount === totalArduinosCount ? 'Todos los nodos OK' : 'Hay placas inactivas'}</span>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 shadow-lg backdrop-blur-md">
        <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Humedad de Suelo Promedio</div>
        <div className="mt-3 text-3xl font-black tracking-tight text-white">{avgHumidity}%</div>
        <div className="mt-2 text-xs text-slate-400">Calculado sobre {humiditySensorsCount} sensores activos</div>
      </div>

      <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 shadow-lg backdrop-blur-md">
        <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Sensores en Línea</div>
        <div className="mt-3 text-3xl font-black tracking-tight text-white">{onlineSensorsCount}</div>
        <div className="mt-2 text-xs text-slate-400">De un total de {totalSensors} instalados</div>
      </div>

      <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 shadow-lg backdrop-blur-md">
        <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Alertas Activas</div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={`text-3xl font-black tracking-tight ${activeAlertsCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{activeAlertsCount}</span>
          <span className="text-xs text-slate-500">requieren atención</span>
        </div>
        <div className="mt-2 text-xs text-slate-400">Monitoreo automático 24/7</div>
      </div>
    </div>
  );
};

export default StatsGrid;
