import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import JournalFiltersBar from "@/components/journal/JournalFiltersBar";
import JournalEditDialog from "@/components/journal/JournalEditDialog";
import {
  STATUSES,
  emptyFilters,
  fetchJournal,
  saveJournalRow,
  statusInfo,
  type JournalFilters,
  type JournalRow,
} from "@/components/journal/types";

const PASS_KEY = "journal_pass";

function Stat({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? "border-green-500/40 bg-green-500/10" : "border-border bg-card"}`}>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export default function CalcJournal() {
  const [password, setPassword] = useState(() => sessionStorage.getItem(PASS_KEY) || "");
  const [authed, setAuthed] = useState(false);
  const [filters, setFilters] = useState<JournalFilters>(emptyFilters());
  const [rows, setRows] = useState<JournalRow[]>([]);
  const [tariffs, setTariffs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<JournalRow | null>(null);
  const [saving, setSaving] = useState(false);
  const reqId = useRef(0);

  async function load(pass = password, f = filters) {
    const id = ++reqId.current;
    setLoading(true);
    setError("");
    try {
      const data = await fetchJournal(pass, f);
      if (id !== reqId.current) return;
      setRows(data.items || []);
      setTariffs(data.tariffs || []);
      setAuthed(true);
      sessionStorage.setItem(PASS_KEY, pass);
    } catch (e) {
      if (id !== reqId.current) return;
      if (e instanceof Error && e.message === "401") {
        setAuthed(false);
        sessionStorage.removeItem(PASS_KEY);
        setError("Неверный пароль");
      } else {
        setError("Не удалось загрузить журнал");
      }
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }

  useEffect(() => {
    if (password) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!authed) return;
    const t = setTimeout(() => load(password, filters), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function patchRow(row: JournalRow, patch: Record<string, unknown>) {
    setSaving(true);
    try {
      await saveJournalRow(password, row.id, patch);
      setEditing(null);
      await load();
    } catch {
      setError("Не удалось сохранить изменения");
    } finally {
      setSaving(false);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <form
          className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-6"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <h1 className="text-xl font-bold">Журнал расчётов</h1>
          <Input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || !password}>
            {loading ? "Проверяю..." : "Войти"}
          </Button>
        </form>
      </div>
    );
  }

  const ok = rows.filter((r) => r.success);
  const sum = ok.reduce((s, r) => s + (r.price || 0), 0);
  const booked = rows.filter((r) => r.booked);
  const bookedSum = booked.reduce((s, r) => s + (r.price || 0), 0);
  const conversion = ok.length ? Math.round((booked.length / ok.length) * 100) : 0;
  const uniqueIps = new Set(rows.map((r) => r.ip).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Журнал расчётов</h1>
          <Button variant="outline" onClick={() => load()} disabled={loading}>
            <Icon name="RefreshCw" size={16} className={loading ? "animate-spin" : ""} />
            Обновить
          </Button>
        </div>

        <JournalFiltersBar filters={filters} tariffs={tariffs} onChange={setFilters} />

        {filters.ip && (
          <div className="flex items-center gap-2 text-sm">
            <span>История посетителя с IP <span className="font-mono">{filters.ip}</span></span>
            <Button size="sm" variant="ghost" onClick={() => setFilters({ ...filters, ip: "" })}>
              <Icon name="X" size={14} />
            </Button>
          </div>
        )}

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Stat label="Всего расчётов" value={rows.length} />
          <Stat label="Посетителей" value={uniqueIps} sub="по разным IP" />
          <Stat label="Не удалось посчитать" value={rows.length - ok.length} />
          <Stat label="Сумма расчётов" value={`${sum.toLocaleString("ru-RU")} ₽`} />
          <Stat
            accent
            label="Оставили заявку"
            value={<>{booked.length} <span className="text-base font-normal text-muted-foreground">({conversion}%)</span></>}
            sub={`на ${bookedSum.toLocaleString("ru-RU")} ₽`}
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3">Когда</th>
                <th className="p-3">Город / IP</th>
                <th className="p-3">Маршрут</th>
                <th className="p-3">Тариф</th>
                <th className="p-3 text-right">Км</th>
                <th className="p-3 text-right">Цена</th>
                <th className="p-3">Заявка</th>
                <th className="p-3">Статус</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className={`border-b border-border last:border-0 align-top ${r.booked ? "bg-green-500/10" : ""} ${r.hidden ? "opacity-50" : ""}`}
                >
                  <td className="p-3 whitespace-nowrap">
                    <div>{r.time}</div>
                    <div className="text-xs text-muted-foreground">{r.date}</div>
                  </td>
                  <td className="p-3">
                    <div>{r.city || <span className="text-muted-foreground">—</span>}</div>
                    {r.ip && (
                      <button
                        onClick={() => setFilters({ ...filters, ip: r.ip || "" })}
                        className="text-xs text-muted-foreground font-mono underline decoration-dotted hover:text-foreground"
                        title="Показать все расчёты с этого IP"
                      >
                        {r.ip}
                      </button>
                    )}
                  </td>
                  <td className="p-3 min-w-[220px]">
                    <div>{r.from}</div>
                    {r.via && <div className="text-xs text-muted-foreground">через {r.via}</div>}
                    <div>→ {r.to}</div>
                    {r.round_trip && <div className="text-xs text-muted-foreground">туда и обратно</div>}
                    {r.note && (
                      <div className="mt-1 text-xs bg-yellow-500/10 text-yellow-300 rounded px-2 py-1 flex gap-1">
                        <Icon name="StickyNote" size={12} className="mt-0.5 flex-shrink-0" />
                        {r.note}
                      </div>
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap">{r.tariff}</td>
                  <td className="p-3 text-right whitespace-nowrap">{r.distance ?? "—"}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {r.success || r.price ? `${(r.price || 0).toLocaleString("ru-RU")} ₽` : <span className="text-red-500">не посчитано</span>}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {r.booked ? (
                      <div>
                        <div className="font-semibold text-green-500">Да{r.booked_time ? `, ${r.booked_time}` : ""}</div>
                        {r.client_name && r.client_name !== "—" && <div>{r.client_name}</div>}
                        {r.client_phone && <a href={`tel:${r.client_phone}`} className="underline">{r.client_phone}</a>}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">нет</span>
                    )}
                  </td>
                  <td className="p-3">
                    <select
                      value={r.status}
                      onChange={(e) => patchRow(r, { status: e.target.value, ...(e.target.value === "booked" ? { booked: true } : {}) })}
                      className={`rounded-md px-2 py-1 text-xs font-semibold border-0 ${statusInfo(r.status).color}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value} className="bg-background text-foreground">{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(r)} title="Редактировать">
                        <Icon name="Pencil" size={16} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => patchRow(r, { hidden: !r.hidden })}
                        title={r.hidden ? "Вернуть в журнал" : "Скрыть из журнала"}
                      >
                        <Icon name={r.hidden ? "Eye" : "EyeOff"} size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-muted-foreground">
                    {loading ? "Загружаю..." : "Ничего не найдено"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <JournalEditDialog
        row={editing}
        saving={saving}
        onClose={() => setEditing(null)}
        onSave={(patch) => editing && patchRow(editing, patch)}
      />
    </div>
  );
}
