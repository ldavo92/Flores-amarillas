import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { getTeam } from "@/data/teams";
import { teamSchedule } from "@/data/matches";
import { useGameStore } from "@/store/useGameStore";
import { ShareCard } from "@/features/share/ShareCard";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";

export function Result() {
  const { idx } = useParams();
  const nav = useNavigate();
  const teamId = useGameStore((s) => s.teamId);
  const predictions = useGameStore((s) => s.predictions);
  const status = useGameStore((s) => s.status);

  const team = teamId ? getTeam(teamId) : null;
  const i = parseInt(idx ?? "0", 10);
  const schedule = team ? teamSchedule(team.id) : [];
  const match = schedule[i];
  const rival = match ? getTeam(match.h === team?.id ? match.a : match.h) : null;

  const [format, setFormat] = useState<"story" | "square">("square");
  const cardRef = useRef<HTMLDivElement>(null);

  if (!team || !match || !rival) return null;

  // Marcador "real" simulado lo desconocemos aquí — usamos el pronóstico como demo
  const pred = predictions[match.iso];
  const youScore = pred?.ph ?? 1;
  const rivScore = pred?.pa ?? 0;
  const predPts = pred?.points ?? 0;
  const exact = predPts === 50;
  const correct = predPts >= 20;

  return (
    <div className="min-h-screen bg-stadium pb-10">
      <div className="max-w-md mx-auto px-4 py-6">
        <button onClick={() => nav("/hub")} className="text-muted text-sm mb-4">
          ← Volver al hub
        </button>

        <motion.h2
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-display text-3xl mb-1"
        >
          {status === "advanced" ? "¡Avanzaste!" : status === "eliminated" ? "Hasta aquí" : "Resultado"}
        </motion.h2>
        <p className="text-muted text-sm mb-4">Tu tarjeta para compartir</p>

        <div className="flex gap-2 mb-4">
          <Chip color={format === "square" ? "#16e07a" : "#9ba6c2"}>
            <button onClick={() => setFormat("square")}>Cuadrado 1:1</button>
          </Chip>
          <Chip color={format === "story" ? "#16e07a" : "#9ba6c2"}>
            <button onClick={() => setFormat("story")}>Story 9:16</button>
          </Chip>
        </div>

        <div ref={cardRef} className="mb-5">
          <ShareCard
            team={team}
            mascotName={useGameStore.getState().mascotName}
            rival={rival}
            scoreYou={youScore}
            scoreRival={rivScore}
            city={match.city}
            predResult={{ exact, correct, points: predPts }}
            format={format}
          />
        </div>

        <div className="flex gap-2">
          <Button
            size="md"
            variant="gold"
            className="flex-1"
            onClick={async () => {
              if ("share" in navigator) {
                try {
                  await navigator.share({
                    title: "MundialGo",
                    text: `${team.name} vs ${rival.name} — ${youScore}-${rivScore} · ¡vivo el Mundial 2026!`,
                  });
                } catch {
                  // user cancelled
                }
              }
            }}
          >
            Compartir
          </Button>
          <Button size="md" variant="ghost" onClick={() => nav("/hub")}>
            Hub
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Stat label="Pronóstico" value={exact ? "Exacto" : correct ? "Resultado" : "Fallido"} hint={`+${predPts} XP`} />
          <Stat label="Estado" value={status === "advanced" ? "Avanza" : status === "eliminated" ? "Eliminada" : "Activa"} hint={team.name} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className="font-display text-xl">{value}</div>
      {hint && <div className="text-xs text-muted">{hint}</div>}
    </div>
  );
}
