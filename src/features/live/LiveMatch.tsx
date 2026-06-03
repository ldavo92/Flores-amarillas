import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { getTeam } from "@/data/teams";
import { teamSchedule } from "@/data/matches";
import { useGameStore, scorePrediction } from "@/store/useGameStore";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Bar } from "@/components/Bar";
import { Confetti } from "@/components/Confetti";
import { Mascot } from "@/mascots/Mascot";
import {
  playGoalHorn,
  playThud,
  setRoarLevel,
  startStadiumRoar,
  stopStadiumRoar,
  unlockAudio,
  vibrate,
} from "@/lib/audio";

type SupportTemp = "tibio" | "caliente" | "en-llamas" | "terremoto";
type EventType = "goal-home" | "goal-away" | "yellow" | "red" | "full-time";

interface LiveEvent {
  id: number;
  type: EventType;
  minute: number;
  team: "home" | "away";
  text: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  vx: number;
  vy: number;
  rot: number;
}

const SIM_TICKS_PER_MINUTE = 4;
const SIM_INTERVAL_MS = 380;

export function LiveMatch() {
  const { idx } = useParams();
  const nav = useNavigate();
  const i = parseInt(idx ?? "0", 10);
  const teamId = useGameStore((s) => s.teamId);
  const team = teamId ? getTeam(teamId) : null;
  const schedule = team ? teamSchedule(team.id) : [];
  const match = schedule[i];
  const rival = match ? getTeam(match.h === team?.id ? match.a : match.h) : null;
  const isHome = team && match ? match.h === team.id : true;
  const home = isHome ? team : rival;
  const away = isHome ? rival : team;

  const audioOn = useGameStore((s) => s.audioOn);
  const hapticsOn = useGameStore((s) => s.hapticsOn);
  const lowDataMode = useGameStore((s) => s.lowDataMode);
  const addXp = useGameStore((s) => s.addXp);
  const bumpStreak = useGameStore((s) => s.bumpStreak);
  const setStatus = useGameStore((s) => s.setStatus);
  const predictions = useGameStore((s) => s.predictions);
  const resolvePrediction = useGameStore((s) => s.resolvePrediction);

  // Estado del partido
  const [minute, setMinute] = useState(0);
  const [scoreH, setScoreH] = useState(0);
  const [scoreA, setScoreA] = useState(0);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [finished, setFinished] = useState(false);
  const [running, setRunning] = useState(false);
  const eventIdRef = useRef(0);

  // Support meter
  const [support, setSupport] = useState(0);
  const [combo, setCombo] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const lastTapRef = useRef(0);
  const lastComboTapRef = useRef(0);
  const supportRef = useRef(0);
  supportRef.current = support;

  // Crowd presence (hinchas vivos simulados)
  const [fansYou, setFansYou] = useState(120);
  const [fansRival, setFansRival] = useState(95);
  const [goalFlash, setGoalFlash] = useState<"home" | "away" | null>(null);
  const [shake, setShake] = useState(false);

  // CSS variable --hype para tintar el campo
  useEffect(() => {
    document.documentElement.style.setProperty("--hype", `${(support / 100).toFixed(3)}`);
  }, [support]);

  // Iniciar el motor cuando el usuario arranca
  function startMatch() {
    setRunning(true);
    if (audioOn && !lowDataMode) {
      unlockAudio();
      startStadiumRoar();
    }
  }

  // Pausar audio al desmontar
  useEffect(() => () => stopStadiumRoar(), []);

  // Bucle de simulación del partido (cliente — modo "partido simulado" §4)
  useEffect(() => {
    if (!running || finished || !team || !rival) return;
    const id = window.setInterval(() => {
      setMinute((m) => {
        const next = m + 1 / SIM_TICKS_PER_MINUTE;
        // Probabilidades dinámicas: cuanto mayor el support, más oportunidades a favor
        const supportBoost = supportRef.current / 100;
        const rGoalHome = Math.random();
        const rGoalAway = Math.random();
        if (rGoalHome < 0.015 + (isHome ? supportBoost * 0.025 : 0)) {
          pushGoal("home", Math.floor(next));
        } else if (rGoalAway < 0.015 + (!isHome ? supportBoost * 0.02 : 0)) {
          pushGoal("away", Math.floor(next));
        } else if (Math.random() < 0.008) {
          pushCard("yellow", Math.floor(next));
        } else if (Math.random() < 0.0015) {
          pushCard("red", Math.floor(next));
        }
        if (next >= 90) {
          window.setTimeout(() => finishMatch(), 60);
          return 90;
        }
        return next;
      });
    }, SIM_INTERVAL_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, finished]);

  // Bucle del support meter: decaimiento + roar level
  useEffect(() => {
    const id = window.setInterval(() => {
      setSupport((v) => Math.max(0, v - 2));
      setRoarLevel(supportRef.current / 100);
      // crowd "fansLive" sigue al support
      setFansYou((n) => n + (supportRef.current > 60 ? 1 : -1) * (Math.random() < 0.3 ? 1 : 0));
      setFansRival((n) => Math.max(60, n + (Math.random() < 0.15 ? 1 : 0)));
    }, 140);
    return () => window.clearInterval(id);
  }, []);

  // Reset combo si dejas de tocar
  useEffect(() => {
    const id = window.setInterval(() => {
      if (performance.now() - lastComboTapRef.current > 800 && combo > 0) {
        setCombo(0);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [combo]);

  // Decaimiento de partículas
  useEffect(() => {
    if (particles.length === 0) return;
    const id = window.setInterval(() => {
      setParticles((arr) =>
        arr
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            rot: p.rot + 8,
            vy: p.vy + 0.18,
          }))
          .filter((p) => p.y < 110),
      );
    }, 30);
    return () => window.clearInterval(id);
  }, [particles.length]);

  function pushGoal(side: "home" | "away", min: number) {
    eventIdRef.current += 1;
    const id = eventIdRef.current;
    if (side === "home") setScoreH((n) => n + 1);
    else setScoreA((n) => n + 1);
    const teamName = side === "home" ? home?.name : away?.name;
    const ev: LiveEvent = {
      id,
      type: side === "home" ? "goal-home" : "goal-away",
      minute: min,
      team: side,
      text: `¡GOL de ${teamName}!`,
    };
    setEvents((prev) => [ev, ...prev].slice(0, 30));
    setGoalFlash(side);
    setShake(true);
    if (audioOn) playGoalHorn();
    if (hapticsOn) vibrate([40, 60, 40, 60, 80]);
    window.setTimeout(() => {
      setGoalFlash(null);
      setShake(false);
    }, 1200);
  }

  function pushCard(kind: "yellow" | "red", min: number) {
    const side: "home" | "away" = Math.random() > 0.5 ? "home" : "away";
    eventIdRef.current += 1;
    const teamName = side === "home" ? home?.name : away?.name;
    const ev: LiveEvent = {
      id: eventIdRef.current,
      type: kind,
      minute: min,
      team: side,
      text: `Tarjeta ${kind === "yellow" ? "amarilla" : "ROJA"} · ${teamName}`,
    };
    setEvents((prev) => [ev, ...prev].slice(0, 30));
  }

  function finishMatch() {
    setFinished(true);
    setRunning(false);
    stopStadiumRoar();
    eventIdRef.current += 1;
    setEvents((prev) => [
      { id: eventIdRef.current, type: "full-time", minute: 90, team: "home", text: "Final del partido" },
      ...prev,
    ]);

    if (team) {
      // Resolver pronóstico
      const youScore = isHome ? scoreH : scoreA;
      const rivScore = isHome ? scoreA : scoreH;
      const pred = match ? predictions[match.iso] : undefined;
      if (pred && match) {
        const pts = scorePrediction({ ph: pred.ph, pa: pred.pa }, { ph: youScore, pa: rivScore });
        addXp(pts);
        resolvePrediction(match.iso, pts);
      }
      // Estado del torneo + racha
      if (youScore > rivScore) {
        addXp(30);
        bumpStreak();
        setStatus("advanced");
      } else if (youScore < rivScore) {
        setStatus("eliminated");
      }
    }
  }

  function onCheerTap(e: React.PointerEvent<HTMLButtonElement>) {
    const now = performance.now();
    if (now - lastTapRef.current < 38) return; // throttle anti-abuso §4.4
    lastTapRef.current = now;
    setSupport((v) => Math.min(100, v + 6.5));
    setCombo((c) => c + 1);
    lastComboTapRef.current = now;
    if (audioOn) playThud();
    if (hapticsOn) vibrate(10);
    if (!lowDataMode) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const emojis = team ? [team.flag, "🔥", "💛", "⚡"] : ["🔥"];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)] ?? "🔥";
      setParticles((arr) => [
        ...arr,
        {
          id: Date.now() + Math.random(),
          x,
          y,
          emoji,
          vx: (Math.random() - 0.5) * 4,
          vy: -3 - Math.random() * 3,
          rot: 0,
        },
      ]);
    }
  }

  const temp: SupportTemp =
    support < 25 ? "tibio" : support < 55 ? "caliente" : support < 85 ? "en-llamas" : "terremoto";

  const tempColor: Record<SupportTemp, string> = {
    tibio: "#9ba6c2",
    caliente: "#ffd24a",
    "en-llamas": "#ff6c2f",
    terremoto: "#ef4757",
  };
  const tempLabel: Record<SupportTemp, string> = {
    tibio: "TIBIO",
    caliente: "CALIENTE",
    "en-llamas": "EN LLAMAS 🔥",
    terremoto: "TERREMOTO 🌋",
  };

  // Para mostrar el mood derivado de marcador
  const youScore = isHome ? scoreH : scoreA;
  const rivScore = isHome ? scoreA : scoreH;
  const mood = useMemo(() => {
    if (finished) return youScore > rivScore ? "euphoric" : youScore < rivScore ? "sad" : "idle";
    if (youScore > rivScore) return "euphoric";
    if (youScore < rivScore) return "sad";
    return "nervous";
  }, [finished, youScore, rivScore]);

  if (!team || !match || !rival) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-stadium text-center">
        <div>
          <p className="text-muted mb-4">Partido no encontrado.</p>
          <Button onClick={() => nav("/hub")}>Volver</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen bg-pitch overflow-hidden ${shake ? "live-shake" : ""}`}>
      {/* Flash dorado/rojo en gol */}
      <AnimatePresence>
        {goalFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.55, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-30 pointer-events-none"
            style={{
              background:
                goalFlash === "home"
                  ? `radial-gradient(circle, ${home?.c[0] ?? "#16e07a"}, transparent 60%)`
                  : `radial-gradient(circle, ${away?.c[0] ?? "#ef4757"}, transparent 60%)`,
            }}
          />
        )}
      </AnimatePresence>

      <Confetti
        active={(goalFlash === "home" && isHome) || (goalFlash === "away" && !isHome)}
        count={70}
        colors={team.c as unknown as string[]}
      />

      {/* Top bar */}
      <header className="relative z-20 px-3 pt-3">
        <button
          onClick={() => {
            stopStadiumRoar();
            nav("/hub");
          }}
          className="text-muted text-xs mb-2"
        >
          ← Salir
        </button>
        <div className="flex items-center gap-2 mb-2">
          <Chip color={running ? "#ef4757" : "#9ba6c2"}>
            {finished ? "FT" : running ? `${Math.floor(minute)}'` : "Pre-partido"}
          </Chip>
          <Chip color="#9ba6c2">casi en vivo</Chip>
          <span className="text-xs text-muted">{match.city} · {match.st}</span>
        </div>

        {/* Scoreboard */}
        <div className="rounded-2xl bg-night/60 ring-1 ring-white/10 backdrop-blur p-3">
          <div className="grid grid-cols-7 items-center">
            <div className="col-span-3 flex items-center gap-2 justify-end">
              <span className="text-xs uppercase truncate text-right">{home?.name}</span>
              <span className="text-2xl">{home?.flag}</span>
            </div>
            <div className="col-span-1 text-center font-display text-3xl tabular-nums">
              <span style={{ color: home?.c[0] }}>{scoreH}</span>
              <span className="text-muted mx-1">·</span>
              <span style={{ color: away?.c[0] }}>{scoreA}</span>
            </div>
            <div className="col-span-3 flex items-center gap-2">
              <span className="text-2xl">{away?.flag}</span>
              <span className="text-xs uppercase truncate">{away?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mascot center */}
      <div className="relative z-10 flex flex-col items-center pt-6">
        <Mascot team={team} mood={mood} size={lowDataMode ? 150 : 200} />
        <div className="mt-2 text-center">
          <p className="font-display text-xl">
            {finished
              ? mood === "euphoric"
                ? "¡VICTORIA!"
                : mood === "sad"
                  ? "Cabeza alta"
                  : "Empate digno"
              : mood === "euphoric"
                ? "¡Aguanten así!"
                : mood === "sad"
                  ? "¡Vamos! aún hay tiempo"
                  : "¡A apoyar!"}
          </p>
        </div>
      </div>

      {/* Crowd presence */}
      <div className="relative z-10 mt-3 px-4 max-w-md mx-auto grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-2">
          <div className="text-[10px] uppercase tracking-widest text-muted">Hinchas de {team.name}</div>
          <div className="font-display text-xl" style={{ color: team.c[0] }}>{fansYou}</div>
        </div>
        <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-2">
          <div className="text-[10px] uppercase tracking-widest text-muted">Hinchas de {rival.name}</div>
          <div className="font-display text-xl" style={{ color: rival.c[0] }}>{fansRival}</div>
        </div>
      </div>

      {/* Eventos */}
      <div className="relative z-10 max-w-md mx-auto px-4 mt-4 space-y-1.5 max-h-[18vh] overflow-y-auto">
        <AnimatePresence initial={false}>
          {events.slice(0, 5).map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg bg-white/[0.04] ring-1 ring-white/10 px-3 py-1.5 flex items-center gap-2"
            >
              <span className="font-mono text-xs text-muted w-8">{e.minute}'</span>
              <span className="text-sm">
                {e.type === "goal-home" || e.type === "goal-away" ? "⚽ " : e.type === "yellow" ? "🟨 " : e.type === "red" ? "🟥 " : "🏁 "}
                {e.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Support meter + tap area */}
      <div className="fixed left-0 right-0 bottom-0 z-20 p-3 bg-gradient-to-t from-night via-night/95 to-transparent">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-lg" style={{ color: tempColor[temp] }}>
              {tempLabel[temp]}
            </span>
            {combo > 1 && (
              <motion.span
                key={combo}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                className="font-display text-xl text-gold"
              >
                COMBO ×{combo}
              </motion.span>
            )}
          </div>
          <Bar value={support} color={tempColor[temp]} height={14} />

          {!running && !finished ? (
            <Button
              size="lg"
              className="w-full mt-3"
              onClick={() => {
                startMatch();
              }}
            >
              ▶ Iniciar partido (simulado)
            </Button>
          ) : finished ? (
            <Button
              size="lg"
              className="w-full mt-3"
              variant="gold"
              onClick={() => nav(`/result/${i}`)}
            >
              Ver resultado →
            </Button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onPointerDown={onCheerTap}
              className="relative w-full mt-3 py-4 rounded-2xl text-center font-display text-xl tracking-wider text-black select-none"
              style={{
                background: `linear-gradient(135deg, ${team.c[0]}, ${team.c[1]})`,
                boxShadow: `0 0 ${20 + support / 2}px color-mix(in srgb, ${team.c[0]} ${40 + support / 2}%, transparent)`,
              }}
              aria-label="Toca para apoyar a tu equipo"
            >
              👏 TOCA PARA APOYAR 👏
              <AnimatePresence>
                {particles.map((p) => (
                  <motion.span
                    key={p.id}
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 1.4 }}
                    className="absolute pointer-events-none text-2xl"
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      transform: `translate(${p.x}%, ${p.y}%) rotate(${p.rot}deg)`,
                    }}
                  >
                    {p.emoji}
                  </motion.span>
                ))}
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
