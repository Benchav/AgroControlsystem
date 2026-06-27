import type { LatLngExpression } from "leaflet";

export type Parcel = {
  id: string;
  name: string;
  area: string;
  status: string;
  statusTone: ParcelStatus; //rojo, verde o amarillo
  humidity: string;
  fertility: string;
  temperature: string;
  bounds: LatLngExpression[]; //coordenadas
  center: LatLngExpression; //punto centrico
  soilHistory?: SoilHistoryPoint[]; //historial del suelo
  cropId?:string; //tipo de cultivo
  sowingDate?:Date; //fecha de siembra
  expectedProduction?:string; //produccion esperada
};

export type ParcelStatus = "optimo" | "atencion" | "critico";

// Funcion para mantener el histórico:
export interface SoilHistoryPoint {
  time: string;       // Ejemplo: "10:00", "11:00" o "Día 1"
  humidity: number;
  fertility: number;
}