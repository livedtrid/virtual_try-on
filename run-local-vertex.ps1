# run-local-vertex.ps1
# Starts the Virtual Try-On stack in Vertex AI mode (ADC / service account).
#
# Usage:
#   $env:GOOGLE_CLOUD_PROJECT="my-project"; .\run-local-vertex.ps1
#
# Optional:
#   $env:GOOGLE_CLOUD_LOCATION="us-central1"
#   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"
#   $env:VTO_CA_BUNDLE="C:\path\to\zscaler-ca.pem"

$ErrorActionPreference = "Stop"

$RootDir    = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BaseRunner = Join-Path $RootDir "run-local.ps1"

if (-not (Test-Path $BaseRunner)) {
    Write-Host "[error] Missing base runner: $BaseRunner"
    exit 1
}

if (-not $env:GOOGLE_CLOUD_PROJECT) {
    Write-Host "[error] GOOGLE_CLOUD_PROJECT is required for Vertex mode."
    Write-Host '[hint]  Example: $env:GOOGLE_CLOUD_PROJECT="my-project"; .\run-local-vertex.ps1'
    exit 1
}

$env:VTO_USE_VERTEX         = "true"
$env:GOOGLE_CLOUD_LOCATION  = if ($env:GOOGLE_CLOUD_LOCATION) { $env:GOOGLE_CLOUD_LOCATION } else { "us-central1" }

Write-Host "[vertex] Enabled with GOOGLE_CLOUD_PROJECT=$env:GOOGLE_CLOUD_PROJECT"
Write-Host "[vertex] Using GOOGLE_CLOUD_LOCATION=$env:GOOGLE_CLOUD_LOCATION"

# ── CA bundle (ZScaler / corporate proxy) ────────────────────────────────────
if ($env:VTO_CA_BUNDLE) {
    if (-not (Test-Path $env:VTO_CA_BUNDLE)) {
        Write-Host "[warn]   VTO_CA_BUNDLE points to missing file: $env:VTO_CA_BUNDLE — ignoring"
    } else {
        $env:REQUESTS_CA_BUNDLE              = $env:VTO_CA_BUNDLE
        $env:SSL_CERT_FILE                   = $env:VTO_CA_BUNDLE
        $env:GRPC_DEFAULT_SSL_ROOTS_FILE_PATH = $env:VTO_CA_BUNDLE
        Write-Host "[vertex] Using custom CA bundle: $env:VTO_CA_BUNDLE"
    }
} else {
    Write-Host "[vertex] No VTO_CA_BUNDLE set."
    Write-Host '[vertex] If ZScaler is active, export the cert and set $env:VTO_CA_BUNDLE="C:\path\to\zscaler-ca.pem"'
}

# ── Service account ───────────────────────────────────────────────────────────
if ($env:GOOGLE_APPLICATION_CREDENTIALS) {
    if (-not (Test-Path $env:GOOGLE_APPLICATION_CREDENTIALS)) {
        Write-Host "[error] GOOGLE_APPLICATION_CREDENTIALS points to missing file: $env:GOOGLE_APPLICATION_CREDENTIALS"
        exit 1
    }
    Write-Host "[vertex] Using service account: $env:GOOGLE_APPLICATION_CREDENTIALS"
} else {
    Write-Host "[vertex] No GOOGLE_APPLICATION_CREDENTIALS — relying on ambient ADC (gcloud auth application-default login)."
}

& $BaseRunner

