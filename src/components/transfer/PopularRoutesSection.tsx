import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { ROUTES } from "./routesData";

const GROUPS = [
  { label: "Из Москвы", filter: (slug: string) => slug.startsWith("moskva-") },
  { label: "В Москву", filter: (slug: string) => slug.endsWith("-moskva") },
  { label: "На юг России", filter: (slug: string) => ["sochi", "krasnodar", "anapa", "gelendzhik", "rostov", "stavropol"].some(c => slug.includes(c)) && !slug.startsWith("moskva-") && !slug.endsWith("-moskva") },
  { label: "Поволжье и Урал", filter: (slug: string) => ["kazan", "nizhniy-novgorod", "samara", "ufa", "yekaterinburg", "perm", "chelyabinsk", "kirov"].some(c => slug.includes(c)) && !slug.startsWith("moskva-") && !slug.endsWith("-moskva") },
  { label: "Из Петербурга", filter: (slug: string) => slug.startsWith("sankt-peterburg-") },
];

const INITIAL_COUNT = 1;

export default function PopularRoutesSection() {
  const [activeGroup, setActiveGroup] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const grouped = ROUTES.filter(r => GROUPS[activeGroup].filter(r.slug));
  const displayed = showAll ? grouped : grouped.slice(0, INITIAL_COUNT);
  const hasMore = grouped.length > INITIAL_COUNT;


  function handleGroupChange(idx: number) {
    setActiveGroup(idx);
    setShowAll(false);
  }

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
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
        {displayed.map((r) => (
          <Link
            key={r.slug}
            to={`/marshrut/${r.slug}`}
            className="group bg-surface border border-border rounded-2xl p-4 sm:p-6 hover:border-neon/40 transition-all hover:-translate-y-1 overflow-hidden min-w-0"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-neon/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="MapPin" size={18} className="text-neon" />
              </div>
              <Icon name="ChevronRight" size={18} className="text-muted-foreground group-hover:text-neon transition-colors flex-shrink-0" />
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold mb-1 truncate">{r.from} — {r.to}</h3>
            <div className="text-sm text-muted-foreground mb-3 truncate">{r.distance} км · {r.duration}</div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-muted-foreground">от</span>
              <span className="font-display text-xl sm:text-2xl font-bold text-neon">{r.priceFrom.toLocaleString("ru-RU")}</span>
              <span className="text-sm text-muted-foreground">₽</span>
            </div>
          </Link>
        ))}
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