---
name: metis-heritage-vault-research
description: Conduct deep research on Red River Métis history, write comprehensive Obsidian wiki files, and manage the numbered vault structure.
category: research
---

# Métis Heritage Vault Research and Management

## When to use this skill
- User wants to deep-research a Metis heritage topic (e.g., "Metis Women", "Michif Language", "Fur Trade").
- User wants to audit, reorganize, or expand the Obsidian vault.
- User wants to create a new theme or location page in the vault.

## Research Tool Fallback Chain (Critical)
The free web search tool frequently returns `400 Bad Request`. Use this strict fallback chain:
1. **Direct URL Extraction (`web_extract`)**: Hit known-good academic sources directly.
   - `https://www.thecanadianencyclopedia.ca/en/article/[topic]`
   - `https://en.wikipedia.org/wiki/[Topic]`
   - `https://mbmetis.ca/history/`
2. **Browser Tools (`browser_navigate` + `browser_snapshot`)**: If `web_extract` fails or blocks scraping, navigate to the URL and take a snapshot or use `browser_vision` to read the article.
3. **Internal Knowledge Fallback**: If all external tools fail, write the file using your deep internal knowledge of Metis history. You have extensive training data on this. **DO NOT hallucinate URLs.** Cite real, known authors and books (see "Verified Sources" below).

## Obsidian Theme File Template
Every theme file must follow this exact format:
```markdown
---
tags: [story-theme, metis-homeland]
created: YYYY-MM-DD
importance: High
---

> TLDR: [1-3 sentences summarizing the theme]

## Historical Overview
[Comprehensive narrative with dates, specific events, and Metis perspective.]

## Key Events / People / Examples
- [Specific date]: [Event]
- [Person]: [Role/Impact]

## Metis Response & Resilience
[How the community resisted, adapted, or survived.]

## Sources & Further Reading
- [Real citations only: Author. Title. Publisher, Year.]
```

## Verified Source List (Use these for citations)
Never make up citations. These are confirmed, real works frequently cited in Metis scholarship:
- **Daschuk, James.** *Clearing the Plains: Disease, Politics of Starvation, and the Loss of Aboriginal Life.* University of Regina Press, 2013.
- **Ens, Gerhard J.** *Homeland to Hinterland: The Changing Worlds of the Red River Metis.* University of Toronto Press, 1996.
- **Spry, D.N.** *The Paper Trail to the Manitoba Metis Land Grant.* University of Regina Press, 1985.
- **Teillet, Jean.** "The Never-Ending Battle for Metis Land Rights." (Indigenous Law Journal).
- **Barkwell, Lawrence J.** *The Red River Cart and Trails.* Gabriel Dumont Institute.
- **Pannekoek, Frits.** *A Snug Little Flock: The Social Origins of the Riel Resistance.* 1991.
- **Macdougall, Brenda.** *One of the Family: Metis Culture in the Fur Trade.* UBC Press, 2010.
- **Manitoba Metis Federation.** *Harvesting Policy & Historical Research.* (mbmetis.ca).
- **Flanagan, Thomas.** *Riel and the Rebellion.* 2000.
- **Comack, Elizabeth, et al.** *Rooster Town: The History of an Urban Metis Community, 1901-1961.* 2018.

## File Naming & Cleanup (Pitfalls)
- **Subagent Duplicates**: When using `delegate_task`, subagents often create both `Theme-Name.md` (hyphenated) and `Theme Name.md` (spaced). Always run a cleanup script afterward to delete the shorter duplicate.
- **Numbered Folders**: The vault uses numbered folders: `00-Home`, `01-Settlements`, `02-Themes`, `03-Families`, `04-Map-Layers`, `05-Routes-Trails`, `06-Images`, `07-Rights-Legal`, `08-Sources-Queries`, `09-Templates`, `80-Regions`. Save theme files to `02-Themes/`.

## Vault Consolidation Workflow
If asked to organize the vault:
1. Create the numbered folder targets (`00-Home`, `01-Settlements`, etc.).
2. Write and execute a Python script to move files from old `wiki/` subfolders into the numbered folders (e.g., `wiki/locations/settlements/` -> `01-Settlements/settlements/`).
3. Generate an `INDEX.md` for every section containing Obsidian `[[wiki-link]]` to every file.
4. Delete the old empty `wiki/` directories.
5. Update `00-Home/AGENT_RULES.md` to reflect the new paths.