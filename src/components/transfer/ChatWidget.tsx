import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

const CHAT_URL = func2url.chat;

interface ChatMsg {
  id: number;
  sender: "client" | "operator";
  text: string;
  ts: number;
}

function getSessionId(): string {
  let sid = localStorage.getItem("chat_session_id");
  if (!sid) {
    sid = (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36)).replace(/-/g, "");
    localStorage.setItem("chat_session_id", sid);
  }
  return sid;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState(() => localStorage.getItem("chat_name") || "");
  const [askName, setAskName] = useState(() => !localStorage.getItem("chat_name"));
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);

  const sessionId = useRef(getSessionId());
  const lastId = useRef(0);
  const seeded = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const scrollDown = useCallback(() => {
    requestAnimationFrame(() => {
      if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    });
  }, []);

  const playBeep = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      const tones = [880, 1175];
      tones.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.connect(gain);
        const start = ctx.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
        osc.start(start);
        osc.stop(start + 0.18);
      });
      setTimeout(() => ctx.close(), 600);
    } catch {
      /* sound not available */
    }
  }, []);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`${CHAT_URL}?session_id=${sessionId.current}&after=${lastId.current}`);
      const data = await res.json();
      if (Array.isArray(data.messages) && data.messages.length) {
        setMessages((prev) => {
          const existing = new Set(prev.map((m) => m.id));
          const fresh = data.messages.filter((m: ChatMsg) => !existing.has(m.id));
          if (!fresh.length) return prev;
          lastId.current = Math.max(lastId.current, ...data.messages.map((m: ChatMsg) => m.id));
          const opFresh = fresh.filter((m: ChatMsg) => m.sender === "operator").length;
          if (opFresh && seeded.current) {
            if (!open) setUnread((u) => u + opFresh);
            playBeep();
          }
          return [...prev, ...fresh];
        });
        scrollDown();
      }
      seeded.current = true;
    } catch {
      /* ignore */
    }
  }, [open, scrollDown, playBeep]);

  useEffect(() => {
    const interval = setInterval(poll, 3000);
    poll();
    return () => clearInterval(interval);
  }, [poll]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      scrollDown();
    }
  }, [open, scrollDown]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    if (askName && !name.trim()) return;
    setSending(true);
    const optimistic: ChatMsg = { id: Date.now(), sender: "client", text, ts: Math.floor(Date.now() / 1000) };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    scrollDown();
    try {
      await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", session_id: sessionId.current, text, name: name.trim() }),
      });
      if (name.trim()) {
        localStorage.setItem("chat_name", name.trim());
        setAskName(false);
      }
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Открыть чат"
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-neon text-background flex items-center justify-center shadow-lg glow-neon hover:scale-105 transition-transform"
        >
          <Icon name="MessageCircle" size={26} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm h-[70vh] max-h-[560px] flex flex-col bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-neon text-background flex-shrink-0">
            <div className="flex items-center gap-2">
              <Icon name="MessageCircle" size={20} />
              <div className="leading-tight">
                <div className="font-display font-bold text-sm">Онлайн-чат</div>
                <div className="text-[11px] opacity-80">Ответим в течение пары минут</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Закрыть чат" className="hover:opacity-70 transition-opacity">
              <Icon name="X" size={20} />
            </button>
          </div>

          <div ref={bodyRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
            <div className="bg-background/40 border border-border rounded-xl p-3 text-sm text-muted-foreground">
              Здравствуйте! Напишите ваш вопрос — оператор ответит здесь же.
            </div>
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "client" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                    m.sender === "client"
                      ? "bg-neon text-background rounded-br-sm"
                      : "bg-background border border-border text-foreground rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-3 flex-shrink-0 space-y-2">
            {askName && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как вас зовут?"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-neon/50"
              />
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Введите сообщение..."
                className="flex-1 resize-none bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-neon/50 max-h-24"
              />
              <button
                onClick={send}
                disabled={sending || !input.trim() || (askName && !name.trim())}
                aria-label="Отправить"
                className="w-10 h-10 rounded-xl bg-neon text-background flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                <Icon name="Send" size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}