// Logros desbloqueables. La clave i18n vive en achievements.<id> / <id>Desc.
export interface Achievement {
  readonly id: string;
  readonly icon: string;
}

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: "firstPick", icon: "🎯" },
  { id: "firstPredict", icon: "🔮" },
  { id: "exactScore", icon: "🦅" },
  { id: "streak3", icon: "🔥" },
  { id: "level5", icon: "⭐" },
  { id: "collector", icon: "📚" },
] as const;
