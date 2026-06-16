import { DEFAULT_TIMER } from "./gameHelpers";

const TOKENS_KEY = "ge10_host_tokens";
const PREFS_KEY = "ge10_prefs";

export type Prefs = {
  sound: boolean;
  timerSeconds: number;
  lastRoom: string | null;
};

const DEFAULT_PREFS: Prefs = {
  sound: true,
  timerSeconds: DEFAULT_TIMER,
  lastRoom: null,
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as T) } : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode) */
  }
}

export function saveHostToken(code: string, token: string): void {
  const map = readJson<Record<string, string>>(TOKENS_KEY, {});
  map[code] = token;
  writeJson(TOKENS_KEY, map);
}

export function getHostToken(code: string): string | null {
  return readJson<Record<string, string>>(TOKENS_KEY, {})[code] ?? null;
}

export function getPrefs(): Prefs {
  return readJson<Prefs>(PREFS_KEY, DEFAULT_PREFS);
}

export function savePrefs(patch: Partial<Prefs>): Prefs {
  const next = { ...getPrefs(), ...patch };
  writeJson(PREFS_KEY, next);
  return next;
}
