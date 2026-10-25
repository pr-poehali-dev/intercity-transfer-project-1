import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";

type Row = {
  time: string;
  from: string;
  to: string;
  via: string | null;
  distance: number | null;
  price: number | null;
  tariff: string;
  round_trip: boolean;
  success: boolean;
};

const PASS_KEY = "journal_pass";

function todayMsk() {
  const d = new Date(Date.now() + 3 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}

export default function CalcJournal() {
  const [password, setPassword] = useState(() => sessionStorage.getItem(PASS_KEY) || "");
  const [authed, setAuthed] = useState(false);
  const [date, setDate] = useState(todayMsk());
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load(pass = password, day = date) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${func2url["reviews"]}?action=calc_log&date=${day}`, {
        headers: { "X-Admin-Password": pass },
      });
      if (res.status === 401) {
        setAuthed(false);
        sessionStorage.removeItem(PASS_KEY);
        setError("Неверный пароль");
        return;
      }
      const data = await res.json();
      setRows(data.items || []);
      setAuthed(true);
      sessionStorage.setItem(PASS_KEY, pass);
    } catch {
      setError("Не удалось загрузить журнал");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (password) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Журнал расчётов</h1>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                load(password, e.target.value);
              }}
              className="w-44"
            />
            <Button variant="outline" onClick={() => load()} disabled={loading}>
              <Icon name="RefreshCw" size={16} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Всего расчётов</div>
            <div className="text-2xl font-bold">{rows.length}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Не удалось посчитать</div>
            <div className="text-2xl font-bold">{rows.length - ok.length}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">Сумма посчитанных цен</div>
            <div className="text-2xl font-bold">{sum.toLocaleString("ru-RU")} ₽</div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3">Время</th>
                <th className="p-3">Откуда</th>
                <th className="p-3">Куда</th>
                <th className="p-3">Тариф</th>
                <th className="p-3 text-right">Км</th>
                <th className="p-3 text-right">Цена</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0 align-top">
                  <td className="p-3 whitespace-nowrap">{r.time}</td>
                  <td className="p-3">{r.from}</td>
                  <td className="p-3">
                    {r.via && <div className="text-muted-foreground text-xs">через {r.via}</div>}
                    {r.to}
                    {r.round_trip && <div className="text-xs text-muted-foreground">туда и обратно</div>}
                  </td>
                  <td className="p-3 whitespace-nowrap">{r.tariff}</td>
                  <td className="p-3 text-right whitespace-nowrap">{r.distance ?? "—"}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {r.success ? `${(r.price || 0).toLocaleString("ru-RU")} ₽` : <span className="text-red-500">не посчитано</span>}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    {loading ? "Загружаю..." : "За этот день расчётов нет"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
