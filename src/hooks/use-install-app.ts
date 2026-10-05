import { useEffect, useState } from "react";

type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferred: PromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as PromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    notify();
  });
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(ua) || (ua.includes("Macintosh") && "ontouchend" in document);
}

export function useInstallApp() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((x) => x + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const installed = isStandalone();
  const ios = isIOS();
  const canPrompt = !!deferred;
  const available = !installed && (canPrompt || ios);

  async function install(): Promise<"prompted" | "ios" | "unavailable"> {
    if (deferred) {
      const d = deferred;
      deferred = null;
      await d.prompt();
      await d.userChoice.catch(() => null);
      notify();
      return "prompted";
    }
    if (ios) return "ios";
    return "unavailable";
  }

  return { installed, ios, canPrompt, available, install };
}
