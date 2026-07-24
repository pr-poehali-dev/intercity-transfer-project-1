import Icon from "@/components/ui/icon";
import { TARIFFS, DELIVERY_OPTIONS, MINIVAN_SUBTARIFFS, getDistanceSurcharge, CHILD_SEAT_PRICE, PET_OPTIONS } from "./constants";
import type { IconName } from "./constants";
import { getDurationByDistance } from "./routesData";
import RouteMap from "./RouteMap";

interface BookingModalProps {
  from: string;
  via?: string;
  to: string;
  date?: string;
  time?: string;
  roundTrip: boolean;
  tariff: number;
  passengers: number;
  withChildren: boolean;
  childrenCount: number;
  withPet: boolean;
  petOption: number;
  deliveryMode: number;
  minivanSub: number;
  price: number;
  distance: number | null;
  manualRequest?: boolean;
  routeLabels?: { from?: string; to?: string; points?: string[]; geoPoints?: string[] };
  name: string;
  setName: (v: string) => void;
  phone: string;
  handlePhoneChange: (v: string) => void;
  isPhoneValid: (v: string) => boolean;
  comment: string;
  setComment: (v: string) => void;
  sending: boolean;
  sent: boolean;
  error: string;
  validationError: string;
  onBook: () => void;
  onClose: () => void;
  onSuccessClose: () => void;
}

