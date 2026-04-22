---
name: whatsapp-gateway-diagnostics
description: Diagnose and fix gateway connectivity issues (WhatsApp & Telegram) — detect silent crashes, API credit exhaustion, vision failures, bridge process failures, and restart procedures.
version: 2.0.0
metadata:
  hermes:
    tags: [whatsapp, gateway, diagnostics, troubleshooting]
    homepage: https://github.com/NousResearch/hermes-agent
    related_skills: [hermes-agent]
---

# WhatsApp Gateway Diagnostics

## Common Symptoms

- User messages from WhatsApp or Telegram don't get responses
- User says "you're not responding on Telegram" or "you're not responding on WhatsApp"
- CLI sessions work but mobile messaging is broken
- Gateway process exits with code -15 (SIGTERM) or other non-zero codes
- Photos sent via Telegram don't get analyzed/vision fails
- User says "Telegram can't see images I send"

## Diagnostic Steps

### 1. Check Gateway Status
```bash
hermes gateway status
```

Look for:
- `Active: active (running)` — good
- `Active: inactive (dead)` — crashed/stopped
- `ERROR` messages in recent logs

### 2. Check for API Credit Errors (402) — affects ALL platforms
```bash
grep -i "402\|credits\|upgrade to a paid" ~/.hermes/logs/gateway.log | tail -5
```

If you see errors like:
```
Error code: 402 - {'error': {'message': 'This request requires more credits, or fewer max_tokens...
```

**This means the user's OpenRouter free credits are exhausted.** This affects:
- Chat responses (main model)
- Vision/image analysis (auxiliary vision)
- Web extraction (if using OpenRouter)

### 3. Check for Photo Download vs Vision Analysis Issues
If user reports "Telegram can't see my photos" — distinguish between:

**Photo arrives successfully but doesn't get analyzed:**
```bash
grep -i "Cached user photo\|Error analyzing image" ~/.hermes/logs/gateway.log | tail -10
```
If you see `Cached user photo at ...` followed by `Error analyzing image: Error code: 402` — photos arrive fine but vision model has no credits.

**Fix: Switch vision to Google Gemini (free, no credits):**
```yaml
# In ~/.hermes/config.yaml, under auxiliary:
auxiliary:
  vision:
    provider: custom
    model: gemini-2.5-flash
    base_url: 'https://generativelanguage.googleapis.com/v1beta/openai'
    api_key: 'YOUR_GEMINI_API_KEY'
    timeout: 30
    download_timeout: 30
```

Then restart the gateway (see restart procedure below).

### 5. Check WhatsApp Bridge Process
```bash
ps aux | grep -i whatsapp | grep -v grep
```

You should see: `node /home/$USER/.hermes/hermes-agent/scripts/whatsapp-bridge/bridge.js`

If this process is missing, the bridge has crashed.

### 6. Check Gateway Logs for WhatsApp Activity
```bash
grep -i "whatsapp\|wa:" ~/.hermes/logs/gateway.log | tail -20
```

## Fix Procedures

### SAFE Gateway Restart (no SIGHUP)

**WARNING: Do NOT use `kill -HUP` (SIGHUP) on gateway. It kills the process, which kills the WhatsApp bridge, causing cascading failures.**

**WARNING: Do NOT use `--replace` flag when the old process is still running. The `--replace` tries to kill the old gateway while starting, which also kills the WhatsApp bridge, and then the new gateway also stops.**

**Correct restart procedure:**
```bash
# 1. Kill the old gateway
kill -15 <gateway_pid>
sleep 2

# 2. Start fresh WITHOUT --replace
cd /home/bayard_devries
nohup /home/bayard_devries/.hermes/hermes-agent/venv/bin/python -m hermes_cli.main gateway run > /tmp/gateway_stdout.log 2>&1 &

# 3. Verify it started
sleep 8
tail -15 ~/.hermes/logs/gateway.log
```

Verify in logs:
- `✓ telegram connected`
- `✓ whatsapp connected` 
- `Gateway running with 2 platform(s)`

### Config Changes Require Gateway Restart

Changes to `~/.hermes/config.yaml` (especially `auxiliary:`, `model:`, `providers:`) require a full gateway restart to take effect. SIGHUP is NOT sufficient — the gateway does not reload config on SIGHUP.

### Gateway Crashed Completely
```bash
hermes gateway start
sleep 5
hermes gateway status
```

### 402 Credit Errors (Free Account)
The gateway will keep crashing when OpenRouter runs out of credits.

**Options:**
1. User tops up at https://openrouter.ai/settings/credits (minimum $5 recommended)
2. Switch to model that uses fewer tokens (lower max_tokens in config)
3. Disable context summaries to reduce token consumption:
   ```bash
   hermes config set compression.enabled true
   hermes config set compression.threshold 0.30
   ```

### Bridge Process Dead
```bash
hermes gateway restart
# Wait for it to come back up
sleep 10
hermes gateway status
```

## Monitoring

Gateway status should be checked:
- When user reports messaging not responding (WhatsApp OR Telegram)
- After any server reboot
- When deploying new Hermes updates
- After any config.yaml changes

The **Live Command Centre Dashboard** (see `hermes-command-centre` skill) includes:
- Auto-refresh every 15 seconds
- Gateway status (connected/offline)
- Recent gateway activity from logs
- Agent working/idle detection

## Troubleshooting Photo/Vision Issues

### Photo arrives, vision fails (402)
1. Confirm with log evidence:
   ```bash
   grep -i "Cached user photo\|Error analyzing image" ~/.hermes/logs/gateway.log | tail -10
   ```
2. If `Cached user photo` + `Error code: 402` — vision model is out of credits
3. Fix: Configure Gemini as free vision provider (see config in Step 3 above)
4. Restart gateway to apply config change

### Photo does NOT arrive at all
1. Check Telegram polling is active:
   ```bash
   tail -5 ~/.hermes/logs/gateway.log
   ```
2. Should see `getUpdates` requests returning 200
3. If no polling activity, gateway may be disconnected — restart
## Key Log Messages

| Message | Meaning | Action |
|---------|---------|--------|
| `WhatsApp bridge process exited (code -15)` | Gateway killed the bridge | Restart gateway |
| `APIStatusError: Error code: 402` | Credits exhausted | Top up or switch model |
| `Non-retryable client error` | API connection failed | Check OpenRouter status |
| `Fatal whatsapp adapter error` | Bridge crashed hard | Restart gateway |
| `Active: active (running)` | Working normally | No action needed |

## Prevention

1. **Monitor credit balance** — check https://openrouter.ai/settings/credits periodically
2. **Enable compression** — reduces token usage, prevents out-of-credit crashes
3. **Systemd linger enabled** — ensures gateway survives logout
   ```bash
   loginctl enable-linger $USER
   ```
4. **Auto-restart after crash** — gateway service is already configured as systemd service with restart capability
   ```bash
   # If it keeps crashing, consider a wrapper:
   systemctl --user edit hermes-gateway.service
   # Add: Restart=on-failure  RestartSec=30
   ```
