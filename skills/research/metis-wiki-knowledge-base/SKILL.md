---
name: metis-wiki-knowledge-base
description: Build and maintain a Métis-centered knowledge base with strict agent rules, sourced location pages with TLDRs, and clear separation between research vault and personal notes. Based on the Karpathy LLM-wiki framework adapted for community-centered heritage research.
version: 1.0
author: Hermes Agent
created: 2026-04-06
tags: [knowledge-base, wiki, metis, heritage, research, sourcing, obsidian, agent-rules]
---

# Métis Homeland Knowledge Base — Organization Skill

Build and maintain a research vault for Métis homeland locations with:
- Strict separation between agent-generated content and personal notes
- TLDRs on every wiki page for quick scanning
- Métis-centered sourcing with confidence levels
- Lint passes for consistency maintenance

## WHEN TO USE
- Organizing homeland location research for heritage projects
- Building structured knowledge bases from CSV/map data
- Creating wiki pages with proper sourcing for 228+ locations
- Any heritage research where colonial framing must be flagged and countered

## VAULT STRUCTURE

```
metis-research-vault/
├── personal-notes/          ← User's thinking only. Agent NEVER touches.
├── wiki/
│   ├── KNOWLEDGE_BASE.md    ← Master overview with priority TLDRs
│   ├── SOURCES.md           ← Master source index with verification status
│   ├── AGENT_RULES.md       ← The 7 rules adapted for Métis research
│   ├── templates/
│   │   └── location-template.md   ← Wiki page template
│   ├── locations/
│   │   ├── settlements/     ← 57 settlements
│   │   ├── forts/           ← 27 forts/trading posts
│   │   ├── parishes/        ← 18 parishes
│   │   ├── road-allowance/  ← 22 road allowance communities
│   │   ├── wintering-sites/ ← 8 wintering sites
│   │   ├── historic-sites/  ← 9 battle/historic sites
│   │   ├── trading-posts/   ← 6 trading posts
│   │   └── governance/      ← 6 governance/rights sites
│   ├── themes/              ← Cross-cutting themes
│   ├── sources/             ← Source documents with extraction notes
│   ├── queries/             ← Research query results saved as pages
│   └── agents/              ← Agent logs, lint reports
├── queries/
└── outbox/                  ← Files for delivery (maps, reports)
```

## THE 7 AGENT RULES

### 1. NEVER mix agent content with personal notes
- Agent workspace: `wiki/`, `queries/`
- Personal notes: `personal-notes/` — NEVER read, write, or suggest here

### 2. Classify every source before extracting
| Source Type | Extraction Depth |
|---|---|
| Oral history / community knowledge | Full — quotes, narratives, place names, kinship |
| Métis-authored academic / MMF publications | Key claims + evidence + what Métis voices included |
| Métis archival documents (letters, petitions) | Full context |
| Colonial/government archives | Critical — extract facts but flag framing bias |
| Map / GIS data | Spatial — coordinates, boundaries, what maps leave out |
| Non-Métis academic work | Read for data, center Métis voices in interpretation |

### 3. Every page must include counter-perspective and data gaps
Because we're centering Métis voices, counter-questions mean:
- What do colonial records say about this place? (Extract but clearly label)
- What do Métis oral histories say that colonial records get wrong or leave out?
- Where is the record silent? (Archives that never documented Métis life)
- What does the community know that isn't written down?

### 4. TLDR on every page
One to three sentences immediately after frontmatter. Lets the user scan the whole index fast.

### 5. File query results back into the wiki
When a research question produces a useful answer → save as new wiki page in `queries/`. Best thinking never disappears into chat history.

### 6. Plan for scale from day one
Every wiki page has YAML frontmatter: title, type, category, lat/lon, founded_year, created, updated, tags, location_priority, source_confidence, related_pages

### 7. Run lint passes after every 5–10 page additions
[ ] Find contradictions between pages
[ ] Flag claims newer sources have contradicted
[ ] Spot orphan pages with no inbound links
[ ] Suggest missing concept pages
[ ] Check TLDRs are actually useful
[ ] Verify source confidence levels
[ ] Ensure colonial framing has been flagged where relevant

## WIKI PAGE TEMPLATE

