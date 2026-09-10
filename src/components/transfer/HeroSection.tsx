import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { HERO_IMAGE, STATS, TRUST_BADGES } from "./constants";
import type { IconName } from "./constants";

interface HeroSectionProps {
  onBookClick: () => void;
}

function useCountUp(target: string, active: boolean) {
  const [display, setDisplay] = useState(target);
  const numMatch = target.match(/[\d.,]+/);

  useEffect(() => {
    if (!active || !numMatch) return;
    const raw = numMatch[0].replace(",", ".");
    const end = parseFloat(raw);
    if (isNaN(end)) return;
    const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
    const duration = 1400;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = (end * eased).toFixed(decimals);
      const pretty = decimals === 0
        ? Number(value).toLocaleString("ru-RU")
        : value.replace(".", ",");
      setDisplay(target.replace(numMatch[0], pretty));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);

  return numMatch ? display : target;
}

function StatItem({ value, label, active }: { value: string; label: string; active: boolean }) {
  const display = useCountUp(value, active);
  return (
    <div className="text-center py-1.5">
      <div className="font-display text-xl sm:text-3xl font-bold text-neon tabular-nums">{display}</div>
      <div className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-tight">{label}</div>
    </div>
  );
}

export default function HeroSection({ onBookClick: _ }: HeroSectionProps) {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-start pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-1/3 h-1 bg-neon" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-neon/10 border border-neon/30 text-neon text-xs sm:text-sm font-display tracking-widest px-3 py-1.5 rounded-full mb-4 animate-fade-up">
              <span className="w-1.5 h-1.5 bg-neon rounded-full animate-pulse flex-shrink-0" />
              ОНЛАЙН БРОНИРОВАНИЕ ДОСТУПНО
            </div>
            <h1 className="font-display text-6xl sm:text-7xl md:text-9xl font-bold leading-none tracking-tight mb-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <span style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #003087 50%, #CC0000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>НАШЕ<br />for Russia Transfer</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Поездки по России без агрегаторов — дёшево и с комфортом!
            </p>

            <div className="flex flex-wrap gap-2 sm:gap-3 mt-6 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              {TRUST_BADGES.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 glass rounded-xl px-3 py-2 border border-white/10 hover:border-neon/40 transition-colors"
                >
                  <Icon name={b.icon as IconName} size={16} className="text-neon flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-display font-semibold tracking-wide">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div ref={statsRef} className="absolute bottom-0 left-0 right-0 glass border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {STATS.map((s, i) => (
              <StatItem key={i} value={s.value} label={s.label} active={statsVisible} />
            ))}
          </div>
        </div>
      </section>


    </>
  );
}