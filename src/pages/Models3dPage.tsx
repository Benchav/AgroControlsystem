import { useState } from 'react';
import { ModelGrid } from '../components/3d-objects/model_grid';
import { ModelSkeleton } from '../components/3d-objects/model_skeleton';
import { ModelFormModal } from '../components/3d-objects/model_form_modal';
import { useModels3d } from '../hooks/useModels3d';
import { Models3dItem } from '../entities/3d_object_model';

export function Models3dPage() {
  const { models, isLoading, createModel, updateModel, deleteModel } = useModels3d();
  
  // Estados para controlar el Modal de Formulario
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Models3dItem | null>(null);

  const handleOpenCreateModal = () => {
    setSelectedModel(null); // Al estar nulo, el modal sabe que es un registro nuevo
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (model: Models3dItem) => {
    setSelectedModel(model); // Al pasarle datos, el modal sabe que va a editar
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: Models3dItem) => {
    if (selectedModel) {
      // Si estábamos editando, ejecutamos el update usando el título viejo como ID
      updateModel({ title: selectedModel.title, updatedItem: data });
    } else {
      // Si no, es una creación limpia
      createModel(data);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Modelos 3D Disponibles</h1>
          <p className="text-sm text-slate-500">Administración de assets y métricas agrícolas en memoria local</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 shadow-sm transition-colors"
        >
          + Añadir Objeto 3D
        </button>
      </div>

      {/* Controlamos el renderizado asíncrono */}
      {isLoading ? (
        <ModelSkeleton />
      ) : (
        <ModelGrid 
          models={models} 
          onEditClick={handleOpenEditModal}
          onDeleteClick={deleteModel} 
        />
      )}

      {/* Modal único reutilizable */}
      <ModelFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        modelToEdit={selectedModel}
      />
    </div>
  );
}