import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function Chip({ children, color, className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-white/10 ${className}`}
      style={
        color
          ? {
              background: `color-mix(in srgb, ${color} 15%, transparent)`,
              color,
            }
          : { background: "rgba(255,255,255,0.07)", color: "var(--ink)" }
      }
    >
      {children}
    </span>
  );
}
