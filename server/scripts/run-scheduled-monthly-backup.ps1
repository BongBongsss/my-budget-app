$ErrorActionPreference = 'Stop'

function Get-SecondMonday([datetime]$date) {
  $firstDay = Get-Date -Year $date.Year -Month $date.Month -Day 1
  $daysUntilMonday = (([int][System.DayOfWeek]::Monday - [int]$firstDay.DayOfWeek + 7) % 7)
  return $firstDay.AddDays($daysUntilMonday + 7).Date
}

function Test-CompletedBackup([System.IO.FileInfo]$file) {
  try {
    $verifyScript = Join-Path $PSScriptRoot '..\src\scripts\verifyLocalBackup.ts'
    $tsNode = Join-Path $PSScriptRoot '..\..\node_modules\ts-node\dist\bin.js'
    & node $tsNode $verifyScript $file.FullName --production *> $null
    return $LASTEXITCODE -eq 0
  } catch {
    return $false
  }
}

$today = (Get-Date).Date
$targetDate = Get-SecondMonday $today
if ($today -lt $targetDate) {
  Write-Output "Monthly backup deferred until $($targetDate.ToString('yyyy-MM-dd'))."
  exit 0
}

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$backupDirectory = Join-Path $repoRoot 'server\backup'
$completedBackup = Get-ChildItem -LiteralPath $backupDirectory -Filter 'full-backup-*.json' -File -ErrorAction SilentlyContinue |
  Where-Object { $_.LastWriteTime -ge $targetDate -and (Test-CompletedBackup $_) } |
  Select-Object -First 1

if ($null -ne $completedBackup) {
  Write-Output "Monthly backup already completed: $($completedBackup.Name)"
  exit 0
}

& (Join-Path $PSScriptRoot 'create-local-backup.ps1')
exit $LASTEXITCODE
