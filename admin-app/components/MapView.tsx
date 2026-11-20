"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { GeoPoint } from "@/lib/data";
import type * as LeafletNS from "leaflet";

/**
 * Leaflet map showing the session route: green start marker, red end
 * marker, blue route polyline. Zooming and panning are enabled. Tiles
 * load from OpenStreetMap; coordinates stay visible regardless.
 */
export default function MapView({
  start,
  end,
  height = 180,
}: {
  start: GeoPoint;
  end: GeoPoint;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    let cancelled = false;
    let map: LeafletNS.Map | null = null;

    // Leaflet touches `window` at import time, so load it client-side only.
    void (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;
    const map = L.map(ref.current, {
      center: [
        (start.lat + end.lat) / 2,
        (start.lng + end.lng) / 2,
      ],
      zoom: 13,
      scrollWheelZoom: true,
    });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    // Custom coloured pin markers.
    const pin = (color: string) =>
      L.divIcon({
        className: "",
        html: `<svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 0 C6.7 0 0 6.7 0 15 C0 26 15 42 15 42 C15 42 30 26 30 15 C30 6.7 23.3 0 15 0 Z" fill="${color}"/>
          <circle cx="15" cy="15" r="6" fill="#fff"/>
        </svg>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
      });

    L.marker([start.lat, start.lng], { icon: pin("#1FA33A") })
      .addTo(map)
      .bindPopup(`Start — ${start.lat.toFixed(4)}, ${start.lng.toFixed(4)} (${start.time})`);
    L.marker([end.lat, end.lng], { icon: pin("#E5231B") })
      .addTo(map)
      .bindPopup(`End — ${end.lat.toFixed(4)}, ${end.lng.toFixed(4)} (${end.time})`);
    L.polyline(
      [
        [start.lat, start.lng],
        [end.lat, end.lng],
      ],
      { color: "#1D6FE0", weight: 4, opacity: 0.9 },
    ).addTo(map);

    map.fitBounds(
      L.latLngBounds([start.lat, start.lng], [end.lat, end.lng]).pad(0.25),
    );
    mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [start.lat, start.lng, end.lat, end.lng, start.time, end.time]);

  return <div ref={ref} style={{ height }} />;
}
