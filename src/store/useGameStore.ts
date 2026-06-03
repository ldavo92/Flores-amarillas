import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Team } from "@/data/teams";

export type MascotMood = "idle" | "confident" | "nervous" | "sad" | "euphoric";
export type JourneyStatus = "alive" | "advanced" | "eliminated" | "champion";

interface GameState {
  teamId: string | null;
  mascotName: string;
  mascotMood: MascotMood;
  status: JourneyStatus;
  xp: number;
  level: number;
  streak: number;
  unlocked: string[]; // ids de mascotas desbloqueadas (álbum)
  predictions: Record<string, { ph: number; pa: number; points?: number }>;
  audioOn: boolean;
  hapticsOn: boolean;
  lowDataMode: boolean;
  pickTeam: (t: Team, mascotName: string) => void;
  setMood: (m: MascotMood) => void;
  setStatus: (s: JourneyStatus) => void;
  addXp: (n: number) => void;
  bumpStreak: () => void;
  unlock: (id: string) => void;
  savePrediction: (matchKey: string, ph: number, pa: number) => void;
  resolvePrediction: (matchKey: string, points: number) => void;
  toggleAudio: () => void;
  toggleHaptics: () => void;
  toggleLowData: () => void;
  reset: () => void;
}

const XP_PER_LEVEL = 100;

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      teamId: null,
      mascotName: "",
      mascotMood: "idle",
      status: "alive",
      xp: 0,
      level: 1,
      streak: 0,
      unlocked: [],
      predictions: {},
      audioOn: true,
      hapticsOn: true,
      lowDataMode: false,

      pickTeam: (t, mascotName) =>
        set({
          teamId: t.id,
          mascotName: mascotName.trim() || `Toño ${t.flag}`,
          mascotMood: "confident",
          status: "alive",
          unlocked: [t.id],
        }),

      setMood: (m) => set({ mascotMood: m }),
      setStatus: (s) => set({ status: s }),

      addXp: (n) =>
        set((s) => {
          const xp = Math.max(0, s.xp + n);
          const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
          return { xp, level };
        }),

      bumpStreak: () => set((s) => ({ streak: s.streak + 1 })),

      unlock: (id) =>
        set((s) => (s.unlocked.includes(id) ? s : { unlocked: [...s.unlocked, id] })),

      savePrediction: (matchKey, ph, pa) =>
        set((s) => ({ predictions: { ...s.predictions, [matchKey]: { ph, pa } } })),

      resolvePrediction: (matchKey, points) =>
        set((s) => {
          const prev = s.predictions[matchKey];
          if (!prev) return s;
          return {
            predictions: { ...s.predictions, [matchKey]: { ...prev, points } },
          };
        }),

      toggleAudio: () => set((s) => ({ audioOn: !s.audioOn })),
      toggleHaptics: () => set((s) => ({ hapticsOn: !s.hapticsOn })),
      toggleLowData: () => set((s) => ({ lowDataMode: !s.lowDataMode })),

      reset: () =>
        set({
          teamId: null,
          mascotName: "",
          mascotMood: "idle",
          status: "alive",
          xp: 0,
          level: 1,
          streak: 0,
          unlocked: [],
          predictions: {},
        }),
    }),
    { name: "mundialgo-v1" },
  ),
);

/** Sistema de puntuación de pronóstico §4.6 */
export function scorePrediction(
  pred: { ph: number; pa: number },
  real: { ph: number; pa: number },
): number {
  if (pred.ph === real.ph && pred.pa === real.pa) return 50;
  const predOutcome = Math.sign(pred.ph - pred.pa);
  const realOutcome = Math.sign(real.ph - real.pa);
  if (predOutcome === realOutcome) return 20;
  return 0;
}
