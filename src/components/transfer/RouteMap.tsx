/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";
import { loadYandexMaps } from "./yandexMaps";

interface RouteMapProps {
  points: string[];
  className?: string;
}

interface Marker {
  name: string;
  lat: number;
  lon: number;
}

const ACCENT = "#ff9d0a";

export default function RouteMap({ points, className = "" }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
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
        const [geoRes, ymaps] = await Promise.all([
          fetch(func2url["route-geometry"], {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ points: cities }),
          }).then((r) => r.json()),
          loadYandexMaps(),
        ]);
        if (cancelled) return;

        const data = geoRes as { line?: number[][]; markers?: Marker[] };
        if (!data.markers || data.markers.length < 2) {
          setError(true);
          setLoading(false);
          return;
        }
        renderMap(ymaps, data.line || [], data.markers);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    function renderMap(ymaps: any, line: number[][], markers: Marker[]) {
      if (!containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }

      const map = new ymaps.Map(
        containerRef.current,
        {
          center: [markers[0].lat, markers[0].lon],
          zoom: 6,
          controls: ["zoomControl"],
        },
        { suppressMapOpenBlock: true }
      );
      map.behaviors.disable("scrollZoom");
      mapRef.current = map;

      if (line.length > 1) {
        const polyline = new ymaps.Polyline(
          line,
          {},
          {
            strokeColor: ACCENT,
            strokeWidth: 5,
            strokeOpacity: 0.9,
          }
        );
        map.geoObjects.add(polyline);
      }

      markers.forEach((m, i) => {
        const isEnd = i === markers.length - 1;
        const placemark = new ymaps.Placemark(
          [m.lat, m.lon],
          { balloonContent: m.name, hintContent: m.name },
          {
            preset: isEnd
              ? "islands#redCircleDotIcon"
              : "islands#blueCircleDotIcon",
            iconColor: isEnd ? ACCENT : "#ffffff",
          }
        );
        map.geoObjects.add(placemark);
      });

      const bounds = map.geoObjects.getBounds();
      if (bounds) {
        map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 30 });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, []);

  if (points.filter(Boolean).length < 2) return null;

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border ${className}`}>
      <div ref={containerRef} className="w-full h-full min-h-[220px] bg-surface" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/80 backdrop-blur-sm z-[500]">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="LoaderCircle" size={18} className="animate-spin text-neon" />
            Строим маршрут…
          </div>
        </div>
      )}
      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/90 text-center px-4 z-[500]">
          <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
            <Icon name="MapPinOff" size={22} className="text-muted-foreground" />
            Не удалось построить маршрут на карте
          </div>
        </div>
      )}
    </div>
  );
}
