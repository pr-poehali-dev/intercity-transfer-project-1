import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/transfer/Navbar";
import { getRouteBySlug, ROUTES } from "@/components/transfer/routesData";
import { TARIFFS } from "@/components/transfer/constants";

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

      <section className="pt-32 pb-16 max-w-5xl mx-auto px-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-neon transition-colors inline-flex items-center gap-1 mb-6">
          <Icon name="ChevronRight" size={14} className="rotate-180" />
          На главную
        </Link>

        <div className="inline-block font-display text-neon text-sm tracking-widest mb-3">МЕЖДУГОРОДНИЙ ТРАНСФЕР</div>
        <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Трансфер<br />
          <span style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #003087 50%, #CC0000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>
            {route.from} — {route.to}
          </span>
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-3xl">
          {route.description}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-surface border border-border rounded-2xl p-5">
            <Icon name="MapPin" size={20} className="text-neon mb-3" />
            <div className="font-display text-2xl font-bold">{route.distance} км</div>
            <div className="text-xs text-muted-foreground mt-1">Расстояние</div>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5">
            <Icon name="Clock" size={20} className="text-neon mb-3" />
            <div className="font-display text-2xl font-bold">{route.duration}</div>
            <div className="text-xs text-muted-foreground mt-1">В пути</div>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5">
            <Icon name="CreditCard" size={20} className="text-neon mb-3" />
            <div className="font-display text-2xl font-bold">от {route.priceFrom.toLocaleString("ru-RU")} ₽</div>
            <div className="text-xs text-muted-foreground mt-1">Стоимость</div>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5">
            <Icon name="Shield" size={20} className="text-neon mb-3" />
            <div className="font-display text-2xl font-bold">24/7</div>
            <div className="text-xs text-muted-foreground mt-1">Поддержка</div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">Что входит в поездку</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {route.highlights.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <Icon name="CheckCircle" size={18} className="text-neon flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8 mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">Тарифы на маршрут {route.from} — {route.to}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TARIFFS.map((t, i) => (
              <div key={i} className="border border-border rounded-xl p-5 text-center">
                <Icon name={t.icon as "Car"} size={28} className="text-neon mx-auto mb-3" />
                <div className="font-display text-lg font-bold mb-1">{t.name}</div>
                <div className="text-xs text-muted-foreground mb-3">{t.desc}</div>
                <div className="font-display text-xl text-neon font-bold">
                  от {(route.distance * t.pricePerKm).toLocaleString("ru-RU")} ₽
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mb-16">
          <button
            onClick={() => navigate("/#calc")}
            className="bg-neon text-background font-display font-bold text-lg px-10 py-5 rounded-xl hover:opacity-90 transition-all glow-neon"
          >
            ЗАБРОНИРОВАТЬ ПОЕЗДКУ
          </button>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold mb-6">Другие популярные маршруты</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {otherRoutes.map((r) => (
              <Link
                key={r.slug}
                to={`/marshrut/${r.slug}`}
                className="bg-surface border border-border rounded-xl p-5 hover:border-neon/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-display text-lg font-semibold mb-1">{r.from} — {r.to}</div>
                  <div className="text-xs text-muted-foreground">{r.distance} км · от {r.priceFrom.toLocaleString("ru-RU")} ₽</div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-muted-foreground group-hover:text-neon transition-colors" />
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
