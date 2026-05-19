import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Polygon,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { LatLngExpression, LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import type { Parcel, ParcelStatus } from "../../entities/parcel_model";
import { initialParcels } from "../../data/parcels";
import { FitBounds } from "../../utils/fitBounds";

const mapCenter: [number, number] = [14.0711, -87.1989];

export function FarmInteractiveMap({
  dynamicParcels,
  setDynamicParcels,
}: {
  dynamicParcels: Parcel[];
  setDynamicParcels: React.Dispatch<React.SetStateAction<Parcel[]>>;
}) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [editingParcel, setEditingParcel] = useState<Parcel | null>(
    initialParcels[0],
  );

  const [selectedParcelId, setSelectedParcelId] = useState(
    initialParcels[0].id,
  );

  const selectedParcel = useMemo(
    () =>
      dynamicParcels.find((parcel) => parcel.id === selectedParcelId) ??
      dynamicParcels[0],
    [selectedParcelId, dynamicParcels],
  );

  const updateParcel = (field: keyof Parcel, value: string) => {
    if (!editingParcel) return;

    const updatedParcel = {
      ...editingParcel,
      [field]: value,
    };

    setEditingParcel(updatedParcel);

    setDynamicParcels((prev) =>
      prev.map((parcel) =>
        parcel.id === updatedParcel.id ? updatedParcel : parcel,
      ),
    );
  };

  useEffect(() => {
    const currentParcel = dynamicParcels.find(
      (parcel) => parcel.id === selectedParcelId,
    );

    if (currentParcel) {
      setEditingParcel(currentParcel);
    }
  }, [selectedParcelId, dynamicParcels]);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
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
                    color:
                      tone === "red"
                        ? "#f87171"
                        : tone === "amber"
                          ? "#fbbf24"
                          : "#34d399",
                    weight: isSelected ? 3 : 2,
                    fillColor:
                      tone === "red"
                        ? "#ef4444"
                        : tone === "amber"
                          ? "#f59e0b"
                          : "#10b981",
                    fillOpacity: isSelected ? 0.28 : 0.18,
                  }}
                  eventHandlers={{
                    click: () => {
                      setSelectedParcelId(parcel.id);
                    },
                  }}
                >
                  <Tooltip
                    direction="top"
                    offset={[0, -10]}
                    opacity={1}
                    permanent
                  >
                    {parcel.name}
                  </Tooltip>
                  <Popup>
                    <div className="space-y-1 text-sm">
                      <div className="font-semibold">{parcel.name}</div>
                      <div>Área: {parcel.area}</div>
                      <div>Humedad: {parcel.humidity}</div>
                      <div>Fertilidad: {parcel.fertility}</div>
                      <div>Temperatura: {parcel.temperature}</div>
                      <div className="font-semibold text-emerald-600">
                        Estado: {parcel.status}
                      </div>
                    </div>
                  </Popup>
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
                    const latlngs = layer.getLatLngs()[0] as LatLngExpression[];

                    const newParcel: Parcel = {
                      id: `parcel-${Date.now()}`,
                      name: `Nueva Parcela`,
                      area: "Pendiente",
                      status: "Óptimo",
                      statusTone: "optimo",
                      humidity: "--",
                      fertility: "--",
                      temperature: "--",
                      bounds: latlngs,
                      center: latlngs[0],
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
          <div className="flex flex-row items-center justify-between">
            <div className="text-sm font-semibold text-white">
              Parcela seleccionada
            </div>
            <button
              onClick={() => {
                setEditingParcel(selectedParcel);
                setIsEditorOpen(true);
              }}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
            >
              Editar
            </button>
          </div>
          <div className="mt-3 text-2xl font-black tracking-tight text-emerald-300">
            {selectedParcel.name}
          </div>
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
              <div
                key={label as string}
                className="rounded-[10px] border border-white/8 bg-black/50 p-4"
              >
                <div className="text-xs uppercase tracking-[0.25em] text-white/80">
                  {label as string}
                </div>
                <div className="mt-2 text-xl font-semibold text-white">
                  {value as string}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[14px] border border-white/8 bg-white/[0.03] p-5">
          <div className="text-sm font-semibold text-white">Leyenda</div>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-emerald-400" /> Óptimo
            </div>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-amber-400" /> Atención
            </div>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-red-400" /> Crítico
            </div>
          </div>
        </div>
      </div>
      {isEditorOpen && editingParcel && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#071510] p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex fle-row items-center gap-2">
                <h2 className="text-2xl font-bold text-emerald-300">Editar:</h2>
                <h2 className="text-2xl font-bold text-white/80">
                  {editingParcel.name}
                </h2>
              </div>

              <button
                onClick={() => {
                  setEditingParcel(selectedParcel);
                  setIsEditorOpen(false);
                }}
                className="rounded-full bg-white/5 px-3 py-1 text-slate-300 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label>Nombre:</label>
                <input
                  type="text"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                  value={editingParcel.name}
                  onChange={(e) => updateParcel("name", e.target.value)}
                  placeholder="Nombre"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label>Área:</label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-14 py-3 text-white appearance-none
                    [&::-webkit-outer-spin-button]:appearance-none
                    [&::-webkit-inner-spin-button]:appearance-none
                    [-moz-appearance:textfield]"
                    value={editingParcel.area.replace(" ha", "")}
                    onChange={(e) =>
                      updateParcel("area", `${e.target.value} ha`)
                    }
                    placeholder="Área"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                    ha
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label>Humedad:</label>
                <div className="relative">
                  <input
                    type="number" inputMode="decimal"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-14 py-3 text-white appearance-none
                    [&::-webkit-outer-spin-button]:appearance-none
                    [&::-webkit-inner-spin-button]:appearance-none
                    [-moz-appearance:textfield]"
                    value={editingParcel.humidity.replace("%", "")}
                    onChange={(e) =>
                      updateParcel("humidity", `${e.target.value}%`)
                    }
                    placeholder="Humedad"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                    %
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label>Fertilidad:</label>
                <div className="relative">
                  <input
                    type="number" inputMode="decimal"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-14 py-3 text-white appearance-none
                    [&::-webkit-outer-spin-button]:appearance-none
                    [&::-webkit-inner-spin-button]:appearance-none
                    [-moz-appearance:textfield]"
                    value={editingParcel.fertility.replace("%", "")}
                    onChange={(e) =>
                      updateParcel("fertility", `${e.target.value}%`)
                    }
                    placeholder="Fertilidad"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                    %
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label>Temperatura:</label>
                <div className="relative">
                  <input
                    type="number" inputMode="decimal"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 pr-14 py-3 text-white appearance-none
                    [&::-webkit-outer-spin-button]:appearance-none
                    [&::-webkit-inner-spin-button]:appearance-none
                    [-moz-appearance:textfield]"
                    value={editingParcel.temperature.replace("°C", "")}
                    onChange={(e) =>
                      updateParcel("temperature", `${e.target.value}°C`)
                    }
                    placeholder="Temperatura"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                    °C
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label>Estado:</label>
                <div className="relative">
                  <select
                    className="
                      w-full appearance-none rounded-2xl
                      border border-emerald-400/20
                      bg-[#0b1814]
                      px-4 pr-12 py-3
                      text-white
                      font-medium
                      shadow-lg
                      outline-none
                      transition-all duration-300
                      hover:border-emerald-400/40
                      focus:border-emerald-400
                      focus:ring-2 focus:ring-emerald-400/20
                      cursor-pointer
                    "
                    value={editingParcel.statusTone}
                    onChange={(e) => {
                      const tone = e.target.value as ParcelStatus;

                      if (!editingParcel) return;

                      const updatedParcel = {
                        ...editingParcel,
                        statusTone: tone,
                        status:
                          tone === "critico"
                            ? "Crítico"
                            : tone === "atencion"
                              ? "Atención"
                              : "Óptimo",
                      };

                      setEditingParcel(updatedParcel);

                      setDynamicParcels((prev) =>
                        prev.map((parcel) =>
                          parcel.id === updatedParcel.id
                            ? updatedParcel
                            : parcel,
                        ),
                      );
                    }}
                  >
                    <option
                      value="optimo"
                      className="bg-[#0b1814] text-emerald-300"
                    >
                      🟢 Óptimo
                    </option>

                    <option
                      value="atencion"
                      className="bg-[#0b1814] text-amber-300"
                    >
                      🟡 Atención
                    </option>

                    <option
                      value="critico"
                      className="bg-[#0b1814] text-red-300"
                    >
                      🔴 Crítico
                    </option>
                  </select>

                  {/* Flecha personalizada */}
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-emerald-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => {
                  setEditingParcel(selectedParcel);
                  setIsEditorOpen(false);
                }}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 font-semibold text-slate-300 hover:bg-white/10"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  setDynamicParcels((prev) =>
                    prev.map((parcel) =>
                      parcel.id === editingParcel.id ? editingParcel : parcel,
                    ),
                  );

                  setSelectedParcelId(editingParcel.id);
                  setIsEditorOpen(false);
                }}
                className="flex-1 rounded-2xl bg-emerald-500 py-3 font-semibold text-white hover:bg-emerald-400"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
