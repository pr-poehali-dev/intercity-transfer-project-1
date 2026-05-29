import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { ROUTES } from "./routesData";

export default function PopularRoutesSection() {
  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="reveal mb-8 text-center">
        <div className="inline-block font-display text-neon text-sm tracking-widest mb-2">ПОПУЛЯРНЫЕ НАПРАВЛЕНИЯ</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold">МАРШРУТЫ ПО РОССИИ</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {ROUTES.map((r) => (
          <Link
            key={r.slug}
            to={`/marshrut/${r.slug}`}
            className="reveal group bg-surface border border-border rounded-2xl p-4 sm:p-6 hover:border-neon/40 transition-all hover:-translate-y-1 overflow-hidden min-w-0"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-neon/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="MapPin" size={18} className="text-neon" />
              </div>
              <Icon name="ChevronRight" size={18} className="text-muted-foreground group-hover:text-neon transition-colors flex-shrink-0" />
            </div>
            <h3 className="font-display text-base sm:text-lg font-bold mb-1 truncate">{r.from} — {r.to}</h3>
            <div className="text-xs text-muted-foreground mb-3 truncate">{r.distance} км · {r.duration}</div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-muted-foreground">от</span>
              <span className="font-display text-xl sm:text-2xl font-bold text-neon">{r.priceFrom.toLocaleString("ru-RU")}</span>
              <span className="text-sm text-muted-foreground">₽</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}