import { create } from "zustand";
import type {
  ConnectionStatus,
  GameState,
  JokerCard,
} from "../types/game";
import { QUESTIONS } from "../data/questions";
import { LIFESAVERS } from "../data/lifesavers";
import { JOKERS } from "../data/jokers";
import { createId } from "../utils/createId";
import { shuffle, pickRandom } from "../utils/shuffle";
import {
  MIN_PLAYERS,
  MAX_PLAYERS,
  nextAliveId,
} from "../utils/gameHelpers";
import {
  getRoom,
  updateRoomState,
  subscribeToRoom,
} from "../services/roomService";

/* ----------------------------- draft mutators ----------------------------- */

function draftLog(s: GameState, text: string): void {
  s.gameLog = [{ id: createId(), text, createdAt: Date.now() }, ...s.gameLog].slice(0, 40);
  s.lastEvent = text;
}

function draftStopTimer(s: GameState): void {
  s.timer.isRunning = false;
  s.timer.startedAt = null;
  s.timer.pausedAt = null;
}

function draftResetTimer(s: GameState): void {
  s.timer.remaining = s.timer.duration;
  s.timer.isRunning = false;
  s.timer.startedAt = null;
  s.timer.pausedAt = null;
}

function draftPauseTimer(s: GameState): void {
  if (s.timer.isRunning && s.timer.startedAt) {
    const elapsed = (Date.now() - s.timer.startedAt) / 1000;
    s.timer.remaining = Math.max(0, s.timer.remaining - elapsed);
  }
  s.timer.isRunning = false;
  s.timer.startedAt = null;
  s.timer.pausedAt = Date.now();
}

function draftGenerateQuestion(s: GameState): void {
  let pool = QUESTIONS.filter((q) => !s.usedQuestions.includes(q));
  if (pool.length === 0) {
    s.usedQuestions = [];
    pool = QUESTIONS;
    draftLog(s, "Preguntas reiniciadas 🔁");
  }
  const q = pickRandom(pool)!;
  s.currentQuestion = q;
  s.usedQuestions = [...s.usedQuestions, q];
}

function firstAliveId(s: GameState): string | null {
  return s.players.find((p) => p.isAlive)?.id ?? null;
}

function draftNextTurn(s: GameState): void {
  const aliveSet = new Set(s.players.filter((p) => p.isAlive).map((p) => p.id));
  const aliveQueue = s.activeQueue.filter((id) => aliveSet.has(id));
  if (aliveQueue.length === 0) {
    s.currentPlayerId = null;
    return;
  }
  const curIdx = s.currentPlayerId ? aliveQueue.indexOf(s.currentPlayerId) : -1;
  const nextIdx = (curIdx + 1) % aliveQueue.length;
  if (curIdx !== -1 && nextIdx <= curIdx) s.round += 1;
  s.currentPlayerId = aliveQueue[nextIdx];
}

function draftCheckWinner(s: GameState): boolean {
  const alive = s.players.filter((p) => p.isAlive);
  if (alive.length <= 1) {
    s.screen = "winner";
    s.winnerId = alive[0]?.id ?? null;
    draftStopTimer(s);
    if (alive[0]) draftLog(s, `🏆 ${alive[0].name} GANA`);
    return true;
  }
  return false;
}

function draftEliminatePlayer(s: GameState, id: string): void {
  const p = s.players.find((x) => x.id === id);
  if (!p || !p.isAlive) return;
  const wasCurrent = s.currentPlayerId === id;
  const next = nextAliveId(s.activeQueue, s.players, id);

  if (p.shield) {
    p.shield = false;
    draftLog(s, `${p.name} se salvó con ESCUDO 🛡️`);
    return;
  }

  p.isAlive = false;
  p.eliminatedAt = Date.now();
  s.activeQueue = s.activeQueue.filter((q) => q !== id);
  draftLog(s, `${p.name} fue eliminado ❌`);
  draftStopTimer(s);

  if (draftCheckWinner(s)) return;

  if (wasCurrent) {
    s.currentPlayerId = next && next !== id ? next : firstAliveId(s);
    draftGenerateQuestion(s);
    draftResetTimer(s);
  }
}

