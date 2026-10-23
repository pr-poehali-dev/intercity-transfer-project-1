const BOT_RE = /bot|crawl|spider|slurp|yandex|google|bing|lighthouse|headless|prerender|preview|facebookexternalhit|telegram|whatsapp|vkshare|curl|wget|python/i;

export const isBot = typeof navigator !== "undefined" && BOT_RE.test(navigator.userAgent || "");

const PREFIX = "fncache:";

export function cacheGet<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > ttlMs) return null;
    return v as T;
  } catch {
    return null;
  }
}

export function cacheSet(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ t: Date.now(), v: value }));
  } catch {
    /* переполнено — пропускаем */
  }
}
