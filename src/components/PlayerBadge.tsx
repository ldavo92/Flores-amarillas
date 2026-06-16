import type { Player } from "../types/game";

type Props = {
  player: Player;
  active?: boolean;
  size?: "sm" | "lg";
};

export default function PlayerBadge({ player, active = false, size = "sm" }: Props) {
  const dead = !player.isAlive;
  const big = size === "lg";

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 transition-all ${
        big ? "py-3" : "py-2"
      } ${
        dead
          ? "border-slate-800 bg-slate-900/40 opacity-50"
          : active
            ? "border-cyan-400 bg-cyan-500/15 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400"
            : "border-slate-700 bg-slate-800/60"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          dead ? "bg-slate-700 text-slate-400" : "bg-cyan-500 text-slate-950"
        }`}
      >
        {player.name.charAt(0).toUpperCase()}
      </span>
      <span
        className={`truncate font-semibold ${big ? "text-lg" : "text-sm"} ${
          dead ? "text-slate-500 line-through" : "text-white"
        }`}
      >
        {player.name}
      </span>
      <span className="ml-auto flex items-center gap-1 text-xs">
        {player.shield && <span title="Escudo">🛡️</span>}
        {player.usedLifesaver && <span title="Salvavidas usado" className="opacity-50">🛟</span>}
        {player.usedShazam && <span title="Shazam usado" className="opacity-50">⚡</span>}
        {dead && <span title="Eliminado">💀</span>}
      </span>
    </div>
  );
}
