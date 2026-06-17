import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Button from "../components/Button";
import HostRoomHeader from "../features/host/HostRoomHeader";
import HostSetupPanel from "../features/host/HostSetupPanel";
import HostGamePanel from "../features/host/HostGamePanel";
import { useGameStore } from "../store/useGameStore";
import { getRoom } from "../services/roomService";
import { getHostToken } from "../utils/storage";

type AuthStatus = "checking" | "ok" | "no-room" | "no-token";

export default function HostPage() {
  const { roomCode = "" } = useParams();
  const code = roomCode.toUpperCase();
  const setRoom = useGameStore((s) => s.setRoom);
  const subscribeRoom = useGameStore((s) => s.subscribeRoom);
  const state = useGameStore((s) => s.state);
  const [auth, setAuth] = useState<AuthStatus>("checking");

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const token = getHostToken(code);
      try {
        const row = await getRoom(code);
        if (cancelled) return;
        if (!row) return setAuth("no-room");
        if (!token || token !== row.host_token) return setAuth("no-token");
        setRoom({ code, hostToken: token, isHost: true, state: row.game_state });
        setAuth("ok");
        cleanup = subscribeRoom(code);
      } catch {
        if (!cancelled) setAuth("no-room");
      }
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [code, setRoom, subscribeRoom]);

  if (auth === "checking") {
    return <Centered>Cargando sala…</Centered>;
  }
  if (auth === "no-room") {
    return (
      <Centered>
        <p className="text-xl font-bold text-red-400">La sala {code} no existe.</p>
        <Link to="/" className="mt-4 inline-block text-cyan-400 underline">
          Volver al inicio
        </Link>
      </Centered>
    );
  }
  if (auth === "no-token") {
    return (
      <Centered>
        <p className="text-xl font-bold text-amber-300">No eres el anfitrión de esta sala.</p>
        <p className="mt-2 text-slate-400">
          El token de anfitrión no está en este dispositivo.
        </p>
        <Link to={`/screen/${code}`} className="mt-4 inline-block">
          <Button variant="primary">Abrir pantalla pública</Button>
        </Link>
      </Centered>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-5">
        <HostRoomHeader code={code} />
        {state &&
          (state.screen === "setup" ? (
            <HostSetupPanel state={state} code={code} />
          ) : state.screen === "winner" ? (
            <WinnerControls />
          ) : (
            <HostGamePanel state={state} />
          ))}
      </div>
    </AppLayout>
  );
}

function WinnerControls() {
  const state = useGameStore((s) => s.state);
  const resetGame = useGameStore((s) => s.resetGame);
  const winner = state?.players.find((p) => p.id === state.winnerId);
  return (
    <Card>
      <div className="text-center">
        <p className="text-5xl">🏆</p>
        <p className="font-display text-3xl font-black text-white">{winner?.name ?? "—"}</p>
        <p className="mt-1 text-slate-400">¡Tenemos un ganador!</p>
        <Button block size="xl" variant="success" className="mt-5" onClick={resetGame}>
          🔄 Nueva partida
        </Button>
      </div>
    </Card>
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
