import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useGameStore } from "../../store/useGameStore";
import { MAX_PLAYERS, MIN_PLAYERS, buildJoinUrl } from "../../utils/gameHelpers";
import RoomLinkBox from "../../components/RoomLinkBox";
import type { GameState } from "../../types/game";

export default function HostSetupPanel({ state, code }: { state: GameState; code: string }) {
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const startGame = useGameStore((s) => s.startGame);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const players = state.players;
  const canStart = players.length >= MIN_PLAYERS;
  const full = players.length >= MAX_PLAYERS;

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return setError("Escribe un nombre.");
    if (full) return setError(`Máximo ${MAX_PLAYERS} jugadores.`);
    if (players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      return setError("Ese nombre ya está en la lista.");
    }
    const id = addPlayer(trimmed);
    if (!id) return setError("No se pudo agregar al jugador.");
    setName("");
    setError(null);
  };

  return (
    <div className="space-y-4">
      <Card title={`Jugadores (${players.length}/${MAX_PLAYERS})`}>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Nombre del jugador"
            maxLength={16}
            disabled={full}
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
          />
          <Button onClick={submit} disabled={full}>
            Agregar
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

        <ul className="mt-4 space-y-2">
          {players.length === 0 && (
            <li className="text-sm text-slate-500">Aún no hay jugadores registrados.</li>
          )}
          {players.map((p, i) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2"
            >
              <span className="font-semibold text-white">
                <span className="mr-2 text-slate-500">{i + 1}.</span>
                {p.name}
              </span>
              <Button size="sm" variant="ghost" onClick={() => removePlayer(p.id)}>
                Quitar
              </Button>
            </li>
          ))}
        </ul>

        <Button
          block
          size="xl"
          variant="success"
          className="mt-5"
          disabled={!canStart}
          onClick={startGame}
        >
          {canStart ? "▶ Iniciar juego" : `Faltan ${MIN_PLAYERS - players.length} jugador(es)`}
        </Button>
      </Card>

      <Card title="Unirse desde otro dispositivo (opcional)">
        <RoomLinkBox label="Link para jugadores" url={buildJoinUrl(code)} />
      </Card>
    </div>
  );
}
