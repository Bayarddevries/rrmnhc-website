---
name: obsidian-vault-optimization
description: Optimize an Obsidian vault for multi-project use, agent readability, and personal/work separation. Creates structured dashboards, AI instructions, connected project folders, and updated MOCs.
version: 1.0.0
---

# Obsidian Vault Optimization

Use when you need to restructure an Obsidian knowledge vault to:
- Connect related projects (e.g. Heritage Centre + Shoebox)
- Add agent-readable navigation and instructions
- Separate personal items from work items
- Create dashboards that show current status at a glance
- Update MOCs (Maps of Content) for clean navigation

## Prerequisites
- User has an existing Obsidian vault with markdown files
- Vault already has wiki pages or content that can be connected
- User wants multiple projects cross-linked

## Steps

### 1. Audit Existing Structure
```bash
# Find all folders 2-3 levels deep
find "/path/to/vault/" -maxdepth 3 -type d | sort

# Find MOC/index files
find "/path/to/vault/" -name "Home.md" -o -name "Index.md" -o -name "MOC.md"

# Find the largest content folders
find "/path/to/vault/" -name "*.md" | wc -l
```

### 2. Create Project Structure
If projects don't have dedicated folders yet:
```bash
# Create work project hub
mkdir -p "/path/to/vault/Projects/[ProjectName]"

# Create personal space (agents must NOT access)
mkdir -p "/path/to/vault/Personal"
```

### 3. Write Dashboard for Each Project
```bash
# Create Projects/[ProjectName]/Dashboard.md
# Include:
# - Quick status summary (numbers, completion %)
# - Active automation/cron jobs table
# - Connected projects and how they relate
# - Link back to vault's central MOC
```

### 4. Write Personal Dashboard
```bash
# Create Personal/Dashboard.md
# Include:
# - Clear statement: "Agents should NOT access this folder unless explicitly asked"
# - What types of content go here
# - Privacy boundaries
```

### 5. Write AI-INSTRUCTIONS.md
Create `MOC/AI-INSTRUCTIONS.md` so any agent knows immediately:
- Who the user is and what projects exist
- Which folders are off-limits (Personal/)
- Communication preferences (WhatsApp plain text, WhatsApp no markdown, etc.)
- Key file paths to critical documents
- Rules like "use ALL data points, never a subset"
- Agent behavior rules ("do it all" = autonomous, no confirmation)

YAML frontmatter:
```yaml
---
tags: [system, agent-instructions]
---
```

### 6. Update Home MOC
Update the central `MOC/Home.md` to:
- Show active projects in a table with links to their dashboards
- List navigation indexes with accurate counts and links
- Add a Workspace table showing each folder's purpose
- Add a cross-project connections section (how data flows between projects)
- Add automation status section (what's running, what's paused)
- Never remove existing navigation links — only add

### 7. Cross-Reference Related Projects
If a new project connects to existing content:
- Link new project pages to existing wiki/location/family pages
- Document the connection pattern (e.g. "Shoebox photos tagged 'Batoche' link to wiki/Locations/Batoche.md")
- Add the new project to the Home MOC navigation

### 8. Update Memory
Save the vault path, key file paths, and project connections to long-term memory so future sessions know the structure.

## Template: AI-INSTRUCTIONS.md
```markdown
---
tags: [system, agent-instructions]
---

# AI Agent Instructions

## Identity
This vault belongs to **[Name]** who is leading **[Project/Role]**.

## Projects
1. **[Project A]** — [Brief scope]
2. **[Project B]** — [Brief scope]

## Rules
- **Personal/** folder is PRIVATE. Do not read, process, or reference it unless the user explicitly asks.
- When the user says "do it all" - proceed autonomously with your best judgment.
- When working on [specific task], use ALL data points from the source. Never use a subset.
- For delivery format, follow: [specific format requirements]
- When producing files, use clear folder structures
- For tasks with no details, ask clarifying questions before starting.

## Key Files
- Dashboard: [[../Projects/ProjectA/Dashboard]]
- [Other critical files]

## Communication Preferences
- User prefers [format/style] for [delivery medium].
- User wants [progress detail level] updates.
```

## Full Vault Reorganization (Numbered Folders)

When the user wants a numbered folder structure (00-Home, 01-Settlements, etc.) instead of
additive optimization:

1. **Audit first** — scan all directories (`wiki/`, `outbox/`, project folders) to map every `.md` file
2. **Build move plan** — create (src, dst) pairs with a folder numbering scheme. Use Python `shutil.copy2` + `os.remove` for safe moves (preserves metadata).
3. **Create numbered folders** — typical scheme:
   - `00-Home` — Agent rules, AI instructions, central INDEX
   - `01-*` — Primary content (settlements, locations, people, things)
   - `02-*` — Secondary content (themes, topics, narratives)
   - `03-*` — Cross-references (families, relationships)
   - `04-09` — Supporting content (map layers, images, templates, etc.)
   - `80-*` — Geographic/regional organization
   - `99-*` — Project management, status reports
4. **Execute atomically** — run all moves in a single Python script. Deduplicate src paths first.
5. **Generate INDEX.md per section** — every numbered folder gets an index with wikilinks to all child pages, TLDR, and file counts.
6. **Generate central INDEX** — 00-Home/INDEX.md links to all sections with counts.
7. **Update AGENT_RULES** — fix any hardcoded path references in agent instruction files.
8. **Clean old structure** — remove empty legacy folders (`wiki/`, `outbox/`) after confirming move count matches expectations.

```python
# Safe move pattern:
import shutil, os
for src, dst in moves:
    if os.path.exists(src):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)
        os.remove(src)
```

## Common Pitfalls
- **Don't move files without auditing first** — always print the full move plan before executing
- **Deduplicate source paths** — the same file might be matched by multiple rules
- **Use shutil.copy2 not os.rename** — cross-filesystem moves fail with rename; copy2 works everywhere
- **Preserve subfolder structure** — when moving wiki/locations/settlements/, keep the settlements/ subfolder
- **Generate wikilinks carefully** — use `[[folder/filename|Display Title]]` format, not bare file extensions
- **Keep AI-INSTRUCTIONS.md under ~2000 characters** — if it's too long, agents won't read all of it