export default function BookingModal({
  from, via, to, date, time, roundTrip, tariff, passengers,
  withChildren, childrenCount, withPet, petOption,
  deliveryMode, minivanSub,
  price, distance, manualRequest, routeLabels,
  name, setName, phone, handlePhoneChange, isPhoneValid,
  comment, setComment,
  sending, sent, error, validationError,
  onBook, onClose, onSuccessClose,
}: BookingModalProps) {
  const cur = TARIFFS[tariff];
  const isDelivery = cur.isDelivery;
  const isMinivan = cur.isMinivan;
  const ratePerKm = isDelivery
    ? DELIVERY_OPTIONS[deliveryMode].pricePerKm
    : isMinivan ? MINIVAN_SUBTARIFFS[minivanSub].pricePerKm
    : cur.pricePerKm;
  const extras = isDelivery ? 0 : ((withChildren ? childrenCount * CHILD_SEAT_PRICE : 0) + (withPet ? PET_OPTIONS[petOption].price : 0));
  // Базовая стоимость поездки без extras (distance уже = односторонняя × 2 при туда-обратно)
  const baseRide = distance
    ? Math.round((distance * ratePerKm * getDistanceSurcharge(distance)) / 50) * 50
    : null;
  const basePrice = baseRide != null ? baseRide + extras : price;
  // Скидка 5% со всей стоимости поездки туда-обратно
  const roundTripDiscount = (roundTrip && baseRide != null)
    ? baseRide - Math.round((baseRide * 0.95) / 50) * 50
    : 0;
  const discount = roundTripDiscount;
  // basePrice — полная стоимость двух концов без скидок (distance уже × 2).
  // shownPrice — итоговая цена: полная минус все скидки. Так они всегда сходятся.
  const fullPrice = basePrice != null ? basePrice : null;
  const shownPrice = fullPrice != null ? fullPrice - discount : price;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-up overflow-y-auto"
      onClick={() => onClose()}
    >
      <div
        className="bg-surface border border-neon/40 rounded-2xl p-4 sm:p-8 max-w-lg w-full relative shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onClose()}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background hover:bg-neon/20 transition-colors flex items-center justify-center"
          aria-label="Закрыть"
        >
          <Icon name="ChevronRight" size={18} className="rotate-45 text-muted-foreground" />
        </button>

        {sent ? (
          <div className="text-center py-6">
            <Icon name="CheckCircle2" size={64} className="text-neon mx-auto mb-4" />
            <div className="font-display text-2xl font-bold mb-2">Заявка принята!</div>
            <p className="text-sm text-muted-foreground mb-6">Мы перезвоним вам в течение 5 минут</p>
            <button
              onClick={onSuccessClose}
              className="bg-neon text-background font-display font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all"
            >
              ХОРОШО
            </button>
          </div>
        ) : (
          <>
            {manualRequest ? (
              <>
                <div className="text-xs font-display text-neon tracking-widest mb-4">ЗАЯВКА НА РАСЧЁТ</div>
                <div className="font-display text-2xl sm:text-3xl font-bold mb-3">
                  Рассчитаем стоимость вручную
                </div>
                <div className="inline-flex items-center gap-2 bg-neon/10 border border-neon/40 rounded-lg px-3 py-2 mb-3 text-xs text-foreground font-medium">
                  <Icon name="Phone" size={13} className="flex-shrink-0 text-neon" />
                  Оставьте контакты — посчитаем точную цену и ответим за 5 минут
                </div>
              </>
            ) : (
              <>
                <div className="text-xs font-display text-neon tracking-widest mb-4">СТОИМОСТЬ ПОЕЗДКИ</div>
                {discount > 0 && fullPrice != null && (
                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <span className="font-display text-xl sm:text-2xl text-muted-foreground line-through decoration-2">
                      {fullPrice.toLocaleString("ru-RU")} ₽
                    </span>
                    <span className="inline-flex items-center gap-1 bg-neon/15 text-neon text-xs font-bold px-2 py-0.5 rounded-md">
                      <Icon name="TrendingDown" size={12} />
                      −{discount.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                  <span className="font-display text-lg sm:text-2xl text-muted-foreground">от</span>
                  <span className="font-display text-4xl sm:text-6xl font-bold text-neon glow-neon-text">
                    {(shownPrice ?? 0).toLocaleString("ru-RU")}
                  </span>
                  <span className="font-display text-lg sm:text-2xl text-muted-foreground">₽</span>
                </div>
                {roundTripDiscount > 0 && (
                  <div className="inline-flex items-center gap-2 bg-neon/10 border border-neon/40 rounded-lg px-3 py-2 mb-3 text-xs text-foreground font-medium">
                    <Icon name="RefreshCw" size={13} className="flex-shrink-0 text-neon" />
                    Скидка 5% за поездку туда и обратно уже в цене
                  </div>
                )}

                <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/40 rounded-lg px-3 py-2 mb-3 text-xs text-yellow-200 font-medium">
                  <Icon name="TriangleAlert" size={13} className="flex-shrink-0 text-yellow-400" />
                  Без учёта платных дорог · точную стоимость подтвердит диспетчер
                </div>
              </>
            )}

            <div className="text-sm text-muted-foreground mb-3">
              {from}{via ? ` → ${via}` : ""} → {to}{roundTrip ? `${via ? ` → ${via}` : ""} → ${from}` : ""} · {cur.name}
              {roundTrip ? " · туда-обратно" : ""}
              {isDelivery
                ? ` · ${DELIVERY_OPTIONS[deliveryMode].name} ${DELIVERY_OPTIONS[deliveryMode].pricePerKm} ₽/км`
                : isMinivan
                  ? ` · ${MINIVAN_SUBTARIFFS[minivanSub].name} (${MINIVAN_SUBTARIFFS[minivanSub].desc})`
                  : ` · ${passengers} пасс.`
              }
            </div>

            {!manualRequest && (
              <RouteMap
                points={
                  routeLabels?.geoPoints && routeLabels.geoPoints.length >= 2
                    ? routeLabels.geoPoints
                    : [from, ...(via ? [via] : []), to].filter(Boolean)
                }
                className="h-48 mb-3"
              />
            )}

            {(date || time) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Icon name="Clock" size={14} className="text-neon flex-shrink-0" />
                {date}{time ? ` в ${time}` : ""}
              </div>
            )}

            {!isDelivery && (withChildren || withPet) && (
              <div className="mb-3 space-y-1.5">
                {withChildren && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Icon name="Baby" size={14} className="text-neon flex-shrink-0" />
                    С детьми до 6 лет: {childrenCount}
                  </div>
                )}
                {withPet && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Icon name="Dog" size={14} className="text-neon flex-shrink-0" />
                    Перевозка животного {PET_OPTIONS[petOption].label}
                  </div>
                )}
              </div>
            )}

            {distance && (
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="inline-flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
                  <Icon name="Navigation" size={14} className="text-neon" />
                  <span className="text-sm text-foreground font-medium">
                    {distance.toLocaleString("ru-RU")} км
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
                  <Icon name="Clock" size={14} className="text-neon" />
                  <span className="text-sm text-foreground font-medium">
                    {getDurationByDistance(distance)}
                  </span>
                </div>
              </div>
            )}

            {distance && (routeLabels?.from || routeLabels?.to || routeLabels?.points?.length) && (
              <div className="mb-6 -mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                <Icon name="MapPin" size={13} className="text-neon flex-shrink-0 mt-0.5" />
                <span>
                  Маршрут построен между:{" "}
                  {routeLabels.points?.length
                    ? routeLabels.points.map((p, i) => (
                        <span key={i}>
                          {i > 0 && " → "}
                          <span className="text-foreground">{p}</span>
                        </span>
                      ))
                    : (
                      <>
                        {routeLabels.from && <span className="text-foreground">{routeLabels.from}</span>}
                        {routeLabels.from && routeLabels.to && " → "}
                        {routeLabels.to && <span className="text-foreground">{routeLabels.to}</span>}
                      </>
                    )}
                </span>
              </div>
            )}

            <div className="space-y-2 text-sm mb-6">
              {[
                "Фиксированная цена, без доплат",
                "Встреча по адресу или в аэропорту",
                "Бесплатное ожидание 30 минут",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="CheckCircle" size={14} className="text-neon flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+7 (999) 123-45-67"
                className={`w-full bg-background border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 ${
                  phone && !isPhoneValid(phone) ? "border-red-500/60" : "border-border"
                }`}
              />
              {phone.length > 1 && !isPhoneValid(phone) && (
                <div className="text-xs text-red-400 -mt-1.5 px-1">Введите 11 цифр, например +7 (999) 123-45-67</div>
              )}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Комментарий (адрес подачи, пожелания к поездке...)"
                rows={2}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none"
              />
            </div>

            {validationError && <div className="text-sm text-red-400 mb-3">{validationError}</div>}
            <button
              onClick={onBook}
              disabled={sending}
              className="w-full bg-neon text-background font-display font-bold py-4 rounded-xl hover:opacity-90 transition-all glow-neon disabled:opacity-50"
            >
              {sending ? "ОТПРАВЛЯЕМ..." : `ОФОРМИТЬ — ${price.toLocaleString("ru-RU")} ₽`}
            </button>
          </>
        )}
      </div>

      {error && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-surface border border-red-400/40 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl">
            <Icon name="TriangleAlert" size={56} className="text-red-400 mx-auto mb-4" />
            <div className="font-display text-xl font-bold mb-3">Упс, что-то пошло не так!</div>
            <p className="text-base text-muted-foreground mb-6">Попробуйте позвонить нам или написать</p>
            <a
              href="#contacts"
              onClick={() => onClose()}
              className="inline-block w-full bg-neon text-background font-display font-bold py-4 rounded-xl hover:opacity-90 transition-all glow-neon"
            >
              СВЯЗАТЬСЯ
            </a>
          </div>
        </div>
      )}
    </div>
  );
}