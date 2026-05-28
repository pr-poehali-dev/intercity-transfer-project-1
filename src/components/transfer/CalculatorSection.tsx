import { useRef } from "react";
import Icon from "@/components/ui/icon";
import { CITIES, TARIFFS, getDistance } from "./constants";
import type { IconName } from "./constants";

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
  onCalculate: () => void;
  onRouteSelect: (from: string, to: string) => void;
  sectionRef: React.RefObject<HTMLDivElement>;
}

export default function CalculatorSection({
  from, setFrom, to, setTo,
  tariff, setTariff,
  passengers, setPassengers,
  date, setDate,
  price, calculated,
  onCalculate, onRouteSelect,
  sectionRef,
}: CalculatorSectionProps) {
  return (
    <>
      {/* CALCULATOR */}
      <section id="calc" ref={sectionRef} className="py-24 bg-surface/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="reveal mb-12">
            <div className="inline-block font-display text-neon text-sm tracking-widest mb-3">БРОНИРОВАНИЕ</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">РАССЧИТАЙТЕ<br />СТОИМОСТЬ ПОЕЗДКИ</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="reveal bg-surface border border-border rounded-2xl p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs font-display text-muted-foreground tracking-wider mb-2 block">ОТКУДА</label>
                  <div className="relative">
                    <Icon name="MapPin" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neon pointer-events-none" />
                    <select
                      value={from}
                      onChange={(e) => { setFrom(e.target.value); }}
                      className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-3 text-sm appearance-none cursor-pointer text-foreground"
                    >
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-display text-muted-foreground tracking-wider mb-2 block">КУДА</label>
                  <div className="relative">
                    <Icon name="Navigation" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neon pointer-events-none" />
                    <select
                      value={to}
                      onChange={(e) => { setTo(e.target.value); }}
                      className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-3 text-sm appearance-none cursor-pointer text-foreground"
                    >
                      {CITIES.filter((c) => c !== from).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
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
                disabled={from === to}
                className="w-full bg-neon text-background font-display font-bold text-base py-4 rounded-xl hover:opacity-90 transition-all glow-neon hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                РАССЧИТАТЬ СТОИМОСТЬ
              </button>
            </div>

            {/* Result + routes */}
            <div className="flex flex-col gap-4">
              <div className={`reveal border rounded-2xl p-8 transition-all duration-500 ${
                calculated ? "border-neon/40 bg-neon/5" : "border-border bg-surface"
              }`}>
                {calculated && price ? (
                  <div className="animate-fade-up">
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
                    <button className="w-full bg-neon text-background font-display font-bold py-4 rounded-xl hover:opacity-90 transition-all glow-neon">
                      ЗАБРОНИРОВАТЬ ЗА {price.toLocaleString("ru-RU")} ₽
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-52 text-center">
                    <Icon name="Calculator" size={40} className="text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-sm">Заполните форму и нажмите<br />"Рассчитать стоимость"</p>
                  </div>
                )}
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="reveal mb-16 text-center">
          <div className="inline-block font-display text-neon text-sm tracking-widest mb-3">КАК ЭТО РАБОТАЕТ</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold">3 ШАГА ДО ПОЕЗДКИ</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { num: "1", icon: "MapPin", title: "Выберите маршрут", desc: "Укажите откуда и куда, дату и количество пассажиров" },
            { num: "2", icon: "CreditCard", title: "Оплатите онлайн", desc: "Безопасная оплата картой. Цена фиксирована и не меняется" },
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