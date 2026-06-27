import React, { useState, useEffect, useRef } from 'react';
import { Models3dItem } from '../../entities/3d_object_model';
import { Parcel } from '../../entities/parcel_model';
import { generateId } from '../../utils/uuid';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Models3dItem) => void;
  modelToEdit?: Models3dItem | null;
  availableParcels: Parcel[];
};

export function ModelFormModal({ isOpen, onClose, onSubmit, modelToEdit, availableParcels = [] }: Props) {
  const [formData, setFormData] = useState<Models3dItem>({
    title: '', author: '', modelPath: '', nutritionalInfo: '',
    growthPeriod: '', waterRequirements: '', recommendedFertilizers: '',
    commonDiseases: '', parcels: [], estimatedProduction: '', currentPrice: 0,
    id: generateId(),
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modelToEdit) {
      setFormData(modelToEdit);
    } else {
      setFormData({
        title: '', author: '', modelPath: '', nutritionalInfo: '',
        growthPeriod: '', waterRequirements: '', recommendedFertilizers: '',
        commonDiseases: '', parcels: [], estimatedProduction: '', currentPrice: 0,
        id: generateId(),
      });
    }
    setIsDropdownOpen(false);
  }, [modelToEdit, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'currentPrice' ? Number(value) : value,
    }));
  };

  const toggleParcelSelection = (parcel: Parcel) => {
    setFormData((prev) => {
      const currentParcels = prev.parcels ?? [];
      
      // buscamos por nombre, ID de la parcela o coincidencia con cultivo
      const isSelected = currentParcels.some(
        (p) => p === parcel.name || p === parcel.id || String(parcel.cropId) === String(prev.id)
      );

      let updatedParcels: string[];
      if (isSelected) {
        //remover parcela
        updatedParcels = currentParcels.filter((p) => p !== parcel.name && p !== parcel.id);
      } else {
        updatedParcels = [...currentParcels, parcel.name];
      }

      return { ...prev, parcels: updatedParcels };
    });
  };

  const isParcelChecked = (parcel: Parcel) => {
    const currentParcels = formData.parcels ?? [];
    return (
      currentParcels.includes(parcel.name) || 
      currentParcels.includes(parcel.id) || 
      (parcel.cropId && modelToEdit && String(parcel.cropId) === String(modelToEdit.id))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="border-white/10 bg-[#071510] rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[92vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">
          {modelToEdit ? 'Editar Modelo 3D' : 'Añadir Nuevo Modelo 3D'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white">Título</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm focus:outline-emerald-500 disabled:bg-black text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Autor</label>
              <input required name="author" value={formData.author} onChange={handleChange} className="mt-1 block w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm focus:outline-emerald-500 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white">Ruta del Archivo (.glb)</label>
              <input required name="modelPath" value={formData.modelPath} onChange={handleChange} placeholder="/3d-objects/objeto.glb" className="mt-1 block w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm focus:outline-emerald-500 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Precio Actual</label>
              <input type="number" required name="currentPrice" value={formData.currentPrice} onChange={handleChange} className="mt-1 block w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm focus:outline-emerald-500 text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white">Información Nutricional / Dispositivo</label>
            <textarea name="nutritionalInfo" value={formData.nutritionalInfo} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm focus:outline-emerald-500 text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white">Periodo de Crecimiento / Vida útil</label>
              <input name="growthPeriod" value={formData.growthPeriod} onChange={handleChange} className="mt-1 block w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm focus:outline-emerald-500 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Requerimientos de Agua</label>
              <input name="waterRequirements" value={formData.waterRequirements} onChange={handleChange} className="mt-1 block w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm focus:outline-emerald-500 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white">Fertilizantes Recomendados</label>
              <input name="recommendedFertilizers" value={formData.recommendedFertilizers} onChange={handleChange} className="mt-1 block w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm focus:outline-emerald-500 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Enfermedades Comunes</label>
              <input name="commonDiseases" value={formData.commonDiseases} onChange={handleChange} className="mt-1 block w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm focus:outline-emerald-500 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-white mb-1">
                Asociar Parcelas
              </label>
              
              {/* Dropdown */}
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-left cursor-pointer focus-within:outline-emerald-500 min-h-[38px]"
              >
                <span className="truncate text-slate-300 max-w-[200px]">
                  {formData.parcels && formData.parcels.length > 0
                    ? `${formData.parcels.length} sel. (${formData.parcels.slice(0, 2).join(', ')}${formData.parcels.length > 2 ? '...' : ''})`
                    : 'Seleccionar parcelas...'}
                </span>
                <span className="text-xs text-slate-400 ml-2 transition-transform duration-200">
                  {isDropdownOpen ? '▲' : '▼'}
                </span>
              </div>

              {/* Menú Desplegable con Scroll Interno Absoluto */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 bottom-full mb-1 z-50 rounded-lg border border-white/10 bg-[#0c221a] shadow-xl max-h-[220px] overflow-y-auto p-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  {availableParcels.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500 italic text-center">No hay parcelas creadas</div>
                  ) : (
                    availableParcels.map((parcel) => {
                      const active = isParcelChecked(parcel);
                      return (
                        <div
                          key={parcel.id}
                          onClick={() => toggleParcelSelection(parcel)}
                          className={`flex items-center justify-between px-3 py-2 text-xs rounded-md cursor-pointer transition-colors ${
                            active 
                              ? 'bg-emerald-600/30 text-emerald-300 font-medium' 
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <span className="truncate">{parcel.name}</span>
                          <div className={`w-4 h-4 rounded flex items-center justify-center border text-[9px] transition-all ${
                            active 
                              ? 'bg-emerald-500 border-emerald-400 text-white' 
                              : 'border-white/20'
                          }`}>
                            {active && '✓'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white">Producción Estimada</label>
              <input name="estimatedProduction" value={formData.estimatedProduction} onChange={handleChange} className="mt-1 block w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm focus:outline-emerald-500 text-white" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-2 font-semibold text-slate-300 hover:bg-white/10">
              Cancelar
            </button>
            <button type="submit" className="flex-1 rounded-2xl bg-emerald-500 py-2 font-semibold text-white hover:bg-emerald-400">
              {modelToEdit ? 'Guardar Cambios' : 'Crear Modelo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}