import Icon from "@/components/ui/icon";

export interface Review {
  name: string;
  city: string;
  rating: number;
  text: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

export default function ReviewCard({ review, delay = 0 }: { review: Review; delay?: number }) {
  return (
    <div
      className="reveal in-view relative bg-surface border border-border rounded-2xl p-5 sm:p-6 hover:border-neon/40 transition-all hover:-translate-y-1 overflow-hidden"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Icon name="Quote" size={56} className="absolute -top-2 right-2 text-neon/5 pointer-events-none" />

      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-neon/15 border border-neon/30 flex items-center justify-center flex-shrink-0">
          <span className="font-display font-bold text-neon text-sm">{initials(review.name)}</span>
        </div>
        <div className="min-w-0">
          <div className="font-display font-semibold leading-tight truncate">{review.name}</div>
          <div className="text-xs text-muted-foreground truncate">{review.city}</div>
        </div>
      </div>

      <div className="flex items-center gap-0.5 mb-3">
        {[...Array(review.rating)].map((_, s) => (
          <Icon key={s} name="Star" size={13} className="text-neon fill-neon" />
        ))}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed relative z-10">{review.text}</p>
    </div>
  );
}