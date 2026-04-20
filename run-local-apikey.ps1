# run-local-apikey.ps1
# Starts the Virtual Try-On stack in Vertex AI mode using a plain API key.
#
# Usage:
#   $env:GOOGLE_CLOUD_PROJECT="my-project"; $env:VERTEX_API_KEY="AIza..."; .\run-local-apikey.ps1
#
# Optional:
#   $env:GOOGLE_CLOUD_LOCATION="us-central1"
#   $env:VTO_CA_BUNDLE="C:\path\to\zscaler-ca.pem"

$ErrorActionPreference = "Stop"

$RootDir    = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BaseRunner = Join-Path $RootDir "run-local.ps1"

if (-not (Test-Path $BaseRunner)) {
    Write-Host "[error] Missing base runner: $BaseRunner"
    exit 1
}

# ── Validate required env vars ────────────────────────────────────────────────
if (-not $env:GOOGLE_CLOUD_PROJECT) {
    Write-Host "[error] GOOGLE_CLOUD_PROJECT is required."
    Write-Host '[hint]  Example: $env:GOOGLE_CLOUD_PROJECT="my-project"; $env:VERTEX_API_KEY="AIza..."; .\run-local-apikey.ps1'
    exit 1
}

if (-not $env:VERTEX_API_KEY) {
    Write-Host "[error] VERTEX_API_KEY is required."
    Write-Host '[hint]  Example: $env:GOOGLE_CLOUD_PROJECT="my-project"; $env:VERTEX_API_KEY="AIza..."; .\run-local-apikey.ps1'
    exit 1
}

# ── Export settings ───────────────────────────────────────────────────────────
$env:VTO_USE_VERTEX        = "true"
$env:VTO_AUTH_MODE         = "api_key"
$env:GOOGLE_CLOUD_LOCATION = if ($env:GOOGLE_CLOUD_LOCATION) { $env:GOOGLE_CLOUD_LOCATION } else { "us-central1" }

$maskedKey = "****" + $env:VERTEX_API_KEY.Substring([Math]::Max(0, $env:VERTEX_API_KEY.Length - 4))

Write-Host "[apikey] Vertex AI enabled with API key auth"
Write-Host "[apikey] GOOGLE_CLOUD_PROJECT=$env:GOOGLE_CLOUD_PROJECT"
Write-Host "[apikey] GOOGLE_CLOUD_LOCATION=$env:GOOGLE_CLOUD_LOCATION"
Write-Host "[apikey] VERTEX_API_KEY=$maskedKey"

# ── CA bundle (ZScaler / corporate proxy) ────────────────────────────────────
if ($env:VTO_CA_BUNDLE) {
    if (-not (Test-Path $env:VTO_CA_BUNDLE)) {
        Write-Host "[warn]   VTO_CA_BUNDLE points to missing file: $env:VTO_CA_BUNDLE — ignoring"
    } else {
        $env:REQUESTS_CA_BUNDLE               = $env:VTO_CA_BUNDLE
        $env:SSL_CERT_FILE                    = $env:VTO_CA_BUNDLE
        $env:GRPC_DEFAULT_SSL_ROOTS_FILE_PATH = $env:VTO_CA_BUNDLE
        Write-Host "[apikey] Using custom CA bundle: $env:VTO_CA_BUNDLE"
    }
} else {
    Write-Host "[apikey] No VTO_CA_BUNDLE set."
    Write-Host '[apikey] If ZScaler is active, export the cert and set $env:VTO_CA_BUNDLE="C:\path\to\zscaler-ca.pem"'
}

& $BaseRunner

