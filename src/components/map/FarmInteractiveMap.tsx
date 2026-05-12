import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Polygon, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

type ParcelStatus = 'optimo' | 'atencion' | 'critico';

type Parcel = {
  id: string;
  name: string;
  area: string;
  status: string;
  statusTone: ParcelStatus;
  humidity: string;
  fertility: string;
  temperature: string;
  bounds: [number, number][];
  center: [number, number];
};

const parcels: Parcel[] = [
  {
    id: 'norte',
    name: 'Parcela Norte',
    area: '4.2 ha',
    status: 'Óptimo',
    statusTone: 'optimo',
    humidity: '68%',
    fertility: '94%',
    temperature: '22°C',
    bounds: [
      [14.0722, -87.2030],
      [14.0728, -87.2009],
      [14.0714, -87.1999],
      [14.0708, -87.2021],
    ],
    center: [14.0718, -87.2015],
  },
  {
    id: 'sur',
    name: 'Parcela Sur',
    area: '2.8 ha',
    status: 'Óptimo',
    statusTone: 'optimo',
    humidity: '71%',
    fertility: '87%',
    temperature: '21°C',
    bounds: [
      [14.0708, -87.1998],
      [14.0714, -87.1982],
      [14.0702, -87.1975],
      [14.0696, -87.1992],
    ],
    center: [14.0705, -87.1987],
  },
  {
    id: 'sector-2a',
    name: 'Sector 2A',
    area: '3.1 ha',
    status: 'Atención',
    statusTone: 'atencion',
    humidity: '62%',
    fertility: '76%',
    temperature: '28°C',
    bounds: [
      [14.0728, -87.1986],
      [14.0733, -87.1969],
      [14.0720, -87.1961],
      [14.0715, -87.1978],
    ],
    center: [14.0724, -87.1974],
  },
  {
    id: 'zona-critica',
    name: 'Zona Crítica',
    area: '1.6 ha',
    status: 'Crítico',
    statusTone: 'critico',
    humidity: '34%',
    fertility: '71%',
    temperature: '31°C',
    bounds: [
      [14.0695, -87.2012],
      [14.0701, -87.1998],
      [14.0689, -87.1992],
      [14.0683, -87.2006],
    ],
    center: [14.0692, -87.2001],
  },
  {
    id: 'sector-3b',
    name: 'Sector 3B',
    area: '3.1 ha',
    status: 'Atención',
    statusTone: 'atencion',
    humidity: '65%',
    fertility: '79%',
    temperature: '25°C',
    bounds: [
      [14.0698, -87.1979],
      [14.0704, -87.1963],
      [14.0691, -87.1954],
      [14.0685, -87.1970],
    ],
    center: [14.0694, -87.1967],
  },
];

const mapCenter: [number, number] = [14.0711, -87.1989];

function FitBounds() {
  const map = useMap();

  useEffect(() => {
    const bounds = parcels.map((parcel) => parcel.bounds).flat() as LatLngBoundsExpression;
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [map]);

  return null;
}

export function FarmInteractiveMap() {
  const [selectedParcelId, setSelectedParcelId] = useState(parcels[0].id);
  const selectedParcel = useMemo(() => parcels.find((parcel) => parcel.id === selectedParcelId) ?? parcels[0], [selectedParcelId]);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
      <div className="overflow-hidden rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
        <div className="mb-4 flex items-center justify-between gap-3 px-1">
          <div>
            <div className="text-lg font-semibold text-white">Mapa interactivo del terreno</div>
            <div className="text-sm text-slate-400">Pan, zoom, click por parcela y lectura en vivo</div>
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            OSM · Live
          </div>
        </div>

        <div className="h-[520px] overflow-hidden rounded-3xl border border-white/8">
          <MapContainer center={mapCenter} zoom={16} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds />

            {parcels.map((parcel) => {
              const tone = parcel.statusTone === 'critico' ? 'red' : parcel.statusTone === 'atencion' ? 'amber' : 'emerald';
              const isSelected = selectedParcelId === parcel.id;

              return (
                <Polygon
                  key={parcel.id}
                  positions={parcel.bounds}
                  pathOptions={{
                    color: tone === 'red' ? '#f87171' : tone === 'amber' ? '#fbbf24' : '#34d399',
                    weight: isSelected ? 3 : 2,
                    fillColor: tone === 'red' ? '#ef4444' : tone === 'amber' ? '#f59e0b' : '#10b981',
                    fillOpacity: isSelected ? 0.28 : 0.18,
                  }}
                  eventHandlers={{
                    click: () => setSelectedParcelId(parcel.id),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                    {parcel.name}
                  </Tooltip>
                  <Popup>
                    <div className="space-y-1 text-sm">
                      <div className="font-semibold">{parcel.name}</div>
                      <div>Área: {parcel.area}</div>
                      <div>Humedad: {parcel.humidity}</div>
                      <div>Fertilidad: {parcel.fertility}</div>
                      <div>Temperatura: {parcel.temperature}</div>
                      <div className="font-semibold text-emerald-600">Estado: {parcel.status}</div>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

            {parcels.map((parcel) => (
              <CircleMarker
                key={`${parcel.id}-center`}
                center={parcel.center}
                radius={selectedParcelId === parcel.id ? 7 : 5}
                pathOptions={{
                  color: selectedParcelId === parcel.id ? '#ffffff' : '#0f172a',
                  weight: 2,
                  fillColor: selectedParcelId === parcel.id ? '#22c55e' : parcel.statusTone === 'critico' ? '#ef4444' : parcel.statusTone === 'atencion' ? '#f59e0b' : '#10b981',
                  fillOpacity: 0.95,
                }}
                eventHandlers={{
                  click: () => setSelectedParcelId(parcel.id),
                }}
              />
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
          <div className="text-sm font-semibold text-white">Parcela seleccionada</div>
          <div className="mt-3 text-2xl font-black tracking-tight text-emerald-300">{selectedParcel.name}</div>
          <div className="mt-2 text-sm text-slate-400">{selectedParcel.area} · Última lectura hace 2 min</div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {[
              ['Humedad', selectedParcel.humidity],
              ['Fertilidad', selectedParcel.fertility],
              ['Temperatura', selectedParcel.temperature],
              ['Estado', selectedParcel.status],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.25em] text-slate-500">{label as string}</div>
                <div className="mt-2 text-xl font-semibold text-white">{value as string}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
          <div className="text-sm font-semibold text-white">Leyenda</div>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-emerald-400" /> Óptimo</div>
            <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-amber-400" /> Atención</div>
            <div className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-red-400" /> Crítico</div>
          </div>
        </div>
      </div>
    </div>
  );
}
