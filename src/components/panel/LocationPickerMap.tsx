"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  lat: number;
  lng: number;
  onChange: (point: { lat: number; lng: number }) => void;
};

const markerIcon = L.divIcon({
  className: "",
  html: `<svg width="30" height="39" viewBox="4 1.6 16 20.8" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));"><circle cx="12" cy="10" r="4.5" fill="#ffffff"/><path d="M12 2C7.589 2 4 5.589 4 9.995 3.971 16.44 11.696 21.784 12 22c0 0 8.029-5.56 8-12 0-4.411-3.589-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#cc3846"/></svg>`,
  iconSize: [30, 39],
  iconAnchor: [15, 39],
});

function ClickHandler({ onChange }: Pick<Props, "onChange">) {
  useMapEvents({
    click: (event) => onChange({ lat: event.latlng.lat, lng: event.latlng.lng }),
  });
  return null;
}

function Recenter({ lat, lng }: Pick<Props, "lat" | "lng">) {
  const map = useMap();
  useEffect(() => {
    if (!map.getBounds().contains([lat, lng])) map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function LocationPickerMap({ lat, lng, onChange }: Props) {
  return (
    <MapContainer center={[lat, lng]} zoom={14} className="h-full w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
      />
      <ClickHandler onChange={onChange} />
      <Recenter lat={lat} lng={lng} />
      <Marker
        position={[lat, lng]}
        icon={markerIcon}
        draggable
        eventHandlers={{
          dragend: (event) => {
            const point = (event.target as L.Marker).getLatLng();
            onChange({ lat: point.lat, lng: point.lng });
          },
        }}
      />
    </MapContainer>
  );
}
