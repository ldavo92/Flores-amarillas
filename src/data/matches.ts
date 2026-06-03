// Datos reales 2026 §5.2 — 72 partidos de fase de grupos (horarios ET, ISO 8601)
import type { GroupCode } from "./teams";

export type MatchStatus = "scheduled" | "live" | "finished";

export interface MatchSeed {
  readonly g: GroupCode;
  readonly h: string;
  readonly a: string;
  readonly iso: string;
  readonly city: string;
  readonly st: string;
}

export const MATCHES: readonly MatchSeed[] = [
  // ── GRUPO A ──
  { g:"A", h:"mex", a:"rsa", iso:"2026-06-11T15:00:00-04:00", city:"Ciudad de México", st:"Estadio Azteca" },
  { g:"A", h:"kor", a:"cze", iso:"2026-06-11T22:00:00-04:00", city:"Guadalajara",      st:"Estadio Akron" },
  { g:"A", h:"cze", a:"rsa", iso:"2026-06-18T12:00:00-04:00", city:"Atlanta",          st:"Mercedes-Benz Stadium" },
  { g:"A", h:"mex", a:"kor", iso:"2026-06-18T21:00:00-04:00", city:"Guadalajara",      st:"Estadio Akron" },
  { g:"A", h:"cze", a:"mex", iso:"2026-06-24T21:00:00-04:00", city:"Ciudad de México", st:"Estadio Azteca" },
  { g:"A", h:"rsa", a:"kor", iso:"2026-06-24T21:00:00-04:00", city:"Monterrey",        st:"Estadio BBVA" },
  // ── GRUPO B ──
  { g:"B", h:"can", a:"bih", iso:"2026-06-12T15:00:00-04:00", city:"Toronto",          st:"BMO Field" },
  { g:"B", h:"qat", a:"sui", iso:"2026-06-13T15:00:00-04:00", city:"San Francisco Bay",st:"Levi's Stadium" },
  { g:"B", h:"sui", a:"bih", iso:"2026-06-18T15:00:00-04:00", city:"Los Ángeles",      st:"SoFi Stadium" },
  { g:"B", h:"can", a:"qat", iso:"2026-06-18T18:00:00-04:00", city:"Vancouver",        st:"BC Place" },
  { g:"B", h:"sui", a:"can", iso:"2026-06-24T15:00:00-04:00", city:"Vancouver",        st:"BC Place" },
  { g:"B", h:"bih", a:"qat", iso:"2026-06-24T15:00:00-04:00", city:"Seattle",          st:"Lumen Field" },
  // ── GRUPO C ──
  { g:"C", h:"bra", a:"mar", iso:"2026-06-13T18:00:00-04:00", city:"Nueva York / NJ",  st:"MetLife Stadium" },
  { g:"C", h:"hai", a:"sco", iso:"2026-06-13T21:00:00-04:00", city:"Boston",           st:"Gillette Stadium" },
  { g:"C", h:"sco", a:"mar", iso:"2026-06-19T18:00:00-04:00", city:"Boston",           st:"Gillette Stadium" },
  { g:"C", h:"bra", a:"hai", iso:"2026-06-19T20:30:00-04:00", city:"Filadelfia",       st:"Lincoln Financial Field" },
  { g:"C", h:"sco", a:"bra", iso:"2026-06-24T18:00:00-04:00", city:"Miami",            st:"Hard Rock Stadium" },
  { g:"C", h:"mar", a:"hai", iso:"2026-06-24T18:00:00-04:00", city:"Atlanta",          st:"Mercedes-Benz Stadium" },
  // ── GRUPO D ──
  { g:"D", h:"usa", a:"par", iso:"2026-06-12T21:00:00-04:00", city:"Los Ángeles",      st:"SoFi Stadium" },
  { g:"D", h:"aus", a:"tur", iso:"2026-06-14T00:00:00-04:00", city:"Vancouver",        st:"BC Place" },
  { g:"D", h:"usa", a:"aus", iso:"2026-06-19T15:00:00-04:00", city:"Seattle",          st:"Lumen Field" },
  { g:"D", h:"tur", a:"par", iso:"2026-06-19T23:00:00-04:00", city:"San Francisco Bay",st:"Levi's Stadium" },
  { g:"D", h:"tur", a:"usa", iso:"2026-06-25T22:00:00-04:00", city:"Los Ángeles",      st:"SoFi Stadium" },
  { g:"D", h:"par", a:"aus", iso:"2026-06-25T22:00:00-04:00", city:"San Francisco Bay",st:"Levi's Stadium" },
  // ── GRUPO E ──
  { g:"E", h:"ger", a:"cuw", iso:"2026-06-14T13:00:00-04:00", city:"Houston",          st:"NRG Stadium" },
  { g:"E", h:"civ", a:"ecu", iso:"2026-06-14T19:00:00-04:00", city:"Filadelfia",       st:"Lincoln Financial Field" },
  { g:"E", h:"ger", a:"civ", iso:"2026-06-20T16:00:00-04:00", city:"Toronto",          st:"BMO Field" },
  { g:"E", h:"ecu", a:"cuw", iso:"2026-06-20T20:00:00-04:00", city:"Kansas City",      st:"Arrowhead Stadium" },
  { g:"E", h:"cuw", a:"civ", iso:"2026-06-25T16:00:00-04:00", city:"Filadelfia",       st:"Lincoln Financial Field" },
  { g:"E", h:"ecu", a:"ger", iso:"2026-06-25T16:00:00-04:00", city:"Nueva York / NJ",  st:"MetLife Stadium" },
  // ── GRUPO F ──
  { g:"F", h:"ned", a:"jpn", iso:"2026-06-14T16:00:00-04:00", city:"Dallas",           st:"AT&T Stadium" },
  { g:"F", h:"swe", a:"tun", iso:"2026-06-14T22:00:00-04:00", city:"Monterrey",        st:"Estadio BBVA" },
  { g:"F", h:"ned", a:"swe", iso:"2026-06-20T13:00:00-04:00", city:"Houston",          st:"NRG Stadium" },
  { g:"F", h:"tun", a:"jpn", iso:"2026-06-21T00:00:00-04:00", city:"Monterrey",        st:"Estadio BBVA" },
  { g:"F", h:"jpn", a:"swe", iso:"2026-06-25T19:00:00-04:00", city:"Dallas",           st:"AT&T Stadium" },
  { g:"F", h:"tun", a:"ned", iso:"2026-06-25T19:00:00-04:00", city:"Kansas City",      st:"Arrowhead Stadium" },
  // ── GRUPO G ──
  { g:"G", h:"bel", a:"egy", iso:"2026-06-15T15:00:00-04:00", city:"Seattle",          st:"Lumen Field" },
  { g:"G", h:"irn", a:"nzl", iso:"2026-06-15T21:00:00-04:00", city:"Los Ángeles",      st:"SoFi Stadium" },
  { g:"G", h:"bel", a:"irn", iso:"2026-06-21T15:00:00-04:00", city:"Los Ángeles",      st:"SoFi Stadium" },
  { g:"G", h:"nzl", a:"egy", iso:"2026-06-21T21:00:00-04:00", city:"Vancouver",        st:"BC Place" },
  { g:"G", h:"egy", a:"irn", iso:"2026-06-26T23:00:00-04:00", city:"Seattle",          st:"Lumen Field" },
  { g:"G", h:"nzl", a:"bel", iso:"2026-06-26T23:00:00-04:00", city:"Vancouver",        st:"BC Place" },
  // ── GRUPO H ──
  { g:"H", h:"esp", a:"cpv", iso:"2026-06-15T12:00:00-04:00", city:"Atlanta",          st:"Mercedes-Benz Stadium" },
  { g:"H", h:"ksa", a:"uru", iso:"2026-06-15T18:00:00-04:00", city:"Miami",            st:"Hard Rock Stadium" },
  { g:"H", h:"esp", a:"ksa", iso:"2026-06-21T12:00:00-04:00", city:"Atlanta",          st:"Mercedes-Benz Stadium" },
  { g:"H", h:"uru", a:"cpv", iso:"2026-06-21T18:00:00-04:00", city:"Miami",            st:"Hard Rock Stadium" },
  { g:"H", h:"cpv", a:"ksa", iso:"2026-06-26T20:00:00-04:00", city:"Houston",          st:"NRG Stadium" },
  { g:"H", h:"uru", a:"esp", iso:"2026-06-26T20:00:00-04:00", city:"Guadalajara",      st:"Estadio Akron" },
  // ── GRUPO I ──
  { g:"I", h:"fra", a:"sen", iso:"2026-06-16T15:00:00-04:00", city:"Nueva York / NJ",  st:"MetLife Stadium" },
  { g:"I", h:"irq", a:"nor", iso:"2026-06-16T18:00:00-04:00", city:"Boston",           st:"Gillette Stadium" },
  { g:"I", h:"fra", a:"irq", iso:"2026-06-22T17:00:00-04:00", city:"Filadelfia",       st:"Lincoln Financial Field" },
  { g:"I", h:"nor", a:"sen", iso:"2026-06-22T20:00:00-04:00", city:"Nueva York / NJ",  st:"MetLife Stadium" },
  { g:"I", h:"nor", a:"fra", iso:"2026-06-26T15:00:00-04:00", city:"Boston",           st:"Gillette Stadium" },
  { g:"I", h:"sen", a:"irq", iso:"2026-06-26T15:00:00-04:00", city:"Toronto",          st:"BMO Field" },
  // ── GRUPO J ──
  { g:"J", h:"arg", a:"alg", iso:"2026-06-16T21:00:00-04:00", city:"Kansas City",      st:"Arrowhead Stadium" },
  { g:"J", h:"aut", a:"jor", iso:"2026-06-17T00:00:00-04:00", city:"San Francisco Bay",st:"Levi's Stadium" },
  { g:"J", h:"arg", a:"aut", iso:"2026-06-22T13:00:00-04:00", city:"Dallas",           st:"AT&T Stadium" },
  { g:"J", h:"jor", a:"alg", iso:"2026-06-22T23:00:00-04:00", city:"San Francisco Bay",st:"Levi's Stadium" },
  { g:"J", h:"alg", a:"aut", iso:"2026-06-27T22:00:00-04:00", city:"Kansas City",      st:"Arrowhead Stadium" },
  { g:"J", h:"jor", a:"arg", iso:"2026-06-27T22:00:00-04:00", city:"Dallas",           st:"AT&T Stadium" },
  // ── GRUPO K ──
  { g:"K", h:"por", a:"cod", iso:"2026-06-17T13:00:00-04:00", city:"Houston",          st:"NRG Stadium" },
  { g:"K", h:"uzb", a:"col", iso:"2026-06-17T22:00:00-04:00", city:"Ciudad de México", st:"Estadio Azteca" },
  { g:"K", h:"por", a:"uzb", iso:"2026-06-23T13:00:00-04:00", city:"Houston",          st:"NRG Stadium" },
  { g:"K", h:"col", a:"cod", iso:"2026-06-23T22:00:00-04:00", city:"Guadalajara",      st:"Estadio Akron" },
  { g:"K", h:"col", a:"por", iso:"2026-06-27T19:30:00-04:00", city:"Miami",            st:"Hard Rock Stadium" },
  { g:"K", h:"cod", a:"uzb", iso:"2026-06-27T19:30:00-04:00", city:"Atlanta",          st:"Mercedes-Benz Stadium" },
  // ── GRUPO L ──
  { g:"L", h:"eng", a:"cro", iso:"2026-06-17T16:00:00-04:00", city:"Dallas",           st:"AT&T Stadium" },
  { g:"L", h:"gha", a:"pan", iso:"2026-06-17T19:00:00-04:00", city:"Toronto",          st:"BMO Field" },
  { g:"L", h:"eng", a:"gha", iso:"2026-06-23T16:00:00-04:00", city:"Boston",           st:"Gillette Stadium" },
  { g:"L", h:"pan", a:"cro", iso:"2026-06-23T19:00:00-04:00", city:"Toronto",          st:"BMO Field" },
  { g:"L", h:"pan", a:"eng", iso:"2026-06-27T17:00:00-04:00", city:"Nueva York / NJ",  st:"MetLife Stadium" },
  { g:"L", h:"cro", a:"gha", iso:"2026-06-27T17:00:00-04:00", city:"Filadelfia",       st:"Lincoln Financial Field" },
] as const;

/** Camino real de una selección — sus 3 partidos de grupo en orden cronológico */
export function teamSchedule(teamId: string): readonly MatchSeed[] {
  return MATCHES.filter((m) => m.h === teamId || m.a === teamId).slice().sort(
    (x, y) => x.iso.localeCompare(y.iso),
  );
}

/** Próximo partido (el siguiente que aún no empieza), o el último si ya pasaron todos */
export function nextMatch(teamId: string, now: Date = new Date()): MatchSeed | undefined {
  const sched = teamSchedule(teamId);
  return sched.find((m) => new Date(m.iso).getTime() > now.getTime()) ?? sched[sched.length - 1];
}