function draftRevive(s: GameState): void {
  const dead = s.players.filter((p) => !p.isAlive);
  if (dead.length === 0) {
    draftLog(s, "No hay eliminados para revivir");
    return;
  }
  const target = pickRandom(dead)!;
  const p = s.players.find((x) => x.id === target.id)!;
  p.isAlive = true;
  p.eliminatedAt = null;
  p.shield = false;
  if (!s.activeQueue.includes(p.id)) s.activeQueue.push(p.id);
  draftLog(s, `${p.name} REVIVE 💫`);
}

/* --------------------------------- store ---------------------------------- */

type SetRoomParams = {
  code: string;
  hostToken: string;
  isHost: boolean;
  state: GameState;
};

type GameStore = {
  roomCode: string | null;
  hostToken: string | null;
  isHost: boolean;
  connection: ConnectionStatus;
  state: GameState | null;
  error: string | null;
  loading: boolean;

  setRoom: (params: SetRoomParams) => void;
  loadRoom: (code: string) => Promise<boolean>;
  subscribeRoom: (code: string) => () => void;
  syncRoom: () => Promise<void>;
  setConnection: (status: ConnectionStatus) => void;

  addPlayer: (name: string) => string | null;
  removePlayer: (playerId: string) => void;
  startGame: () => void;
  resetGame: () => void;
  shuffleQueue: () => void;
  generateQuestion: () => void;
  nextTurn: () => void;
  markCorrect: () => void;
  eliminateCurrentPlayer: () => void;
  useLifesaver: () => void;
  resolveLifesaver: (success: boolean) => void;
  useShazam: () => void;
  applyJokerEffect: (card: JokerCard) => void;
  closeShazam: () => void;
  resolveChoose: (playerId: string) => void;
  clearPending: () => void;
  checkWinner: () => void;
  reviveRandomPlayer: () => void;
  setTimerSeconds: (seconds: number) => void;
  addLog: (text: string) => void;

  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  expireTimer: () => void;
};

