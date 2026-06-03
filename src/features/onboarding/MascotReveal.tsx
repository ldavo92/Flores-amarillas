import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { getTeam } from "@/data/teams";
import { Mascot } from "@/mascots/Mascot";
import { Button } from "@/components/Button";
import { Confetti } from "@/components/Confetti";
import { useGameStore } from "@/store/useGameStore";
import { applyTeamColorsGlobal } from "@/lib/teamColors";
import { playGoalHorn, unlockAudio, vibrate } from "@/lib/audio";

const SUGGESTED = ["Toño", "Lupita", "Pepe", "Tito", "Niko", "Sol", "Curi", "Pelé"];

export function MascotReveal() {
  const { teamId } = useParams<{ teamId: string }>();
  const team = teamId ? getTeam(teamId) : undefined;
  const nav = useNavigate();
  const pickTeam = useGameStore((s) => s.pickTeam);
  const audioOn = useGameStore((s) => s.audioOn);

  const [phase, setPhase] = useState<"hatch" | "name">("hatch");
  const [name, setName] = useState("");

  useEffect(() => {
    if (!team) return;
    applyTeamColorsGlobal(team);
    // Pequeño tap de audio + haptic en reveal
    const id = window.setTimeout(() => {
      if (audioOn) {
        unlockAudio();
        playGoalHorn();
      }
      vibrate([20, 40, 20]);
      setPhase("name");
    }, 1700);
    return () => window.clearTimeout(id);
  }, [team, audioOn]);

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stadium p-6 text-center">
        <div>
          <p className="text-muted mb-4">No encontramos esa selección.</p>
          <Button onClick={() => nav("/select")}>Volver a elegir</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-stadium flex items-center justify-center px-6 py-10 relative overflow-hidden"
      style={{
        background: `radial-gradient(800px 400px at 50% 20%, color-mix(in srgb, ${team.c[0]} 28%, transparent), transparent 60%), linear-gradient(180deg, var(--night), #060916)`,
      }}
    >
      <Confetti active={phase === "hatch" || phase === "name"} count={60} colors={[...team.c, "#fff"]} />

      <div className="w-full max-w-md text-center">
        <AnimatePresence mode="wait">
          {phase === "hatch" && (
            <motion.div
              key="hatch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 10, delay: 0.2 }}
              >
                <Mascot team={team} mood="euphoric" size={260} />
              </motion.div>
              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="font-display text-4xl mt-3"
              >
                ¡Llegó tu mascota!
              </motion.h2>
            </motion.div>
          )}

          {phase === "name" && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Mascot team={team} mood="confident" size={220} />
              <h2 className="font-display text-3xl mt-4">¿Cómo se llama?</h2>
              <p className="text-muted text-sm mb-4">
                Su mascota original de {team.name} {team.flag}
              </p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 18))}
                placeholder="Escribe un nombre…"
                maxLength={18}
                className="w-full text-center px-4 py-3.5 rounded-xl bg-white/[0.06] ring-1 ring-white/10 focus:ring-grass focus:outline-none text-xl font-bold mb-3"
                autoFocus
              />
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => setName(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/[0.06] ring-1 ring-white/10 hover:bg-white/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  pickTeam(team, name);
                  nav("/hub");
                }}
              >
                ¡Vámonos al Mundial!
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
