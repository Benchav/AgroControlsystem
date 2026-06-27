// src/hooks/useParcels.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Parcel } from '../entities/parcel_model';
import { initialParcels } from '../data/parcels';

let parcelsDb: Parcel[] = [...initialParcels];

const PARCELS_QUERY_KEY = ['parcels'];

export const useParcels = () => {
  const queryClient = useQueryClient();

  // 1. GET ALL
  const parcelsQuery = useQuery({
    queryKey: PARCELS_QUERY_KEY,
    queryFn: async (): Promise<Parcel[]> => {
      await new Promise((resolve) => setTimeout(resolve, 150)); // Simular retraso
      return [...parcelsDb];
    },
  });

  // 2. CREATE
  const createParcelMutation = useMutation({
    mutationFn: async (newParcel: Parcel) => {
      parcelsDb.push(newParcel);
      return newParcel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARCELS_QUERY_KEY });
    },
  });

  // 3. UPDATE
  const updateParcelMutation = useMutation({
    mutationFn: async ({ id, updatedParcel }: { id: string; updatedParcel: Parcel }) => {
      parcelsDb = parcelsDb.map((p) => (p.id === id ? updatedParcel : p));
      return updatedParcel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARCELS_QUERY_KEY });
    },
  });

  // 4. DELETE
  const deleteParcelMutation = useMutation({
    mutationFn: async (id: string) => {
      parcelsDb = parcelsDb.filter((p) => p.id !== id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARCELS_QUERY_KEY });
    },
  });

  // 5. RELACIONAR / ASIGNAR CULTIVO (Model3D) A PARCELA
  const assignCropMutation = useMutation({
    mutationFn: async ({ parcelId, cropTitle }: { parcelId: string; cropTitle: string | undefined }) => {
      parcelsDb = parcelsDb.map((p) => 
        p.id === parcelId 
          ? { ...p, crop: cropTitle, sowingDate: cropTitle ? new Date() : undefined } 
          : p
      );
      return { parcelId, cropTitle };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARCELS_QUERY_KEY });
    },
  });

  return {
    parcels: parcelsQuery.data || [],
    isLoading: parcelsQuery.isLoading,
    isError: parcelsQuery.isError,
    createParcel: createParcelMutation.mutate,
    updateParcel: updateParcelMutation.mutate,
    deleteParcel: deleteParcelMutation.mutate,
    assignCrop: assignCropMutation.mutate,
    isAssigningCrop: assignCropMutation.isPending,
  };
};