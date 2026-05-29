import { useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { TARIFFS, getDistanceSurcharge } from "./constants";
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
  distance: number | null;
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
  price, distance, calculated, calculating,
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
    const mult = passengers > 1 ? 1 + (passengers - 1) * 0.15 : 1;
    const finalPrice = distance
      ? Math.round((distance * TARIFFS[tariff].pricePerKm * mult * getDistanceSurcharge(distance)) / 50) * 50
      : price;
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
          price: finalPrice,
          distance,
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
      <section id="calc" ref={sectionRef} className="py-16 bg-surface/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="reveal mb-8">
            <div className="inline-block font-display text-neon text-base tracking-widest mb-2">БРОНИРОВАНИЕ</div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">РАССЧИТАЙТЕ СТОИМОСТЬ ПОЕЗДКИ</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            {/* Form */}
            <div className="reveal bg-surface border border-border rounded-2xl p-4 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-display text-muted-foreground tracking-wider mb-2 block">ОТКУДА</label>
                  <CitySelect value={from} onChange={setFrom} iconName="MapPin" exclude={to} />
                </div>
                <div>
                  <label className="text-sm font-display text-muted-foreground tracking-wider mb-2 block">КУДА</label>
                  <CitySelect value={to} onChange={setTo} iconName="Navigation" exclude={from} />
                </div>
              </div>

              {/* Tariffs */}
              <div className="mb-6">
                <label className="text-sm font-display text-muted-foreground tracking-wider mb-3 block">ТАРИФ</label>
                <div className="grid grid-cols-3 gap-3">
                  {TARIFFS.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => { setTariff(i); }}
                      className={`border rounded-xl p-2 sm:p-3 text-center transition-all overflow-hidden min-w-0 ${
                        tariff === i
                          ? "border-neon bg-neon/10 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-white/30"
                      }`}
                    >
                      <Icon name={t.icon as IconName} size={18} className={`mx-auto mb-1 ${tariff === i ? "text-neon" : ""}`} />
                      <div className="font-display text-sm sm:text-base font-semibold leading-tight">{t.name}</div>
                      <div className="text-[11px] sm:text-xs opacity-70 leading-tight mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-display text-muted-foreground tracking-wider mb-2 block">ДАТА ПОЕЗДКИ</label>
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-base text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-display text-muted-foreground tracking-wider mb-2 block">ПАССАЖИРЫ</label>
                  <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-2 sm:px-4 py-3">
                    <button
                      onClick={() => { setPassengers(Math.max(1, passengers - 1)); }}
                      className="w-7 h-7 rounded-full bg-surface-hover flex items-center justify-center hover:bg-neon/20 transition-colors text-foreground font-bold text-lg leading-none"
                    >–</button>
                    <span className="flex-1 text-center font-display font-bold text-foreground">{passengers}</span>
                    <button
                      onClick={() => { setPassengers(Math.min(TARIFFS[tariff].maxPassengers, passengers + 1)); }}
                      className="w-7 h-7 rounded-full bg-surface-hover flex items-center justify-center hover:bg-neon/20 transition-colors text-foreground font-bold text-lg leading-none"
                    >+</button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1.5">
                    Макс. {TARIFFS[tariff].maxPassengers} для тарифа «{TARIFFS[tariff].name}»
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
            className="bg-surface border border-neon/40 rounded-2xl p-4 sm:p-8 max-w-lg w-full relative shadow-2xl my-auto"
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
                {(() => {
                  const mult = passengers > 1 ? 1 + (passengers - 1) * 0.15 : 1;
                  const shownPrice = distance
                    ? Math.round((distance * TARIFFS[tariff].pricePerKm * mult * getDistanceSurcharge(distance)) / 50) * 50
                    : price;
                  return (
                    <>
                      <div className="text-xs font-display text-neon tracking-widest mb-4">СТОИМОСТЬ ПОЕЗДКИ</div>
                      <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                        <span className="font-display text-lg sm:text-2xl text-muted-foreground">от</span>
                        <span className="font-display text-4xl sm:text-6xl font-bold text-neon glow-neon-text">
                          {(shownPrice ?? 0).toLocaleString("ru-RU")}
                        </span>
                        <span className="font-display text-lg sm:text-2xl text-muted-foreground">₽</span>
                      </div>
                    </>
                  );
                })()}
                <div className="text-xs text-muted-foreground/80 mb-3 flex items-center gap-1.5">
                  <Icon name="Info" size={12} className="flex-shrink-0" />
                  Точную стоимость подтвердит диспетчер
                </div>
                <div className="text-sm text-muted-foreground mb-3">
                  {from} → {to} · {TARIFFS[tariff].name} · {passengers} пасс.
                </div>
                {distance && (
                  <div className="inline-flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 mb-6">
                    <Icon name="Navigation" size={14} className="text-neon" />
                    <span className="text-sm text-foreground font-medium">
                      Расстояние: {distance.toLocaleString("ru-RU")} км по дорогам
                    </span>
                  </div>
                )}
                {distance && (
                  <div className="mb-6">
                    <div className="text-xs font-display text-muted-foreground tracking-wider mb-3">ВЫБЕРИТЕ ТАРИФ</div>
                    <div className="space-y-2">
                      {TARIFFS.map((t, i) => {
                        const mult = passengers > 1 ? 1 + (passengers - 1) * 0.15 : 1;
                        const tPrice = Math.round((distance * t.pricePerKm * mult * getDistanceSurcharge(distance)) / 50) * 50;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setTariff(i)}
                            className={`w-full flex items-center justify-between border rounded-xl px-4 py-3 transition-all ${
                              tariff === i
                                ? "border-neon bg-neon/10"
                                : "border-border bg-background hover:border-white/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon name={t.icon as IconName} size={18} className={tariff === i ? "text-neon" : "text-muted-foreground"} />
                              <div className="text-left">
                                <div className="font-display text-sm font-semibold text-foreground">{t.name}</div>
                                <div className="text-xs text-muted-foreground">{t.desc}</div>
                              </div>
                            </div>
                            <div className="font-display font-bold text-foreground">
                              от {tPrice.toLocaleString("ru-RU")} ₽
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
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
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="reveal mb-8 text-center">
          <div className="inline-block font-display text-neon text-sm tracking-widest mb-2">КАК ЭТО РАБОТАЕТ</div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">3 ШАГА ДО ПОЕЗДКИ</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
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