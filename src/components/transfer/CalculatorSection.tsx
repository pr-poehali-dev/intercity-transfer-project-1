import { useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { TARIFFS } from "./constants";
import type { IconName } from "./constants";
import CitySelect from "./CitySelect";
import func2url from "../../../backend/func2url.json";

interface CalculatorSectionProps {
  from: string;
  setFrom: (v: string) => void;
  to: string;
  setTo: (v: string) => void;
  tariff: number;
  setTariff: (v: number) => void;
  passengers: number;
  setPassengers: (v: number) => void;
  date: string;
  setDate: (v: string) => void;
  price: number | null;
  calculated: boolean;
  calculating: boolean;
  onCalculate: () => void;
  onClose: () => void;
  onRouteSelect: (from: string, to: string) => void;
  sectionRef: React.RefObject<HTMLDivElement>;
}

export default function CalculatorSection({
  from, setFrom, to, setTo,
  tariff, setTariff,
  passengers, setPassengers,
  date, setDate,
  price, calculated, calculating,
  onCalculate, onClose, onRouteSelect,
  sectionRef,
}: CalculatorSectionProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleBook() {
    if (!name.trim() || !phone.trim()) {
      setError("Заполните имя и телефон");
      return;
    }
    setError("");
    setSending(true);
    try {
      const res = await fetch(func2url["send-booking"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          from_city: from,
          to_city: to,
          date,
          passengers,
          tariff: TARIFFS[tariff].name,
          price,
        }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError("Ошибка отправки. Попробуйте позже");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* CALCULATOR */}
      <section id="calc" ref={sectionRef} className="py-24 bg-surface/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="reveal mb-12">
            <div className="inline-block font-display text-neon text-sm tracking-widest mb-3">БРОНИРОВАНИЕ</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">РАССЧИТАЙТЕ<br />СТОИМОСТЬ ПОЕЗДКИ</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            {/* Form */}
            <div className="reveal bg-surface border border-border rounded-2xl p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs font-display text-muted-foreground tracking-wider mb-2 block">ОТКУДА</label>
                  <CitySelect value={from} onChange={setFrom} iconName="MapPin" exclude={to} />
                </div>
                <div>
                  <label className="text-xs font-display text-muted-foreground tracking-wider mb-2 block">КУДА</label>
                  <CitySelect value={to} onChange={setTo} iconName="Navigation" exclude={from} />
                </div>
              </div>

              {/* Tariffs */}
              <div className="mb-6">
                <label className="text-xs font-display text-muted-foreground tracking-wider mb-3 block">ТАРИФ</label>
                <div className="grid grid-cols-3 gap-3">
                  {TARIFFS.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => { setTariff(i); }}
                      className={`border rounded-xl p-3 text-center transition-all ${
                        tariff === i
                          ? "border-neon bg-neon/10 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-white/30"
                      }`}
                    >
                      <Icon name={t.icon as IconName} size={20} className={`mx-auto mb-1 ${tariff === i ? "text-neon" : ""}`} />
                      <div className="font-display text-sm font-semibold">{t.name}</div>
                      <div className="text-xs opacity-70">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs font-display text-muted-foreground tracking-wider mb-2 block">ДАТА ПОЕЗДКИ</label>
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-display text-muted-foreground tracking-wider mb-2 block">ПАССАЖИРЫ</label>
                  <div className="flex items-center gap-3 bg-background border border-border rounded-lg px-4 py-3">
                    <button
                      onClick={() => { setPassengers(Math.max(1, passengers - 1)); }}
                      className="w-7 h-7 rounded-full bg-surface-hover flex items-center justify-center hover:bg-neon/20 transition-colors text-foreground font-bold text-lg leading-none"
                    >–</button>
                    <span className="flex-1 text-center font-display font-bold text-foreground">{passengers}</span>
                    <button
                      onClick={() => { setPassengers(Math.min(7, passengers + 1)); }}
                      className="w-7 h-7 rounded-full bg-surface-hover flex items-center justify-center hover:bg-neon/20 transition-colors text-foreground font-bold text-lg leading-none"
                    >+</button>
                  </div>
                </div>
              </div>

              <button
                onClick={onCalculate}
                disabled={from === to || calculating}
                className="w-full bg-neon text-background font-display font-bold text-base py-4 rounded-xl hover:opacity-90 transition-all glow-neon hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {calculating ? (
                  <>
                    <Icon name="Loader2" size={18} className="animate-spin" />
                    РАССЧИТЫВАЕМ...
                  </>
                ) : (
                  "РАССЧИТАТЬ СТОИМОСТЬ"
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL with price */}
      {calculated && price && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-up overflow-y-auto"
          onClick={() => { setSent(false); setError(""); onClose(); }}
        >
          <div
            className="bg-surface border border-neon/40 rounded-2xl p-8 max-w-lg w-full relative shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setSent(false); setError(""); onClose(); }}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background hover:bg-neon/20 transition-colors flex items-center justify-center"
              aria-label="Закрыть"
            >
              <Icon name="ChevronRight" size={18} className="rotate-45 text-muted-foreground" />
            </button>

            {sent ? (
              <div className="text-center py-6">
                <Icon name="CheckCircle2" size={64} className="text-neon mx-auto mb-4" />
                <div className="font-display text-2xl font-bold mb-2">Заявка принята!</div>
                <p className="text-sm text-muted-foreground mb-6">Мы перезвоним вам в течение 15 минут</p>
                <button
                  onClick={() => { setSent(false); setName(""); setPhone(""); onClose(); }}
                  className="bg-neon text-background font-display font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all"
                >
                  ХОРОШО
                </button>
              </div>
            ) : (
              <>
                <div className="text-xs font-display text-neon tracking-widest mb-4">СТОИМОСТЬ ПОЕЗДКИ</div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-display text-6xl font-bold text-neon glow-neon-text">
                    {price.toLocaleString("ru-RU")}
                  </span>
                  <span className="font-display text-2xl text-muted-foreground">₽</span>
                </div>
                <div className="text-sm text-muted-foreground mb-6">
                  {from} → {to} · {TARIFFS[tariff].name} · {passengers} пасс.
                </div>
                <div className="space-y-2 text-sm mb-6">
                  {[
                    "Фиксированная цена, без доплат",
                    "Встреча по адресу или в аэропорту",
                    "Бесплатное ожидание 30 минут",
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="CheckCircle" size={14} className="text-neon flex-shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>
                <div className="space-y-3 mb-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше имя"
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Телефон, например +7 999 123-45-67"
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
                {error && <div className="text-sm text-red-400 mb-3">{error}</div>}
                <button
                  onClick={handleBook}
                  disabled={sending}
                  className="w-full bg-neon text-background font-display font-bold py-4 rounded-xl hover:opacity-90 transition-all glow-neon disabled:opacity-50"
                >
                  {sending ? "ОТПРАВЛЯЕМ..." : `ЗАБРОНИРОВАТЬ ЗА ${price.toLocaleString("ru-RU")} ₽`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* HOW IT WORKS */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="reveal mb-16 text-center">
          <div className="inline-block font-display text-neon text-sm tracking-widest mb-3">КАК ЭТО РАБОТАЕТ</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold">3 ШАГА ДО ПОЕЗДКИ</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { num: "1", icon: "MapPin", title: "Выберите маршрут", desc: "Укажите откуда и куда, дату и количество пассажиров" },
            { num: "2", icon: "CreditCard", title: "Оплатите водителю", desc: "Наличными или переводом. Цена фиксирована и не меняется" },
            { num: "3", icon: "Car", title: "Поедем!", desc: "Водитель встретит вас точно в назначенное время" },
          ].map((step, i) => (
            <div key={i} className="reveal text-center">
              <div className="relative inline-flex mb-6">
                <div className="w-20 h-20 border-2 border-neon rounded-2xl flex items-center justify-center bg-neon/10">
                  <Icon name={step.icon as IconName} size={32} className="text-neon" />
                </div>
                <div className="absolute -top-3 -right-3 font-display text-xs font-bold bg-neon text-background w-7 h-7 rounded-full flex items-center justify-center">
                  {step.num}
                </div>
              </div>
              <h3 className="font-display text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}