```yaml
---
title: "[LOCATION NAME]"
type: location
category: [settlement|fort|parish|road-allowance|wintering-site|historic-site|trading-post|governance]
latitude: 
longitude: 
founded_year: 
created: 2026-04-06
updated: 2026-04-06
tags: []
location_priority: [High|Medium|Low]
source_confidence: [verified|oral-tradition|needs-review]
related_pages: []
---

> TLDR: [One to three sentences. What this place was, who was here, why it matters.]

## Overview
[What this place was, when established, who lived here, role in Métis homeland]

## Community Life
[Daily life, families, cultural practices, how community organized itself]

## Historical Significance
[What happened here, why it matters in Métis history]

## The Land
[Geographic features, land use, river lots, trails, gathering places]

## What Remains
[Today's state, commemoration, access]

## Counter-Perspective & Data Gaps
- **Colonial archive says:** [what records say, clearly labeled as colonial]
- **Métis community says:** [oral history and community knowledge]
- **What's missing:** [what we still need, who to consult]

## Sources
| Source | Type | Confidence | Notes |
|--------|------|-----------|-------|

## Related Locations
- [[Related 1]] — [why related]
- [[Related 2]] — [why related]
```

## SOURCE CONFIDENCE LEVELS
- **Verified**: Multiple independent Métis-centered sources confirm
- **Likely**: Strong evidence from Métis or allied sources
- **Oral Tradition**: Community knowledge passed through generations
- **Community Consulted**: Verified through direct community engagement
- **Archival Only**: Only in colonial/government records — flag for review

## SOURCE PRIORITY (most to least authoritative)
1. Métis oral history / community knowledge — gold standard
2. Métis-authored academic work / MMF publications
3. Archival documents from Métis perspectives
4. Colonial/government archives — useful for dates but flag framing
5. Non-Métis academic work — read for data, center Métis interpretation

## WHAT TO FLAG IN SOURCES
- "Rebellion" → should be "resistance" (sovereignty defense, not rebellion against legitimate authority)
- Passive voice obscuring harm ("land was taken" → "the Canadian government seized land")
- "Settler" used neutrally for colonizers who displaced Métis families
- Accounts centering HBC/NWC while ignoring Métis agency
- Land descriptions erasing prior Métis occupancy

## BULK WIKI GENERATION WORKFLOW

When rewriting 200+ location stubs into proper wiki pages:

1. **Read all stubs and map data in one execute_code call:**
```python
import os, json, re
html_path = "/path/Interactive_Homeland_Map_stories_backup.html"
with open(html_path, 'r') as f:
    content = f.read()
locs_match = re.search(r'var locs\s*=\s*(\[[\s\S]*?\]);', content)
locs = json.loads(locs_match.group(1))
```

2. **DO NOT use delegate_task for file writes** — subagents run in isolated sandboxes and cannot access the main filesystem. Always use `execute_code` with `write_file` or direct Python `open()`.

3. **Use a TYPE_TO_DIR mapping dict** to assign each location to the correct subdirectory. Keep the mapping explicit (see below).

4. **Write all pages in a single execute_code call** — 200+ pages can be generated in under 2 seconds using Python string formatting. No web search needed.

5. **Slug generation — clean version:**
```python
def make_slug(name):
    s = name.lower()
    for accented, base in [('é','e'),('è','e'),('ê','e'),('î','i'),('ô','o'),('û','u'),('à','a'),('ç','c')]:
        s = s.replace(accented, base)
    s = s.replace("'", '').replace("'", '').replace('/', ' ')
    s = re.sub(r'[^a-z0-9\s]', ' ', s)
    return re.sub(r'\s+', '-', s.strip())
```

6. **After generation, remove the old stub directory:** `shutil.rmtree(stubs_dir)`

**PRIORITY BATCH ORDER**: 1) Priority locations first (hand-write these with rich narrative), 2) Bulk-generate remaining by category (Settlements → Forts → Parishes → Trading Posts → Road Allowance → Wintering Sites → Historic Sites → Landmarks).

