---
name: cron-job-management
description: Diagnose and fix failing cron jobs, batch large tasks, and manage scheduled job lifecycles.
version: 1.0.0
---

# Cron Job Management

## Diagnosing a Failing Cron Job

```bash
# 1. List all jobs (include disabled/errored ones)
cronjob(action='list', include_disabled=true)

# 2. Manually trigger a re-run to reproduce the error
cronjob(action='run', job_id='<job_id>')

# 3. Check cron output logs
cat ~/.hermes/cron/output/<job_id>_*.log 2>/dev/null | tail -100

# 4. If no output log exists, the job likely crashed before writing output
# (timeout, OOM, missing dependencies)
```

## Common Failure Modes & Fixes

### Timeout (Most Common)
**Symptom:** Job status is `error`, output log is empty or truncated.
**Fix:** Break the work into smaller batches.
1. Create a state file to track progress:
   ```
   echo "BATCH=1" > /path/to/batch_tracker.txt
   ```
2. Rewrite the cron prompt to process only the current batch.
3. After completing the batch, increment the batch number (cycle back to 1 at the end).
4. Schedule more frequent runs (e.g., `0 8,14,20 * * *` for 3x daily).

### Missing Files / Wrong Paths
**Symptom:** Job errors on file-not-found.
**Fix:** Cron jobs run in a fresh sandbox — always use absolute paths. Verify file existence before referencing it.

### Authentication Drift
**Symptom:** API/service calls fail with 401/403.
**Fix:** Cookies and tokens expire. Either:
- Refresh credentials in the job prompt before each run
- Use a more stable auth method (API keys > cookies)

### Rate Limits
**Symptom:** Intermittent success, then failures.
**Fix:** Add delays between requests, reduce batch size, or spread runs across more time.

## Batch Work Pattern (State File + Cyclic Progression)

For any job that processes many items (image searches, data scraping, audits):

```
# State file location
/path/to/project/batch_tracker.txt

# Content:
BATCH=1

# In the cron job prompt:
# 1. Read the BATCH number from the state file
# 2. Process only items for that batch
# 3. After completing the batch, increment: (BATCH == N) ? 1 : BATCH + 1
# 4. The next scheduled run picks up the next batch automatically

# Update the schedule to match:
# - 6 batches → run 2x/day → full cycle every 3 days
# - 6 batches → run 3x/day → full cycle every 2 days
```

## Updating a Cron Job

```bash
# Change schedule + prompt
cronjob(action='update', job_id='<job_id>', 
        schedule='0 8,14,20 * * *',
        prompt='<new self-contained prompt>')

# Change schedule only
cronjob(action='update', job_id='<job_id>', schedule='every 2h')

# Pause/resume
cronjob(action='pause', job_id='<job_id>', reason='Temporarily disabled')
cronjob(action='resume', job_id='<job_id>')

# Remove entirely
cronjob(action='remove', job_id='<job_id>')
```

## Pitfalls

- **Cron jobs run in a fresh sandbox** — they have NO current-chat context. Prompts must be fully self-contained with all necessary file paths, batch definitions, and instructions.
- **Empty output logs mean early death** — the process died before producing output (timeout, crash, missing dependency).
- **Don't use `cronjob(action='run')` in a cron prompt** — that creates nested scheduling which is unpredictable.
- **State files must use absolute paths** — relative paths resolve differently in the sandbox vs interactive sessions.