export const useGameStore = create<GameStore>((set, get) => {
  const mutate = (producer: (s: GameState) => void) => {
    const cur = get().state;
    if (!cur) return;
    const next = structuredClone(cur);
    producer(next);
    set({ state: next });
    const { roomCode, hostToken, isHost } = get();
    if (isHost && roomCode && hostToken) {
      updateRoomState(roomCode, hostToken, next).catch(() => {
        set({ connection: "disconnected" });
      });
    }
  };

  return {
    roomCode: null,
    hostToken: null,
    isHost: false,
    connection: "connecting",
    state: null,
    error: null,
    loading: false,

    setRoom: ({ code, hostToken, isHost, state }) =>
      set({ roomCode: code, hostToken, isHost, state, connection: "connected", error: null }),

    loadRoom: async (code) => {
      set({ loading: true, error: null });
      try {
        const row = await getRoom(code);
        if (!row) {
          set({ error: "La sala no existe.", loading: false, state: null });
          return false;
        }
        set({ roomCode: row.code, state: row.game_state, loading: false });
        return true;
      } catch {
        set({ error: "No se pudo cargar la sala.", loading: false });
        return false;
      }
    },

    subscribeRoom: (code) => {
      set({ connection: "connecting" });
      return subscribeToRoom(
        code,
        (state) => {
          if (!get().isHost) set({ state });
        },
        (status) => set({ connection: status })
      );
    },

    syncRoom: async () => {
      const { roomCode, hostToken, isHost, state } = get();
      if (isHost && roomCode && hostToken && state) {
        await updateRoomState(roomCode, hostToken, state).catch(() =>
          set({ connection: "disconnected" })
        );
      }
    },

    setConnection: (status) => set({ connection: status }),

    addPlayer: (rawName) => {
      const name = rawName.trim();
      const cur = get().state;
      if (!cur || cur.screen !== "setup") return null;
      if (!name) return null;
      if (cur.players.length >= MAX_PLAYERS) return null;
      if (cur.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) return null;
      const id = createId();
      mutate((s) => {
        s.players.push({
          id,
          name,
          isAlive: true,
          usedLifesaver: false,
          usedShazam: false,
          shield: false,
          eliminatedAt: null,
        });
        draftLog(s, `${name} se unió`);
      });
      return id;
    },

    removePlayer: (playerId) =>
      mutate((s) => {
        if (s.screen !== "setup") return;
        s.players = s.players.filter((p) => p.id !== playerId);
      }),

    startGame: () =>
      mutate((s) => {
        const alive = s.players.filter((p) => p.isAlive);
        if (alive.length < MIN_PLAYERS) return;
        s.screen = "playing";
        s.activeQueue = shuffle(alive.map((p) => p.id));
        s.currentPlayerId = s.activeQueue[0] ?? null;
        s.round = 1;
        s.suddenDeath = false;
        s.winnerId = null;
        s.pending = null;
        s.lastShazam = null;
        s.lastLifesaver = null;
        draftGenerateQuestion(s);
        s.timer = {
          duration: s.timerSeconds,
          remaining: s.timerSeconds,
          isRunning: false,
          startedAt: null,
          pausedAt: null,
        };
        draftLog(s, "¡Comienza GANA EN 10! 🎮");
      }),

    resetGame: () =>
      mutate((s) => {
        s.players = s.players.map((p) => ({
          ...p,
          isAlive: true,
          usedLifesaver: false,
          usedShazam: false,
          shield: false,
          eliminatedAt: null,
        }));
        s.screen = "setup";
        s.activeQueue = [];
        s.currentPlayerId = null;
        s.currentQuestion = "";
        s.usedQuestions = [];
        s.winnerId = null;
        s.round = 1;
        s.suddenDeath = false;
        s.pending = null;
        s.lastShazam = null;
        s.lastLifesaver = null;
        draftResetTimer(s);
        draftLog(s, "Partida reiniciada 🔄");
      }),

    shuffleQueue: () =>
      mutate((s) => {
        const alive = s.players.filter((p) => p.isAlive).map((p) => p.id);
        s.activeQueue = shuffle(alive);
        if (s.currentPlayerId && !s.activeQueue.includes(s.currentPlayerId)) {
          s.currentPlayerId = s.activeQueue[0] ?? null;
        }
        draftLog(s, "Orden revuelto 🌀");
      }),

    generateQuestion: () => mutate((s) => draftGenerateQuestion(s)),

    nextTurn: () =>
      mutate((s) => {
        draftStopTimer(s);
        draftNextTurn(s);
        draftGenerateQuestion(s);
        draftResetTimer(s);
        const p = s.players.find((x) => x.id === s.currentPlayerId);
        if (p) draftLog(s, `Turno de ${p.name} ➡️`);
      }),

    markCorrect: () =>
      mutate((s) => {
        const p = s.players.find((x) => x.id === s.currentPlayerId);
        draftStopTimer(s);
        if (p) draftLog(s, `${p.name} respondió ✔️`);
        draftNextTurn(s);
        draftGenerateQuestion(s);
        draftResetTimer(s);
      }),

    eliminateCurrentPlayer: () =>
      mutate((s) => {
        if (s.currentPlayerId) draftEliminatePlayer(s, s.currentPlayerId);
      }),

    useLifesaver: () =>
      mutate((s) => {
        const p = s.players.find((x) => x.id === s.currentPlayerId);
        if (!p) return;
        if (p.usedLifesaver) {
          draftLog(s, `${p.name} ya usó su salvavidas`);
          return;
        }
        p.usedLifesaver = true;
        draftPauseTimer(s);
        const challenge = pickRandom(LIFESAVERS)!;
        s.pending = { kind: "lifesaver", playerId: p.id, lifesaver: challenge };
        s.lastLifesaver = challenge;
        draftLog(s, `${p.name} activó SALVAVIDAS 🛟`);
      }),

    resolveLifesaver: (success) =>
      mutate((s) => {
        if (!s.pending || s.pending.kind !== "lifesaver") return;
        const id = s.pending.playerId;
        const p = s.players.find((x) => x.id === id);
        s.pending = null;
        s.lastLifesaver = null;
        if (success) {
          draftLog(s, `${p?.name ?? "Jugador"} cumplió y SE SALVA ✅`);
        } else {
          draftEliminatePlayer(s, id);
        }
      }),

    useShazam: () =>
      mutate((s) => {
        const p = s.players.find((x) => x.id === s.currentPlayerId);
        if (!p) return;
        if (p.usedShazam) {
          draftLog(s, `${p.name} ya usó su Shazam`);
          return;
        }
        p.usedShazam = true;
        draftPauseTimer(s);
        const card = pickRandom(JOKERS)!;
        s.lastShazam = card;
        draftLog(s, `${p.name} activó ¡SHAZAM! — ${card.title}`);
      }),

    applyJokerEffect: (card) =>
      mutate((s) => {
        const curId = s.currentPlayerId;
        const cur = s.players.find((x) => x.id === curId);
        switch (card.effect) {
          case "extraTime":
            s.timer.duration += 5;
            s.timer.remaining += 5;
            draftLog(s, "Tiempo +5s ⏱️");
            break;
          case "lessTime":
            s.timer.remaining = Math.max(1, s.timer.remaining - 2);
            draftLog(s, "Tiempo -2s ⏱️");
            break;
          case "skipTurn":
          case "safePass":
            draftStopTimer(s);
            draftNextTurn(s);
            draftGenerateQuestion(s);
            draftResetTimer(s);
            draftLog(s, "Turno salvado ➡️");
            break;
          case "reverseQueue":
            s.activeQueue = [...s.activeQueue].reverse();
            draftLog(s, "Cola invertida 🔃");
            break;
          case "shuffleQueue":
            s.activeQueue = shuffle(s.players.filter((p) => p.isAlive).map((p) => p.id));
            draftLog(s, "Cola revuelta 🌀");
            break;
          case "eliminateCurrent":
            if (curId) draftEliminatePlayer(s, curId);
            break;
          case "reviveRandom":
            draftRevive(s);
            break;
          case "shield":
            if (cur) {
              cur.shield = true;
              draftLog(s, `${cur.name} tiene ESCUDO 🛡️`);
            }
            break;
          case "suddenDeath":
            s.suddenDeath = true;
            draftLog(s, "¡MUERTE SÚBITA! 💀");
            break;
          case "doubleQuestion":
            draftLog(s, "Doble pregunta: responde 2 ✖️");
            break;
          case "duel":
            draftLog(s, "¡DUELO! El host elige rival 🤺");
            break;
          case "swapTurn":
            s.pending = { kind: "swapTurn", playerId: curId ?? "" };
            draftLog(s, "Elige con quién cambiar el turno");
            break;
          case "chooseNextPlayer":
            s.pending = { kind: "chooseNext", playerId: curId ?? "" };
            draftLog(s, "Elige el siguiente jugador");
            break;
          case "stealLifesaver":
            if (cur) {
              cur.usedLifesaver = false;
              draftLog(s, `${cur.name} robó un SALVAVIDAS 🛟`);
            }
            break;
          case "stealShazam":
            if (cur) {
              cur.usedShazam = false;
              draftLog(s, `${cur.name} robó un SHAZAM ⚡`);
            }
            break;
        }
      }),

    closeShazam: () => mutate((s) => {
      s.lastShazam = null;
    }),

    resolveChoose: (playerId) =>
      mutate((s) => {
        if (!s.pending || (s.pending.kind !== "chooseNext" && s.pending.kind !== "swapTurn")) {
          return;
        }
        const target = s.players.find((p) => p.id === playerId);
        if (!target || !target.isAlive) return;
        s.pending = null;
        s.lastShazam = null;
        draftStopTimer(s);
        s.currentPlayerId = playerId;
        draftGenerateQuestion(s);
        draftResetTimer(s);
        draftLog(s, `Turno para ${target.name} 🎯`);
      }),

    clearPending: () =>
      mutate((s) => {
        s.pending = null;
        s.lastLifesaver = null;
      }),

    checkWinner: () => mutate((s) => draftCheckWinner(s)),

    reviveRandomPlayer: () => mutate((s) => draftRevive(s)),

    setTimerSeconds: (seconds) =>
      mutate((s) => {
        s.timerSeconds = seconds;
        s.timer.duration = seconds;
        if (!s.timer.isRunning) s.timer.remaining = seconds;
      }),

    addLog: (text) => mutate((s) => draftLog(s, text)),

    startTimer: () =>
      mutate((s) => {
        if (s.screen !== "playing") return;
        if (s.timer.remaining <= 0) s.timer.remaining = s.timer.duration;
        s.timer.isRunning = true;
        s.timer.startedAt = Date.now();
        s.timer.pausedAt = null;
      }),

    pauseTimer: () => mutate((s) => draftPauseTimer(s)),

    resetTimer: () => mutate((s) => draftResetTimer(s)),

    expireTimer: () =>
      mutate((s) => {
        if (!s.timer.isRunning && s.timer.remaining === 0) return;
        s.timer.isRunning = false;
        s.timer.remaining = 0;
        s.timer.startedAt = null;
        draftLog(s, "¡Tiempo terminado! ⛔");
      }),
  };
});
