$ErrorActionPreference = 'Stop'

# This explicit, local-only command is the sole supported way to allow a
# read-only backup against the remote Neon database from a development PC.
$previousAllowRemoteDb = $env:ALLOW_REMOTE_DB
$env:ALLOW_REMOTE_DB = 'true'

try {
  npm run backup:local --workspace=server
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
} finally {
  if ($null -eq $previousAllowRemoteDb) {
    Remove-Item Env:ALLOW_REMOTE_DB -ErrorAction SilentlyContinue
  } else {
    $env:ALLOW_REMOTE_DB = $previousAllowRemoteDb
  }
}
