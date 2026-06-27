import React, { useState, useEffect } from 'react';
import { Models3dItem } from '../../entities/3d_object_model';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Models3dItem) => void;
  modelToEdit?: Models3dItem | null;
};

export function ModelFormModal({ isOpen, onClose, onSubmit, modelToEdit }: Props) {
  const [formData, setFormData] = useState<Models3dItem>({
    title: '', author: '', modelPath: '', nutritionalInfo: '',
    growthPeriod: '', waterRequirements: '', recommendedFertilizers: '',
    commonDiseases: '', parcels: [], estimatedProduction: '', currentPrice: 0,
  });

  useEffect(() => {
    if (modelToEdit) {
      setFormData(modelToEdit);
    } else {
      setFormData({
        title: '', author: '', modelPath: '', nutritionalInfo: '',
        growthPeriod: '', waterRequirements: '', recommendedFertilizers: '',
        commonDiseases: '', parcels: [], estimatedProduction: '', currentPrice: 0,
      });
    }
  }, [modelToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'currentPrice' ? Number(value) : value,
    }));
  };

  const handleParcelsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      parcels: e.target.value.split(',').map((p) => p.trim()).filter(Boolean),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-slate-800 mb-4">
          {modelToEdit ? 'Editar Modelo 3D' : 'Añadir Nuevo Modelo 3D'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Título</label>
              <input required name="title" value={formData.title} onChange={handleChange} disabled={!!modelToEdit} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-emerald-500 disabled:bg-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Autor</label>
              <input required name="author" value={formData.author} onChange={handleChange} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-emerald-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Ruta del Archivo (.glb)</label>
              <input required name="modelPath" value={formData.modelPath} onChange={handleChange} placeholder="/3d-objects/objeto.glb" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Precio Actual</label>
              <input type="number" required name="currentPrice" value={formData.currentPrice} onChange={handleChange} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-emerald-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Información Nutricional / Dispositivo</label>
            <textarea name="nutritionalInfo" value={formData.nutritionalInfo} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-emerald-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Periodo de Crecimiento / Vida útil</label>
              <input name="growthPeriod" value={formData.growthPeriod} onChange={handleChange} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Requerimientos de Agua</label>
              <input name="waterRequirements" value={formData.waterRequirements} onChange={handleChange} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-emerald-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Fertilizantes Recomendados</label>
              <input name="recommendedFertilizers" value={formData.recommendedFertilizers} onChange={handleChange} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Enfermedades Comunes</label>
              <input name="commonDiseases" value={formData.commonDiseases} onChange={handleChange} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-emerald-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Parcelas (separadas por comas)</label>
              <input name="parcels" value={(formData.parcels ?? []).join(', ')} onChange={handleParcelsChange} placeholder="Parcela A, Parcela B" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Producción Estimada</label>
              <input name="estimatedProduction" value={formData.estimatedProduction} onChange={handleChange} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-emerald-500" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700">
              {modelToEdit ? 'Guardar Cambios' : 'Crear Modelo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}