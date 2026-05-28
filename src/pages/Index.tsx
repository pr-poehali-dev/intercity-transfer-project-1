import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

type IconName = "MapPin" | "Navigation" | "Car" | "Star" | "Users" | "Shield" | "Clock" | "CreditCard" | "Headphones" | "Phone" | "Calculator" | "CheckCircle" | "ArrowRight" | "MessageCircle" | "Send" | "Mail" | "ChevronRight";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/62498eaa-31ad-4421-848c-bf54bb4f1b4a/files/7abb32d5-3e82-4181-9766-9e4568cb20f2.jpg";

const CITIES = [
  "Москва", "Санкт-Петербург", "Казань", "Нижний Новгород",
  "Самара", "Екатеринбург", "Краснодар", "Ростов-на-Дону",
  "Воронеж", "Уфа", "Пермь", "Тверь", "Ярославль", "Тула",
];

const TARIFFS = [
  { name: "Эконом", pricePerKm: 4.5, icon: "Car", desc: "Комфортный седан" },
  { name: "Комфорт", pricePerKm: 6.5, icon: "Star", desc: "Бизнес-класс" },
  { name: "Минивэн", pricePerKm: 8.0, icon: "Users", desc: "До 7 пассажиров" },
];

const DISTANCES: Record<string, Record<string, number>> = {
  "Москва": { "Санкт-Петербург": 710, "Казань": 820, "Нижний Новгород": 410, "Тверь": 167, "Ярославль": 265, "Тула": 193, "Воронеж": 524, "Краснодар": 1360, "Ростов-на-Дону": 1080 },
  "Санкт-Петербург": { "Москва": 710, "Тверь": 485, "Ярославль": 630, "Нижний Новгород": 800 },
  "Казань": { "Москва": 820, "Уфа": 525, "Нижний Новгород": 415, "Самара": 360, "Пермь": 570, "Екатеринбург": 800 },
  "Нижний Новгород": { "Москва": 410, "Казань": 415, "Ярославль": 330, "Санкт-Петербург": 800 },
  "Краснодар": { "Москва": 1360, "Ростов-на-Дону": 280 },
  "Ростов-на-Дону": { "Москва": 1080, "Краснодар": 280, "Воронеж": 590 },
};

function getDistance(from: string, to: string): number {
  if (DISTANCES[from]?.[to]) return DISTANCES[from][to];
  if (DISTANCES[to]?.[from]) return DISTANCES[to][from];
  return Math.floor(250 + Math.random() * 500);
}

const FEATURES = [
  { icon: "Shield", title: "Безопасность", desc: "Проверенные водители с опытом от 5 лет" },
  { icon: "Clock", title: "Точность", desc: "Подача автомобиля минута в минуту" },
  { icon: "CreditCard", title: "Фикс. цена", desc: "Стоимость известна заранее, без сюрпризов" },
  { icon: "Headphones", title: "Поддержка 24/7", desc: "Всегда на связи для вас и водителя" },
];

const STATS = [
  { value: "12 000+", label: "Поездок выполнено" },
  { value: "98%", label: "Довольных клиентов" },
  { value: "150+", label: "Городов и маршрутов" },
  { value: "4.9★", label: "Средняя оценка" },
];

