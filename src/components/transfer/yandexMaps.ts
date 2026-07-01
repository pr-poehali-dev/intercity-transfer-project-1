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