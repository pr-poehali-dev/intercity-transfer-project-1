import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { ROUTES_WITH_DURATION as ROUTES } from "./routesData";
import { TARIFFS, MINIVAN_SUBTARIFFS, getTariffPrice, localDateStr, QUICK_DATES, type IconName } from "./constants";

const GROUPS = [
  { label: "Из Москвы", filter: (slug: string) => slug.startsWith("moskva-") },
  { label: "В Москву", filter: (slug: string) => slug.endsWith("-moskva") },
  { label: "На юг России", filter: (slug: string) => ["sochi", "krasnodar", "anapa", "gelendzhik", "rostov", "stavropol"].some(c => slug.includes(c)) && !slug.startsWith("moskva-") && !slug.endsWith("-moskva") },
  { label: "Поволжье и Урал", filter: (slug: string) => ["kazan", "nizhniy-novgorod", "samara", "ufa", "yekaterinburg", "perm", "chelyabinsk", "kirov"].some(c => slug.includes(c)) && !slug.startsWith("moskva-") && !slug.endsWith("-moskva") },
  { label: "Из Петербурга", filter: (slug: string) => slug.startsWith("sankt-peterburg-") },
];

const INITIAL_COUNT = 3;

export default function PopularRoutesSection() {
  const navigate = useNavigate();
  const [activeGroup, setActiveGroup] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [openTariffs, setOpenTariffs] = useState<string | null>(null);
  const [tripDate, setTripDate] = useState("");
  const [tripTime, setTripTime] = useState("");
  const [pax, setPax] = useState(1);

  const today = localDateStr();

  function goToBooking(from: string, to: string, tariffIndex: number, subIndex?: number) {
    const params = new URLSearchParams({ from, to, tariff: String(tariffIndex) });
    if (subIndex !== undefined) params.set("sub", String(subIndex));
    if (tripDate) params.set("date", tripDate);
    if (tripTime) params.set("time", tripTime);
    if (pax > 1) params.set("pax", String(pax));
    navigate(`/?${params.toString()}#calc`);
  }

  function toggleCard(slug: string) {
    const next = openTariffs === slug ? null : slug;
    setOpenTariffs(next);
    if (next) {
      setTripDate("");
      setTripTime("");
      setPax(1);
    }
  }

  const grouped = ROUTES.filter(r => GROUPS[activeGroup].filter(r.slug));
  const displayed = showAll ? grouped : grouped.slice(0, INITIAL_COUNT);
  const hasMore = grouped.length > INITIAL_COUNT;


  function handleGroupChange(idx: number) {
    setActiveGroup(idx);
    setShowAll(false);
  }

  return (
    <section id="routes" style={{ scrollMarginTop: "80px" }} className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="reveal mb-8 text-center">
        <div className="inline-block font-display text-neon text-base tracking-widest mb-2">ПОПУЛЯРНЫЕ НАПРАВЛЕНИЯ</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold">МАРШРУТЫ ПО РОССИИ</h2>
      </div>

      {/* Группы-табы */}
      <div className="reveal flex flex-wrap gap-2 mb-6 justify-center">
        {GROUPS.map((g, i) => (
          <button
            key={i}
            onClick={() => handleGroupChange(i)}
            className={`px-4 py-2 rounded-xl font-display text-sm font-semibold transition-all border ${
              activeGroup === i
                ? "bg-neon text-background border-neon"
                : "bg-surface border-border text-muted-foreground hover:border-white/30"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Карточки маршрутов */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {displayed.map((r) => {
          const isOpen = openTariffs === r.slug;
          return (
            <div
              key={r.slug}
              className="group bg-surface border border-border rounded-2xl p-4 sm:p-6 hover:border-neon/40 transition-all overflow-hidden min-w-0 flex flex-col"
            >
              <Link to={`/marshrut/${r.slug}`} className="block">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-neon/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="MapPin" size={18} className="text-neon" />
                  </div>
                  <Icon name="ChevronRight" size={18} className="text-muted-foreground group-hover:text-neon transition-colors flex-shrink-0" />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-neon flex-shrink-0" />
                  <div className="flex-1 h-px bg-gradient-to-r from-neon/60 to-neon/20 relative">
                    <Icon
                      name="Car"
                      size={13}
                      className="absolute -top-[7px] left-1/2 -translate-x-1/2 text-neon/70 bg-surface px-[1px] transition-all duration-500 group-hover:left-[85%]"
                    />
                  </div>
                  <div className="w-2 h-2 rounded-full border-2 border-neon flex-shrink-0" />
                </div>

                <h3 className="font-display text-lg sm:text-xl font-bold mb-1 truncate">{r.from} — {r.to}</h3>
                <div className="text-sm text-muted-foreground mb-3 truncate">{r.distance} км · {r.duration}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-muted-foreground">от</span>
                  <span className="font-display text-xl sm:text-2xl font-bold text-neon">{r.priceFrom.toLocaleString("ru-RU")}</span>
                  <span className="text-sm text-muted-foreground">₽</span>
                </div>
              </Link>

              <button
                onClick={() => toggleCard(r.slug)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-xs font-display font-semibold text-muted-foreground hover:border-neon/50 hover:text-neon transition-all"
              >
                {isOpen ? "Свернуть" : "Выбрать дату и тариф"}
                <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={14} />
              </button>

              {isOpen && (
                <div className="mt-3 space-y-1.5 animate-in">
                  <div className="flex gap-1 mb-2">
                    {QUICK_DATES.slice(0, 2).map((q) => {
                      const val = localDateStr(q.offset);
                      const active = tripDate === val;
                      return (
                        <button
                          key={q.offset}
                          onClick={() => setTripDate(active ? "" : val)}
                          className={`flex-1 py-1.5 rounded-lg text-[11px] font-display font-semibold border transition-all ${
                            active
                              ? "bg-neon text-background border-neon"
                              : "bg-background border-border text-muted-foreground hover:border-neon/50 hover:text-neon"
                          }`}
                        >
                          {q.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    <div>
                      <label className="text-[10px] font-display text-muted-foreground tracking-wider mb-1 block">ДАТА</label>
                      <input
                        type="date"
                        value={tripDate}
                        min={today}
                        onChange={(e) => setTripDate(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:border-neon outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-display text-muted-foreground tracking-wider mb-1 block">ВРЕМЯ</label>
                      <input
                        type="time"
                        value={tripTime}
                        onChange={(e) => setTripTime(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:border-neon outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-background border border-border rounded-lg px-2.5 py-1.5 mb-2">
                    <span className="text-[11px] text-muted-foreground">Пассажиров</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPax(Math.max(1, pax - 1))}
                        className="w-5 h-5 rounded border border-border text-muted-foreground hover:border-neon hover:text-neon transition-colors text-xs leading-none"
                      >
                        −
                      </button>
                      <span className="font-display text-sm font-bold w-4 text-center">{pax}</span>
                      <button
                        onClick={() => setPax(Math.min(10, pax + 1))}
                        className="w-5 h-5 rounded border border-border text-muted-foreground hover:border-neon hover:text-neon transition-colors text-xs leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {TARIFFS.map((t, ti) => {
                    const tooSmall = !t.isDelivery && t.maxPassengers < pax;
                    return (
                      <button
                        key={ti}
                        disabled={tooSmall}
                        onClick={() => goToBooking(r.from, r.to, ti)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left ${
                          tooSmall
                            ? "border-border opacity-35 cursor-not-allowed"
                            : "border-border hover:border-neon hover:bg-neon/5"
                        }`}
                      >
                        <Icon name={t.icon as IconName} size={15} className="text-neon flex-shrink-0" />
                        <span className="font-display text-sm font-semibold truncate flex-1">{t.name}</span>
                        {t.popular && !tooSmall && (
                          <span className="bg-neon text-background text-[9px] font-display font-bold px-1.5 py-0.5 rounded flex-shrink-0">ХИТ</span>
                        )}
                        <span className="font-display text-sm text-neon font-bold whitespace-nowrap">
                          {getTariffPrice(r.distance, ti).toLocaleString("ru-RU")} ₽
                        </span>
                      </button>
                    );
                  })}

                  <div className="pt-1.5 mt-1.5 border-t border-border">
                    <div className="text-[10px] text-muted-foreground mb-1.5 px-1">Минивэн по вместимости:</div>
                    {MINIVAN_SUBTARIFFS.map((m, si) => {
                      const mi = TARIFFS.findIndex((t) => t.isMinivan);
                      const tooSmall = m.seats < pax;
                      return (
                        <button
                          key={si}
                          disabled={tooSmall}
                          onClick={() => goToBooking(r.from, r.to, mi, si)}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg transition-all text-left ${
                            tooSmall ? "opacity-35 cursor-not-allowed" : "hover:bg-neon/5"
                          }`}
                        >
                          <span className="text-xs text-muted-foreground truncate">{m.name} · {m.desc}</span>
                          <span className="font-display text-xs text-neon font-bold whitespace-nowrap">
                            {getTariffPrice(r.distance, mi, si).toLocaleString("ru-RU")} ₽
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Кнопка "Показать все" */}
      {hasMore && !showAll && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-surface text-muted-foreground hover:border-neon/40 hover:text-foreground font-display font-semibold transition-all"
          >
            <Icon name="ChevronDown" size={16} />
            Показать все маршруты ({grouped.length})
          </button>
        </div>
      )}
    </section>
  );
}