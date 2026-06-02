import Icon from "@/components/ui/icon";

interface NavbarProps {
  onBookClick: () => void;
}

export default function Navbar({ onBookClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 bg-neon rounded-sm flex items-center justify-center flex-shrink-0">
            <Icon name="MapPin" size={14} className="text-background" />
          </div>
          <div className="flex flex-col leading-none min-w-0">
            <span className="font-display font-bold tracking-wide text-sm sm:text-base">
              НАШЕ<span className="text-neon"> for </span><span style={{ color: '#003087' }}>Russia</span> Transfer
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-base text-muted-foreground">
          <a href="#calc" className="hover:text-foreground transition-colors">Калькулятор</a>
          <a href="#contacts" className="hover:text-foreground transition-colors">Контакты</a>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onBookClick}
            className="bg-neon text-background font-display text-sm sm:text-base px-3 sm:px-5 py-2 rounded-md font-semibold hover:opacity-90 transition-opacity glow-neon"
          >
            <span className="hidden sm:inline">ОФОРМИТЬ ПОЕЗДКУ</span>
            <span className="sm:hidden">ЦЕНА</span>
          </button>
          <div className="flex items-center gap-1">
            {/* Blinking pointer arrow */}
            <span
              className="text-neon text-base font-bold select-none leading-none"
              style={{ animation: "phonePointerBlink 1.2s ease-in-out infinite" }}
            >›</span>
            <a
              href="#contacts"
              className="w-9 h-9 rounded-md border border-neon/60 bg-neon/10 flex items-center justify-center text-neon hover:bg-neon/20 transition-all"
              aria-label="Контакты"
              style={{ animation: "phoneGlowPulse 1.2s ease-in-out infinite" }}
            >
              <Icon name="Phone" size={16} />
            </a>
          </div>
        </div>

        <style>{`
          @keyframes phonePointerBlink {
            0%, 100% { opacity: 1; transform: translateX(0); }
            50% { opacity: 0.3; transform: translateX(-3px); }
          }
          @keyframes phoneGlowPulse {
            0%, 100% { box-shadow: 0 0 0 0 hsl(38 100% 55% / 0.5); }
            50% { box-shadow: 0 0 0 5px hsl(38 100% 55% / 0); }
          }
        `}</style>
      </div>
    </nav>
  );
}