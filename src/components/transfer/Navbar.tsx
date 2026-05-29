import Icon from "@/components/ui/icon";

interface NavbarProps {
  onBookClick: () => void;
}

const MANAGERS = [
  { name: "Максим", value: "+7 996 160-65-67", tel: "+79961606567" },
  { name: "Иван", value: "+7 936 525-00-50", tel: "+79365250050" },
  { name: "Виктор", value: "+7 906 665-10-64", tel: "+79066651064" },
  { name: "Дмитрий", value: "+7 930 867-56-66", tel: "+79308675666" },
  { name: "Владимир", value: "+7 995 899-80-65", tel: "+79958998065" },
];

export default function Navbar({ onBookClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neon rounded-sm flex items-center justify-center">
            <Icon name="MapPin" size={16} className="text-background" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-xl font-bold tracking-wide text-amber-500" style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #003087 50%, #CC0000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>
              НАШЕ for Russia Transfer
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
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
      <div className="border-t border-white/5 bg-background/40">
        <div className="max-w-7xl mx-auto px-6 py-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          {MANAGERS.map((m, i) => (
            <a
              key={i}
              href={`tel:${m.tel}`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-neon transition-colors whitespace-nowrap"
            >
              <Icon name="Phone" size={12} className="text-neon flex-shrink-0" />
              <span className="font-medium text-foreground">{m.name}</span>
              <span>{m.value}</span>
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}