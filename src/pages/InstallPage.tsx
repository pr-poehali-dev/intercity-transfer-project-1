import { useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useInstallFlow } from "@/components/transfer/InstallApp";

const IOS_STEPS = [
  { icon: "Share", text: "Нажмите «Поделиться» внизу экрана Safari" },
  { icon: "SquarePlus", text: "Выберите «На экран „Домой“»" },
  { icon: "Check", text: "Нажмите «Добавить» — иконка появится на экране" },
];

const BENEFITS = [
  { icon: "Zap", text: "Заказ поездки в два касания" },
  { icon: "Wallet", text: "Фиксированная цена без доплат" },
  { icon: "Smartphone", text: "Не занимает память телефона" },
];

export default function InstallPage() {
  const flow = useInstallFlow();

  useEffect(() => {
    document.title = "Установить приложение НАШЕ Трансфер";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-golos flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm text-center">
        <img
          src="/icons/icon-512.png"
          alt="НАШЕ Трансфер"
          className="w-28 h-28 rounded-[28px] mx-auto shadow-2xl border border-white/10"
        />
        <h1 className="font-display text-3xl font-bold mt-6">НАШЕ Трансфер</h1>
        <p className="text-muted-foreground mt-2">Междугородние поездки по России</p>

        <div className="mt-6 space-y-2 text-left">
          {BENEFITS.map((b) => (
            <div key={b.text} className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3">
              <Icon name={b.icon} size={18} className="text-neon flex-shrink-0" />
              <span className="text-sm">{b.text}</span>
            </div>
          ))}
        </div>

        {flow.installed ? (
          <div className="mt-8">
            <div className="flex items-center justify-center gap-2 text-neon font-display font-semibold">
              <Icon name="CircleCheck" size={20} />
              Приложение уже установлено
            </div>
            <Link
              to="/#calc"
              className="mt-4 block w-full bg-neon text-background font-display font-bold text-lg rounded-2xl py-4 glow-neon"
            >
              РАССЧИТАТЬ ПОЕЗДКУ
            </Link>
          </div>
        ) : flow.ios ? (
          <div className="mt-8 bg-surface border border-neon/40 rounded-2xl p-5 text-left">
            <div className="font-display font-bold text-lg mb-4 text-center">Как установить на iPhone</div>
            <ol className="space-y-4">
              {IOS_STEPS.map((s, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-neon text-background font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm flex-1">{s.text}</span>
                  <Icon name={s.icon} size={20} className="text-neon flex-shrink-0" />
                </li>
              ))}
            </ol>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Если открыли ссылку не в Safari — скопируйте её и откройте в Safari
            </p>
          </div>
        ) : (
          <button
            onClick={flow.start}
            className="mt-8 w-full bg-neon text-background font-display font-bold text-lg rounded-2xl py-4 flex items-center justify-center gap-2 glow-neon"
          >
            <Icon name="Download" size={22} />
            УСТАНОВИТЬ ПРИЛОЖЕНИЕ
          </button>
        )}

        <Link to="/" className="inline-block mt-6 text-sm text-muted-foreground hover:text-neon transition-colors">
          Перейти на сайт
        </Link>
      </div>
      {flow.helpNode}
    </div>
  );
}
