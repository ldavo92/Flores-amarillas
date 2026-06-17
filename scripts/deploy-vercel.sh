#!/usr/bin/env bash
#
# Despliega "GANA EN 10" a Vercel usando un token scoped al proyecto (vcp_...).
#
# Requisitos (la red del entorno debe permitir *.vercel.com):
#   - VERCEL_TOKEN       token de Vercel (obligatorio)
#   - VERCEL_PROJECT_ID  id del proyecto (por defecto el de este repo)
#   - VERCEL_ORG_ID      opcional; si no se pasa, se obtiene desde la API
#
# Uso:
#   export VERCEL_TOKEN="vcp_xxx"
#   ./scripts/deploy-vercel.sh           # deploy de producción
#   ./scripts/deploy-vercel.sh --preview # deploy de preview
#
set -euo pipefail

PROJECT_ID="${VERCEL_PROJECT_ID:-prj_7ss4Ossgbk1PoPnmcT9pZdsKgSDI}"
PROD_FLAG="--prod"
if [[ "${1:-}" == "--preview" ]]; then
  PROD_FLAG=""
fi

export VERCEL_TELEMETRY_DISABLED=1

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "ERROR: falta VERCEL_TOKEN. Expórtalo antes de correr el script." >&2
  exit 1
fi

# 1) Asegura el CLI de Vercel.
if ! command -v vercel >/dev/null 2>&1; then
  echo "==> Instalando Vercel CLI..."
  npm i -g vercel >/dev/null 2>&1
fi

# 2) Verifica que la red permita la API de Vercel.
if ! curl -sf -o /dev/null --max-time 15 \
      -H "Authorization: Bearer ${VERCEL_TOKEN}" \
      "https://api.vercel.com/v9/projects/${PROJECT_ID}"; then
  echo "ERROR: no se pudo alcanzar api.vercel.com (¿red bloqueada o token inválido?)." >&2
  echo "       Asegúrate de que el entorno permita *.vercel.com (Network access: Custom)." >&2
  exit 1
fi

# 3) Obtiene el ORG_ID (accountId del proyecto) si no fue provisto.
ORG_ID="${VERCEL_ORG_ID:-}"
if [[ -z "${ORG_ID}" ]]; then
  echo "==> Obteniendo ORG_ID desde la API..."
  ORG_ID="$(curl -s --max-time 15 \
      -H "Authorization: Bearer ${VERCEL_TOKEN}" \
      "https://api.vercel.com/v9/projects/${PROJECT_ID}" \
      | grep -o '"accountId":"[^"]*"' | head -1 | cut -d'"' -f4)"
fi

if [[ -z "${ORG_ID}" ]]; then
  echo "ERROR: no se pudo determinar VERCEL_ORG_ID." >&2
  exit 1
fi
echo "==> ORG_ID=${ORG_ID}  PROJECT_ID=${PROJECT_ID}"

# 4) Vincula el proyecto sin interacción (escribe .vercel/project.json).
mkdir -p .vercel
cat > .vercel/project.json <<JSON
{ "orgId": "${ORG_ID}", "projectId": "${PROJECT_ID}" }
JSON

# 5) Despliega.
export VERCEL_ORG_ID="${ORG_ID}"
export VERCEL_PROJECT_ID="${PROJECT_ID}"
echo "==> Desplegando ${PROD_FLAG:-(preview)} ..."
vercel deploy ${PROD_FLAG} -y

echo "==> Listo. Si configuraste VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY"
echo "    en Vercel, el modo en vivo quedará activo; si no, corre en modo demo."
