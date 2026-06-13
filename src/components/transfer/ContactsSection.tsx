import { useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

export default function ContactsSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+");

  function handlePhoneChange(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (!digits) { setPhone("+"); return; }
    let d = digits;
    if (d.startsWith("8")) d = "7" + d.slice(1);
    let formatted = "+" + d[0];
    if (d.length > 1) formatted += " (" + d.slice(1, 4);
    if (d.length >= 4) formatted += ") " + d.slice(4, 7);
    if (d.length >= 7) formatted += "-" + d.slice(7, 9);
    if (d.length >= 9) formatted += "-" + d.slice(9, 11);
    setPhone(formatted);
  }

  function isPhoneValid(val: string) {
    return val.replace(/\D/g, "").length === 11;
  }
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!name.trim()) { setError("Заполните имя"); return; }
    if (!isPhoneValid(phone)) { setError("Введите корректный номер телефона (11 цифр)"); return; }
    setError("");
    setSending(true);
    try {
      const res = await fetch(func2url["send-booking"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          from_city: "—",
          to_city: "—",
          date: "—",
          passengers: "—",
          tariff: "Заявка с формы контактов",
          price: message || "—",
        }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setName("");
      setPhone("");
      setMessage("");
    } catch {
      setError("Ошибка отправки. Попробуйте позже");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* CONTACTS */}
      <section id="contacts" className="py-16 bg-surface/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="reveal mb-8">
            <div className="inline-block font-display text-neon text-base tracking-widest mb-2">КОНТАКТЫ</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">СВЯЖИТЕСЬ С НАМИ</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="reveal space-y-4">
              {[
                { name: "Максим", value: "+7 996 160-65-67", tel: "+79961606567" },
                { name: "Иван", value: "+7 936 525-00-50", tel: "+79365250050" },
                { name: "Владимир", value: "+7 995 899-80-65", tel: "+79958998065" },
              ].map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 sm:p-5 rounded-xl border border-border bg-surface transition-all hover:border-white/20 min-w-0"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-neon/10">
                    <Icon name="User" size={20} className="text-neon" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Менеджер</div>
                    <div className="font-display font-semibold text-xl text-foreground">{c.name}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                    <a
                      href={`tel:${c.tel}`}
                      aria-label={`Позвонить ${c.name}`}
                      className="w-10 h-10 rounded-lg bg-neon/10 flex items-center justify-center text-neon hover:bg-neon hover:text-background transition-all"
                    >
                      <Icon name="Phone" size={18} />
                    </a>
                    <a
                      href={`https://t.me/${c.tel}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Telegram ${c.name}`}
                      className="w-10 h-10 rounded-lg bg-neon/10 flex items-center justify-center text-neon hover:bg-neon hover:text-background transition-all"
                    >
                      <Icon name="Send" size={18} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="reveal" id="zayavka" style={{ scrollMarginTop: "80px" }}>
              <div className="bg-surface border border-border rounded-2xl p-4 sm:p-8 h-full">
                <h3 className="font-display text-xl font-bold mb-6">ОСТАВЬТЕ ЗАЯВКУ</h3>
                {sent ? (
                  <div className="text-center py-10">
                    <Icon name="CheckCircle2" size={56} className="text-neon mx-auto mb-4" />
                    <div className="font-display text-xl font-bold mb-2">Заявка отправлена!</div>
                    <p className="text-base text-muted-foreground">Мы свяжемся с вами в ближайшее время</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-display text-muted-foreground tracking-wider mb-2 block">ИМЯ</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ваше имя"
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-display text-muted-foreground tracking-wider mb-2 block">ТЕЛЕФОН</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="+7 (999) 123-45-67"
                        className={`w-full bg-background border rounded-lg px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50 ${
                          phone.length > 1 && !isPhoneValid(phone) ? "border-red-500/60" : "border-border"
                        }`}
                      />
                      {phone.length > 1 && !isPhoneValid(phone) && (
                        <div className="text-xs text-red-400 mt-1 px-1">Введите 11 цифр, например +7 (999) 123-45-67</div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-display text-muted-foreground tracking-wider mb-2 block">СООБЩЕНИЕ</label>
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ваш маршрут или вопрос..."
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50 resize-none"
                      />
                    </div>
                    {error && <div className="text-base text-red-400">{error}</div>}
                    <button
                      onClick={handleSubmit}
                      disabled={sending}
                      className="w-full bg-neon text-background font-display font-bold py-4 rounded-xl hover:opacity-90 transition-all glow-neon disabled:opacity-50"
                    >
                      {sending ? "ОТПРАВЛЯЕМ..." : "ОТПРАВИТЬ ЗАЯВКУ"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}