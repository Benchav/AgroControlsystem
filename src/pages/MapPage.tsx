import { FarmInteractiveMap } from "../components/map/FarmInteractiveMap";
import { initialParcels } from "../data/parcels";
import { ParcelStatusTabs } from "../components/map/ParcelStatusTabs";
import { Parcel } from "../entities/parcel_model";
import { useState } from "react";

export function MapPage() {
  const [parcels, setParcels] = useState<Parcel[]>(initialParcels);
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Delimitación de áreas en tiempo real · Censado de terreno
      </p>

      <FarmInteractiveMap dynamicParcels={parcels} setDynamicParcels={setParcels} />

      <ParcelStatusTabs parcels={parcels} />
    </div>
  );
}
