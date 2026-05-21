import { useMemo, useState } from "react";
import { PageSection } from "../layout/PageSection";
import type { Parcel, ParcelStatus } from "../../entities/parcel_model";

type Props = {
  parcels: Parcel[];
};

export function ParcelStatusTabs({ parcels }: Props) {
  const [activeTab, setActiveTab] = useState<ParcelStatus | "todas">("todas");

  const tabs = [
    {
      key: "todas" as const,
      label: "Todas",
      color: "bg-cyan-500/50 text-cyan-300 border-cyan-400/20",
    },
    {
      key: "optimo" as ParcelStatus,
      label: "Óptimo",
      color: "bg-emerald-500/50 text-emerald-300 border-emerald-400/20",
    },
    {
      key: "atencion" as ParcelStatus,
      label: "Atención",
      color: "bg-amber-500/50 text-amber-300 border-amber-400/20",
    },
    {
      key: "critico" as ParcelStatus,
      label: "Crítico",
      color: "bg-red-500/50 text-red-300 border-red-400/20",
    },
  ];

  const filteredParcels = useMemo(() => {
    if (activeTab === "todas") {
      return parcels;
    }

    return parcels.filter((parcel) => parcel.statusTone === activeTab);
  }, [parcels, activeTab]);

  return (
    <PageSection
      title="Gestión de parcelas por estado"
      subtitle="Monitoreo segmentado"
    >
      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-2xl border px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? `${tab.color} scale-105 shadow-lg`
                  : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Parcel cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {filteredParcels.map((parcel) => {
          const toneStyles =
            parcel.statusTone === "critico"
              ? "bg-red-500/10 text-red-300 border-red-400/20"
              : parcel.statusTone === "atencion"
                ? "bg-amber-500/10 text-amber-300 border-amber-400/20"
                : "bg-emerald-500/10 text-emerald-300 border-emerald-400/20";

          return (
            <div
              key={parcel.id}
              className="rounded-[14px] border border-white/8 bg-black/50 p-5 backdrop-blur"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold text-white">
                    {parcel.name}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {parcel.area}
                  </div>
                </div>

                <div
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneStyles}`}
                >
                  {parcel.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredParcels.length === 0 && (
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-8 text-center text-slate-400">
          No hay parcelas registradas en este estado.
        </div>
      )}
    </PageSection>
  );
}
