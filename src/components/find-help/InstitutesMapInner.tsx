"use client";

import { memo, useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { primaryPhoneHref, type InstituteCategory, type MedicalInstitute } from "@/lib/medical-institutes";

type LatLng = { lat: number; lng: number };

type Props = {
  institutes: MedicalInstitute[];
  selectedId: string | null;
  hoveredId?: string | null;
  onSelect: (id: string) => void;
  onHoverChange?: (id: string | null) => void;
  userLocation?: LatLng | null;
  categoryLabels?: Record<InstituteCategory, string>;
  searchThisAreaLabel?: string;
  youAreHereLabel?: string;
  onSearchArea?: (center: LatLng) => void;
};

const iconCache = new Map<string, L.DivIcon>();
const clusterIconCache = new Map<string, L.DivIcon>();

// Places are sapphire (#1d3557); emergency facilities carry clinical ruby (#c62f3c).
const PLACE_FILL = "#1d3557";
const EMERGENCY_FILL = "#c62f3c";

const CLUSTER_MAX_ZOOM = 14;
const CLUSTER_GRID_PX = 52;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// The pin glyph: 28 x 36, its tip on the place.
const PIN_W = 28;
const PIN_H = 36;

function placeIcon(selected: boolean, hovered: boolean, emergency: boolean) {
  const key = `${selected}-${hovered}-${emergency}`;
  const cached = iconCache.get(key);
  if (cached) return cached;
  const fill = emergency ? EMERGENCY_FILL : PLACE_FILL;
  const classes = ["fhs-place", selected ? "is-selected" : "", hovered ? "is-hovered" : ""]
    .filter(Boolean)
    .join(" ");
  const icon = L.divIcon({
    className: classes,
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

function clusterTileIcon(count: number, hasEmergency: boolean, hasHovered: boolean) {
  const key = `${count}-${hasEmergency}-${hasHovered}`;
  const cached = clusterIconCache.get(key);
  if (cached) return cached;
  const ringShadow = hasHovered
    ? "0 0 0 3px rgba(29,53,87,0.28),0 4px 12px rgba(11,19,43,0.28)"
    : "0 2px 8px rgba(11,19,43,0.22)";
  const emergencyDot = hasEmergency
    ? `<span aria-hidden="true" style="position:absolute;top:-3px;right:-3px;width:8px;height:8px;border-radius:9999px;background:${EMERGENCY_FILL};box-shadow:0 0 0 2px #ffffff;"></span>`
    : "";
  const icon = L.divIcon({
    className: "fhs-cluster-icon bg-transparent border-0",
    html: `<div class="rounded-lg bg-sapphire text-white" style="position:relative;width:44px;height:44px;border-radius:8px;background:${PLACE_FILL};color:#ffffff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;font-variant-numeric:tabular-nums;border:2px solid #ffffff;box-shadow:${ringShadow};">${count}${emergencyDot}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
  clusterIconCache.set(key, icon);
  return icon;
}

type PlaceMarkerProps = {
  institute: MedicalInstitute;
  selected: boolean;
  hovered: boolean;
  categoryLabel: string;
  onSelect: (id: string) => void;
  onHoverChange?: (id: string | null) => void;
};

const PlaceMarker = memo(function PlaceMarker({
  institute,
  selected,
  hovered,
  categoryLabel,
  onSelect,
  onHoverChange,
}: PlaceMarkerProps) {
  const { id } = institute;
  const eventHandlers = useMemo<L.LeafletEventHandlerFnMap>(
    () => ({
      click: () => onSelect(id),
      mouseover: () => onHoverChange?.(id),
      mouseout: () => onHoverChange?.(null),
    }),
    [id, onSelect, onHoverChange],
  );
  const location = [institute.address, institute.city].filter(Boolean).join(", ");
  const phoneHref = primaryPhoneHref(institute.phone);

  return (
    <Marker
      position={[institute.lat, institute.lng]}
      icon={placeIcon(selected, hovered, institute.emergency)}
      title={institute.name}
      zIndexOffset={selected ? 1000 : hovered ? 600 : 0}
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
        {institute.phone && phoneHref ? (
          <>
            <br />
            <a
              href={phoneHref}
              className="mt-1 inline-flex min-h-11 items-center rounded-sm font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {institute.phone}
            </a>
          </>
        ) : null}
      </Popup>
    </Marker>
  );
});

type ClusterGroup = {
  key: string;
  lat: number;
  lng: number;
  items: MedicalInstitute[];
  hasEmergency: boolean;
};

const ClusterMarker = memo(function ClusterMarker({
  cluster,
  hasHovered,
}: {
  cluster: ClusterGroup;
  hasHovered: boolean;
}) {
  const map = useMap();
  const eventHandlers = useMemo<L.LeafletEventHandlerFnMap>(
    () => ({
      click: () => {
        const bounds = L.latLngBounds(
          cluster.items.map((item) => [item.lat, item.lng] as [number, number]),
        );
        if (prefersReducedMotion()) {
          map.fitBounds(bounds, { padding: [44, 44], maxZoom: 16, animate: false });
        } else {
          map.flyToBounds(bounds, { padding: [44, 44], maxZoom: 16, duration: 0.55 });
        }
      },
    }),
    [cluster.items, map],
  );

  return (
    <Marker
      position={[cluster.lat, cluster.lng]}
      icon={clusterTileIcon(cluster.items.length, cluster.hasEmergency, hasHovered)}
      zIndexOffset={hasHovered ? 550 : 200}
      eventHandlers={eventHandlers}
    />
  );
});

function ClusteredInstitutesLayer({
  institutes,
  selectedId,
  hoveredId,
  categoryLabels,
  onSelect,
  onHoverChange,
}: {
  institutes: MedicalInstitute[];
  selectedId: string | null;
  hoveredId?: string | null;
  categoryLabels?: Record<InstituteCategory, string>;
  onSelect: (id: string) => void;
  onHoverChange?: (id: string | null) => void;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  const { singles, clusters } = useMemo(() => {
    if (zoom >= CLUSTER_MAX_ZOOM || institutes.length <= 1) {
      return { singles: institutes, clusters: [] as ClusterGroup[] };
    }

    const buckets = new Map<
      string,
      { sumLat: number; sumLng: number; items: MedicalInstitute[]; hasEmergency: boolean }
    >();
    const standalone: MedicalInstitute[] = [];

    // Single O(N) screen-space pixel-grid pass (52px cells)
    for (let i = 0; i < institutes.length; i += 1) {
      const inst = institutes[i];
      if (inst.id === selectedId) {
        standalone.push(inst);
        continue;
      }
      const pt = map.project([inst.lat, inst.lng], zoom);
      const gx = Math.floor(pt.x / CLUSTER_GRID_PX);
      const gy = Math.floor(pt.y / CLUSTER_GRID_PX);
      const cellKey = `${gx}:${gy}`;
      const existing = buckets.get(cellKey);
      if (existing) {
        existing.sumLat += inst.lat;
        existing.sumLng += inst.lng;
        existing.items.push(inst);
        if (inst.emergency) existing.hasEmergency = true;
      } else {
        buckets.set(cellKey, {
          sumLat: inst.lat,
          sumLng: inst.lng,
          items: [inst],
          hasEmergency: inst.emergency,
        });
      }
    }

    const grouped: ClusterGroup[] = [];
    buckets.forEach((bucket, cellKey) => {
      if (bucket.items.length === 1) {
        standalone.push(bucket.items[0]);
      } else {
        const len = bucket.items.length;
        grouped.push({
          key: `cluster-${zoom}-${cellKey}`,
          lat: bucket.sumLat / len,
          lng: bucket.sumLng / len,
          items: bucket.items,
          hasEmergency: bucket.hasEmergency,
        });
      }
    });

    return { singles: standalone, clusters: grouped };
  }, [institutes, zoom, selectedId, map]);

  return (
    <>
      {clusters.map((cluster) => {
        const hasHovered = Boolean(hoveredId && cluster.items.some((item) => item.id === hoveredId));
        return <ClusterMarker key={cluster.key} cluster={cluster} hasHovered={hasHovered} />;
      })}
      {singles.map((institute) => (
        <PlaceMarker
          key={institute.id}
          institute={institute}
          selected={institute.id === selectedId}
          hovered={institute.id === hoveredId}
          categoryLabel={categoryLabels ? categoryLabels[institute.category] : institute.category}
          onSelect={onSelect}
          onHoverChange={onHoverChange}
        />
      ))}
    </>
  );
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
    const container = map.getContainer();
    let rafId: number | null = null;
    const ro = new ResizeObserver(() => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        map.invalidateSize({ pan: false });
      });
    });
    ro.observe(container);
    return () => {
      ro.disconnect();
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [map]);

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
        className="pointer-events-auto min-h-11 rounded-lg bg-card px-4 text-sm font-semibold text-sapphire shadow-md ring-1 ring-black/5 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {label}
      </button>
    </div>
  );
}

export default function InstitutesMapInner({
  institutes,
  selectedId,
  hoveredId = null,
  onSelect,
  onHoverChange,
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
            pathOptions={{ color: "#ffffff", weight: 3, fillColor: PLACE_FILL, fillOpacity: 1 }}
          >
            {youAreHereLabel ? <Tooltip>{youAreHereLabel}</Tooltip> : null}
          </CircleMarker>
        ) : null}
        <ClusteredInstitutesLayer
          institutes={institutes}
          selectedId={selectedId}
          hoveredId={hoveredId}
          categoryLabels={categoryLabels}
          onSelect={onSelect}
          onHoverChange={onHoverChange}
        />
      </MapContainer>
    </div>
  );
}
