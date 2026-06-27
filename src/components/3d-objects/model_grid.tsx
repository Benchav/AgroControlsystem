import { useState } from "react";
import { Models3dItem } from "../../entities/3d_object_model";
import { Parcel } from "../../entities/parcel_model";
import { ModelCard } from "./model_card";

type Props = {
  models: Models3dItem[];
  dynamicParcels: Parcel[];
  onEditClick: (model: Models3dItem) => void;
  onDeleteClick: (id: string) => void;
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
          // Obtenemos las parcelas del filtro dinámico de tiempo real
          const filteredParcels = dynamicParcels
            .filter((p: any) => {
              const parcelCropId = String(p.cropId || '').trim();
              const modelId = String(model.id || '').trim();
              const modelTitle = String(model.title || '').trim();

              return parcelCropId === modelId || parcelCropId === modelTitle;
            })
            .map((p) => p.name);

          // Extraemos las parcelas que vienen ya adjuntas directamente en el modelo por el modal
          const modelDirectParcels = model.parcels || [];

          // Unimos ambas listas y usamos Set para eliminar nombres duplicados
          const uniqueAssignedParcels = Array.from(
            new Set([...filteredParcels, ...modelDirectParcels])
          );

          // Inyectamos la data limpia y unificada
          const enrichedModel = {
            ...model,
            parcels: uniqueAssignedParcels
          };

          return (
            <div key={model.title} className="relative group">
              <ModelCard model3d={enrichedModel} availableParcels={dynamicParcels} />

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

      {/* Modal de Confirmación de Delete */}
      {modelToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">¿Eliminar objeto 3D?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Esta acción eliminará permanentemente el modelo <span className="text-emerald-400 font-semibold">"{modelToDelete.title}"</span>. Las parcelas asociadas perderán esta referencia de cultivo.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModelToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}