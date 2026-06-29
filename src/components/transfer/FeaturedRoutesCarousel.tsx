import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { ROUTES_WITH_DURATION as ROUTES } from "./routesData";

function usePerView() {
  const [perView, setPerView] = useState(1);
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      setPerView(w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return perView;
}

export default function FeaturedRoutesCarousel() {
  const perView = usePerView();
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const pages = Math.max(1, Math.ceil(ROUTES.length / perView));

  useEffect(() => {
    if (index > pages - 1) setIndex(pages - 1);
  }, [pages, index]);

  function go(i: number) {
    setIndex(((i % pages) + pages) % pages);
  }

  function startAuto() {
    stopAuto();
    timer.current = setInterval(() => setIndex((p) => (p + 1) % pages), 5000);
  }
  function stopAuto() {
    if (timer.current) clearInterval(timer.current);
  }

  useEffect(() => {
    startAuto();
    return stopAuto;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages]);

  if (!ROUTES.length) return null;

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="reveal mb-8 text-center">
        <div className="inline-block font-display text-neon text-base tracking-widest mb-2">ВЫБОР КЛИЕНТОВ</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold">ПОПУЛЯРНЫЕ МАРШРУТЫ</h2>
      </div>

      <div className="reveal relative" onMouseEnter={stopAuto} onMouseLeave={startAuto}>
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {ROUTES.map((r) => (
              <div
                key={r.slug}
                className="flex-shrink-0 px-2"
                style={{ width: `${100 / perView}%` }}
              >
                <Link
                  to={`/marshrut/${r.slug}`}
                  className="group flex h-full flex-col bg-surface border border-border rounded-2xl p-5 sm:p-6 hover:border-neon/40 transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 bg-neon/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon name="MapPin" size={20} className="text-neon" />
                    </div>
                    <Icon name="ChevronRight" size={20} className="text-muted-foreground group-hover:text-neon transition-colors flex-shrink-0" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-1 truncate">{r.from} — {r.to}</h3>
                  <div className="text-sm text-muted-foreground mb-4 truncate">{r.distance} км · {r.duration}</div>
                  <div className="mt-auto flex items-baseline gap-1">
                    <span className="text-sm text-muted-foreground">от</span>
                    <span className="font-display text-2xl font-bold text-neon">{r.priceFrom.toLocaleString("ru-RU")}</span>
                    <span className="text-sm text-muted-foreground">₽</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {pages > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Предыдущие маршруты"
              className="absolute -left-1 sm:-left-4 top-[40%] -translate-y-1/2 w-10 h-10 rounded-full glass border border-border flex items-center justify-center text-foreground hover:border-neon/40 hover:text-neon transition-all z-10"
            >
              <Icon name="ChevronLeft" size={20} />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Следующие маршруты"
              className="absolute -right-1 sm:-right-4 top-[40%] -translate-y-1/2 w-10 h-10 rounded-full glass border border-border flex items-center justify-center text-foreground hover:border-neon/40 hover:text-neon transition-all z-10"
            >
              <Icon name="ChevronRight" size={20} />
            </button>

            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Страница ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-neon" : "w-2 bg-border hover:bg-white/30"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
