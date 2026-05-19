import { LatLngBoundsExpression } from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { initialParcels } from "../data/parcels";

export function FitBounds() {
  const map = useMap();

  useEffect(() => {
    const bounds: LatLngBoundsExpression = initialParcels.flatMap(
      (parcel) => parcel.bounds,
    ) as LatLngBoundsExpression;

    map.fitBounds(bounds, { padding: [24, 24] });
  }, [map]);

  return null;
}
