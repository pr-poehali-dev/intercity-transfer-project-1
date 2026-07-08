import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

interface AddressInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

interface Suggestion {
  name: string;
  region: string;
  full: string;
}

export default function AddressInput({ value, onChange, placeholder }: AddressInputProps) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const justPicked = useRef(false);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (justPicked.current) {
      justPicked.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 3) {
      setResults([]);
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
        setResults(data.suggestions || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [value]);

  function pick(s: Suggestion) {
    justPicked.current = true;
    onChange(s.full || s.name);
    setOpen(false);
    setResults([]);
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Icon name="MapPin" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neon pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder || "Адрес подачи (город, улица, дом)"}
          className="w-full bg-background border border-border rounded-lg pl-9 pr-9 py-3 text-sm text-foreground placeholder:text-muted-foreground/60"
        />
        {searching && (
          <Icon name="LoaderCircle" size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {results.map((s, i) => (
              <button
                key={`addr-${i}-${s.full}`}
                type="button"
                onClick={() => pick(s)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-neon/10 transition-colors flex items-start gap-3"
              >
                <Icon name="MapPin" size={14} className="text-neon flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-foreground font-medium">{s.name}</div>
                  {s.region && <div className="text-xs text-muted-foreground">{s.region}</div>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
