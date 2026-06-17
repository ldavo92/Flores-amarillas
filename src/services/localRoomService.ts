import type { GameState, RoomRow } from "../types/game";
import { createRoomCode, createToken, createId } from "../utils/createId";

/**
 * Local fallback that mirrors the Supabase roomService API. It persists rooms in
 * localStorage and syncs across tabs of the same browser using BroadcastChannel
 * (with a `storage` event fallback). Used as a zero-config demo mode when
 * Supabase env vars are not present.
 */

const STORE_KEY = "ge10_local_rooms";
type RoomMap = Record<string, RoomRow>;

const sendChannels = new Map<string, BroadcastChannel>();

function readAll(): RoomMap {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") as RoomMap;
  } catch {
    return {};
  }
}

function writeAll(map: RoomMap): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(map));
}

function nowIso(): string {
  return new Date().toISOString();
}

function channelName(code: string): string {
  return `ge10_room_${code}`;
}

function sendChannel(code: string): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  let ch = sendChannels.get(code);
  if (!ch) {
    ch = new BroadcastChannel(channelName(code));
    sendChannels.set(code, ch);
  }
  return ch;
}

function persistAndBroadcast(code: string, state: GameState): void {
  const map = readAll();
  const room = map[code];
  if (!room) return;
  room.game_state = state;
  room.updated_at = nowIso();
  writeAll(map);
  sendChannel(code)?.postMessage({ type: "state", state });
}

export async function createRoomLocal(
  initialState: GameState
): Promise<{ code: string; hostToken: string; room: RoomRow }> {
  const map = readAll();
  let code = createRoomCode(6);
  while (map[code]) code = createRoomCode(6);
  const hostToken = createToken();
  const room: RoomRow = {
    id: createId(),
    code,
    host_token: hostToken,
    game_state: initialState,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  map[code] = room;
  writeAll(map);
  return { code, hostToken, room };
}

export async function getRoomLocal(code: string): Promise<RoomRow | null> {
  return readAll()[code.toUpperCase()] ?? null;
}

export async function updateRoomStateLocal(
  code: string,
  hostToken: string,
  state: GameState
): Promise<void> {
  const upper = code.toUpperCase();
  const room = readAll()[upper];
  if (!room || room.host_token !== hostToken) throw new Error("Token de anfitrión inválido");
  persistAndBroadcast(upper, state);
}

export async function joinRoomStateLocal(code: string, state: GameState): Promise<void> {
  persistAndBroadcast(code.toUpperCase(), state);
}

export function subscribeToRoomLocal(
  code: string,
  onState: (state: GameState) => void,
  onStatus?: (status: "connected" | "disconnected") => void
): () => void {
  const upper = code.toUpperCase();
  let ch: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== "undefined") {
    ch = new BroadcastChannel(channelName(upper));
  }

  const onMessage = (e: MessageEvent) => {
    if (e.data?.type === "state") onState(e.data.state as GameState);
  };
  ch?.addEventListener("message", onMessage);

  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY || !e.newValue) return;
    try {
      const room = (JSON.parse(e.newValue) as RoomMap)[upper];
      if (room) onState(room.game_state);
    } catch {
      /* ignore malformed payloads */
    }
  };
  window.addEventListener("storage", onStorage);

  onStatus?.("connected");

  return () => {
    ch?.removeEventListener("message", onMessage);
    ch?.close();
    window.removeEventListener("storage", onStorage);
  };
}
