import { useEffect, useState } from "react";

interface Piece {
  id: number;
  x: number;
  y: number;
  rot: number;
  vx: number;
  vy: number;
  vr: number;
  color: string;
  shape: "rect" | "circ";
}

interface Props {
  active: boolean;
  count?: number;
  colors?: string[];
  duration?: number;
}

let nextId = 0;

export function Confetti({
  active,
  count = 80,
  colors = ["#16e07a", "#ffd24a", "#ff6c2f", "#ffffff", "#ef4757"],
  duration = 3000,
}: Props) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!active) return;
    const arr: Piece[] = Array.from({ length: count }, () => ({
      id: nextId++,
      x: Math.random() * 100,
      y: -10 - Math.random() * 30,
      rot: Math.random() * 360,
      vx: (Math.random() - 0.5) * 1.4,
      vy: 0.6 + Math.random() * 1.6,
      vr: (Math.random() - 0.5) * 12,
      color: colors[Math.floor(Math.random() * colors.length)] ?? "#fff",
      shape: Math.random() > 0.5 ? "rect" : "circ",
    }));
    setPieces(arr);
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const elapsed = t - start;
      if (elapsed > duration) {
        setPieces([]);
        return;
      }
      setPieces((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          rot: p.rot + p.vr,
          vy: p.vy + 0.012, // gravedad
        })),
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, count, colors, duration]);

  if (!active && pieces.length === 0) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-30" aria-hidden>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.shape === "rect" ? 8 : 10,
            height: p.shape === "rect" ? 14 : 10,
            background: p.color,
            borderRadius: p.shape === "circ" ? "50%" : 2,
            transform: `rotate(${p.rot}deg)`,
            boxShadow: `0 0 6px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}
