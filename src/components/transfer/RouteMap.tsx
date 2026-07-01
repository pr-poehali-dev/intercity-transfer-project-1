import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

interface RouteMapProps {
  points: string[];
  className?: string;
}

interface Marker {
  name: string;
  lat: number;
  lon: number;
}

export default function RouteMap({ points, className = "" }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const key = points.filter(Boolean).join("|");

  useEffect(() => {
    const cities = points.map((p) => p.trim()).filter(Boolean);
    if (cities.length < 2) return;

    let cancelled = false;
    setLoading(true);
    setError(false);

    async function load() {
      try {
        const res = await fetch(func2url["route-geometry"], {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ points: cities }),
        });
        const data: { line?: number[][]; markers?: Marker[] } = await res.json();
        if (cancelled) return;
        if (!data.markers || data.markers.length < 2) {
          setError(true);
          setLoading(false);
          return;
        }
        renderMap(data.line || [], data.markers);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    function renderMap(line: number[][], markers: Marker[]) {
      if (!containerRef.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, {
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false,
          dragging: true,
        });
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          { maxZoom: 19 }
        ).addTo(mapRef.current);
        L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);
      }

      if (layerRef.current) {
        layerRef.current.remove();
      }
      const group = L.layerGroup().addTo(mapRef.current);
      layerRef.current = group;

      const latlngs = line.map((c) => [c[0], c[1]] as [number, number]);
      const accent = "#ff9d0a";

      if (latlngs.length > 1) {
        L.polyline(latlngs, {
          color: accent,
          weight: 4,
          opacity: 0.9,
          lineJoin: "round",
        }).addTo(group);
      }

      markers.forEach((m, i) => {
        const isEnd = i === markers.length - 1;
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:14px;height:14px;border-radius:50%;background:${
            isEnd ? accent : "#ffffff"
          };border:3px solid #0a0a0a;box-shadow:0 0 0 2px ${
            isEnd ? accent : "#ffffff"
          };"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.marker([m.lat, m.lon], { icon }).addTo(group).bindTooltip(m.name, {
          direction: "top",
          offset: [0, -8],
        });
      });

      const bounds =
        latlngs.length > 1
          ? L.latLngBounds(latlngs)
          : L.latLngBounds(markers.map((m) => [m.lat, m.lon] as [number, number]));
      mapRef.current.fitBounds(bounds, { padding: [30, 30] });
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  if (points.filter(Boolean).length < 2) return null;

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border ${className}`}>
      <div ref={containerRef} className="w-full h-full min-h-[220px] bg-surface" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="LoaderCircle" size={18} className="animate-spin text-neon" />
            Строим маршрут…
          </div>
        </div>
      )}
      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/90 text-center px-4">
          <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
            <Icon name="MapPinOff" size={22} className="text-muted-foreground" />
            Не удалось построить маршрут на карте
          </div>
        </div>
      )}
    </div>
  );
}