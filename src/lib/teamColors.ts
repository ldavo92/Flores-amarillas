import type { Team } from "@/data/teams";

/** Inyecta los colores del equipo como CSS vars en un elemento. */
export function teamCssVars(team: Team | null | undefined): React.CSSProperties {
  if (!team) return {};
  const [c1, c2, c3] = team.c;
  return {
    ["--team-1" as string]: c1,
    ["--team-2" as string]: c2,
    ["--team-3" as string]: c3,
  } as React.CSSProperties;
}

/** Aplica los colores del equipo a :root (afecta toda la app). */
export function applyTeamColorsGlobal(team: Team | null | undefined): void {
  const root = document.documentElement;
  if (!team) {
    root.style.removeProperty("--team-1");
    root.style.removeProperty("--team-2");
    root.style.removeProperty("--team-3");
    return;
  }
  root.style.setProperty("--team-1", team.c[0]);
  root.style.setProperty("--team-2", team.c[1]);
  root.style.setProperty("--team-3", team.c[2]);
}
