import type { GameState, Player } from "../types/game";

export const MAX_PLAYERS = 10;
export const MIN_PLAYERS = 2;
export const DEFAULT_TIMER = 10;
export const TIMER_OPTIONS = [5, 7, 10, 15];

export function createInitialState(timerSeconds = DEFAULT_TIMER): GameState {
  return {
    screen: "setup",
    players: [],
    activeQueue: [],
    currentPlayerId: null,
    currentQuestion: "",
    usedQuestions: [],
    winnerId: null,
    timerSeconds,
    round: 1,
    suddenDeath: false,
    lastEvent: null,
    gameLog: [],
    timer: {
      duration: timerSeconds,
      remaining: timerSeconds,
      isRunning: false,
      startedAt: null,
      pausedAt: null,
    },
    pending: null,
    lastShazam: null,
    lastLifesaver: null,
  };
}

export function getPlayer(state: GameState, id: string | null): Player | null {
  if (!id) return null;
  return state.players.find((p) => p.id === id) ?? null;
}

export function alivePlayers(state: GameState): Player[] {
  return state.players.filter((p) => p.isAlive);
}

export function eliminatedPlayers(state: GameState): Player[] {
  return state.players.filter((p) => !p.isAlive);
}

/** Next alive player id in the queue after the current one. */
export function nextAliveId(
  queue: string[],
  players: Player[],
  currentId: string | null
): string | null {
  const aliveSet = new Set(players.filter((p) => p.isAlive).map((p) => p.id));
  const aliveQueue = queue.filter((id) => aliveSet.has(id));
  if (aliveQueue.length === 0) return null;
  if (!currentId) return aliveQueue[0];
  const idx = aliveQueue.indexOf(currentId);
  if (idx === -1) return aliveQueue[0];
  return aliveQueue[(idx + 1) % aliveQueue.length];
}

export function buildScreenUrl(code: string): string {
  return `${window.location.origin}/screen/${code}`;
}

export function buildJoinUrl(code: string): string {
  return `${window.location.origin}/join/${code}`;
}
