import Icon from "@/components/ui/icon";
import { TARIFFS, DELIVERY_OPTIONS, MINIVAN_SUBTARIFFS, CHILD_SEAT_PRICE, PET_OPTIONS } from "./constants";
import type { IconName } from "./constants";
import CitySelect from "./CitySelect";

interface CalculatorFormProps {
  from: string;
  setFrom: (v: string) => void;
  to: string;
  setTo: (v: string) => void;
  via: string;
  setVia: (v: string) => void;
  withVia: boolean;
  setWithVia: (v: boolean) => void;
  roundTrip: boolean;
  setRoundTrip: (v: boolean) => void;
  tariff: number;
  setTariff: (v: number) => void;
  passengers: number;
  setPassengers: (v: number) => void;
  withChildren: boolean;
  setWithChildren: (v: boolean) => void;
  childrenCount: number;
  setChildrenCount: (v: number) => void;
  maxChildren: number;
  withPet: boolean;
  setWithPet: (v: boolean) => void;
  petOption: number;
  setPetOption: (v: number) => void;
  deliveryMode: number;
  setDeliveryMode: (v: number) => void;
  minivanSub: number;
  setMinivanSub: (v: number) => void;
  date: string;
  setDate: (v: string) => void;
  time: string;
  setTime: (v: string) => void;
  calculating: boolean;
  distanceError: boolean;
  onCalculate: () => void;
}

export default function CalculatorForm({
  from, setFrom, to, setTo, via, setVia, withVia, setWithVia, roundTrip, setRoundTrip,
  tariff, setTariff,
  passengers, setPassengers,
  withChildren, setWithChildren,
  childrenCount, setChildrenCount, maxChildren,
  withPet, setWithPet, petOption, setPetOption,
  deliveryMode, setDeliveryMode,
  minivanSub, setMinivanSub,
  date, setDate,
  time, setTime,
  calculating, distanceError, onCalculate,
}: CalculatorFormProps) {
  const norm = (s: string) => s.trim().toLowerCase();
  const sameRoute = !roundTrip && !!from && !!to && norm(from) === norm(to);
  const viaSameAsFrom = withVia && !!via && norm(via) === norm(from);
  const viaSameAsTo = withVia && !roundTrip && !!via && norm(via) === norm(to);
  const routeError = sameRoute
    ? "Пункты «Откуда» и «Куда» совпадают — выберите разные адреса или включите «Туда и обратно»"
    : viaSameAsFrom
      ? "Промежуточный пункт совпадает с «Откуда»"
      : viaSameAsTo
        ? "Промежуточный пункт совпадает с «Куда»"
        : "";

  return (
    <div className="reveal bg-surface border border-border rounded-2xl p-4 sm:p-8">
      <div className="mb-4">
        <a
          href="#zayavka"
          className="inline-flex items-center gap-2 text-sm font-display font-semibold text-neon border border-neon/40 bg-neon/10 rounded-lg px-4 py-2.5 hover:bg-neon/20 transition-colors"
        >
          <Icon name="HelpCircle" size={16} className="flex-shrink-0" />
          Не корректный просчёт или не нашли нас. пункт? Отправьте заявку! Ответим за 5 минут!
        </a>
      </div>

      <div className="space-y-3 mb-3">
        <div>
          <label className="text-sm font-display text-muted-foreground tracking-wider mb-2 block">ОТКУДА</label>
          <CitySelect value={from} onChange={setFrom} iconName="MapPin" exclude={to} />
        </div>
        {withVia && (
          <div>
            <label className="text-sm font-display text-muted-foreground tracking-wider mb-2 block">ПРОМЕЖУТОЧНЫЙ ПУНКТ</label>
            <CitySelect value={via} onChange={setVia} iconName="Navigation" exclude={to} />
          </div>
        )}
        <div>
          <label className="text-sm font-display text-muted-foreground tracking-wider mb-2 block">КУДА</label>
          <CitySelect value={to} onChange={setTo} iconName="Navigation" exclude={roundTrip ? undefined : from} />
        </div>
      </div>

      {routeError && (
        <div className="mb-3 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          <Icon name="TriangleAlert" size={14} className="flex-shrink-0" />
          {routeError}
        </div>
      )}

      <div className="mb-3">
        <button
          type="button"
          onClick={() => setRoundTrip(!roundTrip)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${roundTrip ? "bg-neon border-neon" : "border-muted-foreground"}`}>
            {roundTrip && <Icon name="Check" size={10} className="text-background" />}
          </div>
          <Icon name="RefreshCw" size={14} className={roundTrip ? "text-neon" : ""} />
          Туда и обратно

        </button>
      </div>

      <div className="mb-6">
        <button
          type="button"
          onClick={() => setWithVia(!withVia)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${withVia ? "bg-neon border-neon" : "border-muted-foreground"}`}>
            {withVia && <Icon name="Check" size={10} className="text-background" />}
          </div>
          <Icon name="MapPin" size={14} className={withVia ? "text-neon" : ""} />
          {withVia ? "Убрать промежуточный пункт" : "Добавить промежуточный пункт"}
        </button>
      </div>

      {/* Tariffs */}
      <div className="mb-6">
        <label className="text-sm font-display text-muted-foreground tracking-wider mb-3 block">ТАРИФ</label>
        <div className="grid grid-cols-3 gap-3">
          {TARIFFS.map((t, i) => (
            <button
              key={i}
              onClick={() => { setTariff(i); }}
              className={`border rounded-xl p-2 sm:p-3 text-center transition-all overflow-hidden min-w-0 ${
                tariff === i
                  ? "border-neon bg-neon/10 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-white/30"
              }`}
            >
              <Icon name={t.icon as IconName} size={18} className={`mx-auto mb-1 ${tariff === i ? "text-neon" : ""}`} />
              <div className="font-display text-sm sm:text-base font-semibold leading-tight">{t.name}</div>
              <div className="text-[11px] sm:text-xs opacity-70 leading-tight mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Minivan subtariffs */}
      {TARIFFS[tariff].isMinivan && (
        <div className="mb-6">
          <label className="text-sm font-display text-muted-foreground tracking-wider mb-3 block">ВЫБЕРИТЕ ВМЕСТИМОСТЬ</label>
          <div className="grid grid-cols-3 gap-3">
            {MINIVAN_SUBTARIFFS.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMinivanSub(i)}
                className={`border rounded-xl p-3 text-center transition-all ${
                  minivanSub === i
                    ? "border-neon bg-neon/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-white/30"
                }`}
              >
                <Icon name="Users" size={18} className={`mx-auto mb-1.5 ${minivanSub === i ? "text-neon" : ""}`} />
                <div className="font-display text-sm font-semibold leading-tight">{s.name}</div>
                <div className="text-[11px] opacity-70 mt-0.5">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Delivery type selector — only for Доставка tariff */}
      {TARIFFS[tariff].isDelivery && (
        <div className="mb-6">
          <label className="text-sm font-display text-muted-foreground tracking-wider mb-3 block">ТИП ДОСТАВКИ</label>
          <div className="grid grid-cols-2 gap-3">
            {DELIVERY_OPTIONS.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setDeliveryMode(i)}
                className={`border rounded-xl p-3 sm:p-4 text-left transition-all ${
                  deliveryMode === i
                    ? "border-neon bg-neon/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-white/30"
                }`}
              >
                <Icon name={d.icon as IconName} size={20} className={`mb-2 ${deliveryMode === i ? "text-neon" : ""}`} />
                <div className="font-display text-sm sm:text-base font-semibold leading-tight">{d.name}</div>
                <div className="text-[11px] sm:text-xs opacity-70 mt-0.5">{d.desc}</div>

              </button>
            ))}
          </div>
        </div>
      )}

      <div className={`grid gap-4 mb-6 ${TARIFFS[tariff].isDelivery ? "grid-cols-2" : "grid-cols-3"}`}>
        <div>
          <label className="text-sm font-display text-muted-foreground tracking-wider mb-2 block">ДАТА ПОЕЗДКИ</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-2 py-3 text-sm text-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-display text-muted-foreground tracking-wider mb-2 block">ВРЕМЯ</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-2 py-3 text-sm text-foreground"
          />
        </div>
        {!TARIFFS[tariff].isDelivery && (
          <div>
            <label className="text-sm font-display text-muted-foreground tracking-wider mb-2 block">ПАССАЖИРЫ</label>
            <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-2 py-3 text-sm">
              <button
                onClick={() => { setPassengers(Math.max(1, passengers - 1)); }}
                className="w-7 h-7 rounded-full bg-surface-hover flex items-center justify-center hover:bg-neon/20 transition-colors text-foreground font-bold text-lg leading-none"
              >–</button>
              <span className="flex-1 text-center font-display font-bold text-foreground">{passengers}</span>
              <button
                onClick={() => { setPassengers(Math.min(TARIFFS[tariff].maxPassengers, passengers + 1)); }}
                className="w-7 h-7 rounded-full bg-surface-hover flex items-center justify-center hover:bg-neon/20 transition-colors text-foreground font-bold text-lg leading-none"
              >+</button>
            </div>
            <div className="text-xs text-muted-foreground mt-1.5">
              Макс. {TARIFFS[tariff].maxPassengers} для тарифа «{TARIFFS[tariff].name}»
            </div>
          </div>
        )}
      </div>

      {/* Extra services — hidden for Доставка tariff */}
      {!TARIFFS[tariff].isDelivery && (
      <div className="mb-6">
        <label className="text-sm font-display text-muted-foreground tracking-wider mb-3 block">ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ</label>
        <div className="space-y-3">
          {/* Children */}
          <div className={`border rounded-xl p-3 transition-all ${withChildren ? "border-neon bg-neon/5" : "border-border bg-background"}`}>
            <button
              type="button"
              onClick={() => setWithChildren(!withChildren)}
              className="w-full flex items-center gap-3"
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${withChildren ? "bg-neon border-neon" : "border-muted-foreground"}`}>
                {withChildren && <Icon name="Check" size={14} className="text-background" />}
              </div>
              <Icon name="Baby" size={18} className={withChildren ? "text-neon" : "text-muted-foreground"} />
              <div className="text-left flex-1 min-w-0">
                <div className="font-display text-sm font-semibold text-foreground">С детьми до 6 лет</div>
                <div className="text-xs text-muted-foreground">Детское кресло, до 6 лет</div>
              </div>
            </button>
            {withChildren && (
              <div className="flex items-center gap-2 mt-3 pl-8">
                <span className="text-sm text-muted-foreground">Детей:</span>
                <button
                  type="button"
                  onClick={() => setChildrenCount(Math.max(1, childrenCount - 1))}
                  className="w-7 h-7 rounded-full bg-surface-hover flex items-center justify-center hover:bg-neon/20 transition-colors text-foreground font-bold text-lg leading-none"
                >–</button>
                <span className="w-8 text-center font-display font-bold text-foreground">{childrenCount}</span>
                <button
                  type="button"
                  onClick={() => setChildrenCount(Math.min(maxChildren, childrenCount + 1))}
                  className="w-7 h-7 rounded-full bg-surface-hover flex items-center justify-center hover:bg-neon/20 transition-colors text-foreground font-bold text-lg leading-none"
                >+</button>
                <span className="text-xs text-muted-foreground ml-1">макс. {maxChildren}</span>
              </div>
            )}
          </div>

          {/* Pet */}
          <div className={`border rounded-xl p-3 transition-all ${withPet ? "border-neon bg-neon/5" : "border-border bg-background"}`}>
            <button
              type="button"
              onClick={() => setWithPet(!withPet)}
              className="w-full flex items-center gap-3"
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${withPet ? "bg-neon border-neon" : "border-muted-foreground"}`}>
                {withPet && <Icon name="Check" size={14} className="text-background" />}
              </div>
              <Icon name="Dog" size={18} className={withPet ? "text-neon" : "text-muted-foreground"} />
              <div className="text-left flex-1 min-w-0">
                <div className="font-display text-sm font-semibold text-foreground">Перевозка животного</div>
                <div className="text-xs text-muted-foreground">Выберите вес питомца</div>
              </div>
            </button>
            {withPet && (
              <div className="grid grid-cols-3 gap-2 mt-3 pl-8">
                {PET_OPTIONS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPetOption(i)}
                    className={`border rounded-lg p-2 text-center transition-all ${petOption === i ? "border-neon bg-neon/10 text-foreground" : "border-border bg-surface text-muted-foreground hover:border-white/30"}`}
                  >
                    <div className="font-display text-sm font-semibold leading-tight">{p.label}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      <button
        onClick={onCalculate}
        disabled={!!routeError || calculating}
        className="w-full bg-neon text-background font-display font-bold text-base py-4 rounded-xl hover:opacity-90 transition-all glow-neon hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {calculating ? (
          <>
            <Icon name="Loader2" size={18} className="animate-spin" />
            РАССЧИТЫВАЕМ...
          </>
        ) : (
          "РАССЧИТАТЬ СТОИМОСТЬ"
        )}
      </button>

      {distanceError && (
        <div className="mt-3 flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5">
          <Icon name="TriangleAlert" size={16} className="flex-shrink-0 mt-0.5" />
          <span>
            Не удалось определить расстояние. Уточните населённый пункт — начните вводить название и выберите нужный вариант с областью из списка.
            {" "}Если пункта нет в списке — просто отправьте заявку, мы рассчитаем вручную и ответим за 5 минут.
          </span>
        </div>
      )}
    </div>
  );
}