---
name: metis-research-vault-standards
description: Standards, structure, quality controls, and workflows for managing the Red River Métis Heritage Research Vault. Includes numbered folder schema, theme file standards, deep research fallbacks when web tools fail, and peer review workflow.
---

# Métis Research Vault Standards

## 1. Standard Numbered Vault Structure
The vault uses a numbered folder system for consistent Obsidian navigation:

```
00-Home/              # AGENT_RULES.md, AI-INSTRUCTIONS.md, INDEX.md, lint reports
01-Settlements/       # 234+ location wiki pages (subfolders: settlements, forts, parishes, wintering-sites, road-allowance, etc.)
02-Themes/            # Base + Compound themes (historical narratives)
03-Families/          # 18 family/kinship pages
04-Map-Layers/        # Interactive map layer definitions
05-Routes-Trails/     # Cart trails, boat routes, research briefs
06-Images/            # Sourcing guides, photo manifests, search results
07-Rights-Legal/      # River lot system, scrip, treaties, displacement contexts
08-Sources-Queries/   # Research queries, source docs, verification baseline
09-Templates/         # Wiki entry templates
80-Regions/           # 18 regional homeland overviews
99-Project-Management/ # Reports, issues, peer reviews, scripts
```

**Rules:**
- Generate an `INDEX.md` for every section.
- Remove old duplicate indexes (e.g., `Families-Index.md`, `Story Themes-Index.md`). Keep only `INDEX.md`.
- Use **spaced filenames** for Obsidian compatibility (e.g., `Metis Women and Matriarchs.md`). Clean up hyphenated duplicates.
- When consolidating, use a Python script to map and move files, then verify counts and write a `VAULT_CONSOLIDATION_*.md` report to `99-Project-Management/`.

## 2. Theme File Quality Standards
Every Base Theme file in `02-Themes/` must meet these standards:

**Frontmatter (Required):**
```yaml
---
tags: [story-theme, metis-homeland, relevant-keyword]
created: YYYY-MM-DD
importance: Critical/High/Medium/Low
---
```

**Structure (Required):**
1. `> TLDR:` (1-2 sentences summarizing the theme)
2. `## Historical Overview` (Métis-centred narrative)
3. `## Key Events / Practices` (Dates, policies, specific examples)
4. `## Case Studies / Community Examples` (Named locations/communities)
5. `## Métis Response / Resilience` (Agency, survival, modern continuity)
6. `## Sources & Further Reading` (Minimum 5 real, verifiable citations)
7. `## Related Themes` ([[wikilinks]] to related base + compound themes)

**CRITICAL Quality Rules (From Peer Review):**
- **NO Wikipedia as a primary source.** It may be used for initial context but must never appear in the source list for exhibit-ready material.
- **NO fabricated citations.** If you cannot verify a book, article, or author, do not include it. Use "real + verifiable" sources only (e.g., Ens, Chartrand, Teillet, Barkwell, MMF reports, The Canadian Encyclopedia, TRC reports).
- **Verify Métis identity.** Do not include non-Métis individuals in "Métis [Group]" files unless explicitly framed as allies/collaborators.
- **Cross-reference everything.** Every file must end with `[[wikilinks]]` to related themes in `02-Themes/`.
- **Centre Métis Voices.** Focus on agency, resilience, and self-determination, not just victimhood. Use first-person perspectives where possible.

## 3. Deep Research Workflow (Web Tool Fallback)
Web tools (`web_search`, `web_extract`) frequently return `400 Bad Request` errors for this project. Use this fallback pipeline:

1. **Browser Research:** Use `browser_navigate` to access Wikipedia, The Canadian Encyclopedia, or MMF/LRI sites directly.
2. **Vision Extraction:** Use `browser_vision` with a prompt like: `"Extract all content about [topic], including named individuals, dates, events, and cited sources."`
3. **Knowledge + Verification:** Write the content from comprehensive training data, but strictly cross-reference with the browser-extracted facts and only cite sources that are known to be real and verifiable (e.g., *The Canadian Encyclopedia*, peer-reviewed authors like Gerhard Ens, Larry Chartrand, Jean Teillet, Lawrence Barkwell).
4. **Peer Review:** ALWAYS run the peer review workflow after writing to catch hallucinated citations or factual errors.

## 4. Peer Review Workflow
Use `delegate_task` to run a peer review of heritage content before finalizing.

```python
delegate_task(
    goal="Peer review theme files for factual accuracy, citation reliability, Métis-centring, and exhibit readiness.",
    context="""
    Review files in /02-Themes/. Check for:
    1. Citation Quality: Are sources real? NO Wikipedia or fabricated citations. 
    2. Métis-Centring: Does it centre Métis voices? Remove non-Métis from Métis-specific categories.
    3. Structural Consistency: Frontmatter, TLDR, Required Sections, 5+ Sources, Cross-linking.
    4. Factual Accuracy: Check dates, names, events.
    5. Exhibit Readiness: Can it be used for museum panels?
    Save report to /02-Themes/PEER_REVIEW_THEMES.md
    """,
    toolsets=["terminal", "file", "web"],
    max_iterations=50
)
```

## 5. Karpathy's "Second Brain" Framework Alignment
Based on comparison with the Karpathy second brain paradigm (the vault IS a Karpathy-style AI-maintained wiki):

**What we do well:**
- AI writes, human curates. No database, no embeddings, just folders and text files.
- `RAW/` folder preserved as immutable source material.

**Critical additions needed (from peer review):**
- **No `CLAUDE.md` / Schema File:** We have `AGENT_RULES.md` but it's philosophical, not operational. Create a `00-Home/SCHEMA.md` that tells agents: "When you ingest a source, do X. When you get a query, do Y. When it's maintenance time, do Z."
- **No `log.md`:** Create `00-Home/log.md` — append-only chronological record. Format: `## [YYYY-MM-DD] Action | Description` (Actions: ingest, query, lint, update, write).
- **No Contradiction Flagging:** When new research conflicts with existing content, flag it explicitly: `**Contradiction:** [old claim] vs [new claim] from [source]`.
- **Standardize Frontmatter:** Every file needs the same fields. Create a template.

## 6. Design Systems Reference Library
59 real-world design system files (DESIGN.md) cloned at `~/design-systems-reference/design-md/`. Covers Apple, Linear, Notion, Spotify, Coinbase, IBM, Vercel, Ferrari, SpaceX, Claude, Figma, and more. Use these when building any web UI for the Heritage Centre map or future exhibit interfaces. Reference via the `design-systems-reference` skill.

## 7. Common Pitfalls
- **Hyphenated vs Spaced names:** Subagents often create `Theme-Name.md` while the vault uses `Theme Name.md`. Always check and unify naming.
- **Stub Compound Themes:** Compounds (e.g., `Land Dispossession Community Destruction.md`) often end up as 12-line stubs. Either expand them to 500+ words with real analysis or merge them into base themes and use cross-references instead.
- **Frontmatter Drift:** Agents inconsistently add `title` or `importance`. Ensure they match the standard exactly.
- **Fabricated Citations:** Subagent deep research frequently invents book titles and article citations. ALWAYS verify: Can you confirm this book/article exists? If not, replace with a known-verifiable source (Ens, Teillet, Sprague, Macdougall, Pannekoek, Morton, Peterson, Barkwell, MMF, Canadian Encyclopedia).
- **Wikipedia as Source:** Never include Wikipedia in final source lists for exhibit-ready material. It's fine as a starting point but must be replaced with the academic sources Wikipedia itself cites.
- **Non-Métis in Métis Files:** Never include non-Métis individuals in files titled "Métis [Group]" unless explicitly framed as allies/collaborators/ancestors.