#!/usr/bin/env zsh
# ---------------------------------------------------------------------------
# run-local-apikey.sh
#
# Starts the Virtual Try-On stack in Vertex mode using a plain API key.
# The API key must have the Vertex AI API enabled on the GCP project.
#
# Usage:
#   VERTEX_API_KEY=AIza... ./ops-docs/scripts/run-local-apikey.sh
#
# Optional settings:
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
if [[ -z "${VERTEX_API_KEY:-}" ]]; then
  echo "[error] VERTEX_API_KEY is required."
  echo "[hint]  Example: VERTEX_API_KEY=AIza... ./ops-docs/scripts/run-local-apikey.sh"
  exit 1
fi

# ── Export settings for the backend ─────────────────────────────────────────
export VTO_USE_VERTEX=true
export VTO_AUTH_MODE=api_key

if [[ -n "${GOOGLE_CLOUD_PROJECT:-}" ]]; then
  echo "[apikey] Ignoring GOOGLE_CLOUD_PROJECT in API key mode."
  unset GOOGLE_CLOUD_PROJECT
fi
if [[ -n "${GOOGLE_CLOUD_LOCATION:-}" ]]; then
  echo "[apikey] Ignoring GOOGLE_CLOUD_LOCATION in API key mode."
  unset GOOGLE_CLOUD_LOCATION
fi
if [[ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" ]]; then
  echo "[apikey] Ignoring GOOGLE_APPLICATION_CREDENTIALS in API key mode."
  unset GOOGLE_APPLICATION_CREDENTIALS
fi

echo "[apikey] Vertex AI enabled with API key auth"
echo "[apikey] VERTEX_API_KEY=****${VERTEX_API_KEY: -4}"   # show only last 4 chars

# ── ZScaler / corporate proxy CA bundle support ───────────────────────────
if [[ -n "${VTO_CA_BUNDLE:-}" ]]; then
  if [[ ! -f "$VTO_CA_BUNDLE" ]]; then
    echo "[warn] VTO_CA_BUNDLE points to missing file: $VTO_CA_BUNDLE — ignoring"
  else
    export REQUESTS_CA_BUNDLE="$VTO_CA_BUNDLE"
    export SSL_CERT_FILE="$VTO_CA_BUNDLE"
    export GRPC_DEFAULT_SSL_ROOTS_FILE_PATH="$VTO_CA_BUNDLE"
    echo "[apikey] Using custom CA bundle: $VTO_CA_BUNDLE"
  fi
elif [[ -f "/Library/Application Support/Netskope/STAgent/data/nscacert_combined.pem" ]]; then
  _ca_bundle="/Library/Application Support/Netskope/STAgent/data/nscacert_combined.pem"
  export REQUESTS_CA_BUNDLE="$_ca_bundle"
  export SSL_CERT_FILE="$_ca_bundle"
  export GRPC_DEFAULT_SSL_ROOTS_FILE_PATH="$_ca_bundle"
  echo "[apikey] Auto-detected Netskope/ZScaler CA bundle: $_ca_bundle"
elif security find-certificate -a -p /Library/Keychains/System.keychain 2>/dev/null | grep -q "BEGIN CERTIFICATE"; then
  _ca_bundle="${TMPDIR:-/tmp}/vto-system-ca-bundle.pem"
  security find-certificate -a -p /Library/Keychains/System.keychain > "$_ca_bundle" 2>/dev/null
  security find-certificate -a -p /System/Library/Keychains/SystemRootCertificates.keychain >> "$_ca_bundle" 2>/dev/null
  export REQUESTS_CA_BUNDLE="$_ca_bundle"
  export SSL_CERT_FILE="$_ca_bundle"
  export GRPC_DEFAULT_SSL_ROOTS_FILE_PATH="$_ca_bundle"
  echo "[apikey] Exported macOS system keychain as CA bundle (includes ZScaler if installed via MDM): $_ca_bundle"
else
  echo "[apikey] No custom CA bundle detected — if ZScaler is intercepting traffic, SSL may fail."
  echo "[apikey] Set VTO_CA_BUNDLE=/path/to/zscaler-ca.pem to fix this."
fi

exec "$BASE_RUNNER"

