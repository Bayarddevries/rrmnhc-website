---
name: install-hub-skill
description: "Install a skill from the upstream NousResearch/hermes-agent GitHub repository when it is not available locally. Covers pull SKILL.md, directory structure, reference files, and heritage customization."
version: 1.0.0
---

# Install Hub Skill from GitHub

Install a skill from the upstream NousResearch/hermes-agent repository when not available via `hermes skills browse/install`.

## When to Use

- User spots a new skill on X/Twitter (e.g. NousResearch tweet)
- Found a skill in the GitHub repo tree view
- `hermes skills browse` does not show the desired skill

## Procedure

### Step 1: Identify the skill path

Skills live at: `https://github.com/NousResearch/hermes-agent/tree/main/skills/<category>/<skill-name>/`

Common categories: `creative`, `research`, `productivity`, `autonomous-ai-agents`, `devops`, `media`, `mlops`, `github`, `software-development`, `web`, `data-science`

### Step 2: Pull SKILL.md

Try curl first:
```bash
curl -s "https://raw.githubusercontent.com/NousResearch/hermes-agent/main/skills/<category>/<skill-name>/SKILL.md"
```

If curl is not available (e.g. cloud sandbox without write access), use browser:
1. `browser_navigate` to the raw URL
2. `browser_snapshot` with full=true
3. `write_file` to save locally

### Step 3: Pull reference files

Check the GitHub tree for references/, scripts/, or templates/ subdirectories. Download each file via curl or browser_snapshot + write_file.

Create directories first: `mkdir -p ~/.hermes/skills/<category>/<skill-name>/references`

### Step 4: Verify

`skills_list` should show the new skill. `skill_view <name>` should load it correctly.

### Step 5: Customize references if needed

For heritage project use, enhance reference files with location-specific patterns. Example from Manim skill installation:
- Added heritage-specific color palettes (deep brown, amber, sage, cream) to scene-planning.md
- Added timing patterns for route animations, historical photo reveals, timeline progressions to animations.md

## Pitfalls

- `web_extract` on raw.githubusercontent.com frequently returns 400 errors -- use browser tools instead
- The skills directory structure must match: category folder -> skill folder -> SKILL.md + optional references/scripts/
- Some skills have system package dependencies (e.g. Manim needs LaTeX, ffmpeg)
- Skills requiring special tools (AlphaXiv/alpha CLI, Docker) need those tools installed first

## Feynman Skills-Only Install

To install only research skills without the full Feynman CLI app:
```bash
curl -fsSL https://feynman.is/install-skills | bash
```

This installs to `~/.codex/skills/feynman/`. Copy the skills into Hermes:
```bash
mkdir -p ~/.hermes/skills/research
cp -r ~/.codex/skills/feynman/* ~/.hermes/skills/research/
```

Then `skills_list` will discover them automatically.

## Manim System Dependencies (Ubuntu/WSL)

```bash
sudo apt install ffmpeg texlive texlive-latex-extra texlive-fonts-recommended texlive-fonts-extra texlive-pictures texlive-xetex texlive-science pkg-config libffi-dev
pip install manim
```