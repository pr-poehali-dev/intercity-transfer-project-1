import { useState } from "react";
import { TARIFFS, DELIVERY_OPTIONS, MINIVAN_SUBTARIFFS, getDistanceSurcharge, CHILD_SEAT_PRICE, PET_OPTIONS } from "./constants";
import CalculatorForm from "./CalculatorForm";
import BookingModal from "./BookingModal";
import HowItWorks from "./HowItWorks";
import func2url from "../../../backend/func2url.json";

interface CalculatorSectionProps {
  from: string;
  setFrom: (v: string) => void;
  to: string;
  setTo: (v: string) => void;
  via: string;
  setVia: (v: string) => void;
  withVia: boolean;
  setWithVia: (v: boolean) => void;
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
  price: number | null;
  distance: number | null;
  calculated: boolean;
  calculating: boolean;
  onCalculate: () => void;
  onClose: () => void;
  onRouteSelect: (from: string, to: string) => void;
  sectionRef: React.RefObject<HTMLDivElement>;
}

export default function CalculatorSection({
  from, setFrom, to, setTo, via, setVia, withVia, setWithVia,
  tariff, setTariff,
  passengers, setPassengers,
  withChildren, setWithChildren,
  childrenCount, setChildrenCount, maxChildren,
  withPet, setWithPet, petOption, setPetOption,
  deliveryMode, setDeliveryMode,
  minivanSub, setMinivanSub,
  date, setDate,
  price, distance, calculated, calculating,
  onCalculate, onClose, onRouteSelect,
  sectionRef,
}: CalculatorSectionProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handlePhoneChange(val: string) {
    let v = val;
    if (v && !v.startsWith("+")) v = "+" + v.replace(/^\+*/, "");
    setPhone(v);
  }

  function isPhoneValid(val: string) {
    const digits = val.replace(/\D/g, "");
    return val.startsWith("+") && digits.length >= 11;
  }

  async function handleBook() {
    if (!name.trim()) { setError("Заполните имя"); return; }
    if (!isPhoneValid(phone)) { setError("Телефон должен начинаться с + и содержать не менее 11 цифр"); return; }
    setError("");
    setSending(true);
    const t = TARIFFS[tariff];
    const isDelivery = t.isDelivery;
    const isMinivan = t.isMinivan;
    const ratePerKm = isDelivery
      ? DELIVERY_OPTIONS[deliveryMode].pricePerKm
      : isMinivan ? MINIVAN_SUBTARIFFS[minivanSub].pricePerKm
      : t.pricePerKm;
    const mult = (isDelivery || isMinivan) ? 1 : (passengers > 1 ? 1 + (passengers - 1) * 0.15 : 1);
    const extras = isDelivery ? 0 : ((withChildren ? childrenCount * CHILD_SEAT_PRICE : 0) + (withPet ? PET_OPTIONS[petOption].price : 0));
    const finalPrice = distance
      ? Math.round((distance * ratePerKm * mult * getDistanceSurcharge(distance)) / 50) * 50 + extras
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
          via_city: (withVia && via) ? via : undefined,
          to_city: to,
          date,
          passengers: isDelivery ? "—" : passengers,
          tariff: tariffLabel,
          price: finalPrice,
          distance,
          services: services.length ? services.join("; ") : "—",
          comment: comment.trim() || "—",
        }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError("Ошибка отправки. Попробуйте позже");
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
              calculating={calculating}
              onCalculate={onCalculate}
            />
          </div>
        </div>
      </section>

      {/* MODAL with price */}
      {calculated && price && (
        <BookingModal
          from={from} via={(withVia && via) ? via : undefined} to={to}
          tariff={tariff} passengers={passengers}
          withChildren={withChildren} childrenCount={childrenCount}
          withPet={withPet} petOption={petOption}
          deliveryMode={deliveryMode} minivanSub={minivanSub}
          price={price} distance={distance}
          name={name} setName={setName}
          phone={phone}
          handlePhoneChange={handlePhoneChange}
          isPhoneValid={isPhoneValid}
          comment={comment} setComment={setComment}
          sending={sending} sent={sent} error={error}
          onBook={handleBook}
          onClose={() => { setSent(false); setError(""); onClose(); }}
          onSuccessClose={() => { setSent(false); setName(""); setPhone(""); onClose(); }}
        />
      )}

      {/* HOW IT WORKS */}
      <HowItWorks />
    </>
  );
}