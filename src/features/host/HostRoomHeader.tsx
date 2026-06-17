import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { ConnectionPill } from "../../components/AppLayout";
import RoomLinkBox from "../../components/RoomLinkBox";
import { useGameStore } from "../../store/useGameStore";
import { buildScreenUrl } from "../../utils/gameHelpers";

export default function HostRoomHeader({ code }: { code: string }) {
  const connection = useGameStore((s) => s.connection);
  const resetGame = useGameStore((s) => s.resetGame);
  const [showLinks, setShowLinks] = useState(false);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Sala</p>
          <p className="font-display text-3xl font-black tracking-widest text-cyan-300">{code}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ConnectionPill connection={connection} />
          <Button
            size="sm"
            variant="primary"
            onClick={() => window.open(buildScreenUrl(code), "_blank", "noopener")}
          >
            ▶ Abrir pantalla
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowLinks((v) => !v)}>
            {showLinks ? "Ocultar" : "Compartir"}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (confirm("¿Reiniciar la partida? Vuelve al registro de jugadores.")) resetGame();
            }}
          >
            Reiniciar
          </Button>
        </div>
      </div>

      {showLinks && (
        <div className="mt-4 space-y-4">
          <RoomLinkBox label="Pantalla pública" url={buildScreenUrl(code)} showQr />
        </div>
      )}
    </Card>
  );
}
