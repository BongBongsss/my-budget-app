$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$backupExitCode = 0

# This explicit, local-only command is the sole supported way to allow a
# read-only backup against the remote Neon database from a development PC.
$previousAllowRemoteDb = $env:ALLOW_REMOTE_DB
$env:ALLOW_REMOTE_DB = 'true'

try {
  Push-Location $repoRoot
  npm run backup:local --workspace=server
  $backupExitCode = $LASTEXITCODE
} finally {
  Pop-Location
  if ($null -eq $previousAllowRemoteDb) {
    Remove-Item Env:ALLOW_REMOTE_DB -ErrorAction SilentlyContinue
  } else {
    $env:ALLOW_REMOTE_DB = $previousAllowRemoteDb
  }
}

if ($backupExitCode -ne 0) {
  exit $backupExitCode
}
