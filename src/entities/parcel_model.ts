import type { LatLngExpression } from "leaflet";

export type Parcel = {
  id: string;
  name: string;
  area: string;
  status: string;
  statusTone: ParcelStatus;
  humidity: string;
  fertility: string;
  temperature: string;
  bounds: LatLngExpression[];
  center: LatLngExpression;
  soilHistory?: SoilHistoryPoint[];
};

export type ParcelStatus = "optimo" | "atencion" | "critico";

// Funcion para mantener el histórico:
export interface SoilHistoryPoint {
  time: string;       // Ejemplo: "10:00", "11:00" o "Día 1"
  humidity: number;
  fertility: number;
}