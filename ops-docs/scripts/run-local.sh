#!/usr/bin/env zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_PORT="${BACKEND_PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

if [[ ! -d "$BACKEND_DIR/.venv" ]]; then
  echo "[setup] Creating Python virtual environment..."
  python3 -m venv "$BACKEND_DIR/.venv"
fi

if ! "$BACKEND_DIR/.venv/bin/python" -c "import fastapi" >/dev/null 2>&1; then
  echo "[setup] Installing backend dependencies..."
  "$BACKEND_DIR/.venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
fi

if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  echo "[setup] Installing frontend dependencies..."
  (cd "$FRONTEND_DIR" && npm install)
fi

if [[ ! -f "$FRONTEND_DIR/.env" ]]; then
  echo "[setup] Creating frontend .env from .env.example..."
  cp "$FRONTEND_DIR/.env.example" "$FRONTEND_DIR/.env"
fi

echo "[run] Starting backend on http://localhost:$BACKEND_PORT"
"$BACKEND_DIR/.venv/bin/python" -m uvicorn app.main:app --app-dir "$BACKEND_DIR" --reload --port "$BACKEND_PORT" &
BACKEND_PID=$!

echo "[run] Starting frontend on http://localhost:$FRONTEND_PORT"
(cd "$FRONTEND_DIR" && npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT") &
FRONTEND_PID=$!

echo "[ready] Open http://localhost:$FRONTEND_PORT"
echo "[ready] Press Ctrl+C to stop both services"

wait "$FRONTEND_PID"

