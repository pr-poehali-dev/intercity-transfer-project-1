import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { STATUSES, type JournalRow } from "./types";

type Props = {
  row: JournalRow | null;
  saving: boolean;
  onClose: () => void;
  onSave: (patch: Record<string, unknown>) => void;
};

type Form = {
  from: string;
  to: string;
  tariff: string;
  price: string;
  distance: string;
  client_name: string;
  client_phone: string;
  city: string;
  status: string;
  note: string;
  booked: boolean;
  hidden: boolean;
};

function toForm(r: JournalRow): Form {
  return {
    from: r.from,
    to: r.to,
    tariff: r.tariff || "",
    price: r.price != null ? String(r.price) : "",
    distance: r.distance != null ? String(r.distance) : "",
    client_name: r.client_name || "",
    client_phone: r.client_phone || "",
    city: r.city || "",
    status: r.status || "new",
    note: r.note || "",
    booked: r.booked,
    hidden: r.hidden,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export default function JournalEditDialog({ row, saving, onClose, onSave }: Props) {
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    setForm(row ? toForm(row) : null);
  }, [row]);

  if (!row || !form) return null;
  const set = (patch: Partial<Form>) => setForm({ ...form, ...patch });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Расчёт от {row.date} {row.time}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => set({ status: s.value, booked: s.value === "booked" ? true : form.booked })}
                className={`px-3 py-1.5 rounded-lg text-sm border ${form.status === s.value ? `${s.color} border-current font-semibold` : "border-border text-muted-foreground"}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Откуда"><Input value={form.from} onChange={(e) => set({ from: e.target.value })} /></Field>
            <Field label="Куда"><Input value={form.to} onChange={(e) => set({ to: e.target.value })} /></Field>
            <Field label="Тариф"><Input value={form.tariff} onChange={(e) => set({ tariff: e.target.value })} /></Field>
            <Field label="Город клиента"><Input value={form.city} onChange={(e) => set({ city: e.target.value })} /></Field>
            <Field label="Цена, ₽"><Input inputMode="numeric" value={form.price} onChange={(e) => set({ price: e.target.value.replace(/\D/g, "") })} /></Field>
            <Field label="Км"><Input inputMode="numeric" value={form.distance} onChange={(e) => set({ distance: e.target.value.replace(/\D/g, "") })} /></Field>
            <Field label="Имя клиента"><Input value={form.client_name} onChange={(e) => set({ client_name: e.target.value })} /></Field>
            <Field label="Телефон"><Input value={form.client_phone} onChange={(e) => set({ client_phone: e.target.value })} /></Field>
          </div>

          <Field label="Заметка">
            <Textarea rows={3} value={form.note} onChange={(e) => set({ note: e.target.value })} placeholder="Например: перезвонить завтра в 10:00" />
          </Field>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" checked={form.booked} onChange={(e) => set({ booked: e.target.checked })} />
              Оставил заявку
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" checked={form.hidden} onChange={(e) => set({ hidden: e.target.checked })} />
              Скрыть из журнала
            </label>
          </div>

          {row.ip && <div className="text-xs text-muted-foreground">IP: <span className="font-mono">{row.ip}</span></div>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button
            disabled={saving}
            onClick={() =>
              onSave({
                ...form,
                price: form.price === "" ? null : Number(form.price),
                distance: form.distance === "" ? null : Number(form.distance),
              })
            }
          >
            {saving ? "Сохраняю..." : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
