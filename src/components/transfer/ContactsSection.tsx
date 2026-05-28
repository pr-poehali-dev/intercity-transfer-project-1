import Icon from "@/components/ui/icon";
import type { IconName } from "./constants";

export default function ContactsSection() {
  return (
    <>
      {/* CONTACTS */}
      <section id="contacts" className="py-24 bg-surface/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="reveal mb-12">
            <div className="inline-block font-display text-neon text-sm tracking-widest mb-3">КОНТАКТЫ</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">СВЯЖИТЕСЬ С НАМИ</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="reveal space-y-4">
              {[
                { icon: "Phone", label: "Максим", value: "+7 996 160-65-67", href: "tel:+79961606567", highlight: true },
                { icon: "Phone", label: "Дополнительный", value: "+7 919 266-78-85", href: "tel:+79192667885", highlight: false },
                { icon: "Send", label: "Telegram", value: "@Nashe_for_Russia", href: "https://t.me/Nashe_for_Russia", highlight: false },
              ].map((c, i) => (
                <a
                  key={i}
                  href={c.href}
                  className={`flex items-center gap-4 p-5 rounded-xl border transition-all group hover:-translate-y-0.5 ${
                    c.highlight
                      ? "border-neon/40 bg-neon/5 hover:bg-neon/10"
                      : "border-border bg-surface hover:border-white/20"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    c.highlight ? "bg-neon" : "bg-neon/10"
                  }`}>
                    <Icon name={c.icon as IconName} size={20} className={c.highlight ? "text-background" : "text-neon"} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{c.label}</div>
                    <div className={`font-display font-semibold text-lg ${c.highlight ? "text-neon" : "text-foreground"}`}>
                      {c.value}
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={16} className="ml-auto text-muted-foreground group-hover:text-neon transition-colors" />
                </a>
              ))}
            </div>

            <div className="reveal">
              <div className="bg-surface border border-border rounded-2xl p-8 h-full">
                <h3 className="font-display text-xl font-bold mb-6">ОСТАВЬТЕ ЗАЯВКУ</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-display text-muted-foreground tracking-wider mb-2 block">ИМЯ</label>
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-display text-muted-foreground tracking-wider mb-2 block">ТЕЛЕФОН</label>
                    <input
                      type="tel"
                      placeholder="+7 (___) ___-__-__"
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-display text-muted-foreground tracking-wider mb-2 block">СООБЩЕНИЕ</label>
                    <textarea
                      rows={3}
                      placeholder="Ваш маршрут или вопрос..."
                      className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none"
                    />
                  </div>
                  <button className="w-full bg-neon text-background font-display font-bold py-4 rounded-xl hover:opacity-90 transition-all glow-neon">
                    ОТПРАВИТЬ ЗАЯВКУ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-neon rounded-sm flex items-center justify-center">
              <Icon name="MapPin" size={14} className="text-background" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold">
                НАШЕ<span className="text-neon"> for </span><span style={{ color: '#003087' }}>Russia</span>
              </span>
              <span className="text-[10px] text-muted-foreground tracking-widest">TRANSFER</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © 2024 НАШЕ for Russia Transfer. Поездки по России без агрегаторов.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="MapPin" size={12} className="text-neon" />
            Работаем по всей России
          </div>
        </div>
      </footer>
    </>
  );
}