import Icon from "@/components/ui/icon";
import { HERO_IMAGE, STATS } from "./constants";

interface HeroSectionProps {
  onBookClick: () => void;
}

export default function HeroSection({ onBookClick }: HeroSectionProps) {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-1/3 h-1 bg-neon" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 pb-36">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-neon/10 border border-neon/30 text-neon text-[10px] sm:text-xs font-display tracking-widest px-3 py-1.5 rounded-full mb-4 animate-fade-up">
              <span className="w-1.5 h-1.5 bg-neon rounded-full animate-pulse flex-shrink-0" />
              ОНЛАЙН БРОНИРОВАНИЕ ДОСТУПНО
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-none tracking-tight mb-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <span style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #003087 50%, #CC0000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>НАШЕ<br />for Russia Transfer</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Поездки по России без агрегаторов — дёшево и с комфортом!
            </p>
            <div className="flex flex-wrap gap-2 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <button
                onClick={onBookClick}
                className="bg-neon text-background font-display font-bold text-sm sm:text-base px-5 sm:px-8 py-3 sm:py-4 rounded-md hover:opacity-90 transition-all glow-neon hover:scale-105 active:scale-95"
              >
                РАССЧИТАТЬ СТОИМОСТЬ
              </button>
              <a
                href="#contacts"
                className="flex items-center gap-2 border border-white/20 text-foreground font-display font-semibold text-sm sm:text-base px-5 sm:px-8 py-3 sm:py-4 rounded-md hover:border-neon/50 hover:text-neon transition-all"
              >
                <Icon name="Phone" size={16} />
                СВЯЗАТЬСЯ
              </a>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="absolute bottom-0 left-0 right-0 glass border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {STATS.map((s, i) => (
              <div key={i} className="text-center py-1.5">
                <div className="font-display text-lg sm:text-2xl font-bold text-neon">{s.value}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


    </>
  );
}