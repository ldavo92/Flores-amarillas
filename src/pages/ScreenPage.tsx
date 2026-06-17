import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppLayout, { ConnectionPill } from "../components/AppLayout";
import ScreenSetupView from "../features/screen/ScreenSetupView";
import ScreenGameView from "../features/screen/ScreenGameView";
import ScreenWinnerView from "../features/screen/ScreenWinnerView";
import { useGameStore } from "../store/useGameStore";

export default function ScreenPage() {
  const { roomCode = "" } = useParams();
  const code = roomCode.toUpperCase();
  const loadRoom = useGameStore((s) => s.loadRoom);
  const subscribeRoom = useGameStore((s) => s.subscribeRoom);
  const state = useGameStore((s) => s.state);
  const error = useGameStore((s) => s.error);
  const connection = useGameStore((s) => s.connection);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    useGameStore.setState({ isHost: false });

    (async () => {
      const ok = await loadRoom(code);
      if (cancelled) return;
      setReady(true);
      if (ok) cleanup = subscribeRoom(code);
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [code, loadRoom, subscribeRoom]);

  if (ready && error) {
    return (
      <AppLayout>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="text-2xl font-bold text-red-400">{error}</p>
          <p className="mt-2 text-slate-400">Verifica el código de la sala: {code}</p>
          <Link to="/" className="mt-4 text-cyan-400 underline">
            Ir al inicio
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (!state) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center text-slate-400">
          Conectando con la sala…
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="fixed right-4 top-4 z-50">
        <ConnectionPill connection={connection} />
      </div>
      {state.screen === "setup" && <ScreenSetupView state={state} code={code} />}
      {state.screen === "playing" && <ScreenGameView state={state} />}
      {state.screen === "winner" && <ScreenWinnerView state={state} />}
    </AppLayout>
  );
}
