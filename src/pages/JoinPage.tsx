import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Button from "../components/Button";
import { getRoom, joinRoomState, subscribeToRoom } from "../services/roomService";
import { createId } from "../utils/createId";
import { MAX_PLAYERS } from "../utils/gameHelpers";
import type { GameState } from "../types/game";

export default function JoinPage() {
  const { roomCode = "" } = useParams();
  const code = roomCode.toUpperCase();
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [joinedId, setJoinedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    (async () => {
      const row = await getRoom(code).catch(() => null);
      if (!row) return setError("La sala no existe.");
      setState(row.game_state);
      cleanup = subscribeToRoom(code, setState);
    })();
    return () => cleanup?.();
  }, [code]);

  const join = async () => {
    const trimmed = name.trim();
    if (!trimmed) return setError("Escribe tu nombre.");
    setBusy(true);
    setError(null);
    try {
      const row = await getRoom(code);
      if (!row) return setError("La sala no existe.");
      const gs = row.game_state;
      if (gs.screen !== "setup") return setError("El juego ya inició. No puedes unirte.");
      if (gs.players.length >= MAX_PLAYERS) return setError("La sala está llena.");
      if (gs.players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
        return setError("Ese nombre ya está en uso.");
      }
      const id = createId();
      const next: GameState = {
        ...gs,
        players: [
          ...gs.players,
          {
            id,
            name: trimmed,
            isAlive: true,
            usedLifesaver: false,
            usedShazam: false,
            shield: false,
            eliminatedAt: null,
          },
        ],
      };
      await joinRoomState(code, next);
      setJoinedId(id);
    } catch {
      setError("No se pudo unir. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  if (error && !state) {
    return (
      <Centered>
        <p className="text-xl font-bold text-red-400">{error}</p>
        <Link to="/" className="mt-4 text-cyan-400 underline">
          Inicio
        </Link>
      </Centered>
    );
  }

  const joined = joinedId && state?.players.some((p) => p.id === joinedId);

  return (
    <AppLayout>
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-10">
        <h1 className="font-display text-4xl font-black">
          GANA EN <span className="text-cyan-400">10</span>
        </h1>
        <p className="mt-1 text-sm uppercase tracking-widest text-slate-400">Sala {code}</p>

        <Card className="mt-6 w-full">
          {joined ? (
            <div className="text-center">
              <p className="text-4xl">✅</p>
              <p className="mt-2 text-xl font-bold text-white">¡Estás dentro!</p>
              <p className="mt-1 text-slate-400">
                Espera a que el anfitrión inicie el juego.
              </p>
            </div>
          ) : state?.screen !== "setup" ? (
            <p className="text-center text-amber-300">El juego ya comenzó. No puedes unirte.</p>
          ) : (
            <>
              <p className="mb-2 text-sm text-slate-400">Tu nombre</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && join()}
                placeholder="Tu nombre"
                maxLength={16}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              <Button block size="lg" className="mt-4" onClick={join} disabled={busy}>
                {busy ? "Uniéndote…" : "Unirme"}
              </Button>
            </>
          )}

          {state && (
            <div className="mt-5">
              <p className="mb-2 text-xs uppercase tracking-widest text-slate-500">
                Jugadores ({state.players.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {state.players.map((p) => (
                  <span
                    key={p.id}
                    className="rounded-lg bg-slate-800 px-2 py-1 text-sm text-slate-200"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center text-slate-300">
        {children}
      </div>
    </AppLayout>
  );
}
