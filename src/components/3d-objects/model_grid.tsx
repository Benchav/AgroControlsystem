import { useState } from "react";
import { Models3dItem } from "../../entities/3d_object_model";
import { ModelCard } from "./model_card";

type Props = {
  models: Models3dItem[];
  onEditClick: (model: Models3dItem) => void;
  onDeleteClick: (title: string) => void;
};

export function ModelGrid({ models, onEditClick, onDeleteClick }: Props) {
  // Guardamos el título del modelo que se intenta eliminar
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (modelToDelete) {
      onDeleteClick(modelToDelete);
      setModelToDelete(null); // Cerramos el modal
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-6">
        {models.map((model) => (
          <div key={model.title} className="relative group">
            <ModelCard model3d={model} />
            
            {/* Botonera de acciones rápida sobre el Card */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/70 backdrop-blur-sm p-1.5 rounded-lg shadow-md">
              <button 
                onClick={() => onEditClick(model)}
                className="px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded"
              >
                Editar
              </button>
              <button 
                onClick={() => setModelToDelete(model.title)} // Abrimos el modal guardando el título
                className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal / Dialog de Confirmación */}
      {modelToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900">
              ¿Confirmar eliminación?
            </h3>
            <p className="mt-2 text-sm text-black/80">
              Estás a punto de eliminar <span className="font-semibold text-black">"{modelToDelete}"</span>. Esta acción no se puede deshacer.
            </p>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModelToDelete(null)} // Cancelar
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm} // Confirmar
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm shadow-red-200"
              >
                Eliminar objeto
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}