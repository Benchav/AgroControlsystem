// src/hooks/useModels3d.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Models3dItem } from '../entities/3d_object_model';
import { models3d as initialData } from '../config/models3d'; 
import { generateId } from '../utils/uuid';

// Inicializamos la base de datos asegurándonos de que cada elemento tenga un ID
let memoryDb: Models3dItem[] = initialData.map((item) => ({
  ...item,
  id: item.id || generateId(), // Usa el id existente o genera uno si no lo tiene
}));

const QUERY_KEY = ['models3d'];

export const useModels3d = () => {
  const queryClient = useQueryClient();

  // 1. Get All
  const modelsQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<Models3dItem[]> => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return [...memoryDb];
    },
  });

  // 2. Create
  const createMutation = useMutation({
    mutationFn: async (newItem: Omit<Models3dItem, 'id'> & { id?: string }) => {
      // Si el elemento no viene con ID, se lo inyectamos aquí de forma segura
      const modelWithId: Models3dItem = {
        ...newItem,
        id: newItem.id || generateId(),
      };
      
      memoryDb.push(modelWithId);
      return modelWithId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // 3. Update (Ahora busca por id)
  const updateMutation = useMutation({
    mutationFn: async ({ id, updatedItem }: { id: string; updatedItem: Models3dItem }) => {
      memoryDb = memoryDb.map((item) => (item.id === id ? updatedItem : item));
      return updatedItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // 4. Delete (Ahora filtra por id)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      memoryDb = memoryDb.filter((item) => item.id !== id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    models: modelsQuery.data || [],
    isLoading: modelsQuery.isLoading,
    isError: modelsQuery.isError,
    createModel: createMutation.mutate,
    updateModel: updateMutation.mutate,
    deleteModel: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};