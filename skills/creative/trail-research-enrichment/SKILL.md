---
name: trail-research-enrichment
description: "Enrich existing map trails and locations with sourced historical research. Compares a research brief against existing HTML map data, finds enrichment opportunities, patches trail descriptions with historical detail, and adds missing trail data. Use when merging research output (deep research briefs, historical sources) into an existing interactive map."
version: 1.0
created: 2026-04-06
tags: [research, map, trails, enrichment, heritage, leaflet, single-file-map]
---

# Trail & Location Research Enrichment

Workflow for merging historical research into an existing Leaflet-based single-file HTML map. Takes a research brief and the existing map file, finds enrichment opportunities, patches descriptions, and adds missing data.

## WHEN TO USE
- You have a research brief (deep research, wiki pages, sourced articles)
- You have an existing HTML map with trail/location data
- You want to enrich descriptions or add missing trails WITHOUT rebuilding the entire map
- The map uses `const trails = [...]` or `const locations = [...]` data arrays

## STEP-BY-STEP

### Step 1: Identify what exists in the research brief
Extract from the research:
- Named routes/trails with geographic details (start, end, waypoints)
- Historical context (dates, economic impact, people involved)
- Coordinate data where available
- Source citations (URLs for credibility)

### Step 2: Audit the existing HTML map
```bash
grep -i "cart.*trail\|trail.*cart\|boat.*route\|\"trails\"" map_v2.html | head -20
```
Identify:
- All existing trail entries (count them)
- Naming convention used in the JSON
- Description format (one-liner vs. paragraph)
- Coordinate data completeness

### Step 3: Gap analysis
Cross-reference research brief against existing data:
- What trails does the research mention that are NOT in the map?
- What trails IN the map are missing detail from the research?
- What specific facts from the research could enrich existing descriptions?

### Step 4: Enrich existing trail descriptions
For trails already in the map, upgrade descriptions using patch():

```python
patch(path='map_v2.html',
    old_string="name": "Carlton Trail (Main)",
    desc": "The main overland freight route",
    new_string="name": "Carlton Trail (Main)",
    desc": "The longest westward cart trail (~1,200 km) connecting the Red River Settlement to Fort Edmonton. Used 1820s-1880s, passing through St. François Xavier, Fort Ellice, Fort Qu'Appelle, and Fort Carlton. Daily travel: 15-25 km loaded, 4-6 weeks total. Brigade sizes of 500-1,200+ carts recorded. The cart's squeal was audible 8-16 km away. Source: Canadian Encyclopedia; Ens 1996.
```

**Enrichment principles:**
- Include distances (km) where possible
- Include date ranges
- Include key waypoints (settlements the trail passed through)
- Include human details (brigade sizes, travel times, cargo capacity)
- Include at least one source citation URL
- Target 3-5 sentences per description

### Step 5: Add missing trails
For trails in the research NOT in the map:

```python
# Find the closing bracket of the trails array
# Insert new trail entries before the final ]
new_trail = '''
{
  "category": "Red River Cart Trails",
  "name": {trail_name},
  "desc": {enriched_description},
  "year": {date_range},
  "color": "#E94560",
  "dash": "8, 6",
  "weight": 3,
  "coords": [
    [{lat1}, {lng1}],
    [{lat2}, {lng2}],
  ]
},'''
```

If no coordinate data exists for a missing trail, use approximations from the CSV or estimate based on named waypoints.

### Step 6: Verify after each batch
After patching 4-5 trails, extract the JS and validate:
```python
import json
# Find the trails array bounds in the HTML
# json.loads to verify the array is valid
```

### Step 7: Update the wiki location pages
For locations mentioned in the research that have stub wiki pages:
```python
patch(path='wiki/locations/.../page.md',
    old_string='> TLDR: A Metis community in the homeland.',
    new_string='> TLDR: {historically_informed_tldr}',
)
```

## ENRICHMENT TEMPLATES BY TOPIC

### For Cart Trails
Include: distance, duration, key waypoints, cargo capacity, brigade size, era, economic role
```
The {trail_name} was a {direction} cart trail connecting {origin} to {destination}.
Approximately {distance} km long, it was used primarily during {era}.
Key waypoints included {waypoints_list}.
Brigades typically traveled {daily_distance} km per day, making the journey in approximately {total_duration}.
{economic_role or notable_event}. Source: {source_url}.
```

### For York Boat Routes
Include: waterway name, distance, portage points, crew composition, cargo capacity, era
```
The {route_name} operated on the {waterway}, connecting {origin} to {destination}.
York Boats carried 3-4 tons of cargo with crews of 8 ({crew_composition}).
The route included {number} major portages.
Used {era}. Source: {source_url}.
```

### For Locations Connected to Routes
Include: trail connection, economic role, notable families
```
{Location} was a key {role} on the {trail_name}.
{historical_significance}. Source: {source_url}.
```

## COMMON PITFAILS

### HTML file is too large for regex
For files >100KB, never use regex to extract JSON arrays. Use `read_file` with `offset`/`limit` to find line ranges, then Python string slicing.

### Description field contains quotes that break JSON
When enriching descriptions, escape internal double quotes:
```
desc": "He said \\"this would work\\" -- it didn\\'t."
```
Or use single quotes within the description text.

### Web search/extract may fail
If `web_search` and `web_extract` return 400 errors (common), fall back to:
- Using `delegate_task` with `web` toolset to a subagent
- Using the `browser` tool directly
- Using pre-cached research briefs already in the vault

### Patch carefully in large files
For files >5000 lines, use read_file to find exact line context before patching. The old_string must be unique. When adding new entries, verify the JSON is valid after each batch by extracting and parsing the array.

### Don't patch coordinates without verification
Only add coordinates that come from:
- The source CSV (`Settlements_and_locations.csv`)
- A published source with explicit coordinates
- Well-established historical locations (e.g., Fort Garry = 49.888, -97.142)

Never invent coordinates -- if unknown, mark as "approximate" or skip.

### Batch size matters
Patch 4-5 trails at a time, then validate. Don't do 20 patches in one pass and discover a JSON syntax error that's hard to track down.
