---
name: hermes-command-centre
description: Build a live-updating web dashboard (Command Centre) for monitoring Hermes Agent state — background jobs, gateway status (WhatsApp + CLI), inbox files, project tracking, agent working/idle status, and WhatsApp activity feed.
version: 1.0.0
metadata:
  hermes:
    tags: [dashboard, monitoring, live-ui, status-page, web]
    homepage: https://github.com/NousResearch/hermes-agent
    related_skills: [obsidian, cron-job-management]
---

# Hermes Command Centre Dashboard

Builds a live-updating HTML dashboard with a Python backend server that polls Hermes state and serves it locally on the user's PC.

## When to Use

- User wants visibility into what Hermes is doing (working vs idle)
- User wants a central view of all active projects, cron jobs, and background tasks
- User wants to monitor WhatsApp gateway connectivity and activity
- User wants quick-action buttons that copy commands to clipboard

## Architecture

Two files in `/home/$USER/dashboard/`:
- `server.py` — Python HTTP server that polls Hermes CLI tools and serves `/api/state` JSON + static HTML
- `dashboard.html` — Self-contained dark-themed dashboard (no external deps) that polls `/api/state` every 15 seconds

## Build Script

```python
import os, socket

# 1. Create directory
os.makedirs('/home/$USER/dashboard/static', exist_ok=True)

# 2. Write server.py — polls Hermes state and serves /api/state + static HTML
#    Key functions:
#    - get_gateway_status() — hermes gateway status
#    - get_active_jobs() — hermes cron list --all, parsed into structured objects
#    - get_inbox() — file listing of /home/$USER/inbox
#    - get_wa_activity() — grep gateway.log for recent WhatsApp lines
#    - check_agent_working() — check gateway.log for tool calls within last 60s
#    - get_sessions() — hermes sessions list, parsed via regex:
#        re.search(r'(\d+)\s*([mh])\s+ago\s+(\S+)\s*$', line)
#      Platform detection: session_id prefix/suffix matching
#        cron_ → cron, telegram → telegram, whatsapp → whatsapp, else → cli
#      Active status: < 45 min for 'm', < 1 hour for 'h'
#    - build_state() — combines all into JSON dict

# 3. Write dashboard.html — self-contained dark theme, polls /api/state every 15s
#    Includes: live session tracking across CLI/Telegram/WhatsApp with platform tabs
#    Session tabs: All | CLI | Telegram | WhatsApp | Active

# 4. Write cross-platform context file at /home/$USER/dashboard/context.md:
#    YAML frontmatter + markdown with current focus, active threads, key decisions,
#    next steps. Read by every session to bridge platform context.

# 5. Start server:
#    pkill -f "python3.*server.py" 2>/dev/null
#    cd /home/$USER/dashboard && python3 server.py &
print("Dashboard built at /home/$USER/dashboard/")
print("Server running at http://localhost:8765")
```

## Critical: Serving at Root URL

The server MUST serve dashboard.html at the root path `/` (not just `/dashboard.html`):

```python
class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/state':
            state = build_state()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(state).encode())
        elif self.path in ('/', '/index.html'):
            self.path = '/dashboard.html'
            http.server.SimpleHTTPRequestHandler.do_GET(self)
        else:
            http.server.SimpleHTTPRequestHandler.do_GET(self)
```

## Cross-Platform Context Sync

Maintain `/home/$USER/dashboard/context.md` as a shared state file that all platform sessions read at startup. Structure:

```yaml
---
last_active: "2026-04-06 09:45 AM"
last_platform: Telegram
---

# RRMNHC Cross-Platform Context

## Current State
## Active Threads
## Key Decisions
## Next Steps
```

Update this file whenever switching topics or finishing tasks. This gives 80% of cross-platform awareness.

## Key Implementation Details

### Agent Working/Idle Detection
Checks gateway.log for lines containing "tool", "exec", "call", or "processing" within the last 60 seconds. If found, shows amber pulsing "Working" status. Otherwise shows green "Idle".

### Live Session Tracking (CLI/Telegram/WhatsApp)
Parses `hermes sessions list` output using regex:
```python
m = re.search(r'(\d+)\s*([mh])\s+ago\s+(\S+)\s*$', line)
```
- **Active sessions**: any session `< 45` minutes old (for 'm') or `< 1` hour (for 'h')
- **Platform detection**: `cron_` → cron, `telegram` → telegram, `whatsapp` → whatsapp, else → cli
- Dashboard includes filter tabs: All | CLI | Telegram | WhatsApp | Active

### Common Pitfalls

1. **Root URL serving**: Without the `Handler.do_GET` override for `/` → `/dashboard.html`, the browser shows a directory listing instead of the dashboard. Always verify `GET /` returns the HTML file, not a directory index.

