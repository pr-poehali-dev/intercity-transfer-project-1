import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { useInstallApp, markInstalled } from "@/hooks/use-install-app";

const DISMISS_KEY = "install-banner-dismissed";

function isMobile() {
  return typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function InstallHelp({ ios, onClose }: { ios: boolean; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <img src="/icons/icon-192.png" alt="" className="w-12 h-12 rounded-xl" />
          <div>
            <div className="font-display font-bold text-lg leading-tight">НАШЕ Трансфер</div>
            <div className="text-xs text-muted-foreground">Установка на телефон</div>
          </div>
        </div>
        {ios ? (
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-neon text-background font-bold flex items-center justify-center flex-shrink-0 text-xs">1</span>
              <span>Откройте сайт в Safari и нажмите <Icon name="Share" size={14} className="inline text-neon -mt-0.5" /> «Поделиться» внизу экрана</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-neon text-background font-bold flex items-center justify-center flex-shrink-0 text-xs">2</span>
              <span>Выберите <Icon name="SquarePlus" size={14} className="inline text-neon -mt-0.5" /> «На экран „Домой“»</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-neon text-background font-bold flex items-center justify-center flex-shrink-0 text-xs">3</span>
              <span>Нажмите «Добавить» — иконка появится на экране телефона</span>
            </li>
          </ol>
        ) : (
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-neon text-background font-bold flex items-center justify-center flex-shrink-0 text-xs">1</span>
              <span>Откройте меню браузера <Icon name="EllipsisVertical" size={14} className="inline text-neon -mt-0.5" /> (три точки)</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-neon text-background font-bold flex items-center justify-center flex-shrink-0 text-xs">2</span>
              <span>Выберите «Установить приложение» или «Добавить на главный экран»</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-neon text-background font-bold flex items-center justify-center flex-shrink-0 text-xs">3</span>
              <span>Подтвердите — иконка появится на экране телефона</span>
            </li>
          </ol>
        )}
        <button onClick={onClose} className="mt-5 w-full bg-neon text-background font-display font-semibold rounded-xl py-3">
          Понятно
        </button>
      </div>
    </div>
  );
}

export function useInstallFlow() {
  const app = useInstallApp();
  const [help, setHelp] = useState(false);
  async function start() {
    const r = await app.install();
    if (r !== "prompted") setHelp(true);
  }
  const helpNode = help ? <InstallHelp ios={app.ios} onClose={() => setHelp(false)} /> : null;
  return { ...app, start, helpNode };
}

export default function InstallAppBanner() {
  const flow = useInstallFlow();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!flow.available || !isMobile()) {
      setShow(false);
      return;
    }
    const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (until > Date.now()) return;
    const t = setTimeout(() => setShow(true), 6000);
    return () => clearTimeout(t);
  }, [flow.available]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 7 * 24 * 3600 * 1000));
    setShow(false);
  }

  return (
    <>
      {show && flow.available && (
        <div className="fixed left-3 right-3 bottom-3 z-[900] bg-surface/95 backdrop-blur border border-neon/40 rounded-2xl p-3 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <img src="/icons/icon-192.png" alt="" className="w-11 h-11 rounded-xl flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-display font-semibold text-sm leading-tight">Приложение НАШЕ Трансфер</div>
            <div className="text-xs text-muted-foreground leading-tight mt-0.5">Заказ поездки в два касания</div>
          </div>
          <button
            onClick={async () => {
              if (flow.ios) markInstalled();
              await flow.start();
              setShow(false);
            }}
            className="bg-neon text-background font-display font-semibold text-sm rounded-lg px-3 py-2 flex-shrink-0"
          >
            Установить
          </button>
          <button onClick={dismiss} aria-label="Закрыть" className="text-muted-foreground p-1 flex-shrink-0">
            <Icon name="X" size={16} />
          </button>
        </div>
      )}
      {flow.helpNode}
    </>
  );
}
