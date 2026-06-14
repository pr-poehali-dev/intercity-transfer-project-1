import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/transfer/Navbar";
import HeroSection from "@/components/transfer/HeroSection";
import CalculatorSection from "@/components/transfer/CalculatorSection";
import PopularRoutesSection from "@/components/transfer/PopularRoutesSection";
import ContactsSection from "@/components/transfer/ContactsSection";
import { TARIFFS, DELIVERY_OPTIONS, MINIVAN_SUBTARIFFS, getDistanceSurcharge, CHILD_SEAT_PRICE, PET_OPTIONS } from "@/components/transfer/constants";
import { resolveCity, resolveGeocodeQuery } from "@/components/transfer/regions";
import SeoTextSection from "@/components/transfer/SeoTextSection";
import func2url from "../../backend/func2url.json";

export default function Index() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [via, setVia] = useState("");
  const [fromRegion, setFromRegion] = useState("");
  const [toRegion, setToRegion] = useState("");
  const [viaRegion, setViaRegion] = useState("");
  const [withVia, setWithVia] = useState(false);
  const [roundTrip, setRoundTrip] = useState(false);
  const [tariff, setTariff] = useState(0);
  const [passengers, setPassengers] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
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
  const [distanceError, setDistanceError] = useState(false);
  const [manualRequest, setManualRequest] = useState(false);
  const [routeLabels, setRouteLabels] = useState<{ from?: string; to?: string; points?: string[] }>({});

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

  async function fetchDist(a: string, b: string): Promise<number | null> {
    try {
      const res = await fetch(func2url["calc-distance"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: a, to: b }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.from_label || data.to_label) {
        setRouteLabels({ from: data.from_label, to: data.to_label });
      }
      if (typeof data.distance === "number" && data.distance > 0) return data.distance;
    } catch { /* no fallback */ }
    return null;
  }

  async function fetchDistMulti(points: string[]): Promise<number | null> {
    try {
      const res = await fetch(func2url["calc-distance"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (Array.isArray(data.labels) && data.labels.length) {
        setRouteLabels({ points: data.labels });
      }
      if (typeof data.distance === "number" && data.distance > 0) return data.distance;
    } catch { /* no fallback */ }
    return null;
  }

  function cityWithRegion(city: string, region: string): string {
    const geo = resolveGeocodeQuery(city);
    // Для терминалов (аэропорт/вокзал/автовокзал) строка уже самодостаточна —
    // регион не добавляем, иначе геокодер запутается.
    if (geo !== city) return geo;
    return region ? `${geo}, ${region}` : geo;
  }

  async function calculate() {
    const norm = (s: string) => s.trim().toLowerCase();
    if (!from || !to || calculating) return;
    if (!roundTrip && norm(from) === norm(to)) return;
    setCalculating(true);
    setRouteLabels({});
    const fromCity = resolveCity(from);
    const toCity = resolveCity(to);
    const viaCity = resolveCity(via);
    const fromFull = cityWithRegion(from, fromRegion);
    const toFull = cityWithRegion(to, toRegion);
    const viaFull = cityWithRegion(via, viaRegion);
    const hasViaStop = withVia && via && norm(viaCity) !== norm(fromCity) && norm(viaCity) !== norm(toCity);
    let totalDist: number | null;
    if (hasViaStop) {
      totalDist = await fetchDistMulti([fromFull, viaFull, toFull]);
    } else {
      totalDist = await fetchDist(fromFull, toFull);
    }
    if (totalDist === null) {
      setPrice(null);
      setDistance(null);
      setCalculated(false);
      setDistanceError(true);
      setManualRequest(true);
      setCalculating(false);
      return;
    }
    setDistanceError(false);
    setManualRequest(false);
    if (roundTrip) totalDist *= 1.9;
    setPrice(priceFromDistance(totalDist) + (hasViaStop ? 1000 : 0));
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

  function handleSetFrom(v: string, region?: string) { setFrom(v); setFromRegion(region || ""); setCalculated(false); setDistanceError(false); setManualRequest(false); }
  function handleSetTo(v: string, region?: string) { setTo(v); setToRegion(region || ""); setCalculated(false); setDistanceError(false); setManualRequest(false); }
  function handleSetVia(v: string, region?: string) { setVia(v); setViaRegion(region || ""); setCalculated(false); setDistanceError(false); setManualRequest(false); }
  function handleSetWithVia(v: boolean) { setWithVia(v); setCalculated(false); if (!v) { setVia(""); setViaRegion(""); } }
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
        fromRegion={fromRegion}
        toRegion={toRegion}
        viaRegion={viaRegion}
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
        time={time}
        setTime={setTime}
        price={price}
        distance={distance}
        routeLabels={routeLabels}
        calculated={calculated}
        calculating={calculating}
        distanceError={distanceError}
        manualRequest={manualRequest}
        onCalculate={calculate}
        onClose={() => { setCalculated(false); setManualRequest(false); }}
        onRouteSelect={handleRouteSelect}
        sectionRef={bookRef}
      />
      <ContactsSection />
      <PopularRoutesSection />
      <SeoTextSection />
      <footer className="border-t border-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
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
          <p className="text-sm text-muted-foreground text-center">
            © 2024 НАШЕ for Russia Transfer. Поездки по России без агрегаторов.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="MapPin" size={12} className="text-neon" />
            Работаем по всей России
          </div>
        </div>
      </footer>

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