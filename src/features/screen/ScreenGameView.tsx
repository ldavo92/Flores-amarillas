import { AnimatePresence, motion } from "framer-motion";
import TimerDisplay from "../../components/TimerDisplay";
import QuestionDisplay from "../../components/QuestionDisplay";
import PlayerGrid from "../../components/PlayerGrid";
import TurnQueue from "../../components/TurnQueue";
import { useSyncedTimer } from "../../hooks/useSyncedTimer";
import { alivePlayers, eliminatedPlayers, getPlayer } from "../../utils/gameHelpers";
import type { GameState } from "../../types/game";

export default function ScreenGameView({ state }: { state: GameState }) {
  const timer = useSyncedTimer(state.timer, { isHost: false });
  const current = getPlayer(state, state.currentPlayerId);
  const alive = alivePlayers(state);
  const dead = eliminatedPlayers(state);
  const lifesaverActive = state.pending?.kind === "lifesaver";

  return (
    <div className="relative mx-auto max-w-7xl px-6 py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
          GANA EN <span className="text-cyan-400">10</span>
          <span className="ml-2 text-base font-semibold uppercase tracking-widest text-violet-400">
            Supervivencia
          </span>
        </h1>
        <div className="flex items-center gap-3 text-sm">
          <Pill label="Ronda" value={state.round} />
          <Pill label="Vivos" value={alive.length} className="text-emerald-300" />
          <Pill label="Fuera" value={dead.length} className="text-red-400" />
          {state.suddenDeath && (
            <span className="rounded-full bg-red-500/20 px-3 py-1 font-bold text-red-300">
              💀 MUERTE SÚBITA
            </span>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-center">
            <p className="text-sm uppercase tracking-widest text-slate-400">Turno de</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={current?.id ?? "none"}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="font-display text-6xl font-black text-white sm:text-7xl"
              >
                {current?.name ?? "—"}
              </motion.p>
            </AnimatePresence>
          </div>

          <TimerDisplay {...timer} size="giant" />
          {timer.remaining <= 0 && !timer.isRunning && (
            <motion.p
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-center font-display text-3xl font-black text-red-500"
            >
              ¡Tiempo terminado!
            </motion.p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm uppercase tracking-widest text-slate-400">Pregunta</p>
            <QuestionDisplay question={state.currentQuestion} size="giant" />
          </div>
          <div>
            <p className="mb-2 text-sm uppercase tracking-widest text-slate-400">Próximos turnos</p>
            <TurnQueue
              queue={state.activeQueue}
              players={state.players}
              currentPlayerId={state.currentPlayerId}
            />
          </div>
          {state.lastEvent && (
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-center text-lg font-semibold text-amber-200">
              {state.lastEvent}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-sm uppercase tracking-widest text-slate-400">Jugadores</p>
        <PlayerGrid players={state.players} currentPlayerId={state.currentPlayerId} big />
      </div>

      {/* Lifesaver event overlay */}
      <AnimatePresence>
        {lifesaverActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-6"
          >
            <motion.div
              initial={{ scale: 0.7, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              className="max-w-2xl rounded-3xl border-4 border-amber-400 bg-slate-900 p-10 text-center shadow-2xl"
            >
              <p className="text-2xl">🛟</p>
              <p className="font-display text-4xl font-black text-amber-300">SALVAVIDAS</p>
              <p className="mt-2 text-xl text-slate-300">
                {current?.name} debe cumplir:
              </p>
              <p className="mt-4 text-3xl font-bold text-white">{state.lastLifesaver}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shazam event overlay */}
      <AnimatePresence>
        {state.lastShazam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/75 p-6"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              className="max-w-2xl rounded-3xl border-4 border-violet-500 bg-gradient-to-br from-violet-700/60 to-fuchsia-700/40 p-12 text-center shadow-2xl"
            >
              <p className="font-display text-5xl font-black tracking-widest text-white">⚡ SHAZAM</p>
              <p className="mt-4 text-sm uppercase tracking-widest text-violet-200">
                {state.lastShazam.type}
              </p>
              <p className="font-display text-5xl font-black text-white">{state.lastShazam.title}</p>
              <p className="mt-3 text-2xl text-slate-100">{state.lastShazam.description}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Pill({ label, value, className = "" }: { label: string; value: number; className?: string }) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">
      <span className="text-slate-500">{label} </span>
      <span className={`font-bold ${className || "text-white"}`}>{value}</span>
    </span>
  );
}
