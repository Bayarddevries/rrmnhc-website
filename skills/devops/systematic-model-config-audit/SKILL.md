---
name: systematic-model-config-audit
description: A systematic procedure for diagnosing and fixing unauthorized or "ghost" model switches in a multi-agent/multi-platform environment.
version: 1.0.0
author: Hermes Agent
---

# Skill: systematic-model-config-audit

A systematic procedure for diagnosing and fixing unauthorized or "ghost" model switches in a multi-agent/multi-platform environment (specifically Hermes Agent).

## Overview
When a user reports that their configured model (e.g., `openrouter/free`) is being overridden in new sessions, the cause is often not the primary `config.yaml`, but rather "leaks" in the agent's procedural memory or automated sub-processes.

## Diagnostic Workflow

### 1. Identify the "Ghost" Model
Check the session transcript or error logs to identify exactly which model is being called instead of the intended one.

### 2. Inspect the Configuration Layers
Check for overrides in the following hierarchy:

- **Primary Config**: `~/.hermes/config.yaml`
    - Check `model.default`
    - Check platform overrides: `whatsapp.model`, `telegram.model`, etc.
    - Check auxiliary models: `auxiliary.vision.model`, `auxiliary.summary_model`
- **Automation (Cron)**: `~/.hermes/cron/jobs.json`
    - Ensure all scheduled jobs have the correct `model` field.
- **Procedural Memory (Skills)**: `~/.hermes/skills/`
    - **CRITICAL**: Search skill files (`SKILL.md`) for hardcoded model names in:
        - YAML example configurations.
        - "Best practice" or "Default" instructions.
        - Platform-specific guidance.
- **Persistent Memory**: `~/.hermes/memories/MEMORY.md`
    - Ensure the recorded "routing configuration" or "preferences" match the intended state.

### 3. Forensic Search Commands
Use these commands to find lingering model identifiers:

```bash
# Search for specific model strings across all non-session/non-log files
grep -rE "model_name_here" ~/.hermes/ --exclude-dir={'.hermes-agent/venv', '.git'} --exclude={'.hermes_history', 'logs', 'sessions'}

# Search for environment variable overrides
grep -rE 'MODEL|OPENROUTER' ~/.hermes/ --include='*.env'

# Check for hardcoded models in skills
grep -rE "model_name_here" ~/.hermes/skills/
```

### 4. Remediation Steps
1. **Patch Config**: Use `patch` to update `config.yaml`.
2. **Patch Skills**: Use `patch` to update `SKILL.md` files. **Do not just tell the user to change it; the skill itself must be updated to prevent the agent from re-learning the wrong behavior.**
3. **Patch Memory**: Update `MEMORY.md` to reflect the correct routing rules.
4. **Restart Gateway**: Run `hermes gateway restart` if platform overrides were changed.

## Pitfalls
- **Skill Re-infection**: If you fix the config but don't fix the `SKILL.md` that contains the "wrong" example, the agent will likely "hallucinate" the old config back into existence during the next complex task.
- **Session History**: `grep` will find many hits in `sessions/` and `.hermes_history`. Ignore these; they are records of past states, not current configurations.
