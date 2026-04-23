# run-local.ps1
# Starts both the FastAPI backend and the Vite frontend.
# Usage:
#   .\ops-docs\scripts\run-local.ps1
#   $env:BACKEND_PORT=8081; $env:FRONTEND_PORT=5174; .\ops-docs\scripts\run-local.ps1

$ErrorActionPreference = "Stop"

$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Definition
$RootDir     = Split-Path -Parent (Split-Path -Parent $ScriptDir)
$BackendDir  = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"
$BackendPort  = if ($env:BACKEND_PORT)  { $env:BACKEND_PORT  } else { "8080" }
$FrontendPort = if ($env:FRONTEND_PORT) { $env:FRONTEND_PORT } else { "5173" }

$VenvPython = Join-Path $BackendDir ".venv\Scripts\python.exe"
$VenvPip    = Join-Path $BackendDir ".venv\Scripts\pip.exe"

# ── Setup ────────────────────────────────────────────────────────────────────
if (-not (Test-Path (Join-Path $BackendDir ".venv"))) {
    Write-Host "[setup] Creating Python virtual environment..."
    python -m venv (Join-Path $BackendDir ".venv")
}

& $VenvPython -c "import importlib.util,sys;sys.exit(0 if importlib.util.find_spec('fastapi') else 1)" *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[setup] Installing backend dependencies..."
    & $VenvPip install -r (Join-Path $BackendDir "requirements.txt")
}

if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
    Write-Host "[setup] Installing frontend dependencies..."
    Push-Location $FrontendDir
    npm install
    Pop-Location
}

$envFile = Join-Path $FrontendDir ".env"
$envExample = Join-Path $FrontendDir ".env.example"
if (-not (Test-Path $envFile)) {
    Write-Host "[setup] Creating frontend .env from .env.example..."
    Copy-Item $envExample $envFile
}

# ── Start services ────────────────────────────────────────────────────────────
Write-Host "[run] Starting backend  on http://localhost:$BackendPort"
$backendProc = Start-Process -NoNewWindow -PassThru `
    -FilePath $VenvPython `
    -ArgumentList "-m", "uvicorn", "app.main:app", "--app-dir", $BackendDir, "--reload", "--port", $BackendPort `
    -WorkingDirectory $BackendDir

Write-Host "[run] Starting frontend on http://localhost:$FrontendPort"
$frontendProc = Start-Process -NoNewWindow -PassThru `
    -FilePath "npm" `
    -ArgumentList "run", "dev", "--", "--host", "0.0.0.0", "--port", $FrontendPort `
    -WorkingDirectory $FrontendDir

Write-Host "[ready] Open http://localhost:$FrontendPort"
Write-Host "[ready] Press Ctrl+C to stop both services"

try {
    $frontendProc.WaitForExit()
} finally {
    Write-Host "`n[cleanup] Stopping services..."
    if (-not $backendProc.HasExited)  { Stop-Process -Id $backendProc.Id  -Force -ErrorAction SilentlyContinue }
    if (-not $frontendProc.HasExited) { Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue }
}

