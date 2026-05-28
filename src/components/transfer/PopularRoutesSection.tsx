import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { ROUTES } from "./routesData";

export default function PopularRoutesSection() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <div className="reveal mb-12 text-center">
        <div className="inline-block font-display text-neon text-sm tracking-widest mb-3">ПОПУЛЯРНЫЕ НАПРАВЛЕНИЯ</div>
        <h2 className="font-display text-4xl md:text-5xl font-bold">МАРШРУТЫ ПО РОССИИ</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROUTES.map((r) => (
          <Link
            key={r.slug}
            to={`/marshrut/${r.slug}`}
            className="reveal group bg-surface border border-border rounded-2xl p-6 hover:border-neon/40 transition-all hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-neon/10 rounded-lg flex items-center justify-center">
                <Icon name="MapPin" size={22} className="text-neon" />
              </div>
              <Icon name="ChevronRight" size={20} className="text-muted-foreground group-hover:text-neon transition-colors" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">{r.from} — {r.to}</h3>
            <div className="text-xs text-muted-foreground mb-4">{r.distance} км · {r.duration}</div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-muted-foreground">от</span>
              <span className="font-display text-2xl font-bold text-neon">{r.priceFrom.toLocaleString("ru-RU")}</span>
              <span className="text-sm text-muted-foreground">₽</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
