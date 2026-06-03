import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Team } from "@/data/teams";
import type { Theme } from "@/lib/theme";

export type MascotMood = "idle" | "confident" | "nervous" | "sad" | "euphoric";
export type JourneyStatus = "alive" | "advanced" | "eliminated" | "champion";

/** Fecha local en formato YYYY-MM-DD (para racha de check-in). */
export function todayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isYesterday(prev: string, ref: Date = new Date()): boolean {
  const y = new Date(ref);
  y.setDate(y.getDate() - 1);
  return prev === todayKey(y);
}

export const CHECKIN_XP = 10;

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
  achievements: string[]; // ids de logros desbloqueados
  adoptedTeamId: string | null;
  championPick: string | null;
  lastCheckinDate: string | null;
  // ajustes
  audioOn: boolean;
  hapticsOn: boolean;
  lowDataMode: boolean;
  theme: Theme;
  // acciones
  pickTeam: (t: Team, mascotName: string) => void;
  setMood: (m: MascotMood) => void;
  setStatus: (s: JourneyStatus) => void;
  addXp: (n: number) => void;
  bumpStreak: () => void;
  unlock: (id: string) => void;
  savePrediction: (matchKey: string, ph: number, pa: number) => void;
  resolvePrediction: (matchKey: string, points: number) => void;
  unlockAchievement: (id: string) => void;
  adoptTeam: (id: string) => void;
  pickChampion: (id: string) => void;
  /** Marca el check-in del día. Devuelve true si fue nuevo (otorga XP). */
  dailyCheckin: () => boolean;
  toggleAudio: () => void;
  toggleHaptics: () => void;
  toggleLowData: () => void;
  setTheme: (t: Theme) => void;
  reset: () => void;
}

const XP_PER_LEVEL = 100;

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      teamId: null,
      mascotName: "",
      mascotMood: "idle",
      status: "alive",
      xp: 0,
      level: 1,
      streak: 0,
      unlocked: [],
      predictions: {},
      achievements: [],
      adoptedTeamId: null,
      championPick: null,
      lastCheckinDate: null,
      audioOn: true,
      hapticsOn: true,
      lowDataMode: false,
      theme: "dark",

      pickTeam: (t, mascotName) =>
        set((s) => ({
          teamId: t.id,
          mascotName: mascotName.trim() || `Toño ${t.flag}`,
          mascotMood: "confident",
          status: "alive",
          adoptedTeamId: null,
          unlocked: s.unlocked.includes(t.id) ? s.unlocked : [...s.unlocked, t.id],
          achievements: s.achievements.includes("firstPick")
            ? s.achievements
            : [...s.achievements, "firstPick"],
        })),

      setMood: (m) => set({ mascotMood: m }),
      setStatus: (s) => set({ status: s }),

      addXp: (n) =>
        set((s) => {
          const xp = Math.max(0, s.xp + n);
          const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
          const achievements =
            level >= 5 && !s.achievements.includes("level5")
              ? [...s.achievements, "level5"]
              : s.achievements;
          return { xp, level, achievements };
        }),

      bumpStreak: () => set((s) => ({ streak: s.streak + 1 })),

      unlock: (id) =>
        set((s) => {
          if (s.unlocked.includes(id)) return s;
          const unlocked = [...s.unlocked, id];
          const achievements =
            unlocked.length >= 10 && !s.achievements.includes("collector")
              ? [...s.achievements, "collector"]
              : s.achievements;
          return { unlocked, achievements };
        }),

      savePrediction: (matchKey, ph, pa) =>
        set((s) => ({
          predictions: { ...s.predictions, [matchKey]: { ph, pa } },
          achievements: s.achievements.includes("firstPredict")
            ? s.achievements
            : [...s.achievements, "firstPredict"],
        })),

      resolvePrediction: (matchKey, points) =>
        set((s) => {
          const prev = s.predictions[matchKey];
          if (!prev) return s;
          const achievements =
            points === 50 && !s.achievements.includes("exactScore")
              ? [...s.achievements, "exactScore"]
              : s.achievements;
          return {
            predictions: { ...s.predictions, [matchKey]: { ...prev, points } },
            achievements,
          };
        }),

      unlockAchievement: (id) =>
        set((s) =>
          s.achievements.includes(id) ? s : { achievements: [...s.achievements, id] },
        ),

      adoptTeam: (id) =>
        set((s) => ({
          adoptedTeamId: id,
          unlocked: s.unlocked.includes(id) ? s.unlocked : [...s.unlocked, id],
        })),

      pickChampion: (id) => set({ championPick: id }),

      dailyCheckin: () => {
        const s = get();
        const today = todayKey();
        if (s.lastCheckinDate === today) return false;
        const continues = s.lastCheckinDate ? isYesterday(s.lastCheckinDate) : false;
        const streak = continues ? s.streak + 1 : 1;
        const achievements =
          streak >= 3 && !s.achievements.includes("streak3")
            ? [...s.achievements, "streak3"]
            : s.achievements;
        const xp = s.xp + CHECKIN_XP;
        set({
          lastCheckinDate: today,
          streak,
          xp,
          level: Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1),
          achievements,
        });
        return true;
      },

      toggleAudio: () => set((s) => ({ audioOn: !s.audioOn })),
      toggleHaptics: () => set((s) => ({ hapticsOn: !s.hapticsOn })),
      toggleLowData: () => set((s) => ({ lowDataMode: !s.lowDataMode })),
      setTheme: (t) => set({ theme: t }),

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
          achievements: [],
          adoptedTeamId: null,
          championPick: null,
          lastCheckinDate: null,
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
