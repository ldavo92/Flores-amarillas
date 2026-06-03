import { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";

/** True si el usuario pidió menos movimiento (OS) o activó modo bajo consumo.
 *  Úsalo para desactivar animaciones pesadas, partículas y bucles. */
export function useReducedMotion(): boolean {
  const lowData = useGameStore((s) => s.lowDataMode);
  const [osReduce, setOsReduce] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setOsReduce(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return lowData || osReduce;
}
