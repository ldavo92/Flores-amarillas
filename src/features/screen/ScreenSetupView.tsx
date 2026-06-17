import { motion } from "framer-motion";
import PlayerBadge from "../../components/PlayerBadge";
import type { GameState } from "../../types/game";

export default function ScreenSetupView({ state, code }: { state: GameState; code: string }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-10 text-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-5xl font-black tracking-tight sm:text-7xl"
      >
        GANA EN <span className="text-cyan-400">10</span>
      </motion.h1>
      <p className="mt-2 text-xl font-semibold uppercase tracking-[0.3em] text-violet-400">
        Supervivencia
      </p>

      <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/70 px-8 py-4">
        <p className="text-sm uppercase tracking-widest text-slate-400">Código de sala</p>
        <p className="font-display text-5xl font-black tracking-[0.3em] text-cyan-300">{code}</p>
      </div>

      <div className="mt-10 w-full max-w-2xl">
        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">
          Jugadores ({state.players.length})
        </p>
        {state.players.length === 0 ? (
          <p className="text-slate-500">Esperando jugadores…</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {state.players.map((p) => (
              <PlayerBadge key={p.id} player={p} size="lg" />
            ))}
          </div>
        )}
      </div>

      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-10 text-lg text-slate-300"
      >
        Esperando a que el anfitrión inicie el juego…
      </motion.p>
    </div>
  );
}