## FULL TYPE_TO_DIR MAPPING
```python
TYPE_TO_DIR = {
    'Settlement': 'settlements', 'Settlement (Abandoned)': 'settlements',
    'Settlement (Destroyed)': 'settlements', 'Settlement (Displaced)': 'settlements',
    'Settlement (Flooded)': 'settlements', 'Settlement (Lumber Towns)': 'settlements',
    'Settlement (Mining town)': 'settlements', 'Settlement (Railway)': 'settlements',
    'Settlement (Relocated)': 'settlements', 'Settlement (River Lot)': 'settlements',
    'Settlement (Wintering site)': 'wintering-sites',
    'Settlement / Fort': 'forts', 'Settlement / Landmark': 'landmarks',
    'Settlement / Parish': 'parishes', 'Settlement / Rendezvous Site': 'settlements',
    'Settlement / Road Allowance': 'road-allowance',
    'Settlement / Stopping Point': 'settlements',
    'Settlement / Sugar Bush Site': 'settlements',
    'Settlement / Trading Post': 'trading-posts',
    'Settlement / Transportation Hub': 'landmarks',
    'Settlement / Transportation site': 'landmarks',
    'Settlement / Wintering site': 'wintering-sites',
    'Settlement Hub': 'settlements', 'Seasonal Camp / Hunt site': 'wintering-sites',
    'Fort / Trading Post': 'forts', 'Fort / Settlement': 'forts',
    'Fort / Settlement / Depot': 'forts', 'Fort / administrative center': 'forts',
    'Forts / Trading Posts': 'forts', 'Historic Site / Fort': 'forts',
    'Trading Post': 'trading-posts', 'Trading Outpost': 'trading-posts',
    'Trading Post (Outpost)': 'trading-posts',
    'Trading Post / Agricultural site': 'trading-posts',
    'Trading Post / Farm': 'trading-posts', 'Trading Post / Farm Depot': 'trading-posts',
    'Trading Post / Wintering site': 'trading-posts',
    'Trading Post site / Settlement': 'trading-posts',
    'Parish / Settlement': 'parishes', 'Parish / Settlement Hub': 'parishes',
    'Mission': 'parishes', 'Mission / Settlement': 'parishes',
    'Mission / Settlement site': 'parishes', 'Mission / Trading Post': 'parishes',
    'Road Allowance Community': 'road-allowance',
    'Geographic Landmark': 'landmarks', 'Landmark': 'landmarks',
    'Landmark / Settlement': 'landmarks', 'Geographic Feature': 'landmarks',
    'Historic Sanctuary': 'landmarks', 'Historic / Ceremonial Site': 'historic-sites',
    'Historic / Defensive Site': 'historic-sites', 'Historic Site': 'historic-sites',
    'Historic Site (Defensive)': 'historic-sites', 'Historic Site / Landmark': 'historic-sites',
    'Sanctuary / Landmark': 'landmarks',
    'Traditional Harvesting Site': 'landmarks', 'Traditional Harvesting Area': 'landmarks',
    'Transportation Route': 'landmarks', 'Transportation Hub': 'landmarks',
    'Transportation Landmark': 'landmarks', 'Meeting Site / Rendezvous': 'historic-sites',
    'Gathering / Recreation Site': 'landmarks', 'Reserved Lands / Settlement': 'settlements',
}
```

## GIT WORKFLOW FOR THE RESEARCH VAULT

- **Map updates** (Interactive_Homeland_Map.html): commit from `Heritage Centre/` subdirectory
  ```
  cd ~/Documents/metis-research-vault/Heritage\ Centre
  git add -A && git commit -m "message" && git push origin main
  ```
- **Wiki updates** (226 location pages): these are in the main vault but NOT in the git repo yet. The Heritage Centre is the only git-tracked directory.
- **Live map URL**: `https://bayarddevries.github.io/Hermes/Interactive_Homeland_Map.html`

## BULK WIKI GENERATION WORKFLOW (LESSONS FROM IMPLEMENTATION)

**CRITICAL: Do NOT use delegate_task for wiki file writes.** Subagents run in isolated sandboxes and write to their own /tmp. I lost a batch of 72 locations because the subagent wrote to /tmp in its sandbox which I cannot access from the main session.

**Correct approach:**
1. Parse all stub data + map embedded JSON in ONE execute_code call
2. Build all 200+ wiki page strings in Python using string formatting  
3. Write all files in the SAME execute_code call
4. This generates 200+ pages in under 2 seconds

**Data extraction:**
```python
import os, json, re
html_path = "~/Documents/metis-research-vault/Heritage Centre/Interactive_Homeland_Map_stories_backup.html"
with open(html_path, 'r') as f:
    content = f.read()
locs_match = re.search(r'var locs\s*=\s*(\[[\s\S]*?\]);', content)
locs = json.loads(locs_match.group(1))
```

