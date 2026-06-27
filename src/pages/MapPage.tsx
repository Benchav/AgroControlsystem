import { FarmInteractiveMap } from "../components/map/FarmInteractiveMap";
import { ParcelStatusTabs } from "../components/map/ParcelStatusTabs";
import { Parcel } from "../entities/parcel_model";
import { useEffect, useState } from "react";
import { useParcels } from "../hooks/useParcels";

export function MapPage() {
  const { parcels, createParcel, updateParcel, deleteParcel, isLoading } = useParcels();

  const [selectedParcelId, setSelectedParcelId] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    if (parcels.length > 0 && !selectedParcelId) {
      setSelectedParcelId(parcels[0].id);
    }
  }, [parcels, selectedParcelId]);

  if (isLoading) {
    return <div className="text-white p-4">Cargando parcelas...</div>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Delimitación de áreas en tiempo real · Censado de terreno
      </p>

      <FarmInteractiveMap
        dynamicParcels={parcels}
        onCreateParcel={createParcel}
        onUpdateParcel={updateParcel}
        onDeleteParcel={deleteParcel}
        selectedParcelId={selectedParcelId}
        setSelectedParcelId={setSelectedParcelId}
        isEditorOpen={isEditorOpen}
        setIsEditorOpen={setIsEditorOpen}
      />

      <ParcelStatusTabs parcels={parcels}
        selectedParcelId={selectedParcelId}
        setSelectedParcelId={setSelectedParcelId}
        setIsEditorOpen={setIsEditorOpen} />
    </div>
  );
}
