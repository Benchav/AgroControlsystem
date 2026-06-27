import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Polygon,
  Popup,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import type { Parcel, ParcelStatus } from "../../entities/parcel_model";
import { initialParcels } from "../../data/parcels";
import { FitBounds } from "../../utils/fitBounds";
import { SoilMetricsPanel } from "../../utils/soil_metrics_panel";
import { useModels3d } from "../../hooks/useModels3d";
import * as turf from "@turf/turf";

const mapCenter: [number, number] = [14.0711, -87.1989];

export function FarmInteractiveMap({
  dynamicParcels,
  setDynamicParcels,
  selectedParcelId,
  setSelectedParcelId,
}: {
  dynamicParcels: Parcel[];
  setDynamicParcels: React.Dispatch<React.SetStateAction<Parcel[]>>;
  selectedParcelId: string;
  setSelectedParcelId: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingParcel, setEditingParcel] = useState<Parcel | null>(initialParcels[0]);
  const { models: crops } = useModels3d();

  const selectedParcel = useMemo(
    () =>
      dynamicParcels.find((parcel) => parcel.id === selectedParcelId) ??
      dynamicParcels[0],
    [selectedParcelId, dynamicParcels],
  );

  const updateParcel = (field: keyof Parcel | string, value: any) => {
    if (!editingParcel) return;

    let updatedParcel: Parcel = {
      ...editingParcel,
      [field]: value,
    };

    if (field === "humidity") {
      const humidityValue = Number(value.replace("%", ""));
      updatedParcel = {
        ...updatedParcel,
        soilHistory: (updatedParcel.soilHistory || []).map((item, index, array) =>
          index === array.length - 1 ? { ...item, humidity: humidityValue } : item,
        ),
      };
    }

    if (field === "fertility") {
      const fertilityValue = Number(value.replace("%", ""));
      updatedParcel = {
        ...updatedParcel,
        soilHistory: (updatedParcel.soilHistory || []).map((item, index, array) =>
          index === array.length - 1 ? { ...item, fertility: fertilityValue } : item,
        ),
      };
    }

    setEditingParcel(updatedParcel);

    setDynamicParcels((prev) =>
      prev.map((parcel) =>
        parcel.id === updatedParcel.id ? updatedParcel : parcel,
      ),
    );
  };

  const handleDeleteParcel = () => {
    if (!editingParcel) return;

    const remainingParcels = dynamicParcels.filter((p) => p.id !== editingParcel.id);
    setDynamicParcels(remainingParcels);

    if (remainingParcels.length > 0) {
      setSelectedParcelId(remainingParcels[0].id);
    } else {
      setSelectedParcelId("");
    }

    setIsEditorOpen(false);
  };

  useEffect(() => {
    const currentParcel = dynamicParcels.find(
      (parcel) => parcel.id === selectedParcelId,
    );
    if (currentParcel) {
      setEditingParcel(currentParcel);
    }
  }, [selectedParcelId, dynamicParcels]);

  // Utilidad para formatear la fecha a un string YYYY-MM-DD aceptado por el input date
  const formatDateForInput = (dateValue: any) => {
    if (!dateValue) return "";
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr] overflow-hidden">
      <div className="overflow-hidden rounded-[14px] border border-white/8 bg-white/[0.03]">
        <div className="mb-4 flex items-center justify-between gap-3 p-4 backdrop-blur">
          <div>
            <div className="text-lg font-semibold text-white">
              Mapa interactivo del terreno
            </div>
            <div className="text-sm text-slate-400">
              Pan, zoom, click por parcela y lectura en vivo
            </div>
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            OSM · Live
          </div>
        </div>

        <div className="h-full overflow-hidden border border-white/8">
          <MapContainer
            center={mapCenter}
            zoom={16}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds />

            {dynamicParcels.map((parcel) => {
              const tone =
                parcel.statusTone === "critico"
                  ? "red"
                  : parcel.statusTone === "atencion"
                    ? "amber"
                    : "emerald";
              const isSelected = selectedParcelId === parcel.id;

              return (
                <Polygon
                  key={parcel.id}
                  positions={parcel.bounds}
                  pathOptions={{
                    color: tone === "red" ? "#f87171" : tone === "amber" ? "#fbbf24" : "#34d399",
                    weight: isSelected ? 3 : 2,
                    fillColor: tone === "red" ? "#ef4444" : tone === "amber" ? "#f59e0b" : "#10b981",
                    fillOpacity: isSelected ? 0.28 : 0.18,
                  }}
                  eventHandlers={{
                    click: () => {
                      setSelectedParcelId(parcel.id);
                    },
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                    {parcel.name}
                  </Tooltip>
                </Polygon>
              );
            })}

            {dynamicParcels.map((parcel) => (
              <CircleMarker
                key={`${parcel.id}-center`}
                center={parcel.center}
                radius={selectedParcelId === parcel.id ? 7 : 5}
                pathOptions={{
                  color: selectedParcelId === parcel.id ? "#ffffff" : "#0f172a",
                  weight: 2,
                  fillColor:
                    selectedParcelId === parcel.id
                      ? "#22c55e"
                      : parcel.statusTone === "critico"
                        ? "#ef4444"
                        : parcel.statusTone === "atencion"
                          ? "#f59e0b"
                          : "#10b981",
                  fillOpacity: 0.95,
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedParcelId(parcel.id);
                    setEditingParcel(parcel);
                  },
                }}
              />
            ))}

            <FeatureGroup>
              <EditControl
                position="topright"
                onCreated={(e) => {
                  const layer = e.layer;
                  if ("getLatLngs" in layer) {
                    // Leaflet Draw puede devolver arrays anidados dependiendo de la figura
                    const rawLatLngs = layer.getLatLngs()[0];
                    const latlngs = (Array.isArray(rawLatLngs) ? rawLatLngs : layer.getLatLngs()) as any[];

                    // --- CÁLCULO DE ÁREA CON TURF ---
                    // Turf requiere coordenadas en [Lng, Lat] y que el primer punto se repita al final
                    const coordinates = latlngs.map((pt: any) => [pt.lng, pt.lat]);
                    coordinates.push([latlngs[0].lng, latlngs[0].lat]);

                    const polygonGeoJSON = turf.polygon([coordinates]);
                    const areaInSquareMeters = turf.area(polygonGeoJSON);
                    
                    // Convertimos metros cuadrados a Hectáreas (1 ha = 10,000 m²)
                    const areaInHectares = areaInSquareMeters / 10000;
                    // Lo dejamos formateado con 2 decimales (ej: "3.45 ha")
                    const formattedArea = `${areaInHectares.toFixed(2)} ha`;

                    const newParcel: Parcel = {
                      id: `parcel-${Date.now()}`,
                      name: `Nueva Parcela`,
                      area: formattedArea, // Aquí insertamos el área real calculada
                      status: "Óptimo",
                      statusTone: "optimo",
                      humidity: "--",
                      fertility: "--",
                      temperature: "--",
                      bounds: latlngs,
                      center: latlngs[0],
                      soilHistory: [{ time: "0", humidity: 0, fertility: 0 }],
                    };

                    setDynamicParcels((prev) => [...prev, newParcel]);
                    setSelectedParcelId(newParcel.id);
                    setEditingParcel(newParcel);
                  }
                }}
                draw={{
                  rectangle: true,
                  polygon: true,
                  circle: false,
                  polyline: false,
                  marker: false,
                  circlemarker: false,
                }}
              />
            </FeatureGroup>
          </MapContainer>
        </div>
      </div>

      <div className="space-y-4 backdrop-blur bg-emerald-500/10">
        <div className="rounded-[14px] border border-white/8 bg-white/[0.03] p-5">
          <div className="text-sm font-semibold text-white">Parcela seleccionada</div>
          <div className="mt-3 text-2xl font-black tracking-tight text-emerald-300">
            {selectedParcel?.name || "Ninguna seleccionada"}
          </div>

          {selectedParcel && (
            <>
              <div className="mt-2 text-sm text-slate-400">
                {selectedParcel.area} · Última lectura hace 2 min
              </div>

              <div className="mt-4 grid gap-3 grid-cols-2">
                {[
                  ["Humedad", selectedParcel.humidity],
                  ["Fertilidad", selectedParcel.fertility],
                  ["Temperatura", selectedParcel.temperature],
                  ["Estado", selectedParcel.status],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[10px] border border-white/8 bg-black/50 p-4">
                    <div className="text-xs uppercase tracking-[0.25em] text-white/80">{label}</div>
                    <div className="mt-2 text-xl font-semibold text-white">{value}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setEditingParcel(selectedParcel);
                  setIsEditorOpen(true);
                }}
                className="rounded-xl bg-emerald-500/60 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 mt-4 w-full h-[2.5rem]"
              >
                Editar Parcela
              </button>
            </>
          )}
        </div>

        {selectedParcel && <SoilMetricsPanel selectedParcel={selectedParcel} />}
      </div>

      {/* MODAL: EDITAR / ELIMINAR */}
      {isEditorOpen && editingParcel && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#071510] p-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-emerald-300">Gestionar:</h2>
                <h2 className="text-2xl font-bold text-white/80">{editingParcel.name}</h2>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="rounded-full bg-white/5 px-3 py-1 text-slate-300 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Nombre:</label>
                <input
                  type="text"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:outline-emerald-500"
                  value={editingParcel.name}
                  onChange={(e) => updateParcel("name", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Área:</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-14 py-3 text-white focus:outline-emerald-500"
                    value={editingParcel.area.replace(" ha", "")}
                    onChange={(e) => updateParcel("area", `${e.target.value} ha`)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">ha</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Humedad:</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-14 py-3 text-white focus:outline-emerald-500"
                    value={editingParcel.humidity.replace("%", "")}
                    onChange={(e) => updateParcel("humidity", `${e.target.value}%`)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Fertilidad:</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-14 py-3 text-white focus:outline-emerald-500"
                    value={editingParcel.fertility.replace("%", "")}
                    onChange={(e) => updateParcel("fertility", `${e.target.value}%`)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Temperatura:</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-14 py-3 text-white focus:outline-emerald-500"
                    value={editingParcel.temperature.replace("°C", "")}
                    onChange={(e) => updateParcel("temperature", `${e.target.value}°C`)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">°C</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Estado Visual:</label>
                <select
                  className="w-full rounded-xl border border-white/10 bg-[#0b1814] px-4 py-3 text-white focus:outline-emerald-500"
                  value={editingParcel.statusTone}
                  onChange={(e) => {
                    const tone = e.target.value as ParcelStatus;
                    updateParcel("statusTone", tone);
                    updateParcel("status", tone === "critico" ? "Crítico" : tone === "atencion" ? "Atención" : "Óptimo");
                  }}
                >
                  <option value="optimo">🟢 Óptimo</option>
                  <option value="atencion">🟡 Atención</option>
                  <option value="critico">🔴 Crítico</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Fecha de Siembra:</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:outline-emerald-500 [color-scheme:dark]"
                  value={formatDateForInput((editingParcel as any).sowingDate)}
                  onChange={(e) => {
                    const dateVal = e.target.value ? new Date(e.target.value) : undefined;
                    updateParcel("sowingDate", dateVal);
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Producción Esperada:</label>
                <input
                  type="text"
                  placeholder="Ej: 5 toneladas, 500kg"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white focus:outline-emerald-500"
                  value={(editingParcel as any).expectedProduction || ""}
                  onChange={(e) => updateParcel("expectedProduction", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-300">Modelo 3D / Cultivo Asociado:</label>
                <select
                  className="w-full rounded-xl border border-white/10 bg-[#0b1814] px-4 py-3 text-white focus:outline-emerald-500"
                  value={(editingParcel as any).cropId || ""}
                  onChange={(e) => updateParcel("cropId", e.target.value)}
                >
                  <option value="">Ninguno / Sin asignar</option>
                  {crops.map((crop) => (
                    <option key={crop.id || crop.title} value={crop.id || crop.title}>
                      {crop.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
              <button
                onClick={() => {
                  if (confirm(`¿Estás seguro de que quieres eliminar la parcela "${editingParcel.name}"?`)) {
                    handleDeleteParcel();
                  }
                }}
                className="rounded-2xl bg-red-600/20 border border-red-500/30 px-6 py-3 font-semibold text-red-400 hover:bg-red-600 hover:text-white transition-colors order-3 sm:order-1"
              >
                Eliminar Parcela
              </button>

              <div className="flex gap-4 flex-1 sm:justify-end order-1 sm:order-2">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="flex-1 sm:flex-none rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-slate-300 hover:bg-white/10"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => {
                    setDynamicParcels((prev) =>
                      prev.map((parcel) => (parcel.id === editingParcel.id ? editingParcel : parcel)),
                    );
                    setSelectedParcelId(editingParcel.id);
                    setIsEditorOpen(false);
                  }}
                  className="flex-1 sm:flex-none rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-400"
                >
                  Guardar cambios
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}