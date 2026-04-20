#!/usr/bin/env zsh
# ---------------------------------------------------------------------------
# run-local-apikey.sh
#
# Starts the Virtual Try-On stack in Vertex mode using a plain API key.
# The API key must have the Vertex AI API enabled on the GCP project.
#
# Usage:
#   GOOGLE_CLOUD_PROJECT=my-project VERTEX_API_KEY=AIza... ./run-local-apikey.sh
#
# Optional settings:
#   GOOGLE_CLOUD_LOCATION=us-central1   (default: us-central1)
#   BACKEND_PORT=8080                   (default: 8080)
#   FRONTEND_PORT=5173                  (default: 5173)
# ---------------------------------------------------------------------------
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_RUNNER="$ROOT_DIR/run-local.sh"

if [[ ! -x "$BASE_RUNNER" ]]; then
  echo "[error] Missing executable base runner: $BASE_RUNNER"
  echo "[hint]  Make sure run-local.sh exists and is executable."
  exit 1
fi

# ── Validate required env vars ───────────────────────────────────────────────
if [[ -z "${GOOGLE_CLOUD_PROJECT:-}" ]]; then
  echo "[error] GOOGLE_CLOUD_PROJECT is required."
  echo "[hint]  Example: GOOGLE_CLOUD_PROJECT=my-project VERTEX_API_KEY=AIza... ./run-local-apikey.sh"
  exit 1
fi

if [[ -z "${VERTEX_API_KEY:-}" ]]; then
  echo "[error] VERTEX_API_KEY is required."
  echo "[hint]  Example: GOOGLE_CLOUD_PROJECT=my-project VERTEX_API_KEY=AIza... ./run-local-apikey.sh"
  exit 1
fi

# ── Export settings for the backend ─────────────────────────────────────────
export VTO_USE_VERTEX=true
export VTO_AUTH_MODE=api_key
export GOOGLE_CLOUD_LOCATION="${GOOGLE_CLOUD_LOCATION:-us-central1}"

echo "[apikey] Vertex AI enabled with API key auth"
echo "[apikey] GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT"
echo "[apikey] GOOGLE_CLOUD_LOCATION=$GOOGLE_CLOUD_LOCATION"
echo "[apikey] VERTEX_API_KEY=****${VERTEX_API_KEY: -4}"   # show only last 4 chars

exec "$BASE_RUNNER"

