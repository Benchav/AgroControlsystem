import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MarketItem } from "../entities/market_model";
import { mockMarketItems as initialData } from "../data/market_data";

let memoryDb: MarketItem[] = initialData.map((item) => ({
  ...item,
  id: item.id || crypto.randomUUID(),
}));

const QUERY_KEY = ["marketItems"];

export const useMarket = () => {
  const queryClient = useQueryClient();

  //  Get All
  const marketQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<MarketItem[]> => {
      // Pequeña simulación de retraso de red
      await new Promise((resolve) => setTimeout(resolve, 200));
      return [...memoryDb];
    },
  });

  // Create
  const createMutation = useMutation({
    mutationFn: async (newItem: Omit<MarketItem, "id"> & { id?: string }) => {
      const itemWithId: MarketItem = {
        ...newItem,
        id: newItem.id || crypto.randomUUID(),
      };

      // Lo agregamos al inicio de la lista para que quede de primero
      memoryDb = [itemWithId, ...memoryDb];
      return itemWithId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updatedItem,
    }: {
      id: string;
      updatedItem: MarketItem;
    }) => {
      memoryDb = memoryDb.map((item) => (item.id === id ? updatedItem : item));
      return updatedItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // Delete
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
    items: marketQuery.data || [],
    isLoading: marketQuery.isLoading,
    isError: marketQuery.isError,

    createItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    deleteItem: deleteMutation.mutate,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
