import React from "react";

type Tab = "monitor" | "arduino" | "tutorials";

type Props = {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
};

export const TabsNav: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-row gap-4 text-sm">
      <button
        type="button"
        onClick={() => setActiveTab("monitor")}
        className={`flex items-center gap-2 rounded-2xl border px-5 py-2 text-sm font-semibold transition-all duration-300 ${
          activeTab === "monitor"
            ? `bg-blue-400/40 scale-105 shadow-lg`
            : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
        }`}
      >
        Monitoreo en Vivo
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("arduino")}
        className={`flex items-center gap-2 rounded-2xl border px-5 py-2 text-sm font-semibold transition-all duration-300 ${
          activeTab === "arduino"
            ? `bg-green-500/40 scale-105 shadow-lg`
            : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
        }`}
      >
        Administración Arduino
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("tutorials")}
        className={`flex items-center gap-2 rounded-2xl border px-5 py-2 text-sm font-semibold transition-all duration-300 ${
          activeTab === "tutorials"
            ? `bg-orange-500/40 scale-105 shadow-lg`
            : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
        }`}
      >
        Guías y Tutoriales
      </button>
    </div>
  );
};

export default TabsNav;
