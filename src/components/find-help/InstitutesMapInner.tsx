"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { MedicalInstitute } from "@/lib/medical-institutes";

type Props = {
  institutes: MedicalInstitute[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function pinIcon(selected: boolean) {
  const fill = selected ? "#ac2c39" : "#cc3846";
  const size = selected ? 40 : 30;
  const height = Math.round(size * 1.3);
  return L.divIcon({
    className: "",
    html: `<svg width="${size}" height="${height}" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));"><path d="M12 0C5.4 0 0 5.4 0 12c0 8.4 12 20 12 20s12-11.6 12-20C24 5.4 18.6 0 12 0z" fill="${fill}"/><circle cx="12" cy="12" r="4.5" fill="#ffffff"/></svg>`,
    iconSize: [size, height],
    iconAnchor: [size / 2, height],
    popupAnchor: [0, -height + 4],
  });
}

function MapController({
  institutes,
  selectedId,
}: {
  institutes: MedicalInstitute[];
  selectedId: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (institutes.length === 0) return;
    const bounds = L.latLngBounds(
      institutes.map((institute) => [institute.lat, institute.lng]),
    );
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [institutes, map]);

  useEffect(() => {
    if (!selectedId) return;
    const institute = institutes.find((item) => item.id === selectedId);
    if (institute) {
      map.flyTo([institute.lat, institute.lng], 15, { duration: 0.6 });
    }
  }, [selectedId, institutes, map]);

  return null;
}

export default function InstitutesMapInner({
  institutes,
  selectedId,
  onSelect,
}: Props) {
  const center: [number, number] = institutes.length
    ? [institutes[0].lat, institutes[0].lng]
    : [44.4268, 26.1025];

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ minHeight: "24rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <MapController institutes={institutes} selectedId={selectedId} />
      {institutes.map((institute) => (
        <Marker
          key={institute.id}
          position={[institute.lat, institute.lng]}
          icon={pinIcon(institute.id === selectedId)}
          eventHandlers={{ click: () => onSelect(institute.id) }}
        >
          <Popup>
            <span className="font-semibold">{institute.name}</span>
            <br />
            {institute.category}
            <br />
            {institute.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
