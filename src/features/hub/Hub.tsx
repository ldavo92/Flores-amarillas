import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { getTeam } from "@/data/teams";
import { teamSchedule, nextMatch } from "@/data/matches";
import { Mascot } from "@/mascots/Mascot";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { JourneyMap } from "@/features/map/JourneyMap";
import { useGameStore } from "@/store/useGameStore";
import { applyTeamColorsGlobal } from "@/lib/teamColors";

export function Hub() {
  const teamId = useGameStore((s) => s.teamId);
  const mascotName = useGameStore((s) => s.mascotName);
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const streak = useGameStore((s) => s.streak);
  const status = useGameStore((s) => s.status);
  const audioOn = useGameStore((s) => s.audioOn);
  const toggleAudio = useGameStore((s) => s.toggleAudio);
  const lowDataMode = useGameStore((s) => s.lowDataMode);
  const toggleLowData = useGameStore((s) => s.toggleLowData);
  const nav = useNavigate();

  const team = teamId ? getTeam(teamId) : null;
  const schedule = useMemo(() => (teamId ? teamSchedule(teamId) : []), [teamId]);
  const next = useMemo(() => (teamId ? nextMatch(teamId) : undefined), [teamId]);

  useEffect(() => {
    applyTeamColorsGlobal(team);
  }, [team]);

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6 bg-stadium">
        <div>
          <p className="text-muted mb-4">Aún no has elegido tu selección.</p>
          <Button onClick={() => nav("/select")}>Elegir selección</Button>
        </div>
      </div>
    );
  }

  const currentMatchIdx = next ? schedule.indexOf(next) : 0;
  const rival = next ? getTeam(next.h === team.id ? next.a : next.h) : null;
  const xpToNext = level * 100 - xp;
  const progress = ((xp % 100) / 100) * 100;

  return (
    <div className="min-h-screen bg-stadium pb-20">
      {/* Top bar: jugador + ajustes */}
      <header className="sticky top-0 z-20 backdrop-blur bg-night/80 ring-1 ring-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-shrink-0">
            <Mascot team={team} mood="confident" size={48} bob={false} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-lg leading-none truncate">{mascotName}</div>
            <div className="flex gap-2 mt-1 items-center">
              <Chip color={team.c[0]}>Nivel {level}</Chip>
              <span className="text-xs text-muted">{xp} XP · 🔥 {streak}</span>
            </div>
          </div>
          <button
            onClick={toggleAudio}
            aria-label={audioOn ? "Silenciar audio" : "Activar audio"}
            className="w-10 h-10 rounded-full bg-white/[0.06] ring-1 ring-white/10 flex items-center justify-center"
          >
            {audioOn ? "🔊" : "🔇"}
          </button>
          <button
            onClick={toggleLowData}
            aria-label="Modo bajo consumo"
            className={`w-10 h-10 rounded-full flex items-center justify-center ring-1 ${
              lowDataMode ? "bg-gold/20 ring-gold/40 text-gold" : "bg-white/[0.06] ring-white/10"
            }`}
            title={lowDataMode ? "Modo bajo consumo: ON" : "Modo bajo consumo: OFF"}
          >
            ⚡
          </button>
        </div>
        <div className="max-w-4xl mx-auto px-4 pb-2">
          <div className="w-full h-1.5 rounded-full bg-white/8 overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${team.c[0]}, ${team.c[1]})`,
              }}
            />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-muted mt-1">
            {xpToNext} XP al nivel {level + 1}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-4 space-y-4">
        {/* Próximo partido */}
        {next && rival && (
          <Card delay={0.1}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-muted">
                Próximo partido
              </span>
              <Chip color={team.c[1]}>Grupo {team.group}</Chip>
            </div>
            <div className="grid grid-cols-3 items-center gap-2 mb-3">
              <TeamSide team={team} side="left" />
              <div className="text-center">
                <CountdownTo iso={next.iso} />
                <div className="text-xs text-muted mt-1">{next.city}</div>
                <div className="text-xs text-muted">{next.st}</div>
              </div>
              <TeamSide team={rival} side="right" />
            </div>
            <div className="flex gap-2">
              <Button
                size="md"
                className="flex-1"
                onClick={() => nav(`/predict/${schedule.indexOf(next)}`)}
              >
                Pronosticar marcador
              </Button>
              <Button
                size="md"
                variant="ghost"
                onClick={() => nav(`/match/${schedule.indexOf(next)}`)}
              >
                Ver partido
              </Button>
            </div>
          </Card>
        )}

        {/* Mapa-viaje */}
        <Card delay={0.2}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest text-muted">
              Tu camino real
            </span>
            <Chip color={team.c[0]}>{schedule.length} partidos</Chip>
          </div>
          <JourneyMap teamId={team.id} schedule={schedule} currentMatchIdx={currentMatchIdx} />
          {status === "eliminated" && (
            <div className="mt-3 text-center text-sm">
              <Chip color="#ef4757">Eliminada · adopta una selección</Chip>
            </div>
          )}
        </Card>

        {/* Lista de tus partidos */}
        <Card delay={0.3}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-widest text-muted">
              Tu calendario
            </span>
          </div>
          <ul className="divide-y divide-white/5">
            {schedule.map((m, i) => {
              const r = getTeam(m.h === team.id ? m.a : m.h);
              if (!r) return null;
              const isHome = m.h === team.id;
              const idx = i;
              const isPast = idx < currentMatchIdx;
              const isCurrent = idx === currentMatchIdx;
              return (
                <li key={m.iso}>
                  <Link
                    to={`/match/${idx}`}
                    className="flex items-center gap-3 py-3 hover:bg-white/[0.03] -mx-2 px-2 rounded-lg"
                  >
                    <div className="text-xs uppercase tracking-widest text-muted w-14">
                      J{idx + 1}
                    </div>
                    <span className="text-2xl">{isHome ? team.flag : r.flag}</span>
                    <span className="text-xs text-muted">vs</span>
                    <span className="text-2xl">{isHome ? r.flag : team.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{r.name}</div>
                      <div className="text-xs text-muted">
                        {fmtMatchDate(m.iso)} · {m.city}
                      </div>
                    </div>
                    {isCurrent && <Chip color={team.c[0]}>Próximo</Chip>}
                    {isPast && <Chip color="#9ba6c2">Pasado</Chip>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <Card delay={0.4} className="text-center">
            <div className="text-3xl mb-2">🏟️</div>
            <div className="font-bold mb-1">Todos los grupos</div>
            <p className="text-xs text-muted mb-3">12 grupos · 16 sedes</p>
            <Button size="sm" variant="ghost" onClick={() => nav("/groups")}>
              Ver
            </Button>
          </Card>
          <Card delay={0.5} className="text-center">
            <div className="text-3xl mb-2">🦄</div>
            <div className="font-bold mb-1">Álbum de mascotas</div>
            <p className="text-xs text-muted mb-3">
              {useGameStore.getState().unlocked.length}/48
            </p>
            <Button size="sm" variant="ghost" onClick={() => nav("/album")}>
              Abrir
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}

function TeamSide({ team, side }: { team: ReturnType<typeof getTeam>; side: "left" | "right" }) {
  if (!team) return null;
  return (
    <div className={`flex flex-col items-center text-center ${side === "left" ? "" : ""}`}>
      <div className="text-4xl mb-1">{team.flag}</div>
      <div className="font-bold leading-tight text-sm">{team.name}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted mt-0.5">
        G{team.group}
      </div>
    </div>
  );
}

function CountdownTo({ iso }: { iso: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = new Date(iso).getTime() - now;
  if (diff <= 0) {
    return <div className="font-display text-2xl text-grass">¡Hoy!</div>;
  }
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return (
    <div className="font-display text-2xl tabular-nums">
      {d > 0 ? `${d}d ${h}h` : `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`}
    </div>
  );
}

function fmtMatchDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
