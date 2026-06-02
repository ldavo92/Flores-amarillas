#!/bin/bash
# Session-start hook for Flores-amarillas / MundialGo
# Current state: pure static HTML — no npm install needed.
# Once FASE 0 (Vite + React scaffold) is merged, replace the body below with:
#   cd "$CLAUDE_PROJECT_DIR"
#   npm install
set -euo pipefail

# Only run meaningful setup in remote (web) sessions.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "Session start: static HTML project — no dependencies to install."
echo "Update this hook after FASE 0 (npm scaffold) is merged."
