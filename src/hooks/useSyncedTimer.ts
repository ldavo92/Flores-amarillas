import { useEffect, useRef, useState } from "react";
import type { TimerState } from "../types/game";

type Options = {
  isHost: boolean;
  onExpire?: () => void;
};

type SyncedTimer = {
  remaining: number;
  duration: number;
  isRunning: boolean;
  isCritical: boolean;
  progress: number;
};

function computeRemaining(timer: TimerState): number {
  if (timer.isRunning && timer.startedAt) {
    const elapsed = (Date.now() - timer.startedAt) / 1000;
    return Math.max(0, timer.remaining - elapsed);
  }
  return Math.max(0, timer.remaining);
}

/**
 * Derives the live countdown from the synced timer state. A single interval
 * runs only while the timer is active; the host fires `onExpire` exactly once
 * when it reaches zero.
 */
export function useSyncedTimer(timer: TimerState, options: Options): SyncedTimer {
  const [remaining, setRemaining] = useState(() => computeRemaining(timer));
  const expiredRef = useRef(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const value = computeRemaining(timer);
    setRemaining(value);

    if (!timer.isRunning) {
      expiredRef.current = value <= 0;
      return;
    }
    expiredRef.current = false;

    const interval = setInterval(() => {
      const next = computeRemaining(timer);
      setRemaining(next);
      if (next <= 0) {
        clearInterval(interval);
        if (optionsRef.current.isHost && !expiredRef.current) {
          expiredRef.current = true;
          optionsRef.current.onExpire?.();
        }
      }
    }, 200);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.isRunning, timer.startedAt, timer.remaining, timer.duration]);

  const display = Math.ceil(remaining);
  return {
    remaining: display,
    duration: timer.duration,
    isRunning: timer.isRunning,
    isCritical: display <= 3 && display > 0 && timer.isRunning,
    progress: timer.duration > 0 ? Math.max(0, Math.min(1, remaining / timer.duration)) : 0,
  };
}
