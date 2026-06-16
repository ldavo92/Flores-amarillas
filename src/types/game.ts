export type GameScreen = "setup" | "playing" | "winner";

export type Player = {
  id: string;
  name: string;
  isAlive: boolean;
  usedLifesaver: boolean;
  usedShazam: boolean;
  shield: boolean;
  eliminatedAt: number | null;
};

export type JokerType = "buff" | "chaos" | "nerf";

export type JokerEffect =
  | "extraTime"
  | "lessTime"
  | "skipTurn"
  | "reverseQueue"
  | "shuffleQueue"
  | "eliminateCurrent"
  | "reviveRandom"
  | "shield"
  | "duel"
  | "swapTurn"
  | "doubleQuestion"
  | "safePass"
  | "suddenDeath"
  | "stealLifesaver"
  | "stealShazam"
  | "chooseNextPlayer";

export type JokerCard = {
  id: string;
  type: JokerType;
  title: string;
  description: string;
  effect: JokerEffect;
};

export type GameLogItem = {
  id: string;
  text: string;
  createdAt: number;
};

export type TimerState = {
  duration: number;
  remaining: number;
  isRunning: boolean;
  startedAt: number | null;
  pausedAt: number | null;
};

export type PendingActionKind =
  | "lifesaver"
  | "shazam"
  | "chooseNext"
  | "swapTurn";

export type PendingAction = {
  kind: PendingActionKind;
  playerId: string;
  lifesaver?: string;
  card?: JokerCard;
} | null;

export type GameState = {
  screen: GameScreen;
  players: Player[];
  activeQueue: string[];
  currentPlayerId: string | null;
  currentQuestion: string;
  usedQuestions: string[];
  winnerId: string | null;
  timerSeconds: number;
  round: number;
  suddenDeath: boolean;
  lastEvent: string | null;
  gameLog: GameLogItem[];
  timer: TimerState;
  pending: PendingAction;
  lastShazam: JokerCard | null;
  lastLifesaver: string | null;
};

export type RoomRow = {
  id: string;
  code: string;
  host_token: string;
  game_state: GameState;
  created_at: string;
  updated_at: string;
};

export type ConnectionStatus = "connecting" | "connected" | "disconnected";
