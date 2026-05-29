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
            <span className="font-display font-bold tracking-wide text-sm sm:text-base truncate" style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #003087 50%, #CC0000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block', maxWidth: '100%' }}>
              НАШЕ for Russia Transfer
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#calc" className="hover:text-foreground transition-colors">Калькулятор</a>
          <a href="#contacts" className="hover:text-foreground transition-colors">Контакты</a>
        </div>
        <button
          onClick={onBookClick}
          className="bg-neon text-background font-display text-xs sm:text-sm px-3 sm:px-5 py-2 rounded-md font-semibold hover:opacity-90 transition-opacity glow-neon flex-shrink-0"
        >
          <span className="hidden sm:inline">ЗАБРОНИРОВАТЬ</span>
          <span className="sm:hidden">ЦЕНА</span>
        </button>
      </div>
    </nav>
  );
}