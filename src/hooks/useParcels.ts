import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Parcel } from "../entities/parcel_model";
import { initialParcels } from "../data/parcels";
import {
  fetchParcel50DaysHistory,
  fetchRealLocationTelemetry,
} from "../services/telemetryService";

let parcelsDb: Parcel[] = [...initialParcels];

const PARCELS_QUERY_KEY = ["parcels"];

// Función auxiliar para estimar fertilidad dinámica en base a humedad y cultivo
const calculateEstimatedFertility = (
  baseFertilityString: string,
  currentMoisture: number,
  hasCrop: boolean,
): number => {
  // Limpiamos el string (ej: "85%" -> 85)
  const baseFertility = parseInt(baseFertilityString) || 70;

  let modifier = 0;

  // Penalización si el suelo está extremadamente seco o saturado
  if (currentMoisture < 20) modifier -= 15;
  else if (currentMoisture > 85) modifier -= 10;
  else modifier += 5; // Estado de humedad óptimo mejora la actividad microbiana es decir fertilidad efectiva

  // Si hay un cultivo sembrado, consume un extra de nutrientes de forma constante
  if (hasCrop) modifier -= 4;

  // Asegurar que el resultado se mantenga en el rango de porcentaje (0 - 100)
  return Math.min(100, Math.max(0, baseFertility + modifier));
};

export const useParcels = () => {
  const queryClient = useQueryClient();

  // OBTENER TODAS LAS PARCELAS
  const parcelsQuery = useQuery({
    queryKey: PARCELS_QUERY_KEY,
    queryFn: async (): Promise<Parcel[]> => {
      await new Promise((resolve) => setTimeout(resolve, 150));

      return await Promise.all(
        parcelsDb.map(async (parcel) => {
          try {
            let lat = 0;
            let lon = 0;
            if (Array.isArray(parcel.center)) {
              lat = parcel.center[0];
              lon = parcel.center[1];
            } else if (parcel.center && typeof parcel.center === "object") {
              lat = (parcel.center as any).lat ?? 0;
              lon =
                (parcel.center as any).lng ?? (parcel.center as any).lon ?? 0;
            }

            if (lat === 0 && lon === 0) return parcel;

            // LANZAMOS EN PARALELO: Telemetría actual + Histórico de los últimos 50 días reales
            const [telemetry, historicalData] = await Promise.all([
              fetchRealLocationTelemetry(lat, lon),
              fetchParcel50DaysHistory(
                lat,
                lon,
                parcel.fertility,
                !!parcel.cropId,
              ),
            ]);

            const estimatedFertilityValue = calculateEstimatedFertility(
              parcel.fertility,
              telemetry.soilMoisture,
              !!parcel.cropId,
            );

            const currentTime = new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return {
              ...parcel,
              temperature: `${telemetry.temperature.toFixed(1)}°C`,
              humidity: `${telemetry.humidity}%`,
              fertility: `${estimatedFertilityValue}%`,
              historicalData, // <-- Guardamos los 50 días reales aquí
              soilHistory: parcel.soilHistory
                ? [
                    ...parcel.soilHistory,
                    {
                      time: currentTime,
                      humidity: telemetry.soilMoisture,
                      fertility: estimatedFertilityValue,
                    },
                  ]
                : [
                    {
                      time: "Actual",
                      humidity: telemetry.soilMoisture,
                      fertility: estimatedFertilityValue,
                    },
                  ],
            };
          } catch (error) {
            console.error(`Error procesando parcela "${parcel.name}":`, error);
            return parcel;
          }
        }),
      );
    },
    staleTime: 1000 * 60 * 15, // Al descargar históricos pesados, subimos la caché a 15 min
  });

  //  CREATE
  const createParcelMutation = useMutation({
    mutationFn: async (newParcel: Parcel) => {
      parcelsDb.push(newParcel);
      return newParcel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARCELS_QUERY_KEY });
    },
  });

  // UPDATE
  const updateParcelMutation = useMutation({
    mutationFn: async ({
      id,
      updatedParcel,
    }: {
      id: string;
      updatedParcel: Parcel;
    }) => {
      parcelsDb = parcelsDb.map((p) => (p.id === id ? updatedParcel : p));
      return updatedParcel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARCELS_QUERY_KEY });
    },
  });

  //  DELETE
  const deleteParcelMutation = useMutation({
    mutationFn: async (id: string) => {
      parcelsDb = parcelsDb.filter((p) => p.id !== id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARCELS_QUERY_KEY });
    },
  });

  // RELACIONAR / ASIGNAR CULTIVO A PARCELA
  const assignCropMutation = useMutation({
    mutationFn: async ({
      parcelId,
      cropTitle,
    }: {
      parcelId: string;
      cropTitle: string | undefined;
    }) => {
      parcelsDb = parcelsDb.map((p) =>
        p.id === parcelId
          ? {
              ...p,
              cropId: cropTitle,
              sowingDate: cropTitle ? new Date() : undefined,
            }
          : p,
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
