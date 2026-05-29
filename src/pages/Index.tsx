import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/transfer/Navbar";
import HeroSection from "@/components/transfer/HeroSection";
import CalculatorSection from "@/components/transfer/CalculatorSection";
import PopularRoutesSection from "@/components/transfer/PopularRoutesSection";
import ContactsSection from "@/components/transfer/ContactsSection";
import { TARIFFS, getDistance, getDistanceSurcharge } from "@/components/transfer/constants";
import func2url from "../../backend/func2url.json";

export default function Index() {
  const [from, setFrom] = useState("Москва");
  const [to, setTo] = useState("Санкт-Петербург");
  const [tariff, setTariff] = useState(0);
  const [passengers, setPassengers] = useState(1);
  const [date, setDate] = useState("");
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
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("in-view");
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function priceFromDistance(dist: number) {
    const base = dist * TARIFFS[tariff].pricePerKm;
    const mult = passengers > 1 ? 1 + (passengers - 1) * 0.15 : 1;
    const surcharge = getDistanceSurcharge(dist);
    return Math.round((base * mult * surcharge) / 50) * 50;
  }

  async function calculate() {
    if (from === to || calculating) return;
    setCalculating(true);
    let dist = getDistance(from, to);
    try {
      const res = await fetch(func2url["calc-distance"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to }),
      });
      const data = await res.json();
      if (typeof data.distance === "number" && data.distance > 0) {
        dist = data.distance;
      }
    } catch {
      // fallback на локальную матрицу расстояний
    }
    setPrice(priceFromDistance(dist));
    setDistance(dist);
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
  function handleSetTariff(v: number) {
    setTariff(v);
    setPassengers((p) => Math.min(p, TARIFFS[v].maxPassengers));
  }
  function handleSetPassengers(v: number) { setPassengers(v); setCalculated(false); }

  return (
    <div className="min-h-screen bg-background text-foreground font-golos overflow-x-hidden">
      <Navbar onBookClick={scrollToBook} />
      <HeroSection onBookClick={scrollToBook} />
      <CalculatorSection
        from={from}
        setFrom={handleSetFrom}
        to={to}
        setTo={handleSetTo}
        tariff={tariff}
        setTariff={handleSetTariff}
        passengers={passengers}
        setPassengers={handleSetPassengers}
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