**Slug generation:**
```python
def make_slug(name):
    s = name.lower()
    for accented, base in [('é','e'),('è','e'),('ê','e'),('î','i'),('ô','o'),('û','u'),('à','a'),('ç','c')]:
        s = s.replace(accented, base)
    s = s.replace("'", '').replace("'", '').replace('/', ' ')
    s = re.sub(r'[^a-z0-9\s]', ' ', s)
    return re.sub(r'\s+', '-', s.strip())
```

**Type to directory mapping:**
- Settlement types → `settlements/`
- Fort types → `forts/`
- Parish/Mission → `parishes/`
- Trading Post types → `trading-posts/`
- Road Allowance → `road-allowance/`
- Wintering site → `wintering-sites/`
- Historic Site → `historic-sites/`
- Landmark/Transportation/Harvesting → `landmarks/`

**Web search caveat:** web_search can fail with 400 errors during batch operations. Rely on existing map data and stub metadata for bulk generation. Hand-write priority locations with richer narrative when possible.

## PITFALLS
- **DO NOT use delegate_task for wiki creation** — subagents write to isolated sandboxes. Use execute_code in main session.
- **Web search can fail with 400 errors** — use browser or existing knowledge as fallback
- **Extracting data from embedded JSON in HTML**: use `re.search(r'var locs\s*=\s*(\[[\s\S]*?\]);', content)` then `json.loads()`
- When stripping fields from map HTML, verify after write by re-reading from disk
- Always use `get_hermes_home()` for file paths, never hardcode `~/.hermes`
- `personal-notes/` is the user's space — NEVER read, write, or suggest in it

- **Duplicate images**: Check for exact byte-duplicates across `RAW/Photos/` and `outbox/images/` — keep only one source of truth.
- **Empty directories**: Recreate empty category dirs (forts, trading-posts, etc.) after cleanup so the structure is ready for future pages.

## IMAGE INTEGRATION INTO WIKI PAGES

**Curated local images** (IMAGE_MANIFEST.json in RAW/Photos/) map specific locations to specific historical photos. Use these:

```python
import os, json

with open("RAW/Photos/IMAGE_MANIFEST.json") as f:
    img_manifest = json.load(f)

# IMAGE_MANIFEST maps: location_name -> [list of filenames in RAW/Photos/]
# Slug must match wiki page filenames exactly
def name_to_slug(name):
    s = name.lower()
    for fr, to in [('é','e'),('è','e'),('ê','e'),('î','i'),('ô','o'),('û','u'),('ù','u'),('à','a'),('â','a'),('ç','c')]:
        s = s.replace(fr, to)
    s = re.sub(r"[^a-z0-9\s]", ' ', s)
    s = s.replace("'", '').replace("'", '').replace('/', ' ')
    return re.sub(r'\s+', '-', s.strip()).strip('-')

for loc_name, image_files in img_manifest.items():
    slug = name_to_slug(loc_name)  # e.g. "Ash House (Fort de la Frèniere)" -> "ash-house-fort-de-la-freniere"
    # Search wiki/locations subdirectories for {slug}.md
    # Insert ## Images section before ## Data Gaps or ## Sources
    # Use relative paths to RAW/Photos/ from wiki page location
```

**Wikimedia auto-search images (COMBINED_MANIFEST.json) are mostly irrelevant.** The automated search returns anything matching the place name regardless of geographic/relevance. For example "Bacon Ridge" returns photos of Bacon Ridge Maryland, not Manitoba. DO NOT auto-embed these without human review.

**Image integration order of operations:**
1. IMAGE_MANIFEST.json curated photos → auto-add to matching wiki pages
2. Hand-written priority pages → add from RAW/Photos/ manually
3. Remaining 200+ locations → need manual sourcing from archives (MMF collections, Library and Archives Canada, provincial archives)
4. Generate IMAGE_SOURCING_QUEUE.md listing all locations needing images by category

## HISTORICAL TRAILS LAYER INTEGRATION

Trail data is in `trails_data.json` (39 routes: 23 cart trails, 16 boat routes). To add to the map:

