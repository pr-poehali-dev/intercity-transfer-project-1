import Icon from "@/components/ui/icon";
import { REVIEWS } from "./constants";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

export default function ReviewsSection() {
  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="reveal mb-8 text-center">
        <div className="inline-block font-display text-neon text-base tracking-widest mb-2">ОТЗЫВЫ КЛИЕНТОВ</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold">НАМ ДОВЕРЯЮТ ПОЕЗДКИ</h2>
        <div className="flex items-center justify-center gap-2 mt-3 text-muted-foreground">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Icon key={i} name="Star" size={16} className="text-neon fill-neon" />
            ))}
          </div>
          <span className="text-sm">4.9 из 5 — на основе 12 000+ поездок</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REVIEWS.map((r, i) => (
          <div
            key={i}
            className="reveal relative bg-surface border border-border rounded-2xl p-5 sm:p-6 hover:border-neon/40 transition-all hover:-translate-y-1 overflow-hidden"
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <Icon
              name="Quote"
              size={56}
              className="absolute -top-2 right-2 text-neon/5 pointer-events-none"
            />

            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-neon/15 border border-neon/30 flex items-center justify-center flex-shrink-0">
                <span className="font-display font-bold text-neon text-sm">{initials(r.name)}</span>
              </div>
              <div className="min-w-0">
                <div className="font-display font-semibold leading-tight truncate">{r.name}</div>
                <div className="text-xs text-muted-foreground truncate">{r.city}</div>
              </div>
            </div>

            <div className="flex items-center gap-0.5 mb-3">
              {[...Array(r.rating)].map((_, s) => (
                <Icon key={s} name="Star" size={13} className="text-neon fill-neon" />
              ))}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed relative z-10">{r.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
