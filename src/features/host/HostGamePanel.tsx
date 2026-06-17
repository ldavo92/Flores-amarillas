import Card from "../../components/Card";
import GameLog from "../../components/GameLog";
import TurnQueue from "../../components/TurnQueue";
import HostTimerControls from "./HostTimerControls";
import HostControls from "./HostControls";
import { alivePlayers, eliminatedPlayers } from "../../utils/gameHelpers";
import type { GameState } from "../../types/game";

export default function HostGamePanel({ state }: { state: GameState }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Ronda" value={state.round} />
          <Stat label="Vivos" value={alivePlayers(state).length} className="text-emerald-300" />
          <Stat label="Fuera" value={eliminatedPlayers(state).length} className="text-red-400" />
        </div>
        <HostTimerControls state={state} />
        <Card title="Cola de turnos">
          <TurnQueue
            queue={state.activeQueue}
            players={state.players}
            currentPlayerId={state.currentPlayerId}
          />
        </Card>
        <Card title="Registro">
          <GameLog items={state.gameLog} />
        </Card>
      </div>

      <div className="space-y-4">
        <HostControls state={state} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 py-2">
      <p className="text-xs uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`font-display text-2xl font-black ${className || "text-white"}`}>{value}</p>
    </div>
  );
}
