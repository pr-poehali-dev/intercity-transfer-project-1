/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { loadYandexMaps } from "./yandexMaps";
import func2url from "../../../backend/func2url.json";
import { isBot, cacheGet, cacheSet } from "@/lib/apiGuard";

interface RouteMapProps {
  points: string[];
  labels?: string[];
  className?: string;
}

const ACCENT = "#ff9d0a";
const NEW_ZONE_COLOR = "#e53935";
const CRIMEA_ZONE_COLOR = "#8e44ef";
const KURSK_ZONE_COLOR = "#1e88e5";

type Zone = "n" | "c" | "k" | ".";

function splitByZone(line: number[][], zones: string) {
  const parts: { zone: Zone; pts: number[][] }[] = [];
  for (let i = 0; i < line.length - 1; i++) {
    const zone: Zone = zones[i] === "n" ? "n" : zones[i] === "c" ? "c" : zones[i] === "k" ? "k" : ".";
    const last = parts[parts.length - 1];
    if (last && last.zone === zone) {
      last.pts.push(line[i + 1]);
    } else {
      parts.push({ zone, pts: [line[i], line[i + 1]] });
    }
  }
  return parts;
}

async function fetchGeometry(cities: string[]): Promise<any> {
  const ck = "geo:" + cities.join("|").toLowerCase();
  const hit = cacheGet<any>(ck, 7 * 24 * 3600 * 1000);
  if (hit) return hit;
  for (let attempt = 0; attempt < 1; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    try {
      const res = await fetch(func2url["calc-distance"], {
        signal: ctrl.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: cities, geometry: true }),
      });
      const data = await res.json();
      if (data?.line && data.line.length >= 2) {
        cacheSet(ck, data);
        return data;
      }
    } catch {
      /* повторим */
    } finally {
      clearTimeout(timer);
    }
    if (ctrl.signal.aborted) break;
  }
  return null;
}

export default function RouteMap({ points, labels, className = "" }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const key = points.filter(Boolean).join("|");

  useEffect(() => {
    const cities = points.map((p) => p.trim()).filter(Boolean);
    if (cities.length < 2) return;
    if (isBot) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    async function load() {
      try {
        const [ymaps, res] = await Promise.all([loadYandexMaps(), fetchGeometry(cities)]);

        if (cancelled || !containerRef.current) return;

        const line: number[][] | null = res?.line || null;
        const stops: number[][] | null = res?.stops || null;

        if (mapRef.current) {
          mapRef.current.destroy();
          mapRef.current = null;
        }

        if (!line || line.length < 2) {
          const fallbackMap = new ymaps.Map(
            containerRef.current,
            { center: [55.75, 37.62], zoom: 5, controls: ["zoomControl"] },
            { suppressMapOpenBlock: true }
          );
          fallbackMap.behaviors.disable("scrollZoom");
          mapRef.current = fallbackMap;
          const multi = new ymaps.multiRouter.MultiRoute(
            { referencePoints: cities, params: { routingMode: "auto", results: 1 } },
            {
              boundsAutoApply: true,
              routeActiveStrokeColor: ACCENT,
              routeActiveStrokeWidth: 6,
              wayPointStartIconColor: ACCENT,
              wayPointFinishIconColor: ACCENT,
              viaPointIconFillColor: ACCENT,
            }
          );
          multi.model.events.add("requestfail", () => {
            if (!cancelled) {
              setError(true);
              setLoading(false);
            }
          });
          multi.model.events.add("requestsuccess", () => {
            if (!cancelled) setLoading(false);
          });
          fallbackMap.geoObjects.add(multi);
          return;
        }

        const map = new ymaps.Map(
          containerRef.current,
          { center: line[Math.floor(line.length / 2)], zoom: 6, controls: ["zoomControl"] },
          { suppressMapOpenBlock: true }
        );
        map.behaviors.disable("scrollZoom");
        mapRef.current = map;

        const polyline = new ymaps.Polyline(line, {}, { strokeOpacity: 0 });
        map.geoObjects.add(polyline);

        const zones: string = typeof res?.zones === "string" ? res.zones : "";
        const parts = zones.length === line.length - 1
          ? splitByZone(line, zones)
          : [{ zone: "." as Zone, pts: line }];
        parts.forEach((p) => {
          map.geoObjects.add(
            new ymaps.Polyline(p.pts, {}, {
              strokeColor: p.zone === "n" ? NEW_ZONE_COLOR : p.zone === "c" ? CRIMEA_ZONE_COLOR : p.zone === "k" ? KURSK_ZONE_COLOR : ACCENT,
              strokeWidth: p.zone === "." ? 5 : 6,
              strokeOpacity: 0.95,
            })
          );
        });

        const marks = stops && stops.length >= 2 ? stops : [line[0], line[line.length - 1]];
        const names = labels && labels.length === cities.length ? labels : cities;
        marks.forEach((c, i) => {
          const isStart = i === 0;
          const isEnd = i === marks.length - 1;
          const placemark = new ymaps.Placemark(
            c,
            { iconCaption: isStart ? names[0] : isEnd ? names[names.length - 1] : names[i] },
            {
              preset: isStart ? "islands#circleDotIcon" : "islands#circleIcon",
              iconColor: ACCENT,
            }
          );
          map.geoObjects.add(placemark);
        });

        map.setBounds(polyline.geometry.getBounds(), {
          checkZoomRange: true,
          zoomMargin: 30,
        });

        if (!cancelled) setLoading(false);
      } catch (e) {
        console.error("[RouteMap] load error", e);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

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
            <button
              type="button"
              onClick={() => setAttempt((a) => a + 1)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-neon text-background font-semibold px-3 py-1.5"
            >
              <Icon name="RefreshCw" size={14} />
              Повторить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}