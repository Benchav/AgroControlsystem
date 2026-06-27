// src/hooks/useModels3d.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Models3dItem } from '../entities/3d_object_model';
import { models3d as initialData } from '../config/models3d'; 


let memoryDb: Models3dItem[] = [...initialData];

// Clave de models3d
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
    mutationFn: async (newItem: Models3dItem) => {
      memoryDb.push(newItem);
      return newItem;
    },
    onSuccess: () => {
      // Invalidar caché para forzar el refresco visual en la app
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // 3. Update
  const updateMutation = useMutation({
    mutationFn: async ({ title, updatedItem }: { title: string; updatedItem: Models3dItem }) => {
      memoryDb = memoryDb.map((item) => (item.title === title ? updatedItem : item));
      return updatedItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // 4. Delete
  const deleteMutation = useMutation({
    mutationFn: async (title: string) => {
      memoryDb = memoryDb.filter((item) => item.title !== title);
      return title;
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