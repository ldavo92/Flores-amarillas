import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import QuestionDisplay from "../../components/QuestionDisplay";
import { useGameStore } from "../../store/useGameStore";
import { copyToClipboard } from "../../utils/clipboard";
import { getPlayer } from "../../utils/gameHelpers";
import type { GameState } from "../../types/game";

export default function HostControls({ state }: { state: GameState }) {
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const {
    markCorrect,
    eliminateCurrentPlayer,
    useLifesaver,
    resolveLifesaver,
    useShazam,
    applyJokerEffect,
    closeShazam,
    resolveChoose,
    nextTurn,
    shuffleQueue,
    generateQuestion,
  } = useGameStore();

  const current = getPlayer(state, state.currentPlayerId);
  const pending = state.pending;
  const card = state.lastShazam;
  const choosing = pending?.kind === "chooseNext" || pending?.kind === "swapTurn";

  const chooseTargets = state.players.filter(
    (p) => p.isAlive && p.id !== state.currentPlayerId
  );

  return (
    <>
      <Card title="Jugador actual">
        {current ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-3xl font-black text-white">{current.name}</p>
              <p className="text-sm text-slate-400">
                {current.isAlive ? "En juego" : "Eliminado"}
                {state.suddenDeath && " · ⚠️ Muerte súbita"}
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <Tag ok={!current.usedLifesaver} label="🛟 Salvavidas" />
              <Tag ok={!current.usedShazam} label="⚡ Shazam" />
              {current.shield && (
                <span className="rounded-lg bg-emerald-500/20 px-2 py-1 font-semibold text-emerald-300">
                  🛡️ Escudo
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-slate-400">Sin jugador activo.</p>
        )}
      </Card>

      <Card title="Pregunta">
        <QuestionDisplay question={state.currentQuestion} />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={generateQuestion}>
            🔀 Nueva pregunta
          </Button>
          <Button variant="ghost" onClick={() => copyToClipboard(state.currentQuestion)}>
            📋 Copiar
          </Button>
        </div>
      </Card>

      <Card title="Controles">
        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" variant="success" onClick={markCorrect}>
            ✔ Correcto
          </Button>
          <Button size="lg" variant="danger" onClick={eliminateCurrentPlayer}>
            ✖ Eliminar
          </Button>
          <Button
            size="lg"
            variant="warning"
            onClick={useLifesaver}
            disabled={!current || current.usedLifesaver}
          >
            🛟 Salvavidas
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={useShazam}
            disabled={!current || current.usedShazam}
          >
            ⚡ ¡SHAZAM!
          </Button>
          <Button size="lg" variant="primary" onClick={nextTurn}>
            ➡ Siguiente turno
          </Button>
          <Button size="lg" variant="ghost" onClick={shuffleQueue}>
            🌀 Revolver orden
          </Button>
        </div>
      </Card>

      {/* Lifesaver flow */}
      <Modal
        open={pending?.kind === "lifesaver"}
        title="🛟 Salvavidas"
        accent="border-amber-400"
      >
        <p className="mb-2 text-sm text-slate-400">
          Reto para <span className="font-bold text-white">{current?.name}</span>
        </p>
        <p className="mb-5 rounded-xl bg-slate-800 p-4 text-lg font-semibold text-amber-200">
          {pending?.lifesaver}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="success" size="lg" onClick={() => resolveLifesaver(true)}>
            Cumplió ✅
          </Button>
          <Button variant="danger" size="lg" onClick={() => resolveLifesaver(false)}>
            No cumplió ❌
          </Button>
        </div>
      </Modal>

      {/* Shazam flow */}
      <Modal
        open={Boolean(card)}
        title="⚡ ¡SHAZAM!"
        accent="border-violet-500"
        onClose={choosing ? undefined : closeShazam}
      >
        {card && (
          <>
            <div className="mb-4 rounded-2xl border-2 border-violet-500 bg-gradient-to-br from-violet-600/40 to-fuchsia-600/20 p-5 text-center">
              <p className="text-xs uppercase tracking-widest text-violet-300">{card.type}</p>
              <p className="font-display text-2xl font-black text-white">{card.title}</p>
              <p className="mt-2 text-slate-200">{card.description}</p>
            </div>

            {choosing ? (
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-300">
                  Elige el jugador objetivo:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {chooseTargets.length === 0 && (
                    <p className="col-span-2 text-sm text-slate-500">No hay otros jugadores vivos.</p>
                  )}
                  {chooseTargets.map((p) => (
                    <Button key={p.id} variant="primary" onClick={() => resolveChoose(p.id)}>
                      {p.name}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  disabled={appliedId === card.id}
                  onClick={() => {
                    applyJokerEffect(card);
                    setAppliedId(card.id);
                  }}
                >
                  {appliedId === card.id ? "Aplicado ✓" : "Aplicar efecto"}
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    setAppliedId(null);
                    closeShazam();
                  }}
                >
                  Cerrar
                </Button>
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}

function Tag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`rounded-lg px-2 py-1 font-semibold ${
        ok ? "bg-slate-800 text-slate-200" : "bg-slate-800/50 text-slate-500 line-through"
      }`}
    >
      {label}
    </span>
  );
}
