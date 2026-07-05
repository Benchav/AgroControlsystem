import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Parcel } from '../entities/parcel_model';
import { initialParcels } from '../data/parcels';
// 1. Importa tu servicio de telemetría (ajusta la ruta según tu estructura)
import { fetchRealLocationTelemetry } from '../services/telemetryService'; 

let parcelsDb: Parcel[] = [...initialParcels];

const PARCELS_QUERY_KEY = ['parcels'];

export const useParcels = () => {
  const queryClient = useQueryClient();

  // 2. OBTENER TODAS LAS PARCELAS (Ahora enriquecidas con telemetría en tiempo real)
  const parcelsQuery = useQuery({
    queryKey: PARCELS_QUERY_KEY,
    queryFn: async (): Promise<Parcel[]> => {
      await new Promise((resolve) => setTimeout(resolve, 150)); // Simular retraso de red base
      
      // Recorremos todas las parcelas y consultamos la API meteorológica en paralelo
      const enrichedParcels = await Promise.all(
        parcelsDb.map(async (parcel) => {
          try {
            // Extraemos latitud y longitud de forma segura desde el 'center' (LatLngExpression)
            let lat = 0;
            let lon = 0;

            if (Array.isArray(parcel.center)) {
              lat = parcel.center[0];
              lon = parcel.center[1];
            } else if (parcel.center && typeof parcel.center === 'object') {
              lat = (parcel.center as any).lat ?? 0;
              lon = (parcel.center as any).lng ?? (parcel.center as any).lon ?? 0;
            }

            // Si la parcela no tiene coordenadas válidas asignadas, devolvemos los datos por defecto
            if (lat === 0 && lon === 0) return parcel;

            // Invocamos tu servicio externo enviándole las coordenadas de la parcela actual
            const telemetry = await fetchRealLocationTelemetry(lat, lon);

            // Formateamos los strings para que coincidan con los tipos de datos de tu interfaz 'Parcel'
            return {
              ...parcel,
              temperature: `${telemetry.temperature.toFixed(1)}°C`,
              humidity: `${telemetry.humidity}%`,
              // Opcional: Puedes ir alimentando de manera dinámica el histórico del suelo
              soilHistory: parcel.soilHistory 
                ? [
                    ...parcel.soilHistory,
                    {
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      humidity: telemetry.soilMoisture,
                      fertility: parseInt(parcel.fertility) || 75 // Convierte tu string de fertilidad a número de respaldo
                    }
                  ]
                : [{ time: "Actual", humidity: telemetry.soilMoisture, fertility: 75 }]
            };
          } catch (error) {
            console.error(`Error obteniendo telemetría satelital para la parcela "${parcel.name}":`, error);
            return parcel; // En caso de error en una parcela, retorna sus datos locales sin tumbar la app
          }
        })
      );

      return enrichedParcels;
    },
    // CONFIGURACIÓN DE RENDIMIENTO IMPORTANTE PARA TELEMETRÍA:
    staleTime: 1000 * 60 * 5, // Los datos se consideran "frescos" por 5 minutos. Evita spamear la API en cada re-render.
    refetchInterval: 1000 * 60 * 10, // Auto-refresca los datos satelitales en segundo plano cada 10 minutos.
  });

  // 3. CREATE
  const createParcelMutation = useMutation({
    mutationFn: async (newParcel: Parcel) => {
      parcelsDb.push(newParcel);
      return newParcel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARCELS_QUERY_KEY });
    },
  });

  // 4. UPDATE
  const updateParcelMutation = useMutation({
    mutationFn: async ({ id, updatedParcel }: { id: string; updatedParcel: Parcel }) => {
      parcelsDb = parcelsDb.map((p) => (p.id === id ? updatedParcel : p));
      return updatedParcel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARCELS_QUERY_KEY });
    },
  });

  // 5. DELETE
  const deleteParcelMutation = useMutation({
    mutationFn: async (id: string) => {
      parcelsDb = parcelsDb.filter((p) => p.id !== id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARCELS_QUERY_KEY });
    },
  });

  // 6. RELACIONAR / ASIGNAR CULTIVO (Model3D) A PARCELA
  const assignCropMutation = useMutation({
    mutationFn: async ({ parcelId, cropTitle }: { parcelId: string; cropTitle: string | undefined }) => {
      parcelsDb = parcelsDb.map((p) => 
        p.id === parcelId 
          ? { ...p, cropId: cropTitle, sowingDate: cropTitle ? new Date() : undefined } 
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