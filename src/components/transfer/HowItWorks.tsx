import Icon from "@/components/ui/icon";
import type { IconName } from "./constants";

export default function HowItWorks() {
  return (
    <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="reveal mb-8 text-center">
        <div className="inline-block font-display text-neon text-sm tracking-widest mb-2">КАК ЭТО РАБОТАЕТ</div>
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">3 ШАГА ДО ПОЕЗДКИ</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
        {[
          { num: "1", icon: "MapPin", title: "Выберите маршрут", desc: "Укажите откуда и куда, дату и количество пассажиров" },
          { num: "2", icon: "CreditCard", title: "Оплатите водителю", desc: "Наличными или переводом. Цена фиксирована и не меняется" },
          { num: "3", icon: "Car", title: "Поедем!", desc: "Водитель встретит вас точно в назначенное время" },
        ].map((step, i) => (
          <div key={i} className="reveal text-center">
            <div className="relative inline-flex mb-6">
              <div className="w-20 h-20 border-2 border-neon rounded-2xl flex items-center justify-center bg-neon/10">
                <Icon name={step.icon as IconName} size={32} className="text-neon" />
              </div>
              <div className="absolute -top-3 -right-3 font-display text-xs font-bold bg-neon text-background w-7 h-7 rounded-full flex items-center justify-center">
                {step.num}
              </div>
            </div>
            <h3 className="font-display text-xl font-bold mb-3">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
