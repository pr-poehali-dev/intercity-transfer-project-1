const BOT_RE = /bot|crawl|spider|slurp|lighthouse|headless|prerender|facebookexternalhit|vkshare|curl|wget|python/i;

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
const CALC_IDS_KEY = "calc_log_ids";

export function rememberCalcId(id: number) {
  try {
    const now = Date.now();
    const list: { id: number; t: number }[] = JSON.parse(localStorage.getItem(CALC_IDS_KEY) || "[]");
    const fresh = list.filter((x) => now - x.t < 2 * 24 * 3600 * 1000).slice(-19);
    fresh.push({ id, t: now });
    localStorage.setItem(CALC_IDS_KEY, JSON.stringify(fresh));
  } catch {
    /* пропускаем */
  }
}

export function getCalcIds(): number[] {
  try {
    const now = Date.now();
    const list: { id: number; t: number }[] = JSON.parse(localStorage.getItem(CALC_IDS_KEY) || "[]");
    return list.filter((x) => now - x.t < 2 * 24 * 3600 * 1000).map((x) => x.id);
  } catch {
    return [];
  }
}

export function clearCalcIds() {
  try {
    localStorage.removeItem(CALC_IDS_KEY);
  } catch {
    /* пропускаем */
  }
}

const YM_ID = 109705581;

export function ymGoal(goal: string, params?: Record<string, unknown>) {
  try {
    const ym = (window as unknown as { ym?: (...a: unknown[]) => void }).ym;
    if (!ym) return;
    ym(YM_ID, "reachGoal", goal, params);
    if (params) ym(YM_ID, "params", params);
  } catch {
    /* пропускаем */
  }
}
