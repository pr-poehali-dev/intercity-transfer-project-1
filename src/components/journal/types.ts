import func2url from "../../../backend/func2url.json";

export type JournalRow = {
  id: number;
  date: string;
  time: string;
  from: string;
  to: string;
  via: string | null;
  distance: number | null;
  price: number | null;
  tariff: string;
  round_trip: boolean;
  success: boolean;
  booked: boolean;
  booked_time: string | null;
  client_name: string | null;
  client_phone: string | null;
  ip: string | null;
  city: string | null;
  status: string;
  note: string | null;
  hidden: boolean;
};

export type JournalFilters = {
  date_from: string;
  date_to: string;
  q: string;
  city: string;
  ip: string;
  tariff: string;
  status: string;
  booked: string;
  success: string;
  show_hidden: string;
};

export const STATUSES: { value: string; label: string; color: string }[] = [
  { value: "new", label: "Новый", color: "bg-muted text-foreground" },
  { value: "called", label: "Перезвонили", color: "bg-blue-500/20 text-blue-400" },
  { value: "booked", label: "Заказал", color: "bg-green-500/20 text-green-400" },
  { value: "refused", label: "Отказ", color: "bg-orange-500/20 text-orange-400" },
  { value: "spam", label: "Мусор", color: "bg-red-500/20 text-red-400" },
];

export function statusInfo(value: string) {
  return STATUSES.find((s) => s.value === value) || STATUSES[0];
}

export function todayMsk() {
  return new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10);
}

export function emptyFilters(): JournalFilters {
  const d = todayMsk();
  return { date_from: d, date_to: d, q: "", city: "", ip: "", tariff: "", status: "", booked: "", success: "", show_hidden: "" };
}

const URL = `${func2url["reviews"]}?action=calc_log`;

export async function fetchJournal(password: string, f: JournalFilters) {
  const qs = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });
  const res = await fetch(`${URL}&${qs.toString()}`, { headers: { "X-Admin-Password": password } });
  if (res.status === 401) throw new Error("401");
  if (!res.ok) throw new Error("load");
  return (await res.json()) as { items: JournalRow[]; tariffs: string[] };
}

export async function saveJournalRow(password: string, id: number, patch: Record<string, unknown>) {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Password": password },
    body: JSON.stringify({ edit: true, id, ...patch }),
  });
  if (!res.ok) throw new Error("save");
}
