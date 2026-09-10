import { useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

interface ReviewFormProps {
  onSent?: () => void;
}

export default function ReviewForm({ onSent }: ReviewFormProps) {
  const [name, setName] = useState("");
  const [route, setRoute] = useState("");
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const valid = name.trim() && route.trim() && text.trim().length >= 10;

  async function submit() {
    if (!valid || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(func2url["reviews"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, route, rating, text }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Не удалось отправить отзыв. Попробуйте позже.");
        setSending(false);
        return;
      }
      setSent(true);
      setName("");
      setRoute("");
      setText("");
      setRating(5);
      onSent?.();
    } catch {
      setError("Не удалось отправить отзыв. Проверьте соединение.");
    }
    setSending(false);
  }

  if (sent) {
    return (
      <div className="bg-surface border border-neon/40 rounded-2xl p-6 sm:p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-neon/15 flex items-center justify-center mx-auto mb-4">
          <Icon name="CheckCircle" size={28} className="text-neon" />
        </div>
        <h3 className="font-display text-xl font-bold mb-2">Спасибо за отзыв!</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Мы прочитаем его и опубликуем на сайте после проверки.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="text-sm font-display font-semibold text-neon hover:underline"
        >
          Оставить ещё один
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 sm:p-8">
      <h3 className="font-display text-xl sm:text-2xl font-bold mb-1">ОСТАВИТЬ ОТЗЫВ</h3>
      <p className="text-sm text-muted-foreground mb-5">
        Расскажите о поездке — это помогает другим пассажирам выбрать нас
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-display text-muted-foreground tracking-wider mb-2 block">ВАШЕ ИМЯ</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder="Например, Андрей С."
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-neon/60 transition-colors"
          />
        </div>

        <div>
          <label className="text-sm font-display text-muted-foreground tracking-wider mb-2 block">МАРШРУТ</label>
          <input
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            maxLength={200}
            placeholder="Например, Москва — Казань"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-neon/60 transition-colors"
          />
        </div>

        <div>
          <label className="text-sm font-display text-muted-foreground tracking-wider mb-2 block">ОЦЕНКА</label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                aria-label={`Оценка ${s}`}
                className="transition-transform hover:scale-110"
              >
                <Icon
                  name="Star"
                  size={26}
                  className={(hovered || rating) >= s ? "text-neon fill-neon" : "text-muted-foreground"}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-display text-muted-foreground tracking-wider mb-2 block">ОТЗЫВ</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            rows={5}
            placeholder="Как прошла поездка? Что понравилось?"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-neon/60 transition-colors resize-none"
          />
          <div className="text-xs text-muted-foreground mt-1">Минимум 10 символов</div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            <Icon name="TriangleAlert" size={14} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={!valid || sending}
          className="w-full bg-neon text-background font-display font-bold text-base py-4 rounded-xl hover:opacity-90 transition-all glow-neon hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <Icon name="Loader2" size={18} className="animate-spin" />
              ОТПРАВЛЯЕМ...
            </>
          ) : (
            "ОТПРАВИТЬ ОТЗЫВ"
          )}
        </button>
      </div>
    </div>
  );
}