export default function Index() {
  const [from, setFrom] = useState("Москва");
  const [to, setTo] = useState("Санкт-Петербург");
  const [tariff, setTariff] = useState(0);
  const [passengers, setPassengers] = useState(1);
  const [date, setDate] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [calculated, setCalculated] = useState(false);

  const bookRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    setDate(today.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("in-view");
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function calculate() {
    if (from === to) return;
    const dist = getDistance(from, to);
    const base = dist * TARIFFS[tariff].pricePerKm;
    const mult = passengers > 1 ? 1 + (passengers - 1) * 0.15 : 1;
    setPrice(Math.round((base * mult) / 50) * 50);
    setCalculated(true);
  }

  function scrollToBook() {
    bookRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-golos overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-neon rounded-sm flex items-center justify-center">
              <Icon name="MapPin" size={16} className="text-background" />
            </div>
            <span className="font-display text-xl font-bold tracking-wide">
              ТРАНС<span className="text-neon">ФЕР</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#routes" className="hover:text-foreground transition-colors">Маршруты</a>
            <a href="#calc" className="hover:text-foreground transition-colors">Калькулятор</a>
            <a href="#contacts" className="hover:text-foreground transition-colors">Контакты</a>
          </div>
          <button
            onClick={scrollToBook}
            className="bg-neon text-background font-display text-sm px-5 py-2 rounded-md font-semibold hover:opacity-90 transition-opacity glow-neon"
          >
            ЗАБРОНИРОВАТЬ
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-1/3 h-1 bg-neon" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 pb-40">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-neon/10 border border-neon/30 text-neon text-xs font-display tracking-widest px-4 py-2 rounded-full mb-6 animate-fade-up">
              <span className="w-2 h-2 bg-neon rounded-full animate-pulse" />
              ОНЛАЙН БРОНИРОВАНИЕ ДОСТУПНО
            </div>
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold leading-none tracking-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              МЕЖГОРОД<br />
              <span className="text-neon glow-neon-text">&amp; ТРАНСФЕР</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Комфортные поездки по всей России. Фиксированная цена, профессиональные водители, точно в срок.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <button
                onClick={scrollToBook}
                className="bg-neon text-background font-display font-bold text-base px-8 py-4 rounded-md hover:opacity-90 transition-all glow-neon hover:scale-105 active:scale-95"
              >
                РАССЧИТАТЬ СТОИМОСТЬ
              </button>
              <a
                href="tel:+79961606567"
                className="flex items-center gap-2 border border-white/20 text-foreground font-display font-semibold text-base px-8 py-4 rounded-md hover:border-neon/50 hover:text-neon transition-all"
              >
                <Icon name="Phone" size={18} />
                +7 996 160-65-67
              </a>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="absolute bottom-0 left-0 right-0 glass border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <div key={i} className="text-center py-2">
                <div className="font-display text-2xl font-bold text-neon">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="routes" className="py-24 max-w-7xl mx-auto px-6">
        <div className="reveal mb-16">
          <div className="inline-block font-display text-neon text-sm tracking-widest mb-3">ПОЧЕМУ МЫ</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold">ВАШЕ УДОБСТВО —<br />НАШ ПРИОРИТЕТ</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="reveal group bg-surface border border-border rounded-xl p-6 hover:border-neon/40 transition-all hover:-translate-y-1"
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              <div className="w-12 h-12 bg-neon/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-neon/20 transition-colors">
                <Icon name={f.icon as IconName} size={22} className="text-neon" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="calc" ref={bookRef} className="py-24 bg-surface/30 border-y border-border">
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
                      onChange={(e) => { setFrom(e.target.value); setCalculated(false); }}
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
                      onChange={(e) => { setTo(e.target.value); setCalculated(false); }}
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
                      onClick={() => { setTariff(i); setCalculated(false); }}
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
                      onClick={() => { setPassengers(Math.max(1, passengers - 1)); setCalculated(false); }}
                      className="w-7 h-7 rounded-full bg-surface-hover flex items-center justify-center hover:bg-neon/20 transition-colors text-foreground font-bold text-lg leading-none"
                    >–</button>
                    <span className="flex-1 text-center font-display font-bold text-foreground">{passengers}</span>
                    <button
                      onClick={() => { setPassengers(Math.min(7, passengers + 1)); setCalculated(false); }}
                      className="w-7 h-7 rounded-full bg-surface-hover flex items-center justify-center hover:bg-neon/20 transition-colors text-foreground font-bold text-lg leading-none"
                    >+</button>
                  </div>
                </div>
              </div>

              <button
                onClick={calculate}
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

              <div className="reveal border border-border rounded-2xl p-6 bg-surface">
                <div className="text-xs font-display text-muted-foreground tracking-wider mb-4">ПОПУЛЯРНЫЕ МАРШРУТЫ</div>
                <div className="space-y-1">
                  {[
                    { from: "Москва", to: "Санкт-Петербург", price: "от 3 200 ₽" },
                    { from: "Москва", to: "Казань", price: "от 3 700 ₽" },
                    { from: "Москва", to: "Нижний Новгород", price: "от 1 850 ₽" },
                    { from: "Казань", to: "Уфа", price: "от 2 360 ₽" },
                  ].map((r, i) => (
                    <button
                      key={i}
                      onClick={() => { setFrom(r.from); setTo(r.to); setCalculated(false); scrollToBook(); }}
                      className="w-full flex items-center justify-between py-3 px-4 rounded-lg hover:bg-background transition-colors group"
                    >
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Icon name="ArrowRight" size={14} className="text-neon" />
                        <span>{r.from}</span>
                        <span className="text-muted-foreground">→</span>
                        <span>{r.to}</span>
                      </div>
                      <span className="text-sm text-neon font-display font-semibold">{r.price}</span>
                    </button>
                  ))}
                </div>
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

      {/* CONTACTS */}
      <section id="contacts" className="py-24 bg-surface/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="reveal mb-12">
            <div className="inline-block font-display text-neon text-sm tracking-widest mb-3">КОНТАКТЫ</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">СВЯЖИТЕСЬ С НАМИ</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="reveal space-y-4">
              {[
                { icon: "Phone", label: "Максим", value: "+7 996 160-65-67", href: "tel:+79961606567", highlight: true },
                { icon: "MessageCircle", label: "WhatsApp", value: "+7 996 160-65-67", href: "https://wa.me/79961606567", highlight: false },
                { icon: "Send", label: "Telegram", value: "+7 996 160-65-67", href: "https://t.me/+79961606567", highlight: false },
              ].map((c, i) => (
                <a
                  key={i}
                  href={c.href}
                  className={`flex items-center gap-4 p-5 rounded-xl border transition-all group hover:-translate-y-0.5 ${
                    c.highlight
                      ? "border-neon/40 bg-neon/5 hover:bg-neon/10"
                      : "border-border bg-surface hover:border-white/20"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    c.highlight ? "bg-neon" : "bg-neon/10"
                  }`}>
                    <Icon name={c.icon as IconName} size={20} className={c.highlight ? "text-background" : "text-neon"} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{c.label}</div>
                    <div className={`font-display font-semibold text-lg ${c.highlight ? "text-neon" : "text-foreground"}`}>
                      {c.value}
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={16} className="ml-auto text-muted-foreground group-hover:text-neon transition-colors" />
                </a>
              ))}
            </div>

            <div className="reveal">
              <div className="bg-surface border border-border rounded-2xl p-8 h-full">
                <h3 className="font-display text-xl font-bold mb-6">ОСТАВЬТЕ ЗАЯВКУ</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-display text-muted-foreground tracking-wider mb-2 block">ИМЯ</label>
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-display text-muted-foreground tracking-wider mb-2 block">ТЕЛЕФОН</label>
                    <input
                      type="tel"
                      placeholder="+7 (___) ___-__-__"
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-display text-muted-foreground tracking-wider mb-2 block">СООБЩЕНИЕ</label>
                    <textarea
                      rows={3}
                      placeholder="Ваш маршрут или вопрос..."
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none"
                    />
                  </div>
                  <button className="w-full bg-neon text-background font-display font-bold py-4 rounded-xl hover:opacity-90 transition-all glow-neon">
                    ОТПРАВИТЬ ЗАЯВКУ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-neon rounded-sm flex items-center justify-center">
              <Icon name="MapPin" size={14} className="text-background" />
            </div>
            <span className="font-display text-lg font-bold">
              ТРАНС<span className="text-neon">ФЕР</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © 2024 ТрансферЭкспресс. Межгородние перевозки и трансфер по всей России.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="MapPin" size={12} className="text-neon" />
            Работаем по всей России
          </div>
        </div>
      </footer>

      <style>{`
        .font-display { font-family: 'Oswald', sans-serif; }
        .font-golos { font-family: 'Golos Text', sans-serif; }
        .text-neon { color: hsl(38 100% 55%); }
        .bg-neon { background-color: hsl(38 100% 55%); }
        .glow-neon { box-shadow: 0 0 20px hsl(38 100% 55% / 0.4), 0 0 60px hsl(38 100% 55% / 0.15); }
        .glow-neon-text { text-shadow: 0 0 30px hsl(38 100% 55% / 0.6); }
        .glass {
          background: hsl(220 18% 8% / 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .bg-surface { background-color: hsl(220 18% 11%); }
        .bg-surface-hover { background-color: hsl(220 18% 15%); }
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal.in-view {
          opacity: 1;
          transform: translateY(0);
        }
        .animate-fade-up {
          animation: fadeUp 0.6s ease-out forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}