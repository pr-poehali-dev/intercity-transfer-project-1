import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import RouteMap from "@/components/transfer/RouteMap";
import func2url from "../../backend/func2url.json";
import { useLocation } from "@/lib/router-compat";

type Pt = { lat: number; lon: number };

function parsePoints(raw: string | null): Pt[] {
  if (!raw) return [];
  if (raw.includes("~") || raw.includes(",")) {
    return raw
      .split("~")
      .map((p) => p.split(",").map(Number))
      .filter((p) => p.length === 2 && p.every((n) => Number.isFinite(n)))
      .map(([lat, lon]) => ({ lat, lon }));
  }
  const nums = raw.split("_").map(Number);
  const out: Pt[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    if (Number.isFinite(nums[i]) && Number.isFinite(nums[i + 1])) out.push({ lat: nums[i], lon: nums[i + 1] });
  }
  return out;
}

function naviLink(pts: Pt[]): string {
  const start = pts[0];
  const end = pts[pts.length - 1];
  const via = pts.slice(1, -1);
  const params = new URLSearchParams({
    lat_from: String(start.lat),
    lon_from: String(start.lon),
    lat_to: String(end.lat),
    lon_to: String(end.lon),
  });
  via.forEach((p, i) => {
    params.set(`lat_via_${i}`, String(p.lat));
    params.set(`lon_via_${i}`, String(p.lon));
  });
  return `yandexnavi://build_route_on_map?${params.toString()}`;
}

function mapsAppLink(pts: Pt[]): string {
  return `yandexmaps://maps.yandex.ru/?rtext=${pts.map((p) => `${p.lat},${p.lon}`).join("~")}&rtt=auto`;
}

function webLink(pts: Pt[]): string {
  return `https://yandex.ru/maps/?mode=routes&rtt=auto&rtext=${pts.map((p) => `${p.lat},${p.lon}`).join("~")}`;
}

export default function Navi() {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const pts = useMemo(() => parsePoints(params.get("p")), [params]);
  const stops = useMemo(() => (params.get("s") || "").split("_").map((x) => x.trim()).filter(Boolean), [params]);
  const names = (params.get("n") || "").split(/[~_]/).filter(Boolean);
  const [resolved, setResolved] = useState<Pt[]>([]);
  const ok = pts.length >= 2 || stops.length >= 2;

  useEffect(() => {
    if (pts.length >= 2 || stops.length < 2) return;
    let cancelled = false;
    fetch(func2url["calc-distance"], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points: stops, coords_only: true }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !Array.isArray(d?.coords)) return;
        const list: Pt[] = d.coords
          .filter((c: unknown) => Array.isArray(c) && c.length === 2)
          .map((c: number[]) => ({ lat: c[0], lon: c[1] }));
        if (list.length === stops.length) setResolved(list);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pts, stops]);

  const navPts = pts.length >= 2 ? pts : resolved;
  const byCoords = navPts.length >= 2;

  useEffect(() => {
    document.title = "Маршрут поездки";
  }, []);

  if (!ok) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-muted-foreground">
        Маршрут не найден
        <p className="sr-only">
          Страница маршрута поездки НАШЕ Трансфер: откройте ссылку с точками маршрута, чтобы построить путь в Яндекс Навигаторе, Яндекс Картах или в браузере.
        </p>
      </div>
    );
  }

  const mapPoints = pts.length >= 2 ? pts.map((p) => `${p.lat},${p.lon}`) : stops;
  const labelsList = names.length === mapPoints.length ? names : undefined;
  const textWebLink = `https://yandex.ru/maps/?mode=routes&rtt=auto&rtext=${stops.map((x) => encodeURIComponent(x)).join("~")}`;
  const btn = "flex items-center justify-center gap-2 w-full rounded-xl px-4 py-4 font-semibold text-base";

  return (
    <div className="min-h-screen flex justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-2xl flex flex-col gap-3">
        <div className="text-xs font-display text-neon tracking-widest">МАРШРУТ ПОЕЗДКИ</div>
        <div className="font-display text-xl font-bold mb-2">
          {names.length ? names.join(" → ") : `${mapPoints.length} точки`}
        </div>
        <RouteMap
          points={mapPoints}
          labels={labelsList}
          className="h-[55vh] min-h-[300px] mb-2"
        />
        {byCoords && (
          <>
            <a href={naviLink(navPts)} className={`${btn} bg-neon text-background`}>
              <Icon name="Navigation" size={18} />
              Открыть в Навигаторе
            </a>
            <a href={mapsAppLink(navPts)} className={`${btn} bg-surface border border-border text-foreground`}>
              <Icon name="Map" size={18} />
              Открыть в Яндекс Картах
            </a>
          </>
        )}
        <a href={byCoords ? webLink(navPts) : textWebLink} target="_blank" rel="noreferrer" className={`${btn} bg-surface border border-border text-foreground`}>
          <Icon name="Globe" size={18} />
          Карта в браузере
        </a>
      </div>
    </div>
  );
}