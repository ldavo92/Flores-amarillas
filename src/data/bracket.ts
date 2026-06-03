// §5.4 — Estructura del bracket de eliminatorias 2026 (rivales reales TBD).
// Las rondas se siembran; los slots concretos se llenan con resultados oficiales.
export interface BracketRound {
  readonly id: "r32" | "r16" | "qf" | "sf" | "final";
  readonly matches: number; // nº de cruces en la ronda
  readonly points: number; // puntos por acertar un cruce (predicción de bracket)
}

export const BRACKET_ROUNDS: readonly BracketRound[] = [
  { id: "r32", matches: 16, points: 10 },
  { id: "r16", matches: 8, points: 20 },
  { id: "qf", matches: 4, points: 30 },
  { id: "sf", matches: 2, points: 50 },
  { id: "final", matches: 1, points: 100 },
] as const;
