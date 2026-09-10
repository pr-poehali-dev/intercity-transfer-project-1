import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/transfer/Navbar";
import ReviewCard, { type Review } from "@/components/transfer/ReviewCard";
import ReviewForm from "@/components/transfer/ReviewForm";
import { REVIEWS } from "@/components/transfer/constants";
import func2url from "../../backend/func2url.json";

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch(func2url["reviews"])
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.reviews) && d.reviews.length) setReviews(d.reviews);
      })
      .catch(() => { /* fallback to static reviews */ })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("in-view");
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [reviews, loading]);

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1).replace(".", ",")
    : "5,0";

  return (
    <div className="min-h-screen bg-background text-foreground font-golos overflow-x-hidden">
      <Navbar />

      <section className="pt-28 pb-10 max-w-7xl mx-auto px-4 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-neon transition-colors mb-6"
        >
          <Icon name="ArrowLeft" size={15} />
          На главную
        </Link>

        <div className="text-center">
          <div className="inline-block font-display text-neon text-base tracking-widest mb-2">ОТЗЫВЫ КЛИЕНТОВ</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">ЧТО ГОВОРЯТ О НАС</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Icon key={i} name="Star" size={18} className="text-neon fill-neon" />
              ))}
            </div>
            <span className="text-sm">{avg} из 5 · {reviews.length} отзывов</span>
          </div>
        </div>
      </section>

      <section className="pb-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.map((r, i) => (
                <ReviewCard key={i} review={r} delay={i * 50} />
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <ReviewForm onSent={load} />
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 НАШЕ for Russia Transfer. Поездки по России без агрегаторов.
          </p>
        </div>
      </footer>

      <style>{`
        .font-display { font-family: 'Oswald', sans-serif; }
        .font-golos { font-family: 'Golos Text', sans-serif; }
        .text-neon { color: hsl(38 100% 55%); }
        .bg-neon { background-color: hsl(38 100% 55%); }
        .glow-neon { box-shadow: 0 0 20px hsl(38 100% 55% / 0.4), 0 0 60px hsl(38 100% 55% / 0.15); }
        .bg-surface { background-color: hsl(220 18% 11%); }
        .glass {
          background: hsl(220 18% 8% / 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal.in-view {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
