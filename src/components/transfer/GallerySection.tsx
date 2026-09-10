import { GALLERY } from "./constants";

export default function GallerySection() {
  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="reveal mb-8 text-center">
        <div className="inline-block font-display text-neon text-base tracking-widest mb-2">КАК МЫ РАБОТАЕМ</div>
        <h2 className="font-display text-3xl md:text-4xl font-bold">НЕ АГРЕГАТОР — СВОИ МАШИНЫ</h2>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
          Мы знаем каждого водителя лично и отвечаем за состояние автомобиля перед поездкой
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GALLERY.map((g, i) => (
          <div
            key={i}
            className="reveal group relative rounded-2xl overflow-hidden border border-border hover:border-neon/40 transition-all hover:-translate-y-1"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <img
              src={g.src}
              alt={g.title}
              loading="lazy"
              className="w-full h-56 sm:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
              <h3 className="font-display text-lg sm:text-xl font-bold mb-1">{g.title}</h3>
              <p className="text-sm text-muted-foreground leading-snug">{g.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
