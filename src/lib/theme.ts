export type Theme = "dark" | "light";

/** Aplica el tema al <html data-theme> (los tokens CSS reaccionan a esto). */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
}

/** ¿El usuario prefiere movimiento reducido? (combina con lowDataMode). */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
