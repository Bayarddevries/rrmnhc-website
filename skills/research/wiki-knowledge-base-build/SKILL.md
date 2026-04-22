---
name: wiki-knowledge-base-build
description: Build and maintain an LLM-managed wiki knowledge base using the Karpathy framework — 7 rules for separating vaults, classifying sources, TLDRs, query filing, scale planning, and lint passes. Adaptable to any research-intensive project.
version: 1.0
author: Hermes Agent + Bayard DeVries
created: 2026-04-06
tags: [wiki, knowledge-base, research, karpathy-framework, llm-maintained, obsidian, markdown]
---

# Wiki Knowledge Base Building — Karpathy Framework

Based on the viral LLM-maintained wiki architecture from Karpathy/Shann Holmberg. 7 rules for building a knowledge base that the LLM can maintain and the user can curate.

## WHEN TO USE
- You have 20+ research items that need organization
- The user wants TLDRs, sourcing, and cross-links on every entry
- The LLM will be adding to and maintaining the knowledge base over time
- You need to separate agent-generated content from personal notes

## DIRECTORY STRUCTURE

```
project-root/
├── personal-notes/          ← User's thinking only. Agent NEVER touches.
├── wiki/
│   ├── KNOWLEDGE_BASE.md    ← Master overview + priority TLDRs
│   ├── SOURCES.md           ← Master source index with confidence levels
│   ├── AGENT_RULES.md       ← The 7 rules (adapted for this project)
│   ├── templates/           ← Reusable page templates
│   │   └── location-template.md
│   ├── locations/           ← Primary content, organized by category
│   │   ├── category-a/
│   │   ├── category-b/
│   │   └── ...
│   ├── themes/              ← Cross-cutting topics
│   ├── sources/             ← Source docs with extraction notes
│   ├── queries/             ← Research queries that produced valuable results
│   └── agents/              ← Lint reports, maintenance logs
├── queries/                 ← Active research queries
└── outbox/                  ← Deliverables for the user
```

## THE 7 RULES

### Rule 1: Separate the vaults
- Agent workspace (wiki/) must NEVER mix with user's personal notes (personal-notes/)
- Agent never reads, writes, or suggests anything in personal-notes/
- Personal notes stay high signal

### Rule 2: Classify every source before extracting
Don't treat every document the same. Type determines extraction depth:

| Source Type | Extraction Depth |
|---|---|
| Oral history / community knowledge | Full — quotes, narratives, place names, kinship |
| Academic paper / research | Key claims + evidence + methodology + gaps |
| Archival document (community perspective) | Full context |
| Archival document (opposing/colonial) | Critical reading — extract facts but flag framing |
| Map / GIS data | Spatial — coordinates, boundaries, temporal coverage |
| News article | Key claims + whose voices are centered |

### Rule 3: Every page must include counter-perspective and data gaps
Every entry answers:
- What does the dominant/opposing record say?
- What does community knowledge say that's different?
- Where is the record silent?
- What needs community verification?

### Rule 4: TLDR on every page
Every wiki page starts with a TLDR (1–3 sentences) immediately after the frontmatter. Used for index scanning.

### Rule 5: File query results back into the wiki
When a research question produces a valuable answer → save as a new wiki page. Best thinking never disappears into chat history.

### Rule 6: Plan for scale from day one
- Frontmatter on every page (title, type, category, tags, created, updated, related pages, confidence)
- Naming conventions: wiki/{category}/{item-name}.md
- Index files per category
- Cross-links between related pages

### Rule 7: Run lint passes periodically
After every 5–10 page additions:
- Find contradictions between pages
- Flag claims newer sources have updated
- Spot orphan pages with no inbound links
- Suggest concepts mentioned but missing their own page
- Verify confidence levels are accurate

## PAGE TEMPLATE

```yaml
---
title: "[Name]"
type: [location | theme | source | query-result]
category: [category]
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: []
confidence: [verified | likely | oral-tradition | community-consulted | archival-only]
related_pages: []
---

> TLDR: [1–3 sentences]

## Overview
[What this is, who, when, why it matters]

## Detail Sections
[As needed for the domain]

## Counter-Perspective and Data Gaps
- [What dominant records say vs. community knowledge]
- [What's missing]
- [What needs verification]

## Sources
| Source | Type | Confidence | Notes |
|--------|------|-----------|-------|

## Related Pages
- [[Page 1]] — [why]
- [[Page 2]] — [why]
```

## SOURCE CONFIDENCE LEVELS
- **Verified**: Multiple independent community-centered sources confirm
- **Likely**: Strong evidence from community or allied sources
- **Oral Tradition**: Community knowledge passed through generations
- **Community Consulted**: Verified through direct community engagement
- **Archival Only**: Only in opposing/government records — flag for review

## LINT CHECKLIST (run every 5–10 pages)
- [ ] Find contradictions between pages
- [ ] Flag outdated claims
- [ ] Spot orphan pages (no inbound links)
- [ ] Suggest missing concept pages
- [ ] Verify TLDRs are useful for scanning
- [ ] Check confidence levels match actual sourcing
- [ ] Ensure opposing framing has been flagged where relevant

## PITFALLS
- **Subagent isolation**: Subagents write to their sandbox, which the main session can't access. Write wiki content directly from the main session.
- **Web search failures**: If web_search or web_extract fail, fall back to browser_snapshot with full=true or existing knowledge.
- **Colonial framing**: When building knowledge bases about marginalized communities, always flag when colonial/opposing sources dominate the record. Note what community knowledge fills the gap.
- **JSON in HTML**: If extracting data from embedded JSON in HTML, use Python's json module after regex-extracting the array. Don't try to parse HTML directly.
