import { useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/transfer/Navbar";
import { PRIVACY_BLOCKS } from "./privacyContent";

export default function Privacy() {
  useEffect(() => {
    document.title = "Политика конфиденциальности | НАШЕ for Russia Transfer";
  }, []);

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
          Политика в отношении обработки персональных данных
        </h1>

        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
          {PRIVACY_BLOCKS.map((b, i) =>
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
          <Link to="/oferta" className="inline-flex items-center gap-2 text-sm text-neon hover:underline">
            Публичная оферта
            <Icon name="ChevronRight" size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
