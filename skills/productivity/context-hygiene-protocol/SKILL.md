---
name: context-hygiene-protocol
description: Maintain optimal agent performance through periodic self-diagnostics and context compression to prevent degradation.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [context, hygiene, maintenance, protocol]
    related_skills: []
---

# Context Hygiene Protocol

## When to use
- After 15-20 turns of conversation.
- When tool call errors increase (e.g., 404s, schema mismatches).
- When user reports "forgetting" or degraded performance.

## Steps

1. **Self-Diagnostic Audit**
   - Verify tool schemas are loaded: check for `terminal`, `file`, `memory`, `web_search`.
   - Confirm current role: Architect (build) or Tester (verify).
   - Summarize current objective in one sentence.

2. **Context Load Assessment**
   - Estimate token usage: if >70% of context window used, trigger compression.
   - Identify bloat: repeated terminal outputs, long chat history.

3. **Compression (if needed)**
   - Generate a dense "Session State Block": goal, role, key variables, paths, progress.
   - Present to user: "Ready to compress? Say /compress to reset with this state."

4. **Reset (if needed)**
   - Use the Session State Block as the initial prompt for a new session.
   - Discard the old conversation history.

## Pitfalls
- Do NOT include a constant "pulse indicator" in every response (user explicitly dislikes).
- Avoid over-auditing; trust the user to signal when performance is off.
- Do not compress mid-task unless context is critical.

## Verification
- After reset, confirm tool schemas load correctly with a simple test call (e.g., `terminal` echo).
- Verify role clarity: ask user if the role is correct before proceeding.

## Example
User: "You seem to be forgetting how to call tools."
Agent: "Running self-diagnostic... Tool schemas present. Context load at 85%. Suggesting /compress to restore optimal performance."