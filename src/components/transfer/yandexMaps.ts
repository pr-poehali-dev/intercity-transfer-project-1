/* eslint-disable @typescript-eslint/no-explicit-any */
import func2url from "../../../backend/func2url.json";

declare global {
  interface Window {
    ymaps?: any;
  }
}

let loaderPromise: Promise<any> | null = null;

async function fetchKey(): Promise<string> {
  const res = await fetch(func2url["yandex-key"]);
  const data: { key?: string } = await res.json();
  if (!data.key) throw new Error("Yandex Maps API key is not configured");
  return data.key;
}

export function loadYandexMaps(): Promise<any> {
  if (window.ymaps && window.ymaps.Map) {
    return Promise.resolve(window.ymaps);
  }
  if (loaderPromise) return loaderPromise;

  loaderPromise = (async () => {
    const key = await fetchKey();
    await new Promise<void>((resolve, reject) => {
      const existing = document.getElementById("ymaps-script");
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("ymaps load error")));
        return;
      }
      const script = document.createElement("script");
      script.id = "ymaps-script";
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(key)}&lang=ru_RU`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("ymaps load error"));
      document.head.appendChild(script);
    });
    await new Promise<void>((resolve) => window.ymaps.ready(resolve));
    return window.ymaps;
  })().catch((e) => {
    loaderPromise = null;
    throw e;
  });

  return loaderPromise;
}

export interface YandexRouteResult {
  distanceKm: number;
  durationText: string;
}

/**
 * Строит автомобильный маршрут по дорогам через Яндекс multiRouter
 * и возвращает суммарное расстояние (км) и время в пути.
 */
export async function getYandexRoute(points: string[]): Promise<YandexRouteResult | null> {
  const stops = points.map((p) => p.trim()).filter(Boolean);
  if (stops.length < 2) return null;

  const ymaps = await loadYandexMaps();

  return new Promise<YandexRouteResult | null>((resolve) => {
    let done = false;
    const finish = (v: YandexRouteResult | null) => {
      if (!done) {
        done = true;
        resolve(v);
      }
    };

    try {
      const multiRoute = new ymaps.multiRouter.MultiRoute(
        { referencePoints: stops, params: { routingMode: "auto", results: 1 } },
        { boundsAutoApply: false }
      );

      multiRoute.model.events.add("requestsuccess", () => {
        const active = multiRoute.getActiveRoute();
        if (!active) return finish(null);
        const meters: number = active.properties.get("distance").value;
        const durationText: string = active.properties.get("duration").text;
        finish({ distanceKm: Math.round(meters / 1000), durationText });
      });
      multiRoute.model.events.add("requestfail", () => finish(null));
    } catch {
      finish(null);
    }

    setTimeout(() => finish(null), 12000);
  });
}