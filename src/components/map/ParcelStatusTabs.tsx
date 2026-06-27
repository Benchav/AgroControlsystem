import { useMemo, useState } from "react";
import { PageSection } from "../layout/PageSection";
import type { Parcel, ParcelStatus } from "../../entities/parcel_model";

type Props = {
  parcels: Parcel[];
  selectedParcelId: string;
  setSelectedParcelId: React.Dispatch<React.SetStateAction<string>>;
  setIsEditorOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function ParcelStatusTabs({ parcels, selectedParcelId, setSelectedParcelId, setIsEditorOpen }: Props) {
  const [activeTab, setActiveTab] = useState<ParcelStatus | "todas">("todas");

  const tabs = [
    { key: "todas" as const, label: "Todas", color: "bg-cyan-500/50 text-cyan-300 border-cyan-400/20" },
    { key: "optimo" as ParcelStatus, label: "Óptimo", color: "bg-emerald-500/50 text-emerald-300 border-emerald-400/20" },
    { key: "atencion" as ParcelStatus, label: "Atención", color: "bg-amber-500/50 text-amber-300 border-amber-400/20" },
    { key: "critico" as ParcelStatus, label: "Crítico", color: "bg-red-500/50 text-red-300 border-red-400/20" },
  ];

  const filteredParcels = useMemo(() => {
    if (activeTab === "todas") return parcels;
    return parcels.filter((parcel) => parcel.statusTone === activeTab);
  }, [parcels, activeTab]);

  return (
    <PageSection title="Gestión de parcelas por estado" subtitle="Monitoreo segmentado y acciones rápidas">
      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-2xl border px-5 py-2 text-sm font-semibold transition-all duration-300 ${isActive
                  ? `${tab.color} scale-105 shadow-lg`
                  : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tarjetas */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {filteredParcels.map((parcel) => {
          const isSelected = selectedParcelId === parcel.id;
          const toneStyles =
            parcel.statusTone === "critico"
              ? "bg-red-500/10 text-red-300 border-red-400/20"
              : parcel.statusTone === "atencion"
                ? "bg-amber-500/10 text-amber-300 border-amber-400/20"
                : "bg-emerald-500/10 text-emerald-300 border-emerald-400/20";

          return (
            <div
              key={parcel.id}
              onClick={() => setSelectedParcelId(parcel.id)}
              className={`group relative rounded-[14px] border p-4 backdrop-blur cursor-pointer transition-all duration-300 hover:border-white/30 ${toneStyles} ${isSelected ? "ring-2 ring-white/50 border-white/20 scale-[1.02] shadow-xl" : ""
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-lg font-semibold text-white group-hover:text-emerald-200 transition-colors">
                    {parcel.name}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {parcel.area}
                  </div>
                </div>

                <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneStyles}`}>
                  {parcel.status}
                </div>
              </div>

              {/* Botón CRUD integrado directo en la tarjeta */}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Evita re-seleccionar la tarjeta innecesariamente
                    setSelectedParcelId(parcel.id);
                    setIsEditorOpen(true);
                  }}
                  className="w-full rounded-xl bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500/30 border border-white/5 transition-all text-center"
                >
                  Editar / Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredParcels.length === 0 && (
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-8 text-center text-slate-400">
          No hay parcelas registradas en este estado.
        </div>
      )}
    </PageSection>
  );
}