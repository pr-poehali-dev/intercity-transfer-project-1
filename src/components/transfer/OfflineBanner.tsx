import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const PHONES = [
  { name: "Максим", value: "+7 996 160-65-67", tel: "+79961606567" },
  { name: "Максим", value: "+7 919 266-78-85", tel: "+79192667885" },
];

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] bg-neon text-background px-4 py-3 shadow-lg">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 font-display font-bold text-sm">
          <Icon name="WifiOff" size={18} />
          Нет интернета. Позвоните нам, оформим заказ по телефону:
        </div>
        <div className="flex flex-wrap gap-2">
          {PHONES.map((p) => (
            <a
              key={p.tel}
              href={`tel:${p.tel}`}
              className="inline-flex items-center gap-1.5 bg-background text-foreground font-display font-bold text-sm px-3 py-1.5 rounded-lg"
            >
              <Icon name="Phone" size={14} />
              {p.value}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}