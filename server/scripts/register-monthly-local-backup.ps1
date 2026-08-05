$ErrorActionPreference = 'Stop'

$taskName = 'SmartBudgetMonthlyLocalBackup'
$backupScript = Join-Path $PSScriptRoot 'run-scheduled-monthly-backup.ps1'
$currentUser = "$env:USERDOMAIN\$env:USERNAME"
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$backupScript`""
$trigger = New-ScheduledTaskTrigger -Daily -At 9:00AM
$principal = New-ScheduledTaskPrincipal -UserId $currentUser -LogonType Interactive -RunLevel Limited
$taskParameters = @{
  TaskName = $taskName
  Description = 'Creates one Smart Budget Manager backup after the second Monday of each month, retrying at 9:00 AM on subsequent days until successful.'
  Action = $action
  Trigger = $trigger
  Principal = $principal
  Force = $true
}
Register-ScheduledTask @taskParameters | Out-Null

Write-Output "Registered scheduled task: $taskName"
