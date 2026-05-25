import React from 'react';

type Props = {
  isSimulating: boolean;
  toggleSim: () => void;
};

export const IotHeader: React.FC<Props> = ({ isSimulating, toggleSim }) => {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <p className="text-sm text-slate-400">Panel Administrativo de Control y Telemetría Industrial</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-white">Consola Central IoT</h1>
      </div>

      <button
        onClick={toggleSim}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold border transition-all duration-200 hover:scale-105 active:scale-95 ${isSimulating
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            : 'border-white/10 bg-white/5 text-slate-400'
          }`}
      >
        <span className={`relative flex h-2.5 w-2.5`}>
          {isSimulating && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSimulating ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
        </span>
        {isSimulating ? 'Simulación en Vivo Activa' : 'Simulación Pausada'}
      </button>
    </div>
  );
};

export default IotHeader;
