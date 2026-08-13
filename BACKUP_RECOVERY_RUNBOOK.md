# Backup and recovery runbook

## Monthly backup

The scheduled task runs the existing read-only backup command after the second
Monday of each month. A manual run is also possible:

```powershell
./server/scripts/create-local-backup.ps1
```

The JSON output is stored under `server/backup/`, which is ignored by Git.
Keep that directory private and do not place it in an unencrypted shared
folder.

## Verify a new backup

```powershell
npm run backup:verify --workspace=server -- server/backup/<backup-file>.json
```

Verification checks the format, timestamp, excluded session/migration tables,
table list, and every declared row count. It reads only the backup file.

## Recovery drill

1. Create and verify a backup.
2. Confirm `server/.env.local` points to local `budget_dev`.
3. Restore only to the local database. For a non-destructive drill, first copy
   the local schema to a temporary database named `budget_recovery_drill_*`,
   then set both `DATABASE_URL` to that database and
   `ALLOW_RECOVERY_DRILL=true` before running the command. The script refuses
   every other non-local database.

```powershell
npm run restore:local --workspace=server -- server/backup/<backup-file>.json
```

4. Confirm the script reports matching row counts, then run the application
   locally and check login, transaction list, assets, and fixed-cost management.

`restore:local` rejects remote hosts and every database other than local
`budget_dev` or an explicitly enabled `budget_recovery_drill_*` database. It
is not a production restore command.

## Revision history

- **2026-08-13**: Added independent backup-file verification and documented
  the monthly backup and local recovery drill.
  - **Reason**: Make backup validity and recovery scope explicit before an
    incident occurs.
