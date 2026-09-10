import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

interface FloatingCTAProps {
  onBookClick: () => void;
}

export default function FloatingCTA({ onBookClick }: FloatingCTAProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.9);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={onBookClick}
      aria-label="Рассчитать стоимость поездки"
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-neon text-background font-display font-bold text-sm sm:text-base px-5 py-3.5 rounded-full shadow-lg glow-neon transition-all duration-300 hover:scale-105 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16 pointer-events-none"
      }`}
    >
      <span className="absolute inset-0 rounded-full bg-neon animate-ping opacity-20 pointer-events-none" />
      <Icon name="Calculator" size={18} className="relative flex-shrink-0" />
      <span className="relative">Рассчитать поездку</span>
    </button>
  );
}
