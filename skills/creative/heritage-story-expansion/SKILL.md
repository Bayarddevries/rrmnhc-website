---
name: heritage-story-expansion
description: Expanding location story concepts into full heritage narratives for museum/heritage centre interpretive content
category: creative
---

# Heritage Story Expansion & Wiki Knowledge Base

Use this when you have location data for Métis homeland sites and need to:
1. Write authentic, Métis-centered wiki location pages (the primary workflow)
2. Rewrite map descriptions/stories into heritage narratives
3. Maintain the knowledge base with proper sourcing and TLDRs

## Knowledge Base Structure

## Approach

Do NOT generate stories one at a time. Process all locations in a single `execute_code` Python script for consistency and speed.

## Wiki Page Format (New Standard)

Every rewritten location now gets a **full wiki page** in `wiki/locations/{category}/{slug}.md` with frontmatter and structured sections:

```yaml
---
title: Location Name
type: location
category: settlement | fort | parish | road-allowance | wintering-site | historic-site | trading-post | governance
latitude: 49.0
longitude: -99.0
founded_year: 1869
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [tag1, tag2]
location_priority: High | Medium | Low
source_confidence: verified | oral-tradition | needs-review
related_pages: [page1, page2]
---
> TLDR: One to three sentences. What this place is, who was here, why it matters.
```

### Required Sections (in order):
1. **TLDR** — Immediately after frontmatter (in a `> TLDR:` markdown quote). Used for index scanning.
2. **What This Place Is** — Physical description, who lived here, when, how it fits into the homeland
3. **Community Life** — Daily life, families, cultural practices, self-governance
4. **Why It Matters** — Historical significance, what happened here, broader meaning
5. **The Land / Community Life** — Geography, river lots, hunting grounds, what the land was like
6. **What Remains Today** — Current state, commemoration, physical remnants
7. **Counter-Arguments and Data Gaps** — Critical section that answers:
   - What do colonial records say about this place? (brief summary, flagged)
   - What do Métis oral histories say that colonial records get wrong or leave out?
   - Where is the record silent? What did colonial archives not bother to document?
   - What does the community know that isn't written down?
8. **Sources** — Table with columns: Source | Type | Confidence | Notes
9. **Related Locations** — Cross-links to other wiki pages

### Source Confidence Levels:
- **verified** — Multiple independent Métis-centered sources confirm
- **likely** — Strong evidence from Métis or allied sources
- **oral-tradition** — Community knowledge passed through generations
- **community-consulted** — Verified through direct community engagement
- **needs-review** — Found only in colonial/government records

### Source Priority (most to least authoritative):
1. Métis oral history / community knowledge
2. Métis-authored academic work / MMF publications
3. Archival documents from Métis perspectives
4. Colonial/government archives (read critically, always flag framing)
5. Non-Métis academic work (use data but center Métis voices)

## Approach

Do NOT generate stories one at a time. Process all locations in a single `execute_code` Python script for consistency and speed.

## Template System by Community Type

Create type-specific narrative templates. Each template includes placeholders for: `{name}`, `{founded}`, `{desc}`, `{events}`, `{families}`, `{rights}`, `{region}`.

### Template Categories

