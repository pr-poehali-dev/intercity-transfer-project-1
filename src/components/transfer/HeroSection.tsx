import Icon from "@/components/ui/icon";
import { HERO_IMAGE, STATS, FEATURES } from "./constants";
import type { IconName } from "./constants";

interface HeroSectionProps {
  onBookClick: () => void;
}

export default function HeroSection({ onBookClick }: HeroSectionProps) {
  return (
    <>
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
              НАШЕ<br />
              <span className="text-neon glow-neon-text">for Russia Transfer</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Поездки по России без агрегаторов — дёшево и с комфортом!
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <button
                onClick={onBookClick}
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
    </>
  );
}