1. **Read trail JSON** — each trail has name, type (cart/boat), year range, description, and waypoint coordinates (lat/lon pairs)
2. **Generate Leaflet polylines** — brown (#8B4513) for cart trails, blue dashed (#2980B9) for boat routes
3. **Interpolate sparse points** — for cart trails with gaps >200km, add intermediate waypoints (0.5-degree spacing) so lines render smoothly on the map
4. **Build toggleable checkboxes** — one checkbox per trail, plus Select All/Deselect All buttons
5. **Inject as new sidebar panel** — position top-right, alongside the existing layer filters
6. **Inject JS before closing script** — create L.polyline for each trail, bind to checkbox events

```python
# Interpolate waypoints for long cart trail segments
def interpolate_points(wp1, wp2, min_spacing_degrees=0.5):
    lat1, lon1 = wp1
    lat2, lon2 = wp2
    delta_lat = lat2 - lat1
    delta_lon = lon2 - lon1
    distance = math.sqrt(delta_lat**2 + delta_lon**2)
    if distance <= min_spacing_degrees:
        return [wp2]
    num_points = int(distance / min_spacing_degrees)
    points = []
    for i in range(1, num_points + 1):
        t = i / (num_points + 1)
        lat = lat1 + delta_lat * t
        lon = lon1 + delta_lon * t
        points.append([round(lat, 4), round(lon, 4)])
    points.append(wp2)
    return points
```

## CATEGORY INDEX GENERATION

After creating wiki pages, generate INDEX.md files per category:

```python
for cat in categories:
    dirpath = os.path.join(wiki_loc, cat)
    if not os.path.exists(dirpath):
        continue
    
    index_lines = [f'# {cat.replace("-", " ").title()} Index', '', f'> TLDR: N locations in this category.', '']
    index_lines.append('| Priority | Location | Founded | TLDR | Issues |')
    index_lines.append('|----------|----------|---------|------|--------|')
    
    for fn in sorted(os.listdir(dirpath)):
        if not fn.endswith('.md') or fn == 'INDEX.md':
            continue
        with open(os.path.join(dirpath, fn), 'r', encoding='utf-8') as f:
            content = f.read()
        
        m = re.search(r'## Images', content)
        has_image = 'YES' if m else 'NO'
        
        # Extract frontmatter fields
        m = re.search(r'location_priority:\s*(.+)', content)
        pri = m.group(1).strip() if m else 'Medium'
        m = re.search(r'title:\s*"(.+?)"', content)
        title = m.group(1) if m else fn.replace('.md','').replace('-',' ').title()
        m = re.search(r'founded_year:\s*"(.+?)"', content)
        founded = m.group(1) if m else '—'
        m = re.search(r'> TLDR:(.+)', content)
        tldr = (m.group(1).strip())[:100] if m else '—'
        chars = len(content)
        
        index_lines.append(f'| {pri} | [{title}]({fn.replace(' ','-').lower()}) | {founded} | {chars} chars | {has_image} |')
    
    with open(os.path.join(dirpath, 'INDEX.md'), 'w') as f:
        f.write('\n'.join(index_lines))
```

## SOURCE VERIFICATION TRACKER

Build SOURCE_VERIFICATION_BASELINE.md tracking confidence levels:

| Level | Meaning |
|-------|---------|
| **verified** | Multiple independent Metis-centered sources confirm |
| **oral-tradition** | Community knowledge but needs formal documentation |
| **unverified** | No sources consulted yet |

**Standard practice:**
- 10 hand-written priority pages → set to "verified" (have curated sources linked)
- 216 auto-generated pages → set to "oral-tradition" (data-grounded but source-free)
- Track by category in the baseline document
- Update confidence as research progresses through 6-phase plan:
  1. Verify priority 10 locations
  2. Collect oral histories from MMF elder networks
  3. Cross-reference with HBC Archives
  4. Map parish records for family connections
  5. Verify coordinates against historical maps
  6. Ongoing confidence updates

## COMMON SECTION NAMES ACROSS PAGES

The hand-written priority pages use richer section headers than the auto-generated ones:
- **Hand-written**: Overview, What This Place Is, Community Life, Historical Significance, The Land, What Remains, Counter-Arguments and Data Gaps, Images, Sources, Related Locations
- **Auto-generated**: What This Place Is, Community Life, Why It Matters, What Remains, Data Gaps, Sources

A lint audit should check for sections by **content presence** not exact header matching. The hand-written pages are more comprehensive — use them as the quality standard.