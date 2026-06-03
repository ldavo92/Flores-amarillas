import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTeam, type Team } from "@/data/teams";
import { teamSchedule } from "@/data/matches";
import { BRACKET_ROUNDS } from "@/data/bracket";
import { useGameStore } from "@/store/useGameStore";
import { Mascot } from "@/mascots/Mascot";
import { useReducedMotion } from "@/lib/useReducedMotion";

type NodeState = "done" | "active" | "locked";
interface GroupNode {
  kind: "group";
  idx: number; // índice en el schedule
  rival: Team;
  iso: string;
  city: string;
}
interface RoundNode {
  kind: "round";
  id: string;
  isFinal: boolean;
}
type PathNode = GroupNode | RoundNode;

const UNIT_Y = 124;
const TOP_PAD = 84;
const NODE = 66;

export function JourneyPath({ team }: { team: Team }) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const reduced = useReducedMotion();
  const matchResults = useGameStore((s) => s.matchResults);
  const mascotName = useGameStore((s) => s.mascotName);

  const schedule = teamSchedule(team.id);

  // Construir nodos: 3 partidos de grupo + rondas de eliminatorias.
  const groupNodes: GroupNode[] = schedule
    .map((m, idx): GroupNode | null => {
      const rival = getTeam(m.h === team.id ? m.a : m.h);
      return rival ? { kind: "group", idx, rival, iso: m.iso, city: m.city } : null;
    })
    .filter((n): n is GroupNode => n !== null);

  const roundNodes: RoundNode[] = BRACKET_ROUNDS.map((r) => ({
    kind: "round",
    id: r.id,
    isFinal: r.id === "final",
  }));

  const nodes: PathNode[] = [...groupNodes, ...roundNodes];

  // Estado de cada nodo: el primer partido de grupo sin resultado es el activo.
  const firstUnplayed = groupNodes.findIndex((n) => !matchResults[n.iso]);
  const activeGroupIdx = firstUnplayed; // -1 si todos jugados

  function stateOf(node: PathNode, i: number): NodeState {
    if (node.kind === "group") {
      if (matchResults[node.iso]) return "done";
      if (i === activeGroupIdx) return "active";
      return "locked";
    }
    return "locked"; // rondas: rival real por confirmar
  }

  const height = TOP_PAD + (nodes.length - 1) * UNIT_Y + 110;
  const xPct = (i: number) => 50 + Math.sin(i * 0.9 + 0.5) * 27;
  const yPx = (i: number) => TOP_PAD + i * UNIT_Y;

  // Hasta dónde llega el "progreso" (línea coloreada): hasta el nodo activo.
  const progressTo = activeGroupIdx >= 0 ? activeGroupIdx : groupNodes.length;

  const [shakeKey, setShakeKey] = useState<number | null>(null);

  const trackPath = nodes.map((_, i) => `${i === 0 ? "M" : "L"} ${xPct(i)} ${yPx(i)}`).join(" ");
  const progressPath = nodes
    .slice(0, progressTo + 1)
    .map((_, i) => `${i === 0 ? "M" : "L"} ${xPct(i)} ${yPx(i)}`)
    .join(" ");

  function onNodeTap(node: PathNode, st: NodeState, i: number) {
    if (node.kind === "group" && st === "active") {
      nav(`/predict/${node.idx}`);
    } else if (node.kind === "group" && st === "done") {
      nav(`/match/${node.idx}`);
    } else {
      setShakeKey(i);
      window.setTimeout(() => setShakeKey(null), 450);
    }
  }

  return (
    <div className="relative w-full" style={{ height }}>
      {/* Líneas del camino */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d={trackPath}
          fill="none"
          stroke="rgba(255,255,255,0.13)"
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={progressPath}
          fill="none"
          stroke="var(--team-1)"
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Nodos */}
      {nodes.map((node, i) => {
        const st = stateOf(node, i);
        const left = `${xPct(i)}%`;
        const top = yPx(i);
        const result = node.kind === "group" ? matchResults[node.iso] : undefined;
        const label =
          node.kind === "group"
            ? node.rival.name
            : node.isFinal
              ? t("path.champion")
              : t(`bracket.${node.id}`);
        const shaking = shakeKey === i;

        return (
          <div
            key={node.kind === "group" ? `g${node.idx}` : `r${node.id}`}
            className="absolute flex flex-col items-center"
            style={{ left, top, transform: "translate(-50%, -50%)", width: 120 }}
          >
            {/* Mascota + badge sobre el nodo activo */}
            {st === "active" && (
              <div
                className="pointer-events-none absolute left-1/2 flex flex-col items-center"
                style={{ bottom: NODE / 2 + 6, transform: "translateX(-50%)" }}
              >
                <motion.div
                  initial={{ y: 0 }}
                  animate={reduced ? undefined : { y: [0, -5, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="rounded-full bg-gold px-3 py-1 font-display text-sm tracking-wide text-black shadow-lg"
                >
                  {t("path.play")}
                </motion.div>
                <div
                  className="h-0 w-0"
                  style={{
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: "7px solid var(--gold)",
                  }}
                />
                <Mascot team={team} mood="confident" size={64} bob={!reduced} />
              </div>
            )}

            <motion.button
              onClick={() => onNodeTap(node, st, i)}
              whileTap={{ scale: 0.92 }}
              animate={shaking ? { x: [0, -6, 6, -4, 4, 0] } : undefined}
              aria-label={label}
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: NODE,
                height: NODE,
                background:
                  st === "done"
                    ? `linear-gradient(145deg, ${team.c[0]}, ${team.c[1]})`
                    : st === "active"
                      ? "var(--night-2)"
                      : "rgba(255,255,255,0.05)",
                boxShadow:
                  st === "active"
                    ? `0 0 0 4px var(--team-1), 0 0 22px color-mix(in srgb, var(--team-1) 60%, transparent)`
                    : st === "done"
                      ? `0 6px 16px color-mix(in srgb, ${team.c[0]} 45%, transparent)`
                      : "inset 0 0 0 2px rgba(255,255,255,0.08)",
              }}
            >
              {/* Anillo pulsante del activo */}
              {st === "active" && !reduced && (
                <motion.span
                  className="absolute inset-0 rounded-full"
                  style={{ boxShadow: "0 0 0 3px var(--team-1)" }}
                  animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              {/* Contenido del nodo */}
              {node.kind === "group" ? (
                st === "done" && result ? (
                  <span className="font-display text-lg text-white drop-shadow">
                    {result.you}-{result.rival}
                  </span>
                ) : (
                  <span className={`text-3xl ${st === "locked" ? "opacity-40 grayscale" : ""}`}>
                    {node.rival.flag}
                  </span>
                )
              ) : (
                <span className={`text-2xl ${st === "locked" ? "opacity-60" : ""}`}>
                  {node.isFinal ? "🏆" : "🔒"}
                </span>
              )}

              {/* Check de completado */}
              {st === "done" && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-grass text-xs text-black">
                  ✓
                </span>
              )}
              {/* Candado para grupo bloqueado */}
              {node.kind === "group" && st === "locked" && (
                <span className="absolute -bottom-1 -right-1 text-sm">🔒</span>
              )}
            </motion.button>

            {/* Etiqueta */}
            <div className="mt-1.5 text-center" style={{ width: 110 }}>
              <div
                className={`truncate text-xs font-semibold ${st === "locked" ? "text-muted" : "text-ink"}`}
              >
                {node.kind === "group" ? `${node.rival.flag} ${label}` : label}
              </div>
              {node.kind === "group" ? (
                <div className="truncate text-[10px] text-muted">{node.city}</div>
              ) : (
                <div className="truncate text-[10px] text-muted">{t("path.tbdHint")}</div>
              )}
            </div>
          </div>
        );
      })}

      {/* Etiqueta de inicio */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center" style={{ top: 8 }}>
        <span className="text-[10px] uppercase tracking-widest text-muted">
          {t("path.groupStage")} · {mascotName}
        </span>
      </div>
    </div>
  );
}
