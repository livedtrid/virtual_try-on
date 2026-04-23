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
  echo "[hint] Example: GOOGLE_CLOUD_PROJECT=my-project ./ops-docs/scripts/run-local-vertex.sh"
  exit 1
fi

export VTO_USE_VERTEX=true
export GOOGLE_CLOUD_LOCATION="${GOOGLE_CLOUD_LOCATION:-us-central1}"

echo "[vertex] Enabled with GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT"
echo "[vertex] Using GOOGLE_CLOUD_LOCATION=$GOOGLE_CLOUD_LOCATION"

# ── ZScaler / corporate proxy CA bundle support ───────────────────────────
# If VTO_CA_BUNDLE is set, trust it. Otherwise try the macOS system keychain
# export (which includes ZScaler's root cert when installed via MDM).
if [[ -n "${VTO_CA_BUNDLE:-}" ]]; then
  if [[ ! -f "$VTO_CA_BUNDLE" ]]; then
    echo "[warn] VTO_CA_BUNDLE points to missing file: $VTO_CA_BUNDLE — ignoring"
  else
    export REQUESTS_CA_BUNDLE="$VTO_CA_BUNDLE"
    export SSL_CERT_FILE="$VTO_CA_BUNDLE"
    export GRPC_DEFAULT_SSL_ROOTS_FILE_PATH="$VTO_CA_BUNDLE"
    echo "[vertex] Using custom CA bundle: $VTO_CA_BUNDLE"
  fi
elif [[ -f "/Library/Application Support/Netskope/STAgent/data/nscacert_combined.pem" ]]; then
  _ca_bundle="/Library/Application Support/Netskope/STAgent/data/nscacert_combined.pem"
  export REQUESTS_CA_BUNDLE="$_ca_bundle"
  export SSL_CERT_FILE="$_ca_bundle"
  export GRPC_DEFAULT_SSL_ROOTS_FILE_PATH="$_ca_bundle"
  echo "[vertex] Auto-detected Netskope/ZScaler CA bundle: $_ca_bundle"
elif security find-certificate -a -p /Library/Keychains/System.keychain 2>/dev/null | grep -q "BEGIN CERTIFICATE"; then
  _ca_bundle="${TMPDIR:-/tmp}/vto-system-ca-bundle.pem"
  security find-certificate -a -p /Library/Keychains/System.keychain > "$_ca_bundle" 2>/dev/null
  security find-certificate -a -p /System/Library/Keychains/SystemRootCertificates.keychain >> "$_ca_bundle" 2>/dev/null
  export REQUESTS_CA_BUNDLE="$_ca_bundle"
  export SSL_CERT_FILE="$_ca_bundle"
  export GRPC_DEFAULT_SSL_ROOTS_FILE_PATH="$_ca_bundle"
  echo "[vertex] Exported macOS system keychain as CA bundle (includes ZScaler if installed via MDM): $_ca_bundle"
else
  echo "[vertex] No custom CA bundle detected — if ZScaler is intercepting traffic, SSL may fail."
  echo "[vertex] Set VTO_CA_BUNDLE=/path/to/zscaler-ca.pem to fix this."
fi

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

