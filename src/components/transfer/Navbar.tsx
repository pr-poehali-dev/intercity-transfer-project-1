import Icon from "@/components/ui/icon";

interface NavbarProps {
  onBookClick: () => void;
}

export default function Navbar({ onBookClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neon rounded-sm flex items-center justify-center">
            <Icon name="MapPin" size={16} className="text-background" />
          </div>
          <span className="font-display text-xl font-bold tracking-wide">
            ТРАНС<span className="text-neon">ФЕР</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#routes" className="hover:text-foreground transition-colors">Маршруты</a>
          <a href="#calc" className="hover:text-foreground transition-colors">Калькулятор</a>
          <a href="#contacts" className="hover:text-foreground transition-colors">Контакты</a>
        </div>
        <button
          onClick={onBookClick}
          className="bg-neon text-background font-display text-sm px-5 py-2 rounded-md font-semibold hover:opacity-90 transition-opacity glow-neon"
        >
          ЗАБРОНИРОВАТЬ
        </button>
      </div>
    </nav>
  );
}
