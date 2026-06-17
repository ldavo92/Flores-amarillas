import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { GameState, RoomRow } from "../types/game";
import { createRoomCode, createToken } from "../utils/createId";
import {
  createRoomLocal,
  getRoomLocal,
  updateRoomStateLocal,
  joinRoomStateLocal,
  subscribeToRoomLocal,
} from "./localRoomService";

export async function createRoom(
  initialState: GameState
): Promise<{ code: string; hostToken: string; room: RoomRow }> {
  if (!isSupabaseConfigured) return createRoomLocal(initialState);

  const hostToken = createToken();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = createRoomCode(6);
    const { data, error } = await supabase
      .from("rooms")
      .insert({ code, host_token: hostToken, game_state: initialState })
      .select()
      .single();

    if (!error && data) {
      return { code, hostToken, room: data as RoomRow };
    }
    // 23505 = unique violation (code collision) -> retry with a new code.
    if (error && error.code !== "23505") {
      throw error;
    }
  }
  throw new Error("No se pudo crear la sala. Intenta de nuevo.");
}

export async function getRoom(code: string): Promise<RoomRow | null> {
  if (!isSupabaseConfigured) return getRoomLocal(code);

  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (error) throw error;
  return (data as RoomRow) ?? null;
}

export async function updateRoomState(
  code: string,
  hostToken: string,
  nextState: GameState
): Promise<void> {
  if (!isSupabaseConfigured) return updateRoomStateLocal(code, hostToken, nextState);

  const { error } = await supabase
    .from("rooms")
    .update({ game_state: nextState })
    .eq("code", code.toUpperCase())
    .eq("host_token", hostToken);

  if (error) throw error;
}

/** Used by the optional /join view: append a player without the host token. */
export async function joinRoomState(code: string, nextState: GameState): Promise<void> {
  if (!isSupabaseConfigured) return joinRoomStateLocal(code, nextState);

  const { error } = await supabase
    .from("rooms")
    .update({ game_state: nextState })
    .eq("code", code.toUpperCase());

  if (error) throw error;
}

export function subscribeToRoom(
  code: string,
  onState: (state: GameState) => void,
  onStatus?: (status: "connected" | "disconnected") => void
): () => void {
  if (!isSupabaseConfigured) return subscribeToRoomLocal(code, onState, onStatus);

  const channel = supabase
    .channel(`room:${code}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "rooms",
        filter: `code=eq.${code.toUpperCase()}`,
      },
      (payload) => {
        const row = payload.new as RoomRow;
        if (row?.game_state) onState(row.game_state);
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") onStatus?.("connected");
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        onStatus?.("disconnected");
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
