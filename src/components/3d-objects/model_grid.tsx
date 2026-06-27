import { useState } from "react";
import { Models3dItem } from "../../entities/3d_object_model";
import { Parcel } from "../../entities/parcel_model"; // Asegúrate de importar el tipo
import { ModelCard } from "./model_card";

type Props = {
  models: Models3dItem[];
  dynamicParcels: Parcel[]; // <-- Recibimos las parcelas en tiempo real
  onEditClick: (model: Models3dItem) => void;
  onDeleteClick: (title: string) => void;
};

export function ModelGrid({ models, dynamicParcels, onEditClick, onDeleteClick }: Props) {
  const [modelToDelete, setModelToDelete] = useState<Models3dItem | null>(null);

  const handleDeleteConfirm = () => {
    if (modelToDelete) {
      onDeleteClick(modelToDelete.id);
      setModelToDelete(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-6">
        {models.map((model) => {
          // --- CÁLCULO EN TIEMPO REAL ---
          // Filtramos las parcelas que tienen asignado este cultivo específico
          const assignedParcels = dynamicParcels
            .filter((p: any) => String(p.cropId) === String(model.id) || p.cropId === model.title)
            .map((p) => p.name); // Extraemos sólo el nombre legible ("Parcela 1")

          // Inyectamos las parcelas calculadas en vivo al objeto que va al Card/Viewer
          const enrichedModel = {
            ...model,
            parcels: assignedParcels
          };

          return (
            <div key={model.title} className="relative group">
              {/* Le pasamos el modelo enriquecido con las parcelas reales */}
              <ModelCard model3d={enrichedModel} /> 
              
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/70 backdrop-blur-sm p-1.5 rounded-lg shadow-md">
                <button 
                  onClick={() => onEditClick(model)}
                  className="px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded"
                >
                  Editar
                </button>
                <button 
                  onClick={() => setModelToDelete(model)}
                  className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded"
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ... Tu Modal de Confirmación intacto ... */}
    </>
  );
}