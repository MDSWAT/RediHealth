"use client";

import { memo, useEffect, useMemo, useState } from "react";
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

// Places are sapphire; a place with an emergency department keeps the ruby, which this site
// keeps for emergencies.
const PLACE_FILL = "#1d3557";
const EMERGENCY_FILL = "#c62f3c";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// The pin glyph: 28 x 36, its tip on the place.
const PIN_W = 28;
const PIN_H = 36;

/**
 * At rest a place is a 10px dot with a white ring and no shadow, so 80 places in one city read
 * as a quiet scatter. The pin glyph shows only for the place being hovered, keyboard-focused or
 * chosen. Hover and focus are pure CSS (.fhs-place in globals.css), so the element under the
 * pointer is never rebuilt mid-click; only choosing a place swaps the icon. The dot keeps a 24px
 * tap square around it.
 */
function placeIcon(selected: boolean, emergency: boolean) {
  const key = `${selected}-${emergency}`;
  const cached = iconCache.get(key);
  if (cached) return cached;
  const fill = emergency ? EMERGENCY_FILL : PLACE_FILL;
  const icon = L.divIcon({
    className: selected ? "fhs-place is-selected" : "fhs-place",
    html:
      `<span class="fhs-place-hit"></span>` +
      `<span class="fhs-place-dot" style="background:${fill}"></span>` +
      `<svg class="fhs-place-pin" width="${PIN_W}" height="${PIN_H}" viewBox="4 1.6 16 20.8" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="10" r="4.5" fill="#ffffff"/><path d="M12 2C7.589 2 4 5.589 4 9.995 3.971 16.44 11.696 21.784 12 22c0 0 8.029-5.56 8-12 0-4.411-3.589-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="${fill}"/></svg>`,
    iconSize: [PIN_W, PIN_H + 12],
    iconAnchor: [PIN_W / 2, PIN_H],
    popupAnchor: [0, -PIN_H + 4],
  });
  iconCache.set(key, icon);
  return icon;
}

type PlaceMarkerProps = {
  institute: MedicalInstitute;
  selected: boolean;
  categoryLabel: string;
  onSelect: (id: string) => void;
};

const PlaceMarker = memo(function PlaceMarker({ institute, selected, categoryLabel, onSelect }: PlaceMarkerProps) {
  const { id } = institute;
  const eventHandlers = useMemo<L.LeafletEventHandlerFnMap>(() => ({ click: () => onSelect(id) }), [id, onSelect]);
  const location = [institute.address, institute.city].filter(Boolean).join(", ");

  return (
    <Marker
      position={[institute.lat, institute.lng]}
      icon={placeIcon(selected, institute.emergency)}
      title={institute.name}
      zIndexOffset={selected ? 1000 : 0}
      eventHandlers={eventHandlers}
    >
      <Popup>
        <span className="font-semibold">{institute.name}</span>
        <br />
        {categoryLabel}
        {location ? (
          <>
            <br />
            {location}
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
  );
});

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
    map.fitBounds(L.latLngBounds(framed), { padding: [48, 48], maxZoom: 15, animate: !prefersReducedMotion() });
  }, [institutes, userLocation, map]);

  useEffect(() => {
    if (!selectedId) return;
    const institute = institutes.find((item) => item.id === selectedId);
    if (!institute) return;
    const target: [number, number] = [institute.lat, institute.lng];
    const zoom = Math.max(map.getZoom(), 15);
    // A short, decelerating glide to the chosen place; a plain jump under reduced motion.
    if (prefersReducedMotion()) map.setView(target, zoom, { animate: false });
    else map.flyTo(target, zoom, { duration: 0.6, easeLinearity: 0.5 });
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
    // Wheel and pinch zooms are the reader's own, unlike fitBounds/flyTo. A plain tap on a
    // place is not a move, so a touch counts only once two fingers or a 10px drag are involved.
    let start: { x: number; y: number } | null = null;
    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      start = touch ? { x: touch.clientX, y: touch.clientY } : null;
      if (event.touches.length > 1) markMoved();
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (event.touches.length > 1) markMoved();
      else if (start && touch && Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > 10) markMoved();
    };
    container.addEventListener("wheel", markMoved, { passive: true });
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      container.removeEventListener("wheel", markMoved);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
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
        className="pointer-events-auto min-h-10 rounded-lg bg-card px-4 text-sm font-semibold text-sapphire shadow-md ring-1 ring-black/5 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
    <div className="fhs-map relative isolate z-0 h-full w-full">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomAnimation={!prefersReducedMotion()}
        markerZoomAnimation={!prefersReducedMotion()}
        fadeAnimation={!prefersReducedMotion()}
        className="isolate z-0 h-full w-full"
      >
        {/* Credited under the map, in the page language (FindHelpExplorer). */}
        <TileLayer
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
          <PlaceMarker
            key={institute.id}
            institute={institute}
            selected={institute.id === selectedId}
            categoryLabel={categoryLabels ? categoryLabels[institute.category] : institute.category}
            onSelect={onSelect}
          />
        ))}
      </MapContainer>
    </div>
  );
}
