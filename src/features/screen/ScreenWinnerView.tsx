import { motion } from "framer-motion";
import Confetti from "../../components/Confetti";
import { getPlayer } from "../../utils/gameHelpers";
import type { GameState } from "../../types/game";

export default function ScreenWinnerView({ state }: { state: GameState }) {
  const winner = getPlayer(state, state.winnerId);
  const total = state.players.length;
  const survived = winner ? 1 : 0;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center">
      <Confetti />
      <motion.p
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="text-7xl"
      >
        🏆
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 font-display text-3xl font-black uppercase tracking-widest text-amber-300"
      >
        Ganador
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, type: "spring" }}
        className="font-display text-7xl font-black text-white sm:text-8xl"
      >
        {winner?.name ?? "—"}
      </motion.p>

      <p className="mt-6 text-2xl text-cyan-300">¡Sobreviviste hasta el final! 🎉</p>

      <div className="mt-10 flex gap-4">
        <Summary label="Jugadores" value={total} />
        <Summary label="Sobrevivientes" value={survived} />
        <Summary label="Rondas" value={state.round} />
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 px-6 py-4">
      <p className="font-display text-4xl font-black text-white">{value}</p>
      <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
}
