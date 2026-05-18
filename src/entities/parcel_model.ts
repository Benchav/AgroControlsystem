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
};

export type ParcelStatus = "optimo" | "atencion" | "critico";