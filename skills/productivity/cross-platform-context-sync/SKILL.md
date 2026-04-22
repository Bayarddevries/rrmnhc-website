---
name: cross-platform-context-sync
description: Maintain cross-platform awareness between CLI, WhatsApp, and Telegram sessions in Hermes Agent. Uses a shared context.md file so any platform session can pick up what's happening on other platforms.
category: productivity
version: 1.0.0
---

# Cross-Platform Context Sync

Hermes sessions are isolated — a CLI session doesn't natively know what's happening in a WhatsApp or Telegram session. This approach bridges that gap with a shared `context.md` file that every session reads on startup.

## When to Use This
- User switches between CLI, WhatsApp, and Telegram mid-workflow
- User asks "what were we discussing on the CLI?" from mobile
- User needs continuity across different messenger platforms
- Multi-platform active work with overlapping threads

## Setup

### 1. Create the shared context file
```bash
mkdir -p /home/bayard_devries/dashboard/
```

File: `/home/bayard_devries/dashboard/context.md`

```markdown
---
last_active: "2026-04-06 09:45 AM"
last_platform: Telegram
---

# [Project Name] Cross-Platform Context

## Current State
- **Active Platform:** [current platform]
- **Mobile:** [platforms configured]
- **Model Routing:** [per-platform model config]

## Active Threads
1. [Project/task name]: [brief description + status]

## Key Decisions
- [Decision made and date]

## Next Steps
- [ ] [Pending task]
```

### 2. Update session startup
At the beginning of any session where context continuity matters, read this file:
```bash
cat /home/bayard_devries/dashboard/context.md
```

## Workflow

### When Switching Platforms
1. **Before switching** — I update `context.md` with:
   - Current active work
   - Open/pending items
   - Platform we were last active on

2. **On new platform session start** — I:
   - Read `context.md`
   - Immediately know what was being discussed
   - Can reference open threads

### When to Update Context
- After completing a major task
- When switching topics significantly
- When there are new pending items
- When the user explicitly switches platforms

### What to Include
- **Active threads** — 1-2 sentence description of each open work item
- **Key decisions** — recent important choices or trade-offs made
- **Next steps** — concrete pending tasks
- **Platform status** — which channels are active/stable

### What NOT to Include
- Technical configuration details (these belong elsewhere)
- Full conversation history (use `session_search` for that)
- Temporary state that will be resolved immediately

## Integrating with session_search

If the user needs more detail than the context file provides:
```
session_search: [specific topic from context.md]
```

The context file points you to what to search for; `session_search` gives you the deep history.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Context file out of sync | Re-read it before responding; update with current state |
| Too many threads listed | Archive completed ones; keep only 4-6 active |
| Missing critical info from last session | Use `session_search` to fill gaps, then update context.md |
