---
name: agent-state-recovery-and-memory-management
description: |
  Procedures for diagnosing and resolving issues related to agent state loss, persistent file access errors, skill recall failures, and persistent memory capacity limits.
trigger: |
  Agent exhibits signs of state loss (e.g., cannot find saved files/skills, memory full errors), user requests diagnostics or system recovery, or persistent state management fails.
context: |
  Agent operational environment, including filesystem paths for persistent data (~/.hermes/), skill loading mechanisms, and memory capacity limits.
outcome: |
  Restored agent operational stability, accessible persistent files/skills, memory usage within limits, and clear communication about state.
steps:
  - |
    **1. Diagnose State Issues:**
    *   Check memory usage: Use `memory.usage` (if available) or simulate `free -h` via `execute_code` to check general memory status.
    *   Verify access to critical `~/.hermes/` directory files: Attempt to read `preferences.json`, `last_session_summary.md`, and `TROUBLESHOOTING.md` using `read_file`.
    *   Check skill accessibility: Use `skills_list()` to list available skills and `skill_view(name='proper-session-ending')` or other critical skills, expecting them to be found.
    *   Inspect logs for specific errors (e.g., "File not found," "Memory at limit," "Skill not found," "Bad Request" from web tools).
  - |
    **2. Address Memory Limits:**
    *   If memory is near-full (`~2150/2200 chars` or higher):
        *   Identify less critical entries using `memory.current_entries()`.
        *   Attempt to prune entries using `memory.remove(old_text='...')`.
        *   If memory remains full, use `memory.replace()` with more condensed information or prompt the user for removal priorities.
  - |
    **3. Resolve File/Skill Access Issues:**
    *   If essential files (`preferences.json`, `last_session_summary.md`, `TROUBLESHOOTING.md`) are missing:
        *   Inform the user about potential data loss.
        *   If the skill `write_file` is available, attempt to recreate essential files with default/fallback content (e.g., a basic `preferences.json` structure).
    *   If skills are not found (e.g., `proper-session-ending`):
        *   Verify the expected path (`~/.hermes/skills/`) and ensure files are correctly placed and named.
        *   If skills are absent, guide the user or attempt to re-initialize skill loading mechanisms.
  - |
    **4. Improve Response and Tool Discipline:**
    *   When issues are detected, provide clear, brief diagnostic summaries and actionable steps.
    *   Avoid lengthy explanations unless specifically requested.
    *   Ensure tool calls are syntactically correct and parameters are appropriately used.
    *   Use 'brief mode' for status updates by default.
pitfalls: |
  *   Loss of historical data if memory cannot be managed or pruned effectively.
  *   Incorrect pathing to configuration files or scripts within `~/.hermes/` directory.
  *   Over-pruning memory leading to the loss of important context.
  *   Failure to re-initialize or correctly load skills after state issues.
  *   Continued verbosity or missed tool calls if diagnostic and correction loops are not robust.
verification: |
  *   `memory.usage` (or equivalent diagnostic) should show memory within acceptable limits after pruning.
  *   `read_file` commands for `preferences.json`, `last_session_summary.md`, and `TROUBLESHOOTING.md` should succeed.
  *   `skills_list()` should return the expected skills, including `proper-session-ending`.
  *   `skill_view(name='proper-session-ending')` should successfully return the skill content.
  *   Test session wrap-up and resume functionality to ensure state is correctly saved and loaded.
  *   Confirm responses are concise and tool calls are accurate.
---
