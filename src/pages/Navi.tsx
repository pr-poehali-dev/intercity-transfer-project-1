import { useEffect, useMemo } from "react";
import Icon from "@/components/ui/icon";
import RouteMap from "@/components/transfer/RouteMap";

type Pt = { lat: number; lon: number };

function parsePoints(raw: string | null): Pt[] {
  if (!raw) return [];
  return raw
    .split("~")
    .map((p) => p.split(",").map(Number))
    .filter((p) => p.length === 2 && p.every((n) => Number.isFinite(n)))
    .map(([lat, lon]) => ({ lat, lon }));
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
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const pts = useMemo(() => parsePoints(params.get("p")), [params]);
  const names = (params.get("n") || "").split("~").filter(Boolean);
  const ok = pts.length >= 2;

  useEffect(() => {
    document.title = "Маршрут поездки";
  }, []);

  if (!ok) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-muted-foreground">
        Маршрут не найден
      </div>
    );
  }

  const btn = "flex items-center justify-center gap-2 w-full rounded-xl px-4 py-4 font-semibold text-base";

  return (
    <div className="min-h-screen flex justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-2xl flex flex-col gap-3">
        <div className="text-xs font-display text-neon tracking-widest">МАРШРУТ ПОЕЗДКИ</div>
        <div className="font-display text-xl font-bold mb-2">
          {names.length ? names.join(" → ") : `${pts.length} точки`}
        </div>
        <RouteMap
          points={pts.map((p) => `${p.lat},${p.lon}`)}
          labels={names.length === pts.length ? names : undefined}
          className="h-[55vh] min-h-[300px] mb-2"
        />
        <a href={naviLink(pts)} className={`${btn} bg-neon text-background`}>
          <Icon name="Navigation" size={18} />
          Открыть в Навигаторе
        </a>
        <a href={mapsAppLink(pts)} className={`${btn} bg-surface border border-border text-foreground`}>
          <Icon name="Map" size={18} />
          Открыть в Яндекс Картах
        </a>
        <a href={webLink(pts)} target="_blank" rel="noreferrer" className={`${btn} bg-surface border border-border text-foreground`}>
          <Icon name="Globe" size={18} />
          Карта в браузере
        </a>
      </div>
    </div>
  );
}
