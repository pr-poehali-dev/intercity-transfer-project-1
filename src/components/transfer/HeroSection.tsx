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
              <span style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #003087 50%, #CC0000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>НАШЕ<br />for Russia Transfer</span>
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
              <a
                href="https://t.me/+79961606567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-white/20 text-foreground font-display font-semibold text-base px-8 py-4 rounded-md hover:border-neon/50 hover:text-neon transition-all"
              >
                <Icon name="Send" size={18} />
                Telegram
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


    </>
  );
}