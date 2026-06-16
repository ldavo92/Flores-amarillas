import { motion } from "framer-motion";
import type { Player } from "../types/game";

type Props = {
  players: Player[];
  currentPlayerId: string | null;
  big?: boolean;
};

export default function PlayerGrid({ players, currentPlayerId, big = false }: Props) {
  return (
    <div className={`grid gap-3 ${big ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "grid-cols-2 sm:grid-cols-3"}`}>
      {players.map((p) => {
        const active = p.id === currentPlayerId;
        const dead = !p.isAlive;
        return (
          <motion.div
            key={p.id}
            layout
            animate={active ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: active ? Infinity : 0, repeatDelay: 0.6 }}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-4 text-center ${
              dead
                ? "border-slate-800 bg-slate-900/40 opacity-50"
                : active
                  ? "border-cyan-400 bg-gradient-to-br from-cyan-500/25 to-violet-500/20 shadow-xl shadow-cyan-500/30"
                  : "border-slate-700 bg-slate-800/60"
            }`}
          >
            <div
              className={`mb-2 flex items-center justify-center rounded-full font-black ${
                big ? "h-14 w-14 text-2xl" : "h-10 w-10 text-lg"
              } ${dead ? "bg-slate-700 text-slate-400" : "bg-cyan-500 text-slate-950"}`}
            >
              {p.name.charAt(0).toUpperCase()}
            </div>
            <span
              className={`w-full truncate font-bold ${big ? "text-xl" : "text-sm"} ${
                dead ? "text-slate-500 line-through" : "text-white"
              }`}
            >
              {p.name}
            </span>
            <div className="mt-1 flex gap-1 text-xs">
              {p.shield && <span>🛡️</span>}
              {dead && <span>💀</span>}
              {active && !dead && <span className="text-cyan-300">● en turno</span>}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
