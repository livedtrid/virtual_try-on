# run-local-apikey.ps1
# Starts the Virtual Try-On stack in Vertex AI mode using a plain API key.
#
# Usage:
#   $env:VERTEX_API_KEY="AIza..."; .\run-local-apikey.ps1
#
# Optional:
#   $env:VTO_CA_BUNDLE="C:\path\to\zscaler-ca.pem"

$ErrorActionPreference = "Stop"

$RootDir    = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BaseRunner = Join-Path $RootDir "run-local.ps1"

if (-not (Test-Path $BaseRunner)) {
    Write-Host "[error] Missing base runner: $BaseRunner"
    exit 1
}

# -- Validate required env vars ------------------------------------------------
if (-not $env:VERTEX_API_KEY) {
    Write-Host "[error] VERTEX_API_KEY is required."
    Write-Host '[hint]  Example: $env:VERTEX_API_KEY="AIza..."; .\run-local-apikey.ps1'
    exit 1
}

# -- Export settings -----------------------------------------------------------
$env:VTO_USE_VERTEX        = "true"
$env:VTO_AUTH_MODE         = "api_key"

if ($env:GOOGLE_CLOUD_PROJECT) {
    Write-Host "[apikey] Ignoring GOOGLE_CLOUD_PROJECT in API key mode."
    Remove-Item Env:GOOGLE_CLOUD_PROJECT -ErrorAction SilentlyContinue
}
if ($env:GOOGLE_CLOUD_LOCATION) {
    Write-Host "[apikey] Ignoring GOOGLE_CLOUD_LOCATION in API key mode."
    Remove-Item Env:GOOGLE_CLOUD_LOCATION -ErrorAction SilentlyContinue
}
if ($env:GOOGLE_APPLICATION_CREDENTIALS) {
    Write-Host "[apikey] Ignoring GOOGLE_APPLICATION_CREDENTIALS in API key mode."
    Remove-Item Env:GOOGLE_APPLICATION_CREDENTIALS -ErrorAction SilentlyContinue
}

$maskedKey = "****" + $env:VERTEX_API_KEY.Substring([Math]::Max(0, $env:VERTEX_API_KEY.Length - 4))

Write-Host "[apikey] Vertex AI enabled with API key auth"
Write-Host "[apikey] VERTEX_API_KEY=$maskedKey"

# -- CA bundle (ZScaler / corporate proxy) ------------------------------------
if ($env:VTO_CA_BUNDLE) {
    if (-not (Test-Path $env:VTO_CA_BUNDLE)) {
        Write-Host "[warn]   VTO_CA_BUNDLE points to missing file: $env:VTO_CA_BUNDLE - ignoring"
    } else {
        $env:REQUESTS_CA_BUNDLE               = $env:VTO_CA_BUNDLE
        $env:SSL_CERT_FILE                    = $env:VTO_CA_BUNDLE
        $env:GRPC_DEFAULT_SSL_ROOTS_FILE_PATH = $env:VTO_CA_BUNDLE
        Write-Host "[apikey] Using custom CA bundle: $env:VTO_CA_BUNDLE"
    }
} else {
    Write-Host "[apikey] No VTO_CA_BUNDLE set."
    Write-Host "[apikey] If ZScaler is active, export the cert and set `$env:VTO_CA_BUNDLE='C:\path\to\zscaler-ca.pem'"
}

& $BaseRunner

