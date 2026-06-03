import { motion } from "framer-motion";
import { HOST_CITIES, getCity } from "@/data/cities";
import type { MatchSeed } from "@/data/matches";

interface Props {
  teamId: string;
  schedule: readonly MatchSeed[];
  currentMatchIdx: number;
}

/** Mapa estilizado SVG con las 16 sedes + el camino del equipo. */
export function JourneyMap({ teamId, schedule, currentMatchIdx }: Props) {
  // Ciudades del camino
  const route = schedule.map((m) => getCity(m.city)).filter(Boolean);

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-stadium ring-1 ring-white/10">
      <svg viewBox="0 0 100 75" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* outline NorteAmérica estilizado */}
        <defs>
          <radialGradient id="bg-glow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(22,224,122,0.18)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="100" height="75" fill="url(#bg-glow)" />

        {/* Norte America contorno aproximado */}
        <path
          d="M 8 18 Q 18 8 35 12 L 60 8 Q 80 10 92 22 L 96 30 Q 92 38 86 42 L 80 52 L 70 58 L 56 72 L 44 70 L 36 60 L 22 50 L 14 36 Z"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="0.3"
          strokeLinejoin="round"
        />

        {/* Líneas del camino entre sedes consecutivas */}
        {route.map((c, i) => {
          if (i === 0 || !c) return null;
          const prev = route[i - 1];
          if (!prev) return null;
          const isPast = i <= currentMatchIdx;
          return (
            <motion.line
              key={`${teamId}-line-${i}`}
              x1={prev.nx * 100}
              y1={prev.ny * 75}
              x2={c.nx * 100}
              y2={c.ny * 75}
              stroke={isPast ? "var(--team-1)" : "rgba(255,255,255,0.22)"}
              strokeWidth="0.6"
              strokeDasharray="1.4 1.4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, delay: i * 0.12 }}
            />
          );
        })}

        {/* Todas las sedes como pines */}
        {HOST_CITIES.map((city) => {
          const isOnRoute = route.some((r) => r?.name === city.name);
          const idx = route.findIndex((r) => r?.name === city.name);
          const isCurrent = idx === currentMatchIdx;
          const isPast = idx >= 0 && idx < currentMatchIdx;
          return (
            <g key={city.name}>
              {isCurrent && (
                <circle
                  cx={city.nx * 100}
                  cy={city.ny * 75}
                  r={3}
                  fill="var(--team-1)"
                  opacity={0.5}
                >
                  <animate attributeName="r" values="3;5;3" dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={city.nx * 100}
                cy={city.ny * 75}
                r={isCurrent ? 1.6 : 1.0}
                fill={
                  isCurrent
                    ? "var(--team-1)"
                    : isPast
                      ? "var(--team-2)"
                      : isOnRoute
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(255,255,255,0.3)"
                }
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="0.15"
              />
              {isOnRoute && (
                <text
                  x={city.nx * 100}
                  y={city.ny * 75 - 2.4}
                  fontSize="2.2"
                  textAnchor="middle"
                  fill="white"
                  style={{ paintOrder: "stroke", stroke: "#0a0f1f", strokeWidth: 0.6 }}
                >
                  {city.name.length > 16 ? city.name.slice(0, 14) + "…" : city.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
