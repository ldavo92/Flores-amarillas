import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import Card from "../components/Card";
import Button from "../components/Button";
import { useGameStore } from "../store/useGameStore";
import { createRoom } from "../services/roomService";
import { createInitialState, createDemoState } from "../utils/gameHelpers";
import { getHostToken, getPrefs, savePrefs, saveHostToken } from "../utils/storage";
import { isSupabaseConfigured } from "../lib/supabase";

export default function LandingPage() {
  const navigate = useNavigate();
  const setRoom = useGameStore((s) => s.setRoom);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const handleCreate = async () => {
    setError(null);
    setCreating(true);
    try {
      const initial = createInitialState(getPrefs().timerSeconds);
      const { code: roomCode, hostToken } = await createRoom(initial);
      saveHostToken(roomCode, hostToken);
      savePrefs({ lastRoom: roomCode });
      setRoom({ code: roomCode, hostToken, isHost: true, state: initial });
      navigate(`/host/${roomCode}`);
    } catch {
      setError("No se pudo crear la sala. Revisa la configuración de Supabase.");
    } finally {
      setCreating(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    setCreating(true);
    try {
      const initial = createDemoState();
      const { code: roomCode, hostToken } = await createRoom(initial);
      saveHostToken(roomCode, hostToken);
      savePrefs({ lastRoom: roomCode });
      setRoom({ code: roomCode, hostToken, isHost: true, state: initial });
      window.open(`/screen/${roomCode}`, "_blank", "noopener");
      navigate(`/host/${roomCode}`);
    } catch {
      setError("No se pudo iniciar el demo.");
    } finally {
      setCreating(false);
    }
  };

  const handleOpen = () => {
    const c = code.trim().toUpperCase();
    if (c.length < 4) return setError("Código inválido.");
    navigate(getHostToken(c) ? `/host/${c}` : `/screen/${c}`);
  };

  return (
    <AppLayout>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-10">
        <h1 className="font-display text-6xl font-black tracking-tight">
          GANA EN <span className="text-cyan-400">10</span>
        </h1>
        <p className="mt-2 text-lg font-semibold uppercase tracking-[0.3em] text-violet-400">
          Supervivencia
        </p>
        <p className="mt-4 text-center text-slate-400">
          Un game show de eliminación para videollamadas. Controla todo desde tu celular y proyecta
          la pantalla bonita.
        </p>

        {!isSupabaseConfigured && (
          <div className="mt-6 w-full rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-3 text-sm text-cyan-100">
            🧪 <b>Modo demo local</b> activo. El juego sincroniza entre pestañas del mismo
            navegador. Para usarlo entre dispositivos (celular + laptop), agrega las claves de
            Supabase en <code>.env</code>.
          </div>
        )}

        <Card className="mt-8 w-full">
          <Button block size="xl" variant="success" onClick={handleDemo} disabled={creating}>
            {creating ? "Cargando…" : "🧪 Ver demo (abre 2 pestañas)"}
          </Button>
          <Button
            block
            size="xl"
            variant="primary"
            className="mt-3"
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? "Creando…" : "🎮 Crear nueva sala"}
          </Button>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-slate-600">
            <span className="h-px flex-1 bg-slate-800" />o<span className="h-px flex-1 bg-slate-800" />
          </div>

          <p className="mb-2 text-sm text-slate-400">Abrir una sala existente</p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleOpen()}
              placeholder="CÓDIGO"
              maxLength={6}
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-center font-display text-xl font-bold tracking-widest text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none"
            />
            <Button variant="ghost" onClick={handleOpen}>
              Abrir
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
