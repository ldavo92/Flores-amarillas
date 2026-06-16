import type { Player } from "../types/game";

type Props = {
  queue: string[];
  players: Player[];
  currentPlayerId: string | null;
};

export default function TurnQueue({ queue, players, currentPlayerId }: Props) {
  const byId = new Map(players.map((p) => [p.id, p]));
  const ordered = queue
    .map((id) => byId.get(id))
    .filter((p): p is Player => Boolean(p) && (p as Player).isAlive);

  if (ordered.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {ordered.map((p, i) => {
        const active = p.id === currentPlayerId;
        return (
          <div key={p.id} className="flex items-center gap-2">
            <span
              className={`rounded-lg px-3 py-1.5 text-sm font-bold ${
                active
                  ? "bg-cyan-400 text-slate-950"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {p.name}
            </span>
            {i < ordered.length - 1 && <span className="text-slate-600">›</span>}
          </div>
        );
      })}
    </div>
  );
}
