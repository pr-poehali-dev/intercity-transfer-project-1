import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/transfer/Navbar";
import HeroSection from "@/components/transfer/HeroSection";
import CalculatorSection from "@/components/transfer/CalculatorSection";
import PopularRoutesSection from "@/components/transfer/PopularRoutesSection";
import ContactsSection from "@/components/transfer/ContactsSection";
import { TARIFFS, DELIVERY_OPTIONS, MINIVAN_SUBTARIFFS, getDistance, getDistanceSurcharge, CHILD_SEAT_PRICE, PET_OPTIONS } from "@/components/transfer/constants";
import SeoTextSection from "@/components/transfer/SeoTextSection";
import func2url from "../../backend/func2url.json";

export default function Index() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [via, setVia] = useState("");
  const [withVia, setWithVia] = useState(false);
  const [roundTrip, setRoundTrip] = useState(false);
  const [tariff, setTariff] = useState(0);
  const [passengers, setPassengers] = useState(1);
  const [date, setDate] = useState("");
  const [withChildren, setWithChildren] = useState(false);
  const [childrenCount, setChildrenCount] = useState(1);
  const [withPet, setWithPet] = useState(false);
  const [petOption, setPetOption] = useState(0);
  const [deliveryMode, setDeliveryMode] = useState(0);
  const [minivanSub, setMinivanSub] = useState(0);
  const [price, setPrice] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [calculated, setCalculated] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const bookRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    setDate(today.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qFrom = params.get("from");
    const qTo = params.get("to");
    if (qFrom) setFrom(qFrom);
    if (qTo) setTo(qTo);
    if (qFrom || qTo) {
      setTimeout(() => bookRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("in-view");
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isMinivan = TARIFFS[tariff].isMinivan;
  const maxChildren = isMinivan ? 5 : 3;

  function extrasTotal() {
    let sum = 0;
    if (withChildren) sum += childrenCount * CHILD_SEAT_PRICE;
    if (withPet) sum += PET_OPTIONS[petOption].price;
    return sum;
  }

  function priceFromDistance(dist: number) {
    const t = TARIFFS[tariff];
    const isDelivery = t.isDelivery;
    const ratePerKm = isDelivery
      ? DELIVERY_OPTIONS[deliveryMode].pricePerKm
      : t.isMinivan
        ? MINIVAN_SUBTARIFFS[minivanSub].pricePerKm
        : t.pricePerKm;
    const surcharge = getDistanceSurcharge(dist);
    const extras = isDelivery ? 0 : extrasTotal();
    return Math.round((dist * ratePerKm * surcharge) / 50) * 50 + extras;
  }

  async function fetchDist(a: string, b: string): Promise<number> {
    let dist = getDistance(a, b);
    try {
      const res = await fetch(func2url["calc-distance"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: a, to: b }),
      });
      const data = await res.json();
      if (typeof data.distance === "number" && data.distance > 0) dist = data.distance;
    } catch { /* fallback */ }
    return dist;
  }

  async function calculate() {
    const norm = (s: string) => s.trim().toLowerCase();
    if (!from || !to || calculating) return;
    if (!roundTrip && norm(from) === norm(to)) return;
    setCalculating(true);
    let totalDist: number;
    if (withVia && via && norm(via) !== norm(from) && norm(via) !== norm(to)) {
      const d1 = await fetchDist(from, via);
      const d2 = await fetchDist(via, to);
      totalDist = d1 + d2;
    } else {
      totalDist = await fetchDist(from, to);
    }
    if (roundTrip) totalDist *= 1.9;
    setPrice(priceFromDistance(totalDist));
    setDistance(totalDist);
    setCalculated(true);
    setCalculating(false);
  }

  function scrollToBook() {
    bookRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function handleRouteSelect(newFrom: string, newTo: string) {
    setFrom(newFrom);
    setTo(newTo);
    setCalculated(false);
    scrollToBook();
  }

  function handleSetFrom(v: string) { setFrom(v); setCalculated(false); }
  function handleSetTo(v: string) { setTo(v); setCalculated(false); }
  function handleSetVia(v: string) { setVia(v); setCalculated(false); }
  function handleSetWithVia(v: boolean) { setWithVia(v); setCalculated(false); if (!v) setVia(""); }
  function handleSetRoundTrip(v: boolean) { setRoundTrip(v); setCalculated(false); }
  function handleSetTariff(v: number) {
    setTariff(v);
    setPassengers((p) => Math.min(p, TARIFFS[v].maxPassengers));
    const newMax = TARIFFS[v].name === "Минивэн" ? 5 : 3;
    setChildrenCount((c) => Math.min(c, newMax));
    setCalculated(false);
  }
  function handleSetPassengers(v: number) { setPassengers(v); setCalculated(false); }
  function handleSetWithChildren(v: boolean) { setWithChildren(v); setCalculated(false); }
  function handleSetChildrenCount(v: number) { setChildrenCount(v); setCalculated(false); }
  function handleSetWithPet(v: boolean) { setWithPet(v); setCalculated(false); }
  function handleSetPetOption(v: number) { setPetOption(v); setCalculated(false); }
  function handleSetDeliveryMode(v: number) { setDeliveryMode(v); setCalculated(false); }
  function handleSetMinivanSub(v: number) { setMinivanSub(v); setCalculated(false); }

  return (
    <div className="min-h-screen bg-background text-foreground font-golos overflow-x-hidden">
      <Navbar onBookClick={scrollToBook} />
      <HeroSection onBookClick={scrollToBook} />
      <CalculatorSection
        from={from}
        setFrom={handleSetFrom}
        to={to}
        setTo={handleSetTo}
        via={via}
        setVia={handleSetVia}
        withVia={withVia}
        setWithVia={handleSetWithVia}
        roundTrip={roundTrip}
        setRoundTrip={handleSetRoundTrip}
        tariff={tariff}
        setTariff={handleSetTariff}
        passengers={passengers}
        setPassengers={handleSetPassengers}
        withChildren={withChildren}
        setWithChildren={handleSetWithChildren}
        childrenCount={childrenCount}
        setChildrenCount={handleSetChildrenCount}
        maxChildren={maxChildren}
        withPet={withPet}
        setWithPet={handleSetWithPet}
        petOption={petOption}
        setPetOption={handleSetPetOption}
        deliveryMode={deliveryMode}
        setDeliveryMode={handleSetDeliveryMode}
        minivanSub={minivanSub}
        setMinivanSub={handleSetMinivanSub}
        date={date}
        setDate={setDate}
        price={price}
        distance={distance}
        calculated={calculated}
        calculating={calculating}
        onCalculate={calculate}
        onClose={() => setCalculated(false)}
        onRouteSelect={handleRouteSelect}
        sectionRef={bookRef}
      />
      <PopularRoutesSection />
      <SeoTextSection />
      <ContactsSection />

      <style>{`
        .font-display { font-family: 'Oswald', sans-serif; }
        .font-golos { font-family: 'Golos Text', sans-serif; }
        .text-neon { color: hsl(38 100% 55%); }
        .bg-neon { background-color: hsl(38 100% 55%); }
        .glow-neon { box-shadow: 0 0 20px hsl(38 100% 55% / 0.4), 0 0 60px hsl(38 100% 55% / 0.15); }
        .glow-neon-text { text-shadow: 0 0 30px hsl(38 100% 55% / 0.6); }
        .glass {
          background: hsl(220 18% 8% / 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .bg-surface { background-color: hsl(220 18% 11%); }
        .bg-surface-hover { background-color: hsl(220 18% 15%); }
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal.in-view {
          opacity: 1;
          transform: translateY(0);
        }
        .animate-fade-up {
          animation: fadeUp 0.6s ease-out forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}