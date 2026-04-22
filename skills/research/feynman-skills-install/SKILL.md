---
name: feynman-skills-install
description: Install Feynman research agent skills from getcompanion-ai into Hermes. Feynman installs to ~/.codex/skills/ but Hermes reads ~/.hermes/skills/. Steps to bridge the gap.
version: 1.1.0
---

# Feynman Skills - Install into Hermes

Feynman (github.com/getcompanion-ai/feynman) provides excellent research skills: deep-research, literature-review, alpha-research, watch, peer-review, source-comparison, etc. They're not installed natively in Hermes -- must be manually bridged.

## Installation Steps

### 1. Install Feynman Skills

```bash
# macOS / Linux (user-level)
curl -fsSL https://feynman.is/install-skills | bash

# Windows PowerShell (user-level)
irm https://feynman.is/install-skills.ps1 | iex

# Or repo-scoped (local to current git repo)
curl -fsSL https://feynman.is/install-skills | bash -s -- --repo
```

This puts skills into `~/.codex/skills/feynman/`.

### 2. Copy to Hermes Skills Directory

**GOTCHA:** Feynman installs to `~/.codex/skills/feynman/` but Hermes discovers skills from `~/.hermes/skills/`. They are completely separate directories.

```bash
mkdir -p ~/.hermes/skills/research
cp -r ~/.codex/skills/feynman/* ~/.hermes/skills/research/
```

### 3. Verify in Hermes

Run `skills_list` and confirm these appear:
- `deep-research` - thorough source-heavy investigation
- `literature-review` - academic landscape with consensus/disagreements
- `alpha-research` - paper search via AlphaXiv CLI
- `watch` - recurring research monitoring
- `peer-review` - simulated academic critique
- `source-comparison` - multi-source comparison matrix
- `eli5` - plain English explanations
- `session-log` - research session notes

## Updating

When Feynman releases a new version:
```bash
curl -fsSL https://feynman.is/install-skills | bash
cp -r ~/.codex/skills/feynman/* ~/.hermes/skills/research/
```

## Pitfalls

- Skill files internally reference `~/.feynman/agent/skills/` -- this is fine, Hermes doesn't care about internal path references, only the SKILL.md content matters.
- Skills like `modal-compute` and `runpod-compute` require those CLI tools installed -- they'll be discoverable but won't function without the underlying tools.
- The `docker` skill requires Docker installed and running.
