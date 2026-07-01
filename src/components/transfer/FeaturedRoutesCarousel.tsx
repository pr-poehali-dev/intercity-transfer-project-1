import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { ROUTES_WITH_DURATION as ROUTES } from "./routesData";

const FEATURED_SLUGS = [
  "moskva-sankt-peterburg",
  "moskva-sochi",
  "moskva-kazan",
  "moskva-kaliningrad",
  "moskva-pyatigorsk",
  "sochi-krasnodar",
  "novosibirsk-krasnoyarsk",
  "irkutsk-ulan-ude",
  "habarovsk-vladivostok",
  "moskva-murmansk",
  "volgograd-astrahan",
  "nizhniy-novgorod-vladimir",
];

const FEATURED = FEATURED_SLUGS
  .map((s) => ROUTES.find((r) => r.slug === s))
  .filter((r): r is (typeof ROUTES)[number] => Boolean(r));

export default function FeaturedRoutesCarousel() {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = FEATURED.length;

  function go(i: number) {
    setIndex(((i % count) + count) % count);
  }

  function startAuto() {
    stopAuto();
    timer.current = setInterval(() => setIndex((p) => (p + 1) % count), 4000);
  }
  function stopAuto() {
    if (timer.current) clearInterval(timer.current);
  }

  useEffect(() => {
    startAuto();
    return stopAuto;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!count) return null;

  return (
    <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="reveal mb-8 text-center">
        <div className="inline-block font-display text-neon text-base tracking-widest mb-2">ВЫБОР КЛИЕНТОВ</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold">ПОПУЛЯРНЫЕ МАРШРУТЫ</h2>
      </div>

      <div
        className="reveal relative px-6"
        onMouseEnter={stopAuto}
        onMouseLeave={startAuto}
      >
        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {FEATURED.map((r) => (
              <div key={r.slug} className="w-full flex-shrink-0">
                <Link
                  to={`/marshrut/${r.slug}`}
                  className="group block bg-surface border border-border rounded-2xl p-8 sm:p-12 hover:border-neon/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 bg-neon/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon name="MapPin" size={24} className="text-neon" />
                    </div>
                    <span className="font-display text-sm text-muted-foreground">{index + 1} / {count}</span>
                  </div>
                  <h3 className="font-display text-3xl sm:text-4xl font-bold mb-2">{r.from} — {r.to}</h3>
                  <div className="text-base text-muted-foreground mb-5">{r.distance} км · {r.duration}</div>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{r.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base text-muted-foreground">от</span>
                      <span className="font-display text-3xl sm:text-4xl font-bold text-neon">{r.priceFrom.toLocaleString("ru-RU")}</span>
                      <span className="text-base text-muted-foreground">₽</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-neon transition-colors">
                      <span className="font-display">Подробнее</span>
                      <Icon name="ChevronRight" size={16} />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Предыдущий маршрут"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full glass border border-border flex items-center justify-center text-foreground hover:border-neon/40 hover:text-neon transition-all z-10"
        >
          <Icon name="ChevronLeft" size={20} />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Следующий маршрут"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full glass border border-border flex items-center justify-center text-foreground hover:border-neon/40 hover:text-neon transition-all z-10"
        >
          <Icon name="ChevronRight" size={20} />
        </button>

        <div className="flex justify-center gap-2 mt-6">
          {FEATURED.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Маршрут ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? "w-10 bg-neon" : "w-2 bg-border hover:bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}