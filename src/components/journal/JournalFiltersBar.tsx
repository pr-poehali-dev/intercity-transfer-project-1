import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { STATUSES, emptyFilters, todayMsk, type JournalFilters } from "./types";

type Props = {
  filters: JournalFilters;
  tariffs: string[];
  onChange: (f: JournalFilters) => void;
};

const selectCls = "h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground";

function shiftDay(days: number) {
  return new Date(Date.now() + 3 * 3600 * 1000 - days * 86400 * 1000).toISOString().slice(0, 10);
}

export default function JournalFiltersBar({ filters, tariffs, onChange }: Props) {
  const set = (patch: Partial<JournalFilters>) => onChange({ ...filters, ...patch });
  const presets = [
    { label: "Сегодня", from: todayMsk(), to: todayMsk() },
    { label: "Вчера", from: shiftDay(1), to: shiftDay(1) },
    { label: "7 дней", from: shiftDay(6), to: todayMsk() },
    { label: "30 дней", from: shiftDay(29), to: todayMsk() },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {presets.map((p) => {
          const active = filters.date_from === p.from && filters.date_to === p.to;
          return (
            <Button key={p.label} size="sm" variant={active ? "default" : "outline"} onClick={() => set({ date_from: p.from, date_to: p.to })}>
              {p.label}
            </Button>
          );
        })}
        <div className="flex items-center gap-1">
          <Input type="date" value={filters.date_from} onChange={(e) => set({ date_from: e.target.value })} className="w-40" />
          <span className="text-muted-foreground">—</span>
          <Input type="date" value={filters.date_to} onChange={(e) => set({ date_to: e.target.value })} className="w-40" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Маршрут, имя, телефон, заметка"
            value={filters.q}
            onChange={(e) => set({ q: e.target.value })}
            className="pl-9"
          />
        </div>
        <Input placeholder="Город клиента" value={filters.city} onChange={(e) => set({ city: e.target.value })} />
        <Input placeholder="IP" value={filters.ip} onChange={(e) => set({ ip: e.target.value.trim() })} />
        <select className={selectCls} value={filters.tariff} onChange={(e) => set({ tariff: e.target.value })}>
          <option value="">Все тарифы</option>
          {tariffs.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select className={selectCls} value={filters.status} onChange={(e) => set({ status: e.target.value })}>
          <option value="">Все статусы</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select className={selectCls} value={filters.booked} onChange={(e) => set({ booked: e.target.value })}>
          <option value="">Заявка: все</option>
          <option value="1">Оставили заявку</option>
          <option value="0">Без заявки</option>
        </select>
        <select className={selectCls} value={filters.success} onChange={(e) => set({ success: e.target.value })}>
          <option value="">Расчёт: все</option>
          <option value="1">Посчитано</option>
          <option value="0">Не посчитано</option>
        </select>
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.show_hidden === "1"}
              onChange={(e) => set({ show_hidden: e.target.checked ? "1" : "" })}
              className="w-4 h-4"
            />
            Показать скрытые
          </label>
          <Button size="sm" variant="ghost" onClick={() => onChange(emptyFilters())}>
            <Icon name="X" size={14} />
            Сбросить
          </Button>
        </div>
      </div>
    </div>
  );
}
