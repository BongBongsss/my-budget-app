param(
  [Parameter(Mandatory = $true)]
  [string]$DatabaseUrl
)

$ErrorActionPreference = 'Stop'
$database = [uri]$DatabaseUrl
$databaseName = $database.AbsolutePath.TrimStart('/')

if ($database.Host -notin @('localhost', '127.0.0.1') -or $databaseName -notmatch '^budget_bootstrap_[a-z0-9_]+$') {
  throw 'Bootstrap is allowed only for an empty local database named budget_bootstrap_*.'
}

$env:DATABASE_URL = $DatabaseUrl
$schema = 'prisma/schema.prisma'
$legacyMigrations = @(
  '20260605_prepare_import_audit_assets',
  '20260608_add_notices',
  '20260608_add_review_requests',
  '20260805_add_audit_log_batch_id',
  '20260805_add_audit_log_restore_state',
  '20260807_add_asset_member',
  '20260810_add_asset_types',
  '20260813_baseline_marker'
)

npx prisma db execute --schema $schema --file 'prisma/baseline/20260813_initial_schema.sql'
if ($LASTEXITCODE -ne 0) { throw 'Baseline schema application failed.' }

foreach ($migration in $legacyMigrations) {
  npx prisma migrate resolve --schema $schema --applied $migration
  if ($LASTEXITCODE -ne 0) { throw "Could not register baseline migration: $migration" }
}

npx prisma migrate deploy --schema $schema
if ($LASTEXITCODE -ne 0) { throw 'Post-baseline migration deployment failed.' }

Write-Output "Empty local database bootstrap completed: $databaseName"
