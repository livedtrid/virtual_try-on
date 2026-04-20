#!/usr/bin/env zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BASE_RUNNER="$ROOT_DIR/run-local.sh"

if [[ ! -x "$BASE_RUNNER" ]]; then
  echo "[error] Missing executable base runner: $BASE_RUNNER"
  echo "[hint] Make sure run-local.sh exists and is executable."
  exit 1
fi

if [[ -z "${GOOGLE_CLOUD_PROJECT:-}" ]]; then
  echo "[error] GOOGLE_CLOUD_PROJECT is required for Vertex mode."
  echo "[hint] Example: GOOGLE_CLOUD_PROJECT=my-project ./run-local-vertex.sh"
  exit 1
fi

export VTO_USE_VERTEX=true
export GOOGLE_CLOUD_LOCATION="${GOOGLE_CLOUD_LOCATION:-us-central1}"

echo "[vertex] Enabled with GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT"
echo "[vertex] Using GOOGLE_CLOUD_LOCATION=$GOOGLE_CLOUD_LOCATION"

if [[ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" ]]; then
  if [[ ! -f "$GOOGLE_APPLICATION_CREDENTIALS" ]]; then
    echo "[error] GOOGLE_APPLICATION_CREDENTIALS points to a missing file: $GOOGLE_APPLICATION_CREDENTIALS"
    exit 1
  fi
  echo "[vertex] Using service account file from GOOGLE_APPLICATION_CREDENTIALS"
else
  echo "[vertex] GOOGLE_APPLICATION_CREDENTIALS not set; relying on ambient ADC (for example: gcloud auth application-default login)."
fi

exec "$BASE_RUNNER"

