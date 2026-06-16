import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[GANA EN 10] Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env"
  );
}

export const supabase = createClient(url ?? "http://localhost", anonKey ?? "anon", {
  realtime: { params: { eventsPerSecond: 10 } },
});
