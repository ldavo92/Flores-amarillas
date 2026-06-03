import { describe, it, expect, beforeEach } from "vitest";
import { scorePrediction, todayKey, useGameStore } from "./useGameStore";
import { TEAMS } from "@/data/teams";

describe("scorePrediction (§4.6)", () => {
  it("marcador exacto → 50", () => {
    expect(scorePrediction({ ph: 2, pa: 1 }, { ph: 2, pa: 1 })).toBe(50);
  });
  it("empate exacto → 50", () => {
    expect(scorePrediction({ ph: 0, pa: 0 }, { ph: 0, pa: 0 })).toBe(50);
  });
  it("mismo resultado (victoria local) → 20", () => {
    expect(scorePrediction({ ph: 3, pa: 1 }, { ph: 1, pa: 0 })).toBe(20);
  });
  it("mismo resultado (empate distinto marcador) → 20", () => {
    expect(scorePrediction({ ph: 1, pa: 1 }, { ph: 2, pa: 2 })).toBe(20);
  });
  it("resultado opuesto → 0", () => {
    expect(scorePrediction({ ph: 1, pa: 2 }, { ph: 3, pa: 0 })).toBe(0);
  });
  it("victoria visitante acertada → 20", () => {
    expect(scorePrediction({ ph: 0, pa: 2 }, { ph: 1, pa: 3 })).toBe(20);
  });
});

describe("todayKey", () => {
  it("formatea YYYY-MM-DD con ceros", () => {
    expect(todayKey(new Date(2026, 5, 3))).toBe("2026-06-03");
    expect(todayKey(new Date(2026, 0, 9))).toBe("2026-01-09");
  });
});

describe("store: onboarding y check-in", () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    useGameStore.setState({ achievements: [], lastCheckinDate: null, streak: 0, xp: 0, level: 1 });
  });

  it("pickTeam desbloquea la mascota y el logro firstPick", () => {
    const mex = TEAMS.find((t) => t.id === "mex")!;
    useGameStore.getState().pickTeam(mex, "Toño");
    const s = useGameStore.getState();
    expect(s.teamId).toBe("mex");
    expect(s.mascotName).toBe("Toño");
    expect(s.unlocked).toContain("mex");
    expect(s.achievements).toContain("firstPick");
  });

  it("dailyCheckin otorga XP la primera vez y es idempotente el mismo día", () => {
    const first = useGameStore.getState().dailyCheckin();
    expect(first).toBe(true);
    expect(useGameStore.getState().streak).toBe(1);
    expect(useGameStore.getState().xp).toBe(10);
    const second = useGameStore.getState().dailyCheckin();
    expect(second).toBe(false);
    expect(useGameStore.getState().xp).toBe(10); // no duplica
  });

  it("racha continúa si el último check-in fue ayer", () => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    useGameStore.setState({ lastCheckinDate: todayKey(y), streak: 4 });
    useGameStore.getState().dailyCheckin();
    expect(useGameStore.getState().streak).toBe(5);
  });

  it("racha se reinicia si hubo un hueco", () => {
    useGameStore.setState({ lastCheckinDate: "2020-01-01", streak: 9 });
    useGameStore.getState().dailyCheckin();
    expect(useGameStore.getState().streak).toBe(1);
  });

  it("resolvePrediction con 50 desbloquea exactScore", () => {
    useGameStore.getState().savePrediction("m1", 2, 1);
    useGameStore.getState().resolvePrediction("m1", 50);
    expect(useGameStore.getState().achievements).toContain("exactScore");
    expect(useGameStore.getState().predictions["m1"]?.points).toBe(50);
  });
});
