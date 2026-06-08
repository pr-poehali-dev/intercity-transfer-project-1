import { useState, useEffect, useRef, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { FEDERAL_DISTRICTS, TERMINALS } from "./regions";
import func2url from "../../../backend/func2url.json";

interface CitySelectProps {
  value: string;
  onChange: (v: string, region?: string) => void;
  iconName: "MapPin" | "Navigation";
  exclude?: string;
}

interface RemoteCity {
  name: string;
  region: string;
  full: string;
}

export default function CitySelect({ value, onChange, iconName, exclude }: CitySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeDistrict, setActiveDistrict] = useState<string>(FEDERAL_DISTRICTS[0].name);
  const [remoteResults, setRemoteResults] = useState<RemoteCity[]>([]);
  const [searching, setSearching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      setRemoteResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(func2url["search-locations"], {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        });
        const data = await res.json();
        setRemoteResults((data.suggestions || []).filter((c: RemoteCity) => c.name !== exclude));
      } catch {
        setRemoteResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, exclude]);

  const terminalMatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return TERMINALS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        (t.type === "airport" && "аэропорт".includes(q)) ||
        (t.type === "train" && "вокзал".includes(q)) ||
        (t.type === "bus" && "автовокзал".includes(q))
    ).filter((t) => t.name !== exclude);
  }, [search, exclude]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q) {
      const localMatches = FEDERAL_DISTRICTS.flatMap((d) =>
        d.cities
          .filter((c) => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q))
          .map((c) => ({ ...c, district: d.name }))
      ).filter((c) => c.name !== exclude);
      return { isSearch: true, matches: localMatches };
    }
    const district = FEDERAL_DISTRICTS.find((d) => d.name === activeDistrict);
    const cities = district ? district.cities.filter((c) => c.name !== exclude) : [];
    return { isSearch: false, matches: cities.map((c) => ({ ...c, district: activeDistrict })) };
  }, [search, activeDistrict, exclude]);

  function pick(name: string, region?: string) {
    onChange(name, (region || "").trim());
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-background border border-border rounded-lg pl-9 pr-9 py-3 text-base text-left text-foreground cursor-pointer hover:border-white/30 transition-colors flex items-center"
      >
        <Icon name={iconName} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neon pointer-events-none" />
        <span className="truncate">{value || "Город, село, аэропорт..."}</span>
        <Icon name="ChevronRight" size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-transform ${open ? "rotate-90" : "rotate-90"}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full sm:min-w-[360px] sm:max-w-[440px] bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Icon name="Calculator" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск города или региона..."
                autoFocus
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
          </div>



          <div className="max-h-72 overflow-y-auto">
            {filtered.matches.length === 0 && !filtered.isSearch ? (
              <div className="px-4 py-8 text-center text-base text-muted-foreground">
                Ничего не найдено
              </div>
            ) : filtered.isSearch ? (
              <>
                {filtered.matches.length > 0 && (
                  <div className="px-4 py-1.5 text-[10px] font-display tracking-widest text-neon border-b border-border uppercase bg-surface/95">
                    Популярные города
                  </div>
                )}
                {filtered.matches.map((c) => (
                  <button
                    key={`local-${c.name}-${c.region}`}
                    type="button"
                    onClick={() => pick(c.name, c.region)}
                    className="w-full text-left px-4 py-2.5 text-base hover:bg-neon/10 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-foreground font-medium">{c.name}</div>
                      <div className="text-sm text-muted-foreground">{c.region}</div>
                    </div>
                  </button>
                ))}
                {terminalMatches.length > 0 && (
                  <div className="px-4 py-1.5 text-[10px] font-display tracking-widest text-neon border-y border-border uppercase bg-surface/95">
                    Аэропорты, вокзалы, автовокзалы
                  </div>
                )}
                {terminalMatches.map((t, i) => (
                  <button
                    key={`terminal-${i}`}
                    type="button"
                    onClick={() => pick(t.name, t.city)}
                    className="w-full text-left px-4 py-2.5 text-base hover:bg-neon/10 transition-colors flex items-center gap-3"
                  >
                    <Icon
                      name={t.type === "airport" ? "Plane" : t.type === "train" ? "Train" : "Bus"}
                      size={14}
                      className="text-neon flex-shrink-0"
                    />
                    <div>
                      <div className="text-foreground font-medium">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.city}</div>
                    </div>
                  </button>
                ))}
                {(searching || remoteResults.length > 0) && (
                  <div className="px-4 py-1.5 text-[10px] font-display tracking-widest text-neon border-y border-border uppercase bg-surface/95 flex items-center gap-2">
                    Все нас. пункты России
                    {searching && <span className="text-muted-foreground normal-case font-normal text-[10px]">поиск...</span>}
                  </div>
                )}
                {remoteResults.map((c, i) => (
                  <button
                    key={`remote-${i}-${c.name}`}
                    type="button"
                    onClick={() => pick(c.name, c.region)}
                    className="w-full text-left px-4 py-2.5 text-base hover:bg-neon/10 transition-colors"
                  >
                    <div className="text-foreground font-medium">{c.name}</div>
                    <div className="text-sm text-muted-foreground">{c.region || c.full}</div>
                  </button>
                ))}
                {!searching && filtered.matches.length === 0 && terminalMatches.length === 0 && remoteResults.length === 0 && search.trim().length >= 2 && (
                  <div className="px-4 py-6 text-center text-base text-muted-foreground">
                    Ничего не найдено
                  </div>
                )}
                {search.trim().length >= 2 && (
                  <button
                    type="button"
                    onClick={() => pick(search.trim())}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-neon/10 transition-colors border-t border-border flex items-center gap-2 text-neon"
                  >
                    <Icon name="MapPin" size={14} className="flex-shrink-0" />
                    Использовать «{search.trim()}» как адрес
                  </button>
                )}
              </>
            ) : (
              (() => {
                const groups: Record<string, typeof filtered.matches> = {};
                filtered.matches.forEach((c) => {
                  if (!groups[c.region]) groups[c.region] = [];
                  groups[c.region].push(c);
                });
                return Object.entries(groups).map(([region, cities]) => (
                  <div key={region}>
                    <div className="sticky top-0 bg-surface/95 backdrop-blur px-4 py-1.5 text-[10px] font-display tracking-widest text-neon border-b border-border uppercase">
                      {region}
                    </div>
                    {cities.map((c) => (
                      <button
                        key={`${c.name}-${c.region}`}
                        type="button"
                        onClick={() => pick(c.name, c.region)}
                        className="w-full text-left px-4 py-2.5 text-base hover:bg-neon/10 transition-colors"
                      >
                        <span className="text-foreground font-medium">{c.name}</span>
                      </button>
                    ))}
                  </div>
                ));
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
}