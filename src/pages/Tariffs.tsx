import { Link } from "@/lib/router-compat";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/transfer/Navbar";
import {
  TARIFFS,
  MINIVAN_SUBTARIFFS,
  DELIVERY_OPTIONS,
  CHILD_SEAT_PRICE,
  PET_OPTIONS,
  MIN_ORDER_PRICE,
  CHOOSE_CAR_SURCHARGE,
  NEW_REGIONS_MULTIPLIER,
  CRIMEA_MULTIPLIER,
} from "@/components/transfer/constants";

const fmt = (n: number) => n.toLocaleString("ru-RU");

function Row({ name, note, price }: { name: string; note?: string; price: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <div>
        <div className="text-foreground font-medium">{name}</div>
        {note && <div className="text-xs text-muted-foreground">{note}</div>}
      </div>
      <div className="text-neon font-display font-bold whitespace-nowrap">{price}</div>
    </div>
  );
}

function Block({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon name={icon} size={18} className="text-neon" />
        <h2 className="font-display font-bold uppercase tracking-wider text-sm text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function Tariffs() {
  const cars = TARIFFS.filter((t) => !t.isMinivan && !t.isDelivery);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 pt-24 pb-8">
      <Navbar />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="font-display font-bold text-3xl uppercase tracking-wide">
            Тарифы <span className="text-neon">и услуги</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Междугородний трансфер · фиксированная цена</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Block title="Легковые" icon="Car">
            {cars.map((t) => (
              <Row key={t.name} name={t.name} note={`${t.desc} · до ${t.maxPassengers} пасс.`} price={`${t.pricePerKm} ₽/км`} />
            ))}
          </Block>

          <Block title="Минивэны" icon="Bus">
            {MINIVAN_SUBTARIFFS.map((m) => (
              <Row key={m.name} name={m.name} note={m.desc} price={`${m.pricePerKm} ₽/км`} />
            ))}
          </Block>

          <Block title="Доставка" icon="Package">
            {DELIVERY_OPTIONS.map((d) => (
              <Row key={d.name} name={d.name} note={d.desc} price={`${d.pricePerKm} ₽/км`} />
            ))}
          </Block>

          <Block title="Дополнительно" icon="Plus">
            <Row name="Детское кресло" note="за 1 шт." price={`${fmt(CHILD_SEAT_PRICE)} ₽`} />
            {PET_OPTIONS.map((p) => (
              <Row key={p.label} name={`Животное ${p.label.toLowerCase()}`} price={`${fmt(p.price)} ₽`} />
            ))}
            <Row name="Выбор автомобиля" note="из предложенных вариантов" price={`+${CHOOSE_CAR_SURCHARGE} ₽/км`} />
            <Row name="Промежуточная остановка" price="бесплатно" />
          </Block>

          <Block title="Особые регионы" icon="MapPin">
            <Row name="ДНР / ЛНР / Зап. / Херс." note="только км по региону" price={`×${NEW_REGIONS_MULTIPLIER}`} />
            <Row name="Крым / Севастополь" note="только км по региону" price={`×${CRIMEA_MULTIPLIER}`} />
          </Block>

          <Block title="Условия" icon="BadgeCheck">
            <Row name="Минимальный заказ" price={`${fmt(MIN_ORDER_PRICE)} ₽`} />
            <Row name="Туда и обратно" price="−5%" />
            <Row name="Маршрут до 50 км" price="×1,8" />
            <Row name="Маршрут 51–100 км" price="×1,5" />
            <Row name="Маршрут 101–200 км" price="×1,25" />
            <Row name="Ожидание" note="при подаче" price="30 мин бесплатно" />
          </Block>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          Платные дороги оплачиваются клиентом отдельно
        </p>

        <div className="flex justify-center mt-6">
          <Link
            to="/#calc"
            className="inline-flex items-center gap-2 bg-neon text-background font-display font-bold text-base px-8 py-4 rounded-xl hover:opacity-90 transition-all glow-neon hover:scale-[1.02] active:scale-[0.98]"
          >
            <Icon name="Calculator" size={18} />
            РАССЧИТАТЬ ПОЕЗДКУ
          </Link>
        </div>
      </div>
    </div>
  );
}
