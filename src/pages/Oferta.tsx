import { useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/transfer/Navbar";
import { OFERTA_BLOCKS } from "./ofertaContent";

const REQUISITES_COUNT = 9;

export default function Oferta() {
  useEffect(() => {
    document.title = "Публичная оферта | НАШЕ for Russia Transfer";
  }, []);

  const requisites = OFERTA_BLOCKS.slice(0, REQUISITES_COUNT);
  const body = OFERTA_BLOCKS.slice(REQUISITES_COUNT);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 pt-28">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-neon transition-colors mb-8">
          <Icon name="ArrowLeft" size={16} fallback="ChevronRight" />
          На главную
        </Link>

        <div className="font-display text-neon text-base tracking-widest mb-2">ДОКУМЕНТЫ</div>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">
          Публичная оферта использования сервиса «НАШЕ»
        </h1>

        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 mb-8 space-y-1.5 text-sm text-muted-foreground">
          {requisites.map((b, i) => (
            <p key={i}>{b.x}</p>
          ))}
        </div>

        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
          {body.map((b, i) =>
            b.t === "h" ? (
              <h2 key={i} className="font-display text-xl font-bold text-foreground pt-4">
                {b.x}
              </h2>
            ) : (
              <p key={i}>{b.x}</p>
            )
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link to="/privacy" className="inline-flex items-center gap-2 text-sm text-neon hover:underline">
            Политика конфиденциальности
            <Icon name="ChevronRight" size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
