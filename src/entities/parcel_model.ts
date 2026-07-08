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
  historicalData?: HistoricalPoint[]; //historial de datos históricos de telemetría
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

export type HistoricalPoint = {
  date: string;         // Ej: "2026-05-20"
  temperature: number;  // Temperatura promedio de ese día
  humidity: number;     // Humedad promedio de ese día
  fertility: number;    // Fertilidad estimada real para ese día
}