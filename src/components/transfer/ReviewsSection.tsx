import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { REVIEWS } from "./constants";
import ReviewCard, { type Review } from "./ReviewCard";
import func2url from "../../../backend/func2url.json";

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);

  useEffect(() => {
    fetch(func2url["reviews"])
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.reviews) && d.reviews.length) setReviews(d.reviews);
      })
      .catch(() => { /* fallback to static reviews */ });
  }, []);

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="reveal mb-8 text-center">
        <div className="inline-block font-display text-neon text-base tracking-widest mb-2">ОТЗЫВЫ КЛИЕНТОВ</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold">НАМ ДОВЕРЯЮТ ПОЕЗДКИ</h2>
        <div className="flex items-center justify-center gap-2 mt-3 text-muted-foreground">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Icon key={i} name="Star" size={16} className="text-neon fill-neon" />
            ))}
          </div>
          <span className="text-sm">4.9 из 5 — на основе 12 000+ поездок</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.slice(0, 6).map((r, i) => (
          <ReviewCard key={i} review={r} delay={i * 60} />
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          to="/otzyvy"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-neon/40 bg-neon/10 text-neon hover:bg-neon/20 font-display font-semibold transition-all"
        >
          <Icon name="MessageCircle" size={16} />
          Все отзывы и оставить свой
          <Icon name="ChevronRight" size={16} />
        </Link>
      </div>
    </section>
  );
}