1. **Fort / Trading Post** — Focus on fur trade dynamics, Metis labor (hunters, interpreters, boatmen), economic indispensability vs. official erasure, Cuthbert Grant/Desjarlais family connections
2. **Road Allowance Community** — Focus on post-1885 dispossession, marginal survival, cultural resilience (fiddle music, beadwork, elders' stories), government erasure
3. **Parish / Mission** — Focus on faith + Metis culture blend, church as community infrastructure, tension between assimilation and cultural preservation
4. **Wintering Site** — Focus on seasonal migration, camp life, oral tradition transmission, the annual cycle of buffalo hunting
5. **Battle / Resistance** — Focus on courage, land defense, Metis fighters as ordinary people (farmers, hunters), foundational Metis identity
6. **Destroyed / Displaced / Flooded** — Focus on erasure, scattering, memory preservation, systemic dispossession
7. **Railway / Industrial** — Focus on economic disruption, cultural collision, adaptation
8. **Rendezvous / Meeting** — Focus on community organization, hunting brigade culture, elected leadership
9. **Harvesting / Resource Site** — Focus on traditional knowledge transmission (women as primary practitioners), seasonal rhythms
10. **Settlement (default)** — Focus on prairie rhythms, mixed economy, community building, freedom and independence

## Story Structure

Each expanded story should include (in order):
1. **Story title** (from original concept — preserve the user's creative framing)
2. **Premise** (from original concept — the narrative hook)
3. **Historical context** (founding date, region, what this place was)
4. **Community life** (daily rhythms, seasonal patterns, cultural practices)
5. **Key events** (woven naturally into narrative, not as a list)
6. **Family connections** (when documented in the source data)
7. **Rights context** (broader pattern of dispossession, resistance, or recognition)
8. **Legacy / enduring significance** (connects past to present)

## Python Implementation Pattern

```python
import csv, re, json, os

# Load source CSV
csv_path = "/path/to/Settlements_and_locations.csv"
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    locations = [row for row in reader]

# Define type-specific expansion functions
def expand_fort(loc):
    # Returns ~1200-char narrative
    name = loc['Location Name']
    founded = loc.get('Founded', '')
    events = loc.get('Key Historical Events', '')
    families = loc.get('Key Families Mentioned', '')
    rights = loc.get('Metis Rights Context', '')
    desc = loc.get('Description', '')
    # Build narrative using template
    ...

def expand_road_allowance(loc): ...
def expand_parish(loc): ...
def expand_wintering(loc): ...
def expand_battle(loc): ...
def expand_destroyed(loc): ...
def expand_settlement(loc): ...

# Match each location to its expansion function
type_map = {
    'fort': expand_fort,
    'trading': expand_fort,
    'post': expand_fort,
    'road allowan': expand_road_allowance,
    'parish': expand_parish,
    'mission': expand_parish,
    'wintering': expand_wintering,
    'battle': expand_battle,
    'fight': expand_battle,
    'resistance': expand_battle,
    'destroyed': expand_destroyed,
    'displaced': expand_destroyed,
    'flooded': expand_destroyed,
}

def get_expander(community_type):
    ct = community_type.lower()
    for key, func in type_map.items():
        if key in ct:
            return func
    return expand_settlement  # default

# Process all locations
for loc in locations:
    expander = get_expander(loc.get('Community Type', ''))
    new_story = expander(loc)
    loc['Story'] = new_story  # Update in-place

# Save to CSV
output = io.StringIO()
writer = csv.DictWriter(output, fieldnames=fieldnames)
writer.writeheader()
writer.writerows(locations)
with open(output_path, 'w') as f:
    f.write(output.getvalue())
```

## Key Pitfalls

1. **Don't overwrite the original concept** — preserve the story title and premise, then expand AROUND it
2. **Don't make all stories sound the same** — use type-specific templates with different thematic emphasis
3. **Don't exceed 1,500 characters** — keep stories readable for museum panels (1,200 chars is the sweet spot)
4. **Don't hallucinate facts** — only use data from the source CSV (events, families, rights context). Fill gaps with general historical context about Metis life, not specific claims about the location
5. **Don't use academic language** — write for general public / heritage centre visitors, not scholars
6. **Respect the sensitivity** — these are stories of real people. Frame dispossession as injustice, not inevitable historical progress. Center Metis agency and resilience.

## Typical Results

- Input: ~170 characters per location (title + 1-sentence premise)
- Output: ~1,200 characters per location (full heritage narrative)
- Expansion ratio: ~7x
- Processing time for 228 locations: ~0.5 seconds (single Python script)

## Voice & Tone Requirements (CRITICAL)

The user has explicitly rejected stiff, AI-sounding content. Stories must read like **authentic oral history** or **well-researched heritage interpretive panels** — NOT like Wikipedia entries or generic AI summaries.

**Do:**
- Warm, conversational, grounded tone — like a community elder or museum curator speaking
- First-person or close narrative voice when appropriate ("Our people gathered at...", "In the spring of 1869, families from the settlement...")
- Sensory details: the sound of Red River carts, the smell of pemmican, the look of the river in flood
- Community-first language: center the people, their daily lives, their choices
- Reclamation and resilience framing: acknowledge injustice without reducing people to victims
- Welcoming, inclusive, authentic — the brand voice is community-focused

**Don't:**
- Use academic or encyclopedic language ("established in 1870 as a trading post...")
- Use stiff passive voice ("It was here that...")  
- Use generic AI phrases ("played a vital role", "stands as a testament", "rich cultural heritage")
- Make all 228 stories sound identical — each should have its own character
- Read like Wikipedia or a textbook

**Quality bar:** Read each story out loud, in your head. If it sounds like a museum panel you'd stop and read at a heritage centre, it passes. If it sounds like an AI summary, rewrite it.

## Reliable Workflow (What Actually Works)

**Subagent delegation fails for this task** — the isolated sandbox can't share its output with the main session. **Web search is unreliable** — often returns errors.

**The only reliable method is `execute_code`:**
1. Pull location data from the map HTML (`var locs = [...]`) using Python
2. Also read old stubs from `wiki/locations/_old-stubs/` if they exist
3. Write wiki pages directly using Python's file write or `write_file`
4. Delete the old stub after the new page is written
5. Count remaining to track progress

```python
import re, json, os

# Pull data from map HTML
html_path = "/path/to/Interactive_Homeland_Map_stories_backup.html"
with open(html_path, 'r') as f:
    content = f.read()
locs_match = re.search(r'var locs\s*=\s*(\[[\s\S]*?\]);', content)
locs = json.loads(locs_match.group(1))

# Build lookup by name
lookup = {l['n'].lower(): l for l in locs}

# Get data for each target location
wiki = "/path/to/wiki/locations"
for target in priority_names:
    data = lookup.get(target.lower(), {})
    # Build wiki page
    # Write with write_file or Python file operations
```

## Map Data Structure

The interactive map (Interactive_Homeland_Map.html) embeds location data as a JSON array in a `var locs = [...]` block. Each location uses short keys:

| Key | Full Name | Example |
|-----|-----------|---------|
| `n` | Name | "Batoche" |
| `la` | Latitude | 52.7333 |
| `lo` | Longitude | -106.1833 |
| `ds` | Description (~350 chars, AI-generated) | *Strip during rewrite* |
| `st` | Story (~500+ chars, AI-generated) | *Strip during rewrite* |
| `fo` | Founded | "1885" |
| `ct` | Category/Type | "Settlement" |
| `ev` | Events | "1885 | Battle" |
| `fm` | Family connections | "Dumont" |
| `rc` | Rights context | "Land rights..." |
| `ac` | Access info | "Public site" |
| `pr` | Priority | "High" |
| `ml` | Map layer | "Settlements" |
| `ic` | Icon color | "#C0392B" |
| `y` | Year (for time slider) | "1885" |

**Both `ds` and `st` contain AI-generated narrative text.** Both must be stripped during the rewrite phase.

## Stripping Stories from the Map

**ALWAYS use Python/execute_code — never `sed` or bash.** The `sed` approach has been observed to silently fail (file appears modified but changes don't persist). Python's `json` module + `write_file` is reliable:

```python
import re, json

html_path = "/path/to/Interactive_Homeland_Map.html"
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

locs_match = re.search(r'var locs\s*=\s*(\[[\s\S]*?\]);', content)
locs = json.loads(locs_match.group(1))

for loc in locs:
    loc.pop('ds', None)  # Strip description
    loc.pop('st', None)  # Strip story

new_locs_json = json.dumps(locs, ensure_ascii=False)
new_content = content[:locs_match.start()] + f'var locs = {new_locs_json};' + content[locs_match.end():]

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

# VERIFY by re-reading the file
```

**Always verify** by re-reading the file after writing and confirming the fields are gone.

## Adding Rewritten Stories Back to the Map

Once stories pass tone review:

1. Add a new key (e.g. `story`) to each location's JSON in the HTML
2. Update the popup template in the HTML's stylesheet to render the `story` field
3. Push and verify on GitHub Pages
4. **DO this in one batch** — never mix old and new quality stories

## Partial Work Workflow

**Remove ALL stories from the map during the rewrite process.** Do NOT update the live map with partially rewritten stories. Complete ALL stories first, then push the full updated map in one batch. The user prefers the map show no stories rather than a mix of old and new quality.

## Bulk Auto-Generation Pattern (for 100+ pages at once)

**Priority 10 locations get hand-written rich narrative.** The remaining 200+ can be scaffolded automatically in one shot:

```python
import re, json, os

# Pull map data
html_path = "/path/to/Interactive_Homeland_Map_stories_backup.html"
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()
locs_match = re.search(r'var locs\s*=\s*(\[[\s\S]*?\]);', content)
locs = json.loads(locs_match.group(1))
lookup = {l['n'].lower(): l for l in locs}

# Read stubs for additional metadata
stubs = {}
for f in os.listdir("/path/to/wiki/locations/_old-stubs"):
    with open(os.path.join("/path/to/wiki/locations/_old-stubs", f), 'r') as fh:
        stubs[f] = fh.read()

# Parse stubs for metadata
parsed = []
for fname, raw in stubs.items():
    data = {'filename': fname}
    for field, pattern in [('type', r'type:\s*"(.+?)"'), ('founded', r'founded:\s*"(.+?)"'), 
                           ('rights', r'rights_context:\s*"(.+?)"'), ('theme', r'story_theme:\s*"(.+?)"'),
                           ('priority', r'priority:\s*"(.+?)"')]:
        m = re.search(pattern, raw)
        data[field] = m.group(1) if m else ''
    name = fname.replace('.md', '')
    data['name'] = name
    loc = lookup.get(name.lower(), {})
    data['lat'] = loc.get('la', '')
    data['lon'] = loc.get('lo', '')
    data['ds'] = loc.get('ds', '')
    data['ev'] = loc.get('ev', '')
    data['fm'] = loc.get('fm', '')
    parsed.append(data)

# TYPE_TO_DIR mapping
TYPE_TO_DIR = {
    'Settlement': 'settlements', 'Fort / Trading Post': 'forts',
    'Parish / Settlement': 'parishes', 'Road Allowance Community': 'road-allowance',
    # ... etc (map all types to directories)
}

# Generate and write all pages
for p in parsed:
    slug = re.sub(r'[^a-z0-9]+', '-', p['name'].lower().replace('é','e').replace('è','e'))
    directory = TYPE_TO_DIR.get(p['type'], 'settlements')
    fpath = os.path.join(wiki_loc, directory, f"{slug}.md")
    # ... build page content from p['ds'], p['rights'], p['ev'], etc.
    # ... write to fpath
```

**Key insight:** Auto-generated pages are scaffolding, not final content. They have proper structure, TLDRs, and all required sections, but the narrative is concise and data-grounded. The 10 hand-written priority pages set the quality standard. Auto-generated pages can be selectively enriched later.

## Image Sourcing Workflow

**CRITICAL: Automated Wikimedia searches do NOT work for Métis locations.** They return irrelevant images (wrong geography, wrong context entirely). Example: "Bacon Ridge" returns photos from Maryland, not Manitoba.

**What works:**
1. **IMAGE_MANIFEST.json** — Curated local photos in `RAW/Photos/` with location-to-file mapping
2. **Manual archival sourcing** — Library and Archives Canada, provincial archives, MMF collections
3. **Community-contributed photos** — From Métis families and elders with permission

**Sourcing Queue Pattern:** Build a `wiki/IMAGE_SOURCING_QUEUE.md` that lists all locations needing images, organized by priority tier, with suggested archive sources for each category (forts → HBC Archives, parishes → St. Boniface Archives, etc.)

**Image Integration into Wiki Pages:**
```python
# For locations with local photos
for location_name, image_files in img_manifest.items():
    slug = make_slug(location_name)
    found_path = find_wiki_page(slug)  # search all category directories
    if found_path:
        with open(found_path, 'r') as f:
            content = f.read()
        if '## Images' not in content:
            # Insert image section before ## Data Gaps or ## Sources
            images_section = '\n## Images\n\n' + '\n'.join(
                f'![{location_name}](../../RAW/Photos/{img})' for img in image_files
            ) + '\n'
            content = content.replace('## Data Gaps', images_section + '## Data Gaps')
            with open(found_path, 'w') as f:
                f.write(content)
```

## Data Quality Audit (Lint Pass)

After bulk generation or major updates, run an audit of all wiki pages:

```python
for cat in categories:
    dirpath = os.path.join(wiki_loc, cat)
    cat_pages = {}
    for fn in sorted(os.listdir(dirpath)):
        if not fn.endswith('.md'):
            continue
        path = os.path.join(dirpath, fn)
        with open(path, 'r') as f:
            content = f.read()
        # Check for: coordinates, TLDR, founded date, all sections, images
        # Flag issues (missing fields, short content, etc.)
    # Generate INDEX.md for the category with sortable table
    index_path = os.path.join(dirpath, 'INDEX.md')
    with open(index_path, 'w') as f:
        # Table: | Priority | Location | Founded | TLDR | Issues |
```

Report should include: overall health metrics, category breakdown, issue counts, top problem pages, and well-developed pages. Save to `wiki/agents/lint-report-YYYY-MM-DD.md`.

**Remove ALL stories from the map during the rewrite process.** Do NOT update the live map with partially rewritten stories. Complete ALL stories first, then push the full updated map in one batch. The user prefers the map show no stories rather than a mix of old and new quality.

## Old Stub Management

Old format stubs live in `wiki/locations/_old-stubs/`. When a location is rewritten into the new wiki page format:
1. Write the new page in the correct category directory
2. Delete the old stub to track progress
```python
import os
stubs_dir = "/path/to/wiki/locations/_old-stubs"
os.remove(os.path.join(stubs_dir, f"Old Location Name.md"))
```

## Quality Check

After expansion, verify:
- All stories are unique (not identical templates)
- Priority=High locations get the most detailed treatment (use the first/best template)
- Road Allowance stories avoid victimizing language — emphasize resilience and cultural survival
- Battle/Resistance stories focus on courage and land defense, not military glory
- Destroyed/Displaced stories acknowledge erasure but emphasize memory and continuity
- Stories pass the "read out loud" test — they sound like authentic oral history, not AI content