"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { InstituteCategory, MedicalInstitute } from "@/lib/medical-institutes";

type LatLng = { lat: number; lng: number };

type Props = {
  institutes: MedicalInstitute[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userLocation?: LatLng | null;
  categoryLabels?: Record<InstituteCategory, string>;
  searchThisAreaLabel?: string;
  youAreHereLabel?: string;
  onSearchArea?: (center: LatLng) => void;
};

const iconCache = new Map<string, L.DivIcon>();

function pinIcon(selected: boolean, emergency: boolean) {
  const key = `${selected}-${emergency}`;
  const cached = iconCache.get(key);
  if (cached) return cached;
  const fill = selected ? "#ac2c39" : emergency ? "#cc3846" : "#e0606c";
  const size = selected ? 40 : 30;
  const height = Math.round(size * 1.3);
  const icon = L.divIcon({
    className: "",
    html: `<svg width="${size}" height="${height}" viewBox="4 1.6 16 20.8" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));"><circle cx="12" cy="10" r="4.5" fill="#ffffff"/><path d="M12 2C7.589 2 4 5.589 4 9.995 3.971 16.44 11.696 21.784 12 22c0 0 8.029-5.56 8-12 0-4.411-3.589-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="${fill}"/></svg>`,
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -height + 4],
  });
  iconCache.set(key, icon);
  return icon;
}

function MapController({
  institutes,
  selectedId,
  userLocation,
}: {
  institutes: MedicalInstitute[];
  selectedId: string | null;
  userLocation?: LatLng | null;
}) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = institutes.map((institute) => [institute.lat, institute.lng]);
    if (points.length === 0) return;
    // Frame the closest results (and the user) rather than every far-away match.
    const framed = points.slice(0, 25);
    if (userLocation) framed.push([userLocation.lat, userLocation.lng]);
    map.fitBounds(L.latLngBounds(framed), { padding: [48, 48], maxZoom: 15 });
  }, [institutes, userLocation, map]);

  useEffect(() => {
    if (!selectedId) return;
    const institute = institutes.find((item) => item.id === selectedId);
    if (institute) {
      map.flyTo([institute.lat, institute.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
    }
  }, [selectedId, institutes, map]);

  return null;
}

function SearchAreaButton({ label, onSearch }: { label: string; onSearch: (center: LatLng) => void }) {
  const [moved, setMoved] = useState(false);
  const map = useMapEvents({
    dragend: () => setMoved(true),
  });

  useEffect(() => {
    const container = map.getContainer();
    const markMoved = () => setMoved(true);
    // Wheel / pinch zooms are user initiated, unlike fitBounds/flyTo.
    container.addEventListener("wheel", markMoved, { passive: true });
    container.addEventListener("touchend", markMoved, { passive: true });
    return () => {
      container.removeEventListener("wheel", markMoved);
      container.removeEventListener("touchend", markMoved);
    };
  }, [map]);

  if (!moved) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-[1000] flex justify-center">
      <button
        type="button"
        onClick={() => {
          const center = map.getCenter();
          setMoved(false);
          onSearch({ lat: center.lat, lng: center.lng });
        }}
        className="pointer-events-auto rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-md ring-1 ring-black/5 hover:bg-primary-soft"
      >
        {label}
      </button>
    </div>
  );
}

export default function InstitutesMapInner({
  institutes,
  selectedId,
  onSelect,
  userLocation,
  categoryLabels,
  searchThisAreaLabel,
  youAreHereLabel,
  onSearchArea,
}: Props) {
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : institutes.length
      ? [institutes[0].lat, institutes[0].lng]
      : [44.4268, 26.1025];

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ minHeight: "24rem" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapController institutes={institutes} selectedId={selectedId} userLocation={userLocation} />
        {onSearchArea && searchThisAreaLabel ? (
          <SearchAreaButton label={searchThisAreaLabel} onSearch={onSearchArea} />
        ) : null}
        {userLocation ? (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={8}
            pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }}
          >
            {youAreHereLabel ? <Tooltip>{youAreHereLabel}</Tooltip> : null}
          </CircleMarker>
        ) : null}
        {institutes.map((institute) => (
          <Marker
            key={institute.id}
            position={[institute.lat, institute.lng]}
            icon={pinIcon(institute.id === selectedId, institute.emergency)}
            zIndexOffset={institute.id === selectedId ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(institute.id) }}
          >
            <Popup>
              <span className="font-semibold">{institute.name}</span>
              <br />
              {categoryLabels ? categoryLabels[institute.category] : institute.category}
              {institute.address || institute.city ? (
                <>
                  <br />
                  {[institute.address, institute.city].filter(Boolean).join(", ")}
                </>
              ) : null}
              {institute.phone ? (
                <>
                  <br />
                  <a href={`tel:${institute.phone.replace(/[^\d+]/g, "")}`}>{institute.phone}</a>
                </>
              ) : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
