import React from 'react';

type Tab = 'monitor' | 'arduino' | 'tutorials';

type Props = {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
};

export const TabsNav: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex border-b border-white/10 text-sm">
      <button
        onClick={() => setActiveTab('monitor')}
        className={`px-4 py-2 font-semibold transition-all border-b-2 ${activeTab === 'monitor'
            ? 'border-emerald-500 text-white'
            : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
      >
        📊 Monitoreo en Vivo
      </button>
      <button
        onClick={() => setActiveTab('arduino')}
        className={`px-4 py-2 font-semibold transition-all border-b-2 ${activeTab === 'arduino'
            ? 'border-emerald-500 text-white'
            : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
      >
        🔌 Administración Arduino
      </button>
      <button
        onClick={() => setActiveTab('tutorials')}
        className={`px-4 py-2 font-semibold transition-all border-b-2 ${activeTab === 'tutorials'
            ? 'border-emerald-500 text-white'
            : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
      >
        📺 Guías y Tutoriales
      </button>
    </div>
  );
};

export default TabsNav;
