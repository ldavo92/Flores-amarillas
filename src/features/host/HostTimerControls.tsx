import Card from "../../components/Card";
import Button from "../../components/Button";
import TimerDisplay from "../../components/TimerDisplay";
import { useGameStore } from "../../store/useGameStore";
import { useSyncedTimer } from "../../hooks/useSyncedTimer";
import { TIMER_OPTIONS } from "../../utils/gameHelpers";
import type { GameState } from "../../types/game";

export default function HostTimerControls({ state }: { state: GameState }) {
  const setTimerSeconds = useGameStore((s) => s.setTimerSeconds);
  const startTimer = useGameStore((s) => s.startTimer);
  const pauseTimer = useGameStore((s) => s.pauseTimer);
  const resetTimer = useGameStore((s) => s.resetTimer);
  const expireTimer = useGameStore((s) => s.expireTimer);

  const timer = useSyncedTimer(state.timer, { isHost: true, onExpire: expireTimer });

  return (
    <Card title="Temporizador">
      <TimerDisplay {...timer} />

      <div className="mt-3 grid grid-cols-4 gap-2">
        {TIMER_OPTIONS.map((sec) => (
          <Button
            key={sec}
            size="sm"
            variant={state.timer.duration === sec ? "primary" : "ghost"}
            onClick={() => setTimerSeconds(sec)}
          >
            {sec}s
          </Button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Button variant="success" onClick={startTimer} disabled={timer.isRunning}>
          ▶ Iniciar
        </Button>
        <Button variant="warning" onClick={pauseTimer} disabled={!timer.isRunning}>
          ⏸ Pausar
        </Button>
        <Button variant="ghost" onClick={resetTimer}>
          ↺ Reiniciar
        </Button>
      </div>
    </Card>
  );
}
