import Icon from "@/components/ui/icon";
import { TARIFFS, DELIVERY_OPTIONS, MINIVAN_SUBTARIFFS, getDistanceSurcharge, CHILD_SEAT_PRICE, PET_OPTIONS } from "./constants";
import type { IconName } from "./constants";
import { getDurationByDistance } from "./routesData";

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
  price, distance,
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
  const shownPrice = distance
    ? Math.round((distance * ratePerKm * getDistanceSurcharge(distance)) / 50) * 50 + extras
    : price;

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
            <p className="text-sm text-muted-foreground mb-6">Мы перезвоним вам в течение 15 минут</p>
            <button
              onClick={onSuccessClose}
              className="bg-neon text-background font-display font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all"
            >
              ХОРОШО
            </button>
          </div>
        ) : (
          <>
            <div className="text-xs font-display text-neon tracking-widest mb-4">СТОИМОСТЬ ПОЕЗДКИ</div>
            <div className="flex items-baseline gap-2 mb-2 flex-wrap">
              <span className="font-display text-lg sm:text-2xl text-muted-foreground">от</span>
              <span className="font-display text-4xl sm:text-6xl font-bold text-neon glow-neon-text">
                {(shownPrice ?? 0).toLocaleString("ru-RU")}
              </span>
              <span className="font-display text-lg sm:text-2xl text-muted-foreground">₽</span>
            </div>

            <div className="text-xs text-muted-foreground/80 mb-1 flex items-center gap-1.5 animate-pulse">
              <Icon name="Info" size={12} className="flex-shrink-0" />
              Точную стоимость подтвердит диспетчер
            </div>
            <div className="text-xs text-muted-foreground/60 mb-3 flex items-center gap-1.5 animate-pulse">
              <Icon name="TriangleAlert" size={12} className="flex-shrink-0" />
              Стоимость указана без учёта платных дорог
            </div>

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