#!/usr/bin/env bash
#
# deploy-vercel.sh — Despliega esta app (Vite + Supabase) a Vercel desde la
# línea de comandos, sin necesidad de conectar el repo en el dashboard.
#
# Uso:
#   export VERCEL_TOKEN="vcp_..."        # token de https://vercel.com/account/tokens
#   ./scripts/deploy-vercel.sh           # deploy a producción
#   ./scripts/deploy-vercel.sh --preview # deploy de preview (no producción)
#
# Variables de entorno opcionales:
#   VERCEL_TOKEN        (requerida) token de acceso de Vercel
#   VERCEL_ORG_ID       fuerza el scope/equipo (si no, usa el de la cuenta)
#   VITE_SUPABASE_URL       se sube como env var del proyecto si está presente
#   VITE_SUPABASE_ANON_KEY  se sube como env var del proyecto si está presente
#
# Lee también un archivo .env local (si existe) para tomar las claves de Supabase.

set -euo pipefail

# --- Ubicarse en la raíz del repo --------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# --- Colores para logs --------------------------------------------------------
if [ -t 1 ]; then
  BOLD="$(printf '\033[1m')"; RED="$(printf '\033[31m')"
  GREEN="$(printf '\033[32m')"; YELLOW="$(printf '\033[33m')"; RESET="$(printf '\033[0m')"
else
  BOLD=""; RED=""; GREEN=""; YELLOW=""; RESET=""
fi
info()  { echo "${BOLD}==>${RESET} $*"; }
warn()  { echo "${YELLOW}aviso:${RESET} $*" >&2; }
error() { echo "${RED}error:${RESET} $*" >&2; }

# --- Argumentos ---------------------------------------------------------------
TARGET="production"
for arg in "$@"; do
  case "$arg" in
    --preview) TARGET="preview" ;;
    --prod|--production) TARGET="production" ;;
    -h|--help)
      sed -n '3,18p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) warn "argumento desconocido ignorado: $arg" ;;
  esac
done

# --- Validaciones -------------------------------------------------------------
if [ -z "${VERCEL_TOKEN:-}" ]; then
  error "Falta VERCEL_TOKEN."
  echo "  Crea uno en https://vercel.com/account/tokens y expórtalo:" >&2
  echo "    export VERCEL_TOKEN=\"vcp_...\"" >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  error "Node.js no está instalado o no está en el PATH."
  exit 1
fi

# Resolver el binario de Vercel: usa el instalado globalmente o cae a npx.
if command -v vercel >/dev/null 2>&1; then
  VERCEL="vercel"
else
  info "Vercel CLI no encontrado; se usará 'npx vercel'."
  VERCEL="npx --yes vercel@latest"
fi

# --- Cargar .env local (solo claves VITE_*) -----------------------------------
if [ -f .env ]; then
  info "Cargando variables de .env"
  # Solo exporta líneas VITE_SUPABASE_* sin sobreescribir las ya definidas.
  while IFS='=' read -r key value; do
    case "$key" in
      VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY)
        value="${value%\"}"; value="${value#\"}"
        if [ -z "${!key:-}" ]; then export "$key"="$value"; fi
        ;;
    esac
  done < <(grep -E '^\s*VITE_SUPABASE_(URL|ANON_KEY)=' .env || true)
fi

# --- Flags comunes de Vercel --------------------------------------------------
VERCEL_FLAGS="--token $VERCEL_TOKEN --yes"
if [ -n "${VERCEL_ORG_ID:-}" ]; then
  VERCEL_FLAGS="$VERCEL_FLAGS --scope $VERCEL_ORG_ID"
fi

# --- Subir variables de entorno de Supabase al proyecto -----------------------
# Vercel necesita las VITE_* en build time. Las agregamos (ignorando si ya existen).
push_env() {
  local name="$1" val="$2" env_target="$3"
  if [ -z "$val" ]; then return 0; fi
  # 'vercel env add' falla si ya existe; lo intentamos y silenciamos ese caso.
  if printf '%s' "$val" | $VERCEL env add "$name" "$env_target" $VERCEL_FLAGS >/dev/null 2>&1; then
    info "Variable $name configurada en Vercel ($env_target)."
  else
    warn "No se pudo agregar $name (¿ya existe?). Continuando."
  fi
}

if [ "$TARGET" = "production" ]; then
  ENV_SCOPE="production"
else
  ENV_SCOPE="preview"
fi

if [ -n "${VITE_SUPABASE_URL:-}" ] || [ -n "${VITE_SUPABASE_ANON_KEY:-}" ]; then
  info "Sincronizando variables de Supabase con el proyecto de Vercel…"
  push_env "VITE_SUPABASE_URL" "${VITE_SUPABASE_URL:-}" "$ENV_SCOPE"
  push_env "VITE_SUPABASE_ANON_KEY" "${VITE_SUPABASE_ANON_KEY:-}" "$ENV_SCOPE"
else
  warn "No se encontraron VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY."
  warn "Asegúrate de configurarlas en el dashboard de Vercel o el build fallará."
fi

# --- Deploy -------------------------------------------------------------------
info "Desplegando a Vercel (${BOLD}${TARGET}${RESET})…"
if [ "$TARGET" = "production" ]; then
  $VERCEL deploy --prod $VERCEL_FLAGS
else
  $VERCEL deploy $VERCEL_FLAGS
fi

info "${GREEN}Deploy completado.${RESET}"
