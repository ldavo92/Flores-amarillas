import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}

/** Registra el service worker (respeta el base path de Vite). */
export function registerServiceWorker(): void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl).catch(() => {
      /* offline registration optional */
    });
  });
}

function isStandalone(): boolean {
  return (
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone === true))
  );
}

/** Hook: ¿se puede instalar? + función para disparar el prompt. */
export function useInstallPrompt(): {
  canInstall: boolean;
  installed: boolean;
  promptInstall: () => Promise<void>;
} {
  const [, force] = useState(0);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const l = () => {
      force((n) => n + 1);
      setInstalled(isStandalone());
    };
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  return {
    canInstall: deferred !== null && !installed,
    installed,
    promptInstall: async () => {
      if (!deferred) return;
      await deferred.prompt();
      await deferred.userChoice;
      deferred = null;
      listeners.forEach((l) => l());
    },
  };
}