2. **Browser caching is the #1 user-facing problem**: Users see "Loading sessions..." with no error because the browser serves a cached broken version. Ctrl+F5 does **not** always work. The fix: close ALL browser tabs of the dashboard completely, then open a fresh new window and navigate to `http://localhost:8765`. If that still fails, rename the file (e.g., `dashboard-v2.html`) and have the server serve that name instead.

3. **NEVER patch the dashboard HTML — write it entirely**: Every time you patch `dashboard.html`, you risk breaking the `render(d)` function definition. The JavaScript `refresh()`, `render(d)`, and `renderSessions(d)` functions are tightly coupled — a stray closing brace `}` or removed `function render(d) {` line will silently crash the entire dashboard. When making changes, **always rewrite the entire HTML file** with `write_file`, not `patch`.

4. **All getElementById IDs must exist in the HTML**: If JS references an ID that doesn't exist in the HTML (e.g., `sInbox`), `render()` crashes with "Cannot set properties of null" and the dashboard shows blank/empty content. After adding a new stat or element to the JS render function, verify every `getElementById` call has a matching HTML element with that exact `id`. Use a verification script to cross-check:
```python
import re
html_ids = set(re.findall(r'id="([^"]+)"', html_content))
js_ids = set(re.findall(r"getElementById\('([^']+)'\)", js_content))
print("Missing:", js_ids - html_ids)
```

5. **WhatsApp bridge crashes with code -15**: Usually means OpenRouter 402 (credits exhausted) or 429 (rate limited). Check gateway.log for the exact error. Fix: `hermes gateway restart` and/or switch to Google AI Studio provider for that platform.

6. **Session parsing regex must anchor to end of line**: The session ID is always the last token. If you split by whitespace first, you'll grab the wrong token. Always use `re.search(r'(\\d+)\\s*([mh])\\s+ago\\s+(\\S+)\\s*$', line)` to get the session ID.

7. **Server `do_GET` override must avoid recursion**: Do NOT add another `do_GET` method that calls `self.do_GET()`. Use `http.server.SimpleHTTPRequestHandler.do_GET(self)` explicitly when overriding the path to serve the dashboard at root.

### WhatsApp Activity Feed
Reads last 300 lines of `/home/$USER/.hermes/logs/gateway.log`, filters for WhatsApp-related lines, returns most recent 8 entries with timestamps.

### Server Threading
Uses `socketserver.ThreadingMixIn` to handle concurrent requests. Runs on port 8765 by default. CORS headers: `Access-Control-Allow-Origin: *`.

### Static Projects vs Live Data
Projects, unresolved items, and vault folders are defined as Python constants in the server (they change rarely). Inbox files, jobs, gateway status, and WA activity are polled live on each `/api/state` request.

## Dashboard HTML Structure

```
┌── Header ──────────────────────────────────────────────────┐
│ RRMNHC Command Centre  [🟡 Working] [📱 Connected] [💻 CLI] │
├────────────────────────────────────────────────────────────┤
│ Status: Working | Inbox: 3 | Jobs: 5 active | Updated: ... │
├────────────────────────────────────────────────────────────┤
│ [6 Active] [5 Jobs] [3 Inbox] [2 Blocked] [13 Images] [...]│
├──────────────────┬──────────────────┬──────────────────────┤
│ ACTIVE PROJECTS  │  📱 WA Activity  │  ⏰ Scheduled Jobs   │
│ [6 projects w/   │  Timestamp lines  │  Job info + toggles  │
│  status dots]    │  from gateway     │  + next run times    │
│                  ├──────────────────┤  ────────────────────│
│ [UNRESOLVED]     │  📥 Inbox        │  ══ Unresolved ══    │
│ [Blocked items]  │  File listing    │  ══ Obsidian Vault ══│
│                  ├──────────────────┤  ══ Quick Actions ══  │
└──────────────────┴──────────────────┴──────────────────────┘
Auto-refresh: every 15s
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Gateway stopped / WhatsApp not responding | `hermes gateway status` — if dead: `hermes gateway start` |
| Dashboard not loading | `curl http://localhost:8765/api/state` — if no response: restart server.py |
| 402 API errors in gateway | OpenRouter credits exhausted. Top up or switch model |
| Server port in use | `lsof -ti:8765 | xargs kill` then restart |
| WhatsApp activity empty | Check that gateway.log path is correct and has recent entries |

## Quick Actions (Clipboard Commands)

The dashboard copies these commands to clipboard for the user to paste into the active chat:

- **Run Research Agent** — prompts image/catalog research
- **Download Catalog Images** — fetches archived photos from LAC URLs
- **Populate Obsidian Notes** — creates linked project notes from analysis
- **Send WhatsApp Update** — generates status summary and sends to WhatsApp
- **Manage Cron Jobs** — lists and manages scheduled jobs
- **Open Inbox Folder** — opens `\\wsl.localhost\Ubuntu\home\user\inbox` in Explorer
