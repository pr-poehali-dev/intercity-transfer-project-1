import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/transfer/Navbar";
import RouteMap from "@/components/transfer/RouteMap";
import { ROUTES_WITH_DURATION as ROUTES } from "@/components/transfer/routesData";

function getRouteBySlug(slug: string) {
  return ROUTES.find((r) => r.slug === slug);
}
import { TARIFFS, MINIVAN_SUBTARIFFS } from "@/components/transfer/constants";

export default function RoutePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const route = slug ? getRouteBySlug(slug) : undefined;

  useEffect(() => {
    if (!route) return;
    const title = `Трансфер ${route.from} — ${route.to} | Заказ от ${route.priceFrom.toLocaleString("ru-RU")} ₽`;
    const description = `${route.description} Расстояние ${route.distance} км, время в пути ${route.duration}. Цена от ${route.priceFrom.toLocaleString("ru-RU")} ₽.`;
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);
  }, [route]);

  if (!route) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl mb-4">Маршрут не найден</h1>
          <button onClick={() => navigate("/")} className="text-neon hover:underline">
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const otherRoutes = ROUTES.filter((r) => r.slug !== route.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground font-golos">
      <Navbar onBookClick={() => navigate("/#calc")} />

      <section className="pt-28 pb-12 max-w-5xl mx-auto px-4 sm:px-6 overflow-hidden">
        <Link to="/" className="text-sm text-muted-foreground hover:text-neon transition-colors inline-flex items-center gap-1 mb-5">
          <Icon name="ChevronRight" size={14} className="rotate-180" />
          На главную
        </Link>

        <div className="inline-block font-display text-neon text-xs tracking-widest mb-2">МЕЖДУГОРОДНИЙ ТРАНСФЕР</div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Трансфер<br />
          <span className="break-words" style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #003087 50%, #CC0000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block', maxWidth: '100%' }}>
            {route.from} — {route.to}
          </span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8">
          {route.description}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: "MapPin", value: `${route.distance} км`, label: "Расстояние" },
            { icon: "Clock", value: route.duration, label: "В пути" },
            { icon: "CreditCard", value: `от ${route.priceFrom.toLocaleString("ru-RU")} ₽`, label: "Стоимость" },
            { icon: "Shield", value: "24/7", label: "Поддержка" },
          ].map((s, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-3 sm:p-5 overflow-hidden">
              <Icon name={s.icon as "MapPin"} size={16} className="text-neon mb-2" />
              <div className="font-display text-base sm:text-xl font-bold truncate">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4">Маршрут на карте</h2>
          <RouteMap points={[route.from, route.to]} className="h-72 sm:h-80" />
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-8 mb-8">
          <h2 className="font-display text-xl font-bold mb-4">Что входит в поездку</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {route.highlights.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <Icon name="CheckCircle" size={16} className="text-neon flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-8 mb-8">
          <h2 className="font-display text-xl font-bold mb-4 leading-snug">Тарифы: {route.from} — {route.to}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TARIFFS.map((t, i) => (
              <div key={i} className="border border-border rounded-xl p-4 text-center overflow-hidden">
                <Icon name={t.icon as "Car"} size={24} className="text-neon mx-auto mb-2" />
                <div className="font-display text-base font-bold mb-1 truncate">{t.name}</div>
                <div className="text-xs text-muted-foreground mb-2 truncate">{t.desc}</div>
                <div className="font-display text-lg text-neon font-bold truncate">
                  от {(route.distance * (t.isMinivan ? MINIVAN_SUBTARIFFS[0].pricePerKm : t.pricePerKm)).toLocaleString("ru-RU")} ₽
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mb-10">
          <button
            onClick={() => navigate(`/?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}#calc`)}
            className="bg-neon text-background font-display font-bold text-sm sm:text-base px-8 py-4 rounded-xl hover:opacity-90 transition-all glow-neon w-full sm:w-auto"
          >
            ПЕРЕЙТИ К ОФОРМЛЕНИЮ
          </button>
        </div>

        <div>
          <h2 className="font-display text-xl font-bold mb-4">Другие маршруты</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherRoutes.map((r) => (
              <Link
                key={r.slug}
                to={`/marshrut/${r.slug}`}
                className="bg-surface border border-border rounded-xl p-4 hover:border-neon/40 transition-all flex items-center justify-between gap-2 group overflow-hidden min-w-0"
              >
                <div className="min-w-0">
                  <div className="font-display text-sm sm:text-base font-semibold mb-0.5 truncate">{r.from} — {r.to}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.distance} км · от {r.priceFrom.toLocaleString("ru-RU")} ₽</div>
                </div>
                <Icon name="ChevronRight" size={18} className="text-muted-foreground group-hover:text-neon transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .font-display { font-family: 'Oswald', sans-serif; }
        .font-golos { font-family: 'Golos Text', sans-serif; }
        .text-neon { color: hsl(38 100% 55%); }
        .bg-neon { background-color: hsl(38 100% 55%); }
        .glow-neon { box-shadow: 0 0 20px hsl(38 100% 55% / 0.4), 0 0 60px hsl(38 100% 55% / 0.15); }
        .glass {
          background: hsl(220 18% 8% / 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .bg-surface { background-color: hsl(220 18% 11%); }
      `}</style>
    </div>
  );
}