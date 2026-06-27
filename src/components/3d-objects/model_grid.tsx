import { Models3dItem } from "../../entities/3d_object_model";
import { ModelCard } from "./model_card";

type Props = {
  models: Models3dItem[];
  onEditClick: (model: Models3dItem) => void;
  onDeleteClick: (title: string) => void;
};

export function ModelGrid({ models, onEditClick, onDeleteClick }: Props) {
  return (
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
              onClick={() => {
                if(confirm(`¿Seguro que deseas eliminar "${model.title}"?`)) {
                  onDeleteClick(model.title);
                }
              }}
              className="px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}