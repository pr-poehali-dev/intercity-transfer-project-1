import { useState } from "react";
import { TARIFFS, DELIVERY_OPTIONS, MINIVAN_SUBTARIFFS, getDistanceSurcharge, getLongRouteDiscount, CHILD_SEAT_PRICE, PET_OPTIONS } from "./constants";
import { getDurationByDistance } from "./routesData";
import CalculatorForm from "./CalculatorForm";
import BookingModal from "./BookingModal";
import func2url from "../../../backend/func2url.json";

interface CalculatorSectionProps {
  from: string;
  setFrom: (v: string, region?: string) => void;
  to: string;
  setTo: (v: string, region?: string) => void;
  via: string;
  setVia: (v: string, region?: string) => void;
  fromRegion: string;
  toRegion: string;
  viaRegion: string;
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
  price: number | null;
  distance: number | null;
  routeLabels?: { from?: string; to?: string; points?: string[] };
  calculated: boolean;
  calculating: boolean;
  distanceError: boolean;
  manualRequest?: boolean;
  onCalculate: () => void;
  onClose: () => void;
  onRouteSelect: (from: string, to: string) => void;
  sectionRef: React.RefObject<HTMLDivElement>;
}

export default function CalculatorSection({
  from, setFrom, to, setTo, via, setVia, fromRegion, toRegion, viaRegion, withVia, setWithVia, roundTrip, setRoundTrip,
  tariff, setTariff,
  passengers, setPassengers,
  withChildren, setWithChildren,
  childrenCount, setChildrenCount, maxChildren,
  withPet, setWithPet, petOption, setPetOption,
  deliveryMode, setDeliveryMode,
  minivanSub, setMinivanSub,
  date, setDate,
  time, setTime,
  price, distance, routeLabels, calculated, calculating, distanceError, manualRequest,
  onCalculate, onClose, onRouteSelect,
  sectionRef,
}: CalculatorSectionProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

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

  async function handleBook() {
    if (!name.trim()) { setValidationError("Заполните имя"); return; }
    if (!isPhoneValid(phone)) { setValidationError("Введите корректный номер телефона (11 цифр)"); return; }
    setValidationError("");
    setError("");
    setSending(true);
    const t = TARIFFS[tariff];
    const isDelivery = t.isDelivery;
    const isMinivan = t.isMinivan;
    const ratePerKm = isDelivery
      ? DELIVERY_OPTIONS[deliveryMode].pricePerKm
      : isMinivan ? MINIVAN_SUBTARIFFS[minivanSub].pricePerKm
      : t.pricePerKm;
    const extras = isDelivery ? 0 : ((withChildren ? childrenCount * CHILD_SEAT_PRICE : 0) + (withPet ? PET_OPTIONS[petOption].price : 0));
    const finalPrice = distance
      ? Math.round((distance * ratePerKm * getDistanceSurcharge(distance)) / 50) * 50 + extras - getLongRouteDiscount(distance)
      : price;
    const tariffLabel = isMinivan
      ? `${t.name} · ${MINIVAN_SUBTARIFFS[minivanSub].name}`
      : t.name;
    const services: string[] = [];
    if (isDelivery) {
      services.push(`Доставка: ${DELIVERY_OPTIONS[deliveryMode].name} (${DELIVERY_OPTIONS[deliveryMode].pricePerKm} ₽/км)`);
    } else {
      if (withChildren) services.push(`С детьми до 6 лет: ${childrenCount} (+${childrenCount * CHILD_SEAT_PRICE} ₽)`);
      if (withPet) services.push(`Перевозка животного ${PET_OPTIONS[petOption].label} (+${PET_OPTIONS[petOption].price} ₽)`);
    }
    try {
      const res = await fetch(func2url["send-booking"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          from_city: from,
          from_region: fromRegion || undefined,
          via_city: (withVia && via) ? via : undefined,
          via_region: (withVia && via) ? (viaRegion || undefined) : undefined,
          to_city: to,
          to_region: toRegion || undefined,
          round_trip: roundTrip,
          date: time ? `${date} ${time}` : date,
          passengers: isDelivery ? "—" : passengers,
          tariff: tariffLabel,
          price: manualRequest ? "по запросу (ручной расчёт)" : finalPrice,
          distance,
          duration: distance ? getDurationByDistance(distance) : undefined,
          services: services.length ? services.join("; ") : "—",
          comment: comment.trim() || "—",
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Сервер вернул ошибку ${res.status}. ${text}`);
      }
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Сервер не подтвердил отправку");
      setSent(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Ошибка отправки: ${msg}`);
      console.error("Booking error:", e, "URL:", func2url["send-booking"]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* CALCULATOR */}
      <section id="calc" ref={sectionRef} className="py-16 bg-surface/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="reveal mb-8">
            <div className="inline-block font-display text-neon text-base tracking-widest mb-2">БРОНИРОВАНИЕ</div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">РАССЧИТАЙТЕ СТОИМОСТЬ ПОЕЗДКИ</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <CalculatorForm
              from={from} setFrom={setFrom}
              to={to} setTo={setTo}
              via={via} setVia={setVia}
              withVia={withVia} setWithVia={setWithVia}
              roundTrip={roundTrip} setRoundTrip={setRoundTrip}
              tariff={tariff} setTariff={setTariff}
              passengers={passengers} setPassengers={setPassengers}
              withChildren={withChildren} setWithChildren={setWithChildren}
              childrenCount={childrenCount} setChildrenCount={setChildrenCount}
              maxChildren={maxChildren}
              withPet={withPet} setWithPet={setWithPet}
              petOption={petOption} setPetOption={setPetOption}
              deliveryMode={deliveryMode} setDeliveryMode={setDeliveryMode}
              minivanSub={minivanSub} setMinivanSub={setMinivanSub}
              date={date} setDate={setDate}
              time={time} setTime={setTime}
              calculating={calculating}
              distanceError={distanceError}
              onCalculate={onCalculate}
            />
          </div>
        </div>
      </section>

      {/* MODAL with price OR manual request */}
      {((calculated && price) || manualRequest) && (
        <BookingModal
          from={from} via={(withVia && via) ? via : undefined} to={to}
          date={date} time={time}
          roundTrip={roundTrip}
          tariff={tariff} passengers={passengers}
          withChildren={withChildren} childrenCount={childrenCount}
          withPet={withPet} petOption={petOption}
          deliveryMode={deliveryMode} minivanSub={minivanSub}
          price={price ?? 0} distance={distance}
          manualRequest={manualRequest}
          routeLabels={routeLabels}
          name={name} setName={setName}
          phone={phone}
          handlePhoneChange={handlePhoneChange}
          isPhoneValid={isPhoneValid}
          comment={comment} setComment={setComment}
          sending={sending} sent={sent} error={error} validationError={validationError}
          onBook={handleBook}
          onClose={() => { setSent(false); setError(""); setValidationError(""); onClose(); }}
          onSuccessClose={() => { setSent(false); setName(""); setPhone(""); onClose(); }}
        />
      )}

    </>
  );
}