---
name: leaflet-metis-homeland-map
description: Building and enhancing interactive HTML maps for Metis Heritage Centre using Leaflet.js — covers initial map build, trail layer integration, image sourcing, mobile optimization, responsive CSS, and data quality audits. Includes critical pitfalls around HTML/JS injection.
category: creative
---

# Leaflet Interactive Map Builder

Use this when building interactive map HTML files for the Red River Métis Heritage Centre homeland map.

## Architecture

**Single HTML file** — No build step, no dependencies to install. Just open in a browser.
- Leaflet.js loaded via CDN (cdnjs)
- CartoDB dark tiles for the dark theme
- All 228 location data embedded as JavaScript constants in the HTML

## How to Build (Step by Step)

### 1. Read the CSV Data

```python
import csv
import json

CSV_PATH = '/home/bayard_devries/Documents/metis_research/Settlements_and_locations_INTERACTIVE_MAP.csv'
locations = []
with open(CSV_PATH, 'r', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        locations.append(row)
```

### 2. Convert to JavaScript Data Structure

```python
# Parse coordinates from "49.4589° N" format
lat = float(re.sub(r'[^0-9.-]', '', lat_str))
lng = -abs(float(re.sub(r'[^0-9.-]', '', lng_str)))

# Build JS object per location
js_loc = {
    'name': name, 'lat': round(lat, 4), 'lng': round(lng, 4),
    'type': ctype, 'founded': founded, 'desc': desc,
    'region': region, 'layer': layer, 'priority': priority,
}
```

### 3. Generate HTML String

- Use a Python variable with the entire HTML structure
- Keep CSS inline in a `<style>` block (dark theme: #0f0f23, #16213e, #e94560)
- JavaScript embedded in `<script>` block
- Inject JSON data as `const locations = JSON_DATA_HERE;`

### 4. Save to Both Locations

```python
# Metis research folder
OUT_DIR = '/home/bayard_devries/Documents/metis_research'
# User's Obsidian vault on PC (via WSL mount)
PC_VAULT = '/mnt/c/Users/Bayard devries/Documents/MMF Research/MMF Research/99-Projects'
```

## Map Features

- **Light theme**: White panels, #C0392B red accent, clean sans-serif
- **10+ toggleable layers**: Auto-generated from `Heritage Map Layer` column with counts
- **Search bar**: Type to filter by name (and description content if 3+ chars)
- **Popup hierarchy** (top to bottom):
  1. Location name (h2)
  2. Founded date (Est. XXXX)
  3. Coordinates (decimal degrees)
  4. Community type badge (colored pill)
  5. Priority badge (High=green, Medium=yellow, Low=red)
  6. **Description** — factual/encyclopedic text (bold, prominent)
  7. **Heritage Story** — expanded narrative (stripped of `**Title**` prefix)
  8. Key Historical Events (if available)
  9. Key Families (if available)
  10. Metis Rights Context (if available)
  11. Visitor Access (if available)
  12. Historical image thumbnail (if available — opens full-screen on click)
- **Historical trails**: 7 lines (4 cart + 3 boat) overlaid with dash patterns
- **Stats bar**: Shows total location count + trail count
- **Responsive**: Max-width panels, scrollable popups (max-height: 450px)

## Layer Colors

| Layer | Color |
|-------|-------|
| Forts & Trading Posts | #FF9800 (orange) |
| Communities & Settlements | #4CAF50 (green) |
| Parishes & Missions | #9C27B0 (purple) |
| Road Allowance Communities | #FF5722 (dark orange) |
| Wintering Grounds & Camps | #2196F3 (blue) |
| Battles & Resistance | #F44336 (red) |
| Destroyed Communities | #9E9E9E (gray) |
| Resource & Harvesting Sites | #8BC34A (light green) |
| Governance & Rights | #FFC107 (yellow) |
| Transportation Routes | #00BCD4 (cyan) |

## UI Redesign Workflow (Step-by-Step — Added April 2026)

Don't attempt a full redesign in one pass. Break into discrete steps, each self-contained and reviewable:
1. **Foundation** — CSS variables, dark/warm theme, page structure, data load, basic markers, layer controls
2. **Sidebar** — Themed slide-out panel with layer controls and region grouping
3. **Custom markers** — Thematic icons instead of plain dots, priority sizing
4. **Trails** — Styled route lines with hover tooltips
### 6. **Timeline filter** — Slider to filter by era
7. **Mobile** — Responsive layout
8. **Polish** — Branding, animations, final touches

After each step: write the complete file (not a diff), open in browser, verify with `browser_console()`, show result to user before proceeding.

## UI Design System Template

For the warm prairie earth dark theme, use CSS variables:
```css
:root {
  --bg:#1a1714; --bg2:#232019; --bg3:#2e2a22;
  --bgov:rgba(26,23,20,0.92);
  --accent:#c8956c; --accent2:#e6a97c; --accent3:#d4865a;
  --glow:rgba(200,149,108,0.15);
  --t1:#f0e6d8; --t2:#a89b8c; --t3:#7a6f63;
  --brd:rgba(200,149,108,0.12); --brd2:rgba(200,149,108,0.25);
  --r1:6px; --r2:10px; --r3:14px;
}
```
This palette evokes prairie sunset tones — warm charcoal backgrounds with amber/ochre accents. It avoids the cold clinical feel of the previous dark theme (#0f0f23 + #e94560 neon).

## Pitfalls

1. **Triple-quoted strings in Python** — HTML with JavaScript template literals ` ${var} ` can break Python f-strings. Use plain `"""` strings or `.replace()` for data injection.
2. **Coordinate parsing** — Strip `° N`, `° W` before converting to float.
3. **Special characters in filenames** — Location names with `/`, `\`, `:`, `*`, `?` need sanitization for JS property names.
4. **Mobile responsive** — Hide panel and legend on screens < 768px width.
5. **File is large** — 228 locations = ~130KB HTML file. WhatsApp may send as .bin attachment — warn user to open from PC directly.

## Known Issues

- WhatsApp sends .html files as .bin — user must open from PC instead
- File size ~128KB — too large for clean WhatsApp delivery
- Wikimedia Commons thumbnail URLs are DEAD/RATE-LIMITED — do NOT use them for images
- ~58 of 228 locations have zero/empty coordinates that must be fixed before map generation

## Data Requirements (CRITICAL)

- ALWAYS use ALL 228 locations from the enriched CSV — never a subset
- CSV path: `Settlements_and_locations_INTERACTIVE_MAP.csv` in metis_research folder
- After fixing zero-coord locations, save as `Settlements_and_locations_COMPLETE.csv`
- Popup content should include ALL available columns: Description, Story, Metis Rights Context, Key Events, Key Families, Accessibility, Priority

## Image Handling

- Only use locally verified images — filter by file size >3000 bytes to skip placeholders
- Copy verified images to `outbox/images/historical/` AND `RAW/Photos/` in vault

## Output Workflow (inbox/outbox)

- `inbox/` in vault — User uploads files here for processing
- `outbox/` in vault — Agent stores generated files (maps/, data/, images/historical/)
- Always save the HTML map to: `~/99-Projects/`, `outbox/maps/`, AND `Heritage Centre/` folder

## Trail Data (Updated April 2026 — 39 Trails)

Current trail network: 23 cart trails + 16 boat routes = 39 total trails.
Trails are stored in `trails_data.json` (separate file), injected into HTML at build time.

**RENDERING SYSTEM (updated April 2026):** The TL-based trail rendering was REMOVED. Trails now render only once as individual `t0-t38` polyline variables with `.addTo(map)` and `.bindPopup()`. Each trail checkbox (`trail-0` through `trail-38`) controls its own polyline directly via `addEventListener('change', ...)`. There is NO TL iteration for trails in `updateLayers()`.

**Trail popup injection pattern** — To add popups to trails: find each `var tN=L.polyline(...).addTo(map)` and inject `.bindPopup('<b>Name</b><br>Year<br>Desc')` between the closing `)` of options and `.addTo(map)`:
```python
before = html[:addto]
popup = f".bindPopup('<b>{name}</b><br>{year}<br>{desc}')"
after = html[addto:]
html = before + popup + after
```

```json
{"name":"Trail Name","type":"cart|boat","year":"date range","desc":"historical description","wp":[[lat,lon],...]}
```
- Cart trails: brown (#8B4513), solid, weight 4, opacity 0.85
- Boat routes: blue (#2980B9), dashed 8,8, weight 3, opacity 0.85

## Obsidian Vault Structure (Updated April 2026)

- PRIMARY vault: `/home/bayard_devries/Documents/metis-research-vault/`
- Heritage Centre files: `Heritage Centre/Interactive_Homeland_Map.html`
- Trails index: `wiki/Trails/Trails Index.md`
- MOC: `MOC/Home.md` (updated with Active Projects section)
- AI instructions: `MOC/AI-INSTRUCTIONS.md`
- Projects: `Projects/Shoebox/`, `Projects/Heritage Centre/Dashboard.md`
- Personal: `Personal/` (private folder — agents should NOT access)

## GitHub (Confirmed April 2026)

- Repo: https://github.com/Bayarddevries/Hermes
- Auth via Personal Access Token (github_pat_...) — agent cannot push without it
- Alternative: user runs `git pull && git push` from their PC

## User PC Paths (Updated April 2026)

- PRIMARY vault: `/home/bayard_devries/Documents/metis-research-vault/`
- Heritage Centre: `Heritage Centre/Interactive_Homeland_Map.html`
- WSL mount for Windows: `/mnt/c/Users/Bayard deVries/Documents/metis-research-vault/`

## Heritage Story Expansion Engine (Added April 2026)

Stories in the CSV were originally ~170-char concepts (title + premise). Expand them to ~1,200-char heritage narratives using type-specific templates:

**Template categories:**
- `_expand_fort()` / `_expand_trading()` — Fur trade dynamics, Metis labor exploitation, economic indispensability, erasure from records
- `_expand_road()` — Post-1885 dispossession, scrip system fallout, road allowance survival, cultural resilience (fiddles, bannock, elders' stories)
- `_expand_parish()` / `_expand_mission()` — Faith + Metis culture blend, church as community infrastructure, devout yet independent congregation
- `_expand_wintering()` — Seasonal migration rhythms (autumn arrival to spring departure), camp life, fiddle/jig gatherings, oral tradition transmission
- `_expand_battle()` — Metis resistance, land defense, courage as foundational identity, not celebration of conflict
- `_expand_destroyed()` — Physical erasure (flooding/fire/displacement), family scattering, memory preservation
- `_expand_modern()` — Industrialization collision with traditional life, railway/grain elevator replacing old economy
- `_expand_rendezvous()` — Hunting brigade gatherings, elected captains, women organizing logistics, knowledge transmission
- `_expand_harvest()` — Traditional harvesting as cultural practice, women as knowledge holders, seasonal rhythms
- `_expand_ceremonial()` — Spiritual/cultural significance beyond practical function
- `_expand_settlement()` — Prairie rhythms, mixed economy, community building, family networks
- `_expand_geo()` — Landmarks as waypoints in lived landscape

**Expansion formula:**
```python
story = f"**{title}**  {premise}"
story += f"Context paragraph with founding date + region + type"
if events: story += f"Key events: {events}"
if families: story += f"Key families: {families}"
if rights: story += f"Rights context: {rights}"
story += "Concluding paragraph about broader Metis significance"
```

**Result:** 7.1x expansion ratio (170 -> 1,204 chars avg across 228 stories)

## Map Build Process (Updated April 2026)

**Working approach: Two strategies**

### Strategy A: Three-part assembly (preferred for redesigns)
When changing the UI/theme, extract data blocks and inject into a clean template:
1. Read source HTML file line by line to find the data block boundaries
2. Extract three parts: `html_top` (CSS + HTML through `<script>`), `data` (const locations/trails/LC blocks — copied VERBATIM), `js_bottom` (map init, markers, trails, sidebar logic through `</html>`)
3. Assemble: `full = html_top + locations + '\n\n' + trails + '\n\n' + lc_block + '\n' + js_bottom`
4. Write complete file — NO f-strings, NO regex surgery on existing JS
5. Verify: open in browser + `browser_console()` to check JS errors

Why this beats injection: data blocks (228 locations = 123K chars) are copied verbatim from the known-good source. Only the template (CSS/HTML/JS logic) changes — a much smaller surface area for bugs.

### Strategy B: Template + JSON injection (preferred for fresh data builds)
1. Load CSV with `csv.DictReader`
2. Parse coordinates: strip `° N`, `° W`, convert to float
3. Generate expanded stories using type-specific templates
4. Build HTML by concatenating string parts (NO f-strings with JS)
5. Serialize location data as JSON objects
6. Build popup HTML per location with all available fields
7. Write to 3 locations: `outbox/maps/`, `Heritage Centre/`, `~/99-Projects/`

**Key code pattern for HTML generation:**
```python
# DON'T use f-strings with JavaScript content - too fragile
# Instead: build HTML string with Python concatenation
html_header = '''...static HTML with CSS...'''
loc_json = json.dumps(valid_locs, ensure_ascii=False)
trail_json = json.dumps(trails, ensure_ascii=False)
html = html_header + '<script>var locs=' + loc_json + '; ...</script>'
```

**Dynamic layer generation from CSV data:**
Read `Heritage Map Layer` column, auto-group locations, generate layer toggles with counts

## Zero-Coordinate Fix Workflow

Research-based coordinates added for 57/58 locations lacking data:
- Use historical knowledge + geographic context to find approximate coords
- Tag with "[Coordinates added via research]" in Enhancement Notes
- Save as `Settlements_and_locations_COMPLETE.csv`

## Time Machine Slider (Added April 2026)

HTML sidebar element:
```html
<div class="slider-container">
    <label>🕰️ Time Machine: Founded By</label>
    <div class="year-display" id="year-display">All Years</div>
    <input type="range" id="year-slider" min="1750" max="2000" value="2000" step="5" style="width:100%">
</div>
```

JS logic:
```javascript
document.getElementById('year-slider').addEventListener('input', function() {
    var val = parseInt(this.value);
    var display = document.getElementById('year-display');
    display.textContent = (val >= 2000) ? "All Years" : val;
    Object.values(ML).forEach(function(arr){
        arr.forEach(function(m){
            var data = locs[m._index];
            if(data.y <= val) map.addLayer(m);
            else map.removeLayer(m);
        });
    });
});
```

**Requirements:**
- Each location MUST have a `y` (year) property embedded in the JSON data
- The time filter integrates with layer toggles — a marker only shows if BOTH its checkbox is checked AND its year is within range
- Update `updateLayers()` to check: `var timeOk = locs[m._index].y <= sliderValue`

## Kinship Web Layer (DOCUMENTED BUT REMOVED — April 2026)

Was a layer drawing dashed purple lines between locations sharing prominent families, visualizing Metis kinship networks. **Removed from the live map** because the data had not been validated and the purple lines cluttered the interface.

**To re-add when data is ready:**
1. Build kinship data from CSV `Key Families Mentioned` column: parse each location's families, group locations by family name, for families appearing in 2+ locations create a kinship entry
2. Add `var kinships = [...]` data array after the `trails` array
3. Add kinship rendering block:
```javascript
var kinshipLines = [];
kinships.forEach(function(k){
    var line = L.polyline(k.coords, {color:'#9b59b6', weight:2, opacity:.4, dashArray:'4,4'})
        .bindPopup('<b>Family Connection:</b> ' + k.f.toUpperCase());
    line._layer = 'Kinship Web';
    kinshipLines.push(line);
});
TL['Kinship Web'] = kinshipLines;
allT.push('Kinship Web');
```
4. Add legend item in the `<div class="legend">` block
5. Add to the `buildSB()` function to create a sidebar toggle (checked=false by default)

## Critical Pitfalls (Updated April 2026)

6. **JS string concatenation in popup builder** — When building popup HTML with string concatenation in JS, NEVER wrap functions in quotes. Bug example: `'\"esc(l.fm)\"'` should be `esc(l.fm)`. This caused the Key Families section to display literal text instead of the family names. Use: `'+esc(l.fm)+'`

7. **Cron timeout for bulk image search** — The Daily Heritage Image & Research cron job (c9ae77524fc9) errors when bulk-searching Wikimedia for 30+ locations. It times out because each search is sequential. Solution: chunk searches (5 locations per run) or run manually.

8. **NEVER use Python f-strings for JS injection** — Python f-strings consume `{` and `}` characters, mangling JavaScript objects, template literals, and arrow functions. Always use plain string concatenation (`'var x=' + data + ';'`) or `.replace()` placeholders.
**IMPORTANT**: Even f-string variables can silently fail if the injected JSON data contains unescaped `{` or `}`. The safe pattern is to build injection strings as three separate pieces and concatenate:
```python
js_before = 'var LOCATION_SOURCES = '
js_after = ';\\n\\nfunction showSources() { ... }'
full_injection = js_before + json_value + js_after  # NO f-strings anywhere
```

8a. **When injecting JS before a marker like `// INIT\n`, verify the marker stays intact** — String replacement can accidentally merge lines. If replacing `\\n// INIT\\n` with the injection content, the result must preserve the newline before `// INIT`. After injection, always verify: `grep -A1 'INIT' file.html` should show `// INIT` on its own line followed by `buildSB();` on the next line. A collapsed `// INITbuildSB();` means the injection ate the newline.

9. **NEVER do surgical regex fixes on broken JS** — When JS minification or injection breaks syntax (stray `}` in coordinates, `?.85` instead of `?0.85`, broken ternary operators), fixing via regex is error-prone and creates new bugs. ALWAYS reset to a clean git state and rebuild the feature cleanly in one pass.

10. **NEVER inject features multiple times without cleanup** — Each feature injection (trails, mobile CSS, toggle buttons) must first check and remove any previous injection of the same feature. Duplicate `<script>` blocks, duplicate `<div>` panels, and duplicate event listeners break the map silently. Always: find existing, remove, then inject fresh.

10a. **Cart trail connectivity audit methodology** — When trails appear disconnected, run a Python connectivity analysis before fixing:
     (a) Build a graph where trail endpoints (lat,lon) are nodes, trails with shared endpoints are edges. Tolerance ~0.05° for matching.
     (b) Run BFS/DFS to find connected components. Identify isolated trails (components of size 1) and small orphan pairs.
     (c) Also check shared intermediate waypoints — a trail can pass through another trail's midpoint without endpoint matching.
     (d) For each isolated trail, find the nearest point on the connected network and add 1-2 intermediate waypoints as a connector segment.
     (e) Remove any backtracking waypoints that create visual zigzags (a waypoint that jumps opposite the trail's general direction by >1°).
     (f) Verify: re-run the connectivity analysis. Target = all trails in exactly 1 connected component.

11. **Wikimedia auto-search is unreliable for Métis locations** — Automated search returns irrelevant matches (e.g., "Bacon Ridge" → Maryland road, "Ash House" → building in England). Only use images that are manually verified as relevant to the location. Build a curated IMAGE_MANIFEST.json for known-good images.

12. **Trail data needs intermediate waypoints for long segments** — Cart trail segments spanning 200+ km need interpolated waypoints (every ~0.5 degrees) to render as smooth connected lines on the map rather than abrupt jumps. Use linear interpolation between waypoints.

**NOTE:** Individual t0-t38 polyline rendering was replaced in v2 with layer groups (cartTG, boatTG). The old bracket-matching pitfalls (]],{color: verification) are deprecated. If reverting to individual polylines, re-add those checks.

21. **The `updateLayers()` function uses the TL object which is disconnected from the trails panel** — Trail toggles are controlled directly via `trail-0` through `trail-38` checkbox IDs in the trails panel. The `updateLayers()` function tries to find `trl-CartTrails`/`trl-BoatRoutes`/`trl-KinshipWeb` checkboxes that no longer exist in the sidebar. This is dead code for trails — the TL-based trail system was superseded by the individual t0-t38 polylines. To avoid confusion: either remove the TL trail iteration from `updateLayers()`, or rebuild it to iterate `trail-0` through `trail-38` checkboxes instead.

22. **Duplicate trail rendering was FIXED April 2026** — Previously trails were rendered twice: (1) as TL polylines via `trails.forEach` loop + init, AND (2) as individual t0-t38 polylines with `.addTo(map)`. Fix: removed the `trails.forEach` loop entirely, removed `Object.values(TL).forEach(...)` init, removed references to TL trail objects from `updateLayers()`. Trails now render ONLY via the individual t0-t38 variables with `.addTo(map)` and `.bindPopup()`. Each trail has its own checkbox in the trails panel that directly calls `setStyle({opacity})` on its polyline variable.

23. **Kinship web is an optional feature module** — The kinship/family connections layer can be cleanly removed if it's not ready for release. To remove: delete (a) the `var kinships = [...]` data array, (b) the kinship rendering block that creates polylines and adds to TL, (c) the `kinshipLines` variable from init, (d) the legend item, and (e) any sidebar checkbox for it. Verify with `grep -c 'kinship\|Kinship' file.html` returning 0.

24. **Boat route L.polyline options syntax bug** — When trails have `dashArray` in their options, sed fixes for `}{opacity:` can accidentally remove the closing `}` of the options object, leaving `{...,dashArray:'8,8',opacity:.85)` (missing the `}` before the closing `)`). Always verify polyline syntax after bulk replacements: `grep -c "dashArray:'8,8',}{opacity" file` should be 0, AND `grep -c "dashArray:'8,8',opacity:.85})" file` should equal the number of boat routes (16).

25. **Mobile UI should use slide-in overlay pattern, not resize-in-place** — On mobile, both the sidebar and trails panel should use `transform: translateX()` transitions to slide in from the edge as overlays. The sidebar on mobile uses a dual-class system: `collapsed` hides it, `open` shows it. The toggle function checks `window.innerWidth` to decide which class to toggle. Add `window.addEventListener('resize', ...)` to adapt to device rotation.

26. **Kinship web was removed April 2026 for release — planned for future revival** — The family connections layer was removed because the data was not validated and the purple lines cluttered the map. The kinship data structure and rendering code are documented in this skill for when the data is ready to reintegrate.

27. **CRITICAL: Modifying trail polylines via string replacement can drop closing brackets** — When using `set_trail()` or similar regex/string-replacement functions to modify t0-t38 waypoint arrays, the closing `]]` before `,{color:` was being dropped on some trails, producing `[-113.214],{color:` instead of `[-113.214]],{color:`. This is a **catastrophic JS syntax error** that: (a) prevents ALL 39 trail polylines from rendering, AND (b) crashes every JavaScript function defined after the broken trail line (including menu toggle, layer toggles, etc.). The entire map appears blank but shows no visible error to the user. ALWAYS verify after any string modification: `for i in range(39): assert ']],{color:' in html` for each trail. The fix is to search for `],{color:` (single bracket) and replace with `]],{color:` (double bracket). This happened on 9 of 39 trails and took 2 rounds of debugging to fix.

28. **Use `grep -c ']],{color:' file` to verify all 39 trails are intact** — After any trail modification, run: `for i in $(seq 0 38); do grep -q "]],{color:" trail_line_for_t$i && echo "t$i OK" || echo "t$i BROKEN"; done`. Every trail must have `]],{color:` (double closing bracket) to be syntactically valid.

29. **When doing string replacements in HTML, ALWAYS `grep` to confirm exact target text first** — HTML entities like `&#9776;` (hamburger) and `&#x1F5FA;` (map) look like their rendered characters but won't match literal string search. If a `.replace()` silently fails, the target text is probably an HTML entity, not the raw character. Always verify with `grep` before replacing.

30. **Two directories hold map versions — only ONE is the git repo** — `/home/bayard_devries/Documents/metis_research/` contains working copies (metis_homeland_map_v2.html). `/home/bayard_devries/Documents/metis-research-vault/Heritage Centre/` is the git-tracked repo (Interactive_Homeland_Map_v2.html). ALWAYS push from the vault path. Copy working files to the vault path before committing.

31. **Before pushing to GitHub, verify the diff is what you expect** — Running `git diff --stat` shows insertions/deletions. If you expect a 1-line fix but see 2910 deletions, you pushed the wrong file. Always verify `git diff` stats match expectations before committing.

13. **Mobile optimization works well when added incrementally** — We successfully added responsive CSS (@media max-width: 768px and 480px breakpoints) via patch injection to the existing file. Key patterns: sidebar becomes full-width slide-in sheet (`transform: translateX(-100%)`), timeline labels hidden but slider functional with larger thumb (24px), zoom controls repositioned to bottom-right at 36px touch targets, popups cap at viewport width. No rebuild needed — incremental patches work fine if you patch specific CSS blocks rather than rewriting everything.

14. **Use `git checkout <clean-commit> -- file` to restore** — When the HTML file gets corrupted by multiple injection attempts, use git to restore to a known-good commit rather than trying to fix in-place.

15. **NEVER store raw UTF-8 emoji/unicode characters in HTML for GitHub Pages** — The CDN proxy corrupts multi-byte UTF-8 characters into mojibake (e.g., `☰` becomes `â˜°`, `🗺️` becomes `ðºï¸`). ALWAYS use HTML entities: `&#9776;` for hamburger menu, `&#x1F5FA;` for map emoji. Verify with `curl <url> | grep -o '&#9776;\|&#x1F5FA;'` to confirm the live source has entities, not raw bytes.

16. **Mobile UI must default ALL panels to collapsed** — On screens < 768px, the sidebar and trails panel should both start hidden so the map is the primary visible element. Users tap buttons to open panels. Two class systems: sidebar uses `collapsed` on desktop (starts visible, toggle hides) and `open` on mobile (starts hidden, toggle shows). The toggle function must check `window.innerWidth` and use the correct class. Add a `resize` listener so device rotation adapts behavior.

17. **Collapsible layer groups are mandatory for mobile usability** — 100+ flat checkboxes is unusable on a phone. Group layers into 3-4 collapsible categories (e.g., "Communities", "Trade & Worship", "History") with click-to-expand headers. On mobile, default these groups to collapsed. Use simple `&#9660;` (down) / `&#9654;` (right) arrow entities for expand/collapse indicators.

    **Mobile breakpoints**: Two levels
    - `max-width: 768px` (tablets): sidebar as 85vw slide-in overlay (max 340px width, 80vh height), trails panel as 85vw slide-in from right (max 300px), legend hidden, 42px min-height touch targets
    - `max-width: 480px` (phones): sidebar as 90vw (max 280px, 75vh height), more compact labels (38px min-height), smaller fonts throughout, trails panel at 90vw with tighter spacing

18. **When removing a sidebar element, audit ALL JavaScript references** — Deleting `<div id="trail-toggles">` caused `buildSB()` to crash with "Cannot read properties of null (reading 'appendChild')" because it still executed `document.getElementById('trail-toggles').appendChild(...)`. Every element removal requires a full grep for references: `grep -n 'trail-toggles\|getElementById' file.html`.

19. **Dual-panel UI creates synchronization nightmares** — Having the same trail toggles in BOTH the sidebar AND a separate floating panel means changes in one don't reflect in the other. Remove redundancy: keep ONE source of truth for trail toggles (the floating trails panel), remove duplicates from sidebar.

20. **GitHub Pages CDN caching is aggressive** — `cache-control: max-age=600` means changes take up to 10 minutes. Use cache-buster query params (`?v=2`, `?t=timestamp`) when testing. Verify live source with `curl -s <url> | grep <pattern>` rather than trusting browser rendering alone.

## Trail Data Structure
```json
{"name":"Trail Name","type":"cart|boat","year":"date range","desc":"historical description","wp":[[lat,lon],...]}
```
- Cart trails: orange (#E67E22), dashed 10,5, weight 3
- Boat routes: blue (#2980B9), dashed 15,5,5,5, weight 4

## Timeline Filter System (Added May 2026 v2)

**Architecture:** Bottom bar with range slider, era labels 1680-1950, live counts, active label highlight. Filters both location markers AND trail lines by year.

**Key design rules:**

1. **Trail filtering MUST rebuild both groups from scratch every time** — `cartTG.clearLayers()` + `boatTG.clearLayers()`, then iterate all trails and only `addTrailToGroup(t, grp)` those within the cutoff. NEVER selectively add/remove individual lines — this breaks the sidebar toggle system.

2. **Extract trail creation into a helper** — `addTrailToGroup(t, grp)` bundles polyline creation + `bindPopup()` + `bindTooltip()` + `grp.addLayer()`. This keeps the popup/tooltip markup DRY between initial render and timeline rebuild.

3. **Position 0 ("All Eras") must explicitly rebuild everything** — Early return for idx===0 that restores all hidden location markers AND rebuilds all 39 trails from scratch. Don't skip this step.

4. **Coordinate matching tolerance: use 0.001 not 0.0001** — Too-tight tolerance causes markers to not be found after filtering, so locations don't re-appear when sliding back to "All Eras".

5. **Update sidebar trail counts after every filter** — `cartBtn.querySelector('.lcnt').textContent = cartTG.getLayers().length`

**Initial trail render uses same `addTrailToGroup()` helper for consistency.**

```javascript
function addTrailToGroup(t, grp) {
    var line = L.polyline(t.coords, {
        color: t.color, weight: t.weight,
        dashArray: t.dash, opacity: 0.82,
        lineCap: 'round', lineJoin: 'round'
    });
    line.bindPopup('...');  // Themed popup matching location cards
    line.bindTooltip(t.name, { sticky: true, direction: 'top', className: 'trail-tooltip', offset: [0, -4] });
    grp.addLayer(line);
}

function applyTimeline() {
    var idx = parseInt(slider.value);
    if (idx === 0) {
        // Show ALL locations (re-add any hidden)
        // cartTG.clearLayers(); boatTG.clearLayers();
        // trails.forEach(function(t) { addTrailToGroup(t, t.category === '...' ? cartTG : boatTG); });
        // Update sidebar counts
        return;
    }
    // Filter locations by founded year
    // cartTG.clearLayers(); boatTG.clearLayers();
    // trails.forEach(function(t) { if (parseFirstYear(t.year) <= cutoff) addTrailToGroup(t, grp); });
    // Update sidebar trail counts
}
```

## Trail Rendering System (Current — April 2026 v2)

**Layer group approach** (replaced the individual t0-t38 system): Trails are rendered in a `trails.forEach()` loop into two layer groups:

```javascript
const cartTG = L.layerGroup().addTo(map);  // Red River Cart Trails
const boatTG = L.layerGroup().addTo(map);  // York Boat Routes

trails.forEach(function(t) {
    var grp = t.category === 'Red River Cart Trails' ? cartTG : boatTG;
    var line = L.polyline(t.coords, {
        color: t.color, weight: t.weight,
        dashArray: t.dash, opacity: 0.82,
        lineCap: 'round', lineJoin: 'round'
    });
    line.bindPopup('...');       // Click popup
    line.bindTooltip(t.name, {   // Hover tooltip
        sticky: true, direction: 'top',
        className: 'trail-tooltip',
        offset: [0, -4]
    });
    grp.addLayer(line);
});
```

**Sidebar controls:** Two toggle buttons ("Red River Cart Trails" and "York Boat Routes") each toggle their layer group with `map.hasLayer()` / `map.addLayer()` / `map.removeLayer()`.

**Floating overlay toggles:** Added as a secondary quick-access option. Positioned near zoom controls:
1. CSS: `.trail-tog{position:fixed;z-index:1001;display:flex;flex-direction:column;gap:6px;bottom:20px;left:16px}` with `.trail-btn` styling matching theme
2. HTML: `<button class="trail-btn on" onclick="toggleCartTrails(this)">` — starts with `on` class to match default "visible" state
3. JS: Simple toggle functions that check `map.hasLayer(cartTG)`, remove or add, and toggle the button's `.on` class
4. Both floating toggles AND sidebar toggles control the same layer groups (cartTG, boatTG) — changes in one are reflected in the map immediately

**Trail CSS for tooltips:**
```javascript
var trailStyle = document.createElement('style');
trailStyle.textContent = '.trail-tooltip{background:rgba(26,23,20,0.95)!important;color:#f0e6d8!important;border:1px solid rgba(200,149,108,0.3)!important;border-radius:6px!important;padding:4px 10px!important;font-size:12px!important;}';
document.head.appendChild(trailStyle);
```

**Verification checklist after any trail edit:**
1. `grep -c '"category"' file.html` should equal 39
2. Console must be clean: `browser_console()` returns no JS errors
3. Both sidebar toggles show correct counts (23 cart, 16 boat)
4. Hover a trail line — tooltip should appear with trail name
5. Click a trail line — popup should show name, category, year, description

## Trail Data Format Conversion

**Source format** (`trails_data.json`):
```json
{"name": "Trail Name", "type": "cart", "year": "1840s", "desc": "...", "wp": [[lat,lon],[...]]}
```

**HTML format** (what the map expects):
```json
{"category": "Red River Cart Trails", "name": "Trail Name", "desc": "...", "year": "1840s", "color": "#E94560", "dash": "8, 6", "weight": 3, "coords": [[lat,lon],[...]]}
```

**Conversion logic (Python):**
```python
for t in trails_data:
    is_cart = t['type'] == 'cart'
    result.append({
        "category": "Red River Cart Trails" if is_cart else "York Boat Routes",
        "name": t['name'], "desc": t['desc'], "year": t['year'],
        "color": "#E94560" if is_cart else "#2196F3",
        "dash": "8, 6" if is_cart else "12, 6",
        "weight": 3,
        "coords": t['wp']
    })
```

## JavaScript Ordering (CRITICAL — Updated April 2026)

When assembling the HTML file, the order MUST be:
1. `const locations = [...]`
2. `const trails = [...]`
3. `const LC = {...}`
4. `const map = L.map(...)` (map init + marker/trail/sidebar JS)

If `const LC` comes AFTER `const map`, the map init code will crash with "LC is not defined" and **nothing renders**. This silently fails on file:// URLs with no visible error to the user — only `browser_console()` reveals it.

32. **CRITICAL: Undefined CSS variables silently break rendering without console errors** — If a CSS `var(--name)` is used but never defined in `:root`, the browser silently ignores that property. This caused popups to be completely invisible (no background, no shadows, wrong fonts) even though `bindPopup()` was called correctly and the DOM was there. ALWAYS scan for undefined variables before declaring a page "working":
```python
# Python check — find all var(--X) uses vs :root definitions
import re
vars_defined = set(re.findall(r'--([a-zA-Z0-9_-]+)\s*:', css_block))
vars_used = set(re.findall(r'var\(--([a-zA-Z0-9_-]+)\)', full_html))
undefined = vars_used - vars_defined
```
Common offenders: `--accent-glow`, `--sh2`, `--sh3`, `--font`. Define ALL of them in `:root`.

33. **Mobile circleMarker tap targets are too small** — On phone screens, Leaflet `circleMarker` dots (radius 5-8px) are nearly impossible to tap. Fix requires THREE things:
    (a) Map init must include `tap: true, tapTolerance: 30, clickTolerance: 10`
    (b) Add an invisible wider hit-area marker behind each dot:
    ```javascript
    var hit = L.circleMarker([loc.lat, loc.lng], {
        radius: Math.max(r + 8, 16), fillColor: 'transparent',
        color: 'transparent', fillOpacity: 0, opacity: 0, weight: 0, interactive: true
    }).addTo(map);
    hit.on('click touchend', function(e) { m.openPopup(); });
    ```
    (c) Bind both `'click'` AND `'touchend'` events: `m.on('click touchend', function() { m.openPopup(); })`

34. **Explicit popup z-index prevents being hidden behind overlays** — Add `.leaflet-popup{z-index:9999!important}` to popup CSS. The header (z-1000), timeline (z-1000), and loader (z-2000) can all block popup rendering if the popup's default z-index is lower.

35. **CRITICAL: Map recentring = popup IS opening** — When tapping a marker causes the map to pan/centre, this proves the popup IS firing (`autoPan` behaviour in Leaflet). The popup exists in the DOM but is invisible. The problem is CSS (undefined variables, zero-width/height containers), NOT JavaScript click detection. Don't waste time adding click handlers or hit areas — the click works, the popup just can't be seen.

36. **CRITICAL: `circleMarkers` appearing in the wrong location (show when zoomed out but not where you click) = coordinate system mismatch** — Leaflet calculates pixel-to-coordinate mapping based on the map container's client dimensions at init time. If fixed overlays (header, timeline, sidebar) change the visible map area after init, the coordinates are wrong. Fix: call `map.invalidateSize()` after ALL DOM elements have settled (500ms and 1000ms timeouts inside the `load` event handler). Also add `.leaflet-container{touch-action:none}` to prevent the browser from intercepting touch events.

37. **CRITICAL: Remove loading overlays/spinners on mobile — they cause persistent hangs on Android Chrome** — The `window.load` event does NOT reliably fire on Android Chrome, especially for large single-file HTML pages (~250KB). Adding `DOMContentLoaded` + timeout fallbacks also failed because `map.invalidateSize()` called during initialization throws silent errors that halt JS. **The definitive fix: remove the loading overlay entirely.** The map renders fine without it — just let the map show directly. No spinner, no overlay, no loader. If you need a `map.invalidateSize()` call for Android tile rendering, add it as a standalone `setTimeout` right after map init:
```javascript
const map = L.map('map', {center:[52.0, -99.0], zoom:5, ...});
// ... tile layer, layer groups, markers, trails ...
// Force tiles to calculate correctly (Android fix)
setTimeout(function() { try { map.invalidateSize(); } catch(e) {} }, 200);
```
Do NOT use `window.load` event listeners for hiding loaders on this map. Users testing on Android confirmed the spinner never disappears.

41. **Mobile toggle buttons need `touchend` + `preventDefault()` — `click` alone is unreliable on Android Chrome** — When adding sidebar open/close toggles, hamburger menus, or any interactive UI element, always wire BOTH `click` AND `touchend` listeners, with `e.preventDefault()` on touch to prevent double-firing:
```javascript
function closeSidebar() {
    sidebar.classList.add('closed');
    sbTog.classList.remove('open');
}
sbX.addEventListener('click', function(e) { e.preventDefault(); closeSidebar(); });
sbX.addEventListener('touchend', function(e) { e.preventDefault(); closeSidebar(); });
```
Without `touchend`, the sidebar close button may be unresponsive on Android Chrome. The `preventDefault()` is critical — without it, some browsers fire both `click` and `touchend`, causing the handler to run twice (open-then-close or close-then-open).

38. **Pitfall: Inline HTML popups are more reliable than CSS-class-based popups on mobile** — If a popup uses CSS classes (`.loc-popup`, `.pop-header`, etc.) and those classes depend on CSS variables, undefined variables cause silent popup invisibility. For bulletproof popups, use inline CSS strings directly in `bindPopup()` content instead of relying on external stylesheets.

39. **Verification: Use `map.eachLayer()` to confirm marker rendering** — If popups appear invisible, add temporary debug code: `map.eachLayer(function(l) { if(l instanceof L.CircleMarker) console.log(l.getLatLng()); });` to verify markers are actually on the map at the expected coordinates vs. rendered at wrong positions.

40. **CRITICAL: CSS animations using `transform` break Leaflet popup positioning** — Any `animation` or `transition` on `.leaflet-popup` that uses `transform` (e.g., `scale(.95)`) will **completely overwrite** Leaflet's internal `transform: translate(x, y)` positioning. This causes popups to snap to the top-right corner or origin instead of appearing at the marker. Fix: use opacity-only animations (`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`). NEVER use `transform`, `scale`, or `translate` in popup animations.

42. **CRITICAL: Unescaped quotes in JSON string values break JS parser with spinning loader** — When any JSON string value (not just `desc`, but also `name`, `founded`, `region`, `layer`, `type`, `priority`, `icon`, `ic`, `color`, `dash`, `year`) contains a raw `\"` character, the JavaScript parser fails with vague errors like `Unexpected identifier 'Hayes'` or `Unexpected string` or `Invalid or unexpected token`. The map shows only a spinning "Loading Metis Homeland..." overlay with NO visible console error to the user. **Root cause**: every `"key": value"` field must have its value wrapped in quotes: `"key": "value"`. If the opening `"` on the value is missing or stripped (e.g., `"year": 1840s"` instead of `"year": "1840s"`), the parser chokes immediately.

**The triple-escape trap**: The file has been corrupted three ways across multiple edit attempts:
  - (a) Missing opening quotes on values: `"desc": Text here"` instead of `"desc": "Text here"` — caused by global `\"` → `"` replacement that ate opening quotes
  - (b) Double-escaped quotes: `\\\"word\\\"` instead of `\"word\"` — caused by an overzealous escaping script adding extra backslashes
  - (c) Unescaped internal quotes: `"desc": ...text "quote" more...` — the original data had raw quotes inside string values
  
**CORRECT fix protocol** — NEVER do a global replace. Instead:
  1. Restore to last known-good git commit: `git checkout <clean-commit> -- file.html`
  2. For each `desc` line, find the LAST `"` followed by `,` or `}` — that's the real string close. Walk backwards from there finding all bare `"` that aren't preceded by `\` and escape each one with `\`
  3. Verify: `browser_console()` should show zero JS errors
  4. Test on mobile — the map should load with all 228 locations visible

43. **CRITICAL: CSS `animation` with `transform` + `both` fill-mode permanently overrides `transition`** — If an element has both an entry animation (e.g., `animation: slideIn .3s both`) AND a `.closed` / `.hidden` class that uses `transform` for transition-based hide/show, the animation's final computed transform state **wins** and the transition never fires. The element appears stuck open. Fix options:
  - (a) **Remove the animation entirely** — let CSS transitions handle show/hide. The element just appears instantly on page load. Simplest and most reliable.
  - (b) **Remove the animation class after it completes**: `setTimeout(() => el.style.animation = 'none', 400)` — allows the transition to take over afterward.
  - (c) **Never use `animation` + `transition` on the same element with conflicting `transform` properties.** Use `opacity`-only animations if you need both.
  
  This was the root cause of the sidebar × button appearing broken for months — the entry animation locked the sidebar in its visible state.

44. **NEVER use regex `.*?` to find bracket-delimited code blocks** — Patterns like `"coords":\s*\n\s*\[[\s\S]*?\n\s*\]` will consume MULTIPLE closing brackets if the content between `[` and `]` contains nested brackets, commas, or unexpected structures. This caused the trail coordinate smoothing script to eat 1,200+ lines of the file including locations, trails, and JS logic. **Safe approach**: Use bracket counting to find exact boundaries:
```python
def find_bracketed(text, bracket_open_pos):
    depth = 0
    pos = bracket_open_pos
    while pos < len(text):
        if text[pos] == '[': depth += 1
        elif text[pos] == ']':
            depth -= 1
            if depth == 0: return pos
        pos += 1
    return -1  # No matching bracket found
```
Then extract the content between brackets, process it, and replace by position.

45. **Trail coordinate smoothing: remove consecutive duplicates, then apply weighted moving average** — When trail coordinates bounce back and forth between settlement positions (zigzag pattern), the fix has two steps:
  (a) Remove exact consecutive duplicate coordinate pairs
  (b) Apply a weighted moving average (e.g., 0.25/0.50/0.25 or 0.3/0.4/0.3) to smooth out alternating reversals
  Only smooth if the zigzag ratio (fraction of consecutive direction reversals) exceeds 0.25. Skip trails that don't zigzag much — their coordinates are fine.
  
  Always replace the old coords array text with a compact format afterward to keep the file size manageable. Verify with `browser_console()` that no new errors were introduced.

46. **Pass data through DOM reads, not string arguments** — When adding buttons to Leaflet popups that need to identify which location they belong to, DON'T pass the location name as a string argument in `onclick=\"showSources('Name')\"`. Single quotes in location names (like \"Gabriel's Crossing\", \"Lane's Post\", \"St. Peter's Mission\") require complex JS escaping in string concatenation (`l.n.replace(/'/g, \"\\\\\\\\'\")`) that's extremely fragile across Python→JS injection layers. Instead, read the name from the popup DOM at click time:
```javascript
// HTML: onclick=\"showSources(this)\" - no string arg needed
function showSources(btn) {
    var popup = btn.closest('.leaflet-popup-content');
    var locName = popup.querySelector('h2').textContent.trim();
    var sources = LOCATION_SOURCES[locName];
    // ...
}
```
This works with ANY location name regardless of special characters, requires zero escaping, and is much easier to maintain.

  47. **CRITICAL: `write_file()` silently truncates large single-line HTML** — The HTML file has a ~25KB locations JSON data array on a single line (no newlines). `write_file()` appears to truncate content to the file's original on-disk size when the new data contains very long lines. Always verify: after `write_file()`, run `wc -c file.html` to confirm the byte count matches `len(html_string)`. If truncated, use `terminal('cat > file.html << HERMES_EOF\n...\nHERMES_EOF')` or write in smaller chunks. This caused the injections to silently drop the last ~40% of the file.

  48. **Curly apostrophes (U+2019 `'`) in original data break JS parsers** — The original location data contains curly/smart quotes (`'` instead of `'`). Node.js `--check` rejects these as `SyntaxError: Invalid or unexpected token`, but browsers are more lenient and render the page fine regardless. If you see 2 JS errors in `browser_console()` on a freshly-injected file, it may just be browser lenience masking the curly quotes. Test the page in a real browser before assuming the injection is broken. Replace them proactively: `html.replace("\u2019", "'")`.

  49. **Working citation injection pattern (verified April 2026):**
  (a) Get clean JSON from source: `terminal('sed -n "6851,7045p" file_v2.html')` then `.replace('const LOCATION_SOURCES = ', '', 1).rstrip().rstrip(';')`
  (b) Replace curly quotes first: `html.replace("\u2019", "'").replace("\u201c", "\"").replace("\u201d", "\"")`
  (c) Build injection as string concatenation ONLY — no f-strings:
  ```python
  js_before = '\\nvar LOCATION_SOURCES = '
  js_after = ';\\n\\nfunction closeSources() { ... }'
  full = js_before + json_value + js_after
  html = html[:idx] + full + html[idx+len(marker)-1:]
  ```
  (d) For popup button, use `onclick=\"showSources(this)\"` — zero escaping needed (see pitfall #46)
  (e) Verify with `terminal('wc -c file.html')` — size must increase by ~40KB for 193 citations
  (f) Test with `browser_console()` — zero JS errors means it works
  (g) The SOURCES data is injected BEFORE the `buildSB()` marker in the first script block, NOT in a separate script tag. Injecting INSIDE `<script src=\"...leaflet.js\">` tags causes catastrophic parse failure.
  (a) Extract source data from PDFs using `pymupdf` (install: `uv pip install pymupdf pymupdf4llm`)
  (b) Cross-reference map locations against source settlement names by normalizing both (lowercase, strip punctuation, word overlap scoring)
  (c) Build a separate `const LOCATION_SOURCES = { "Name": [{doc, author, page, entry, confidence}], ... }` JS object — do NOT mutate the existing `locations` array inline (JSON formatting breaks the HTML)
  (d) Inject the citations as a standalone `<script>` block before `</script>`, plus CSS for a sources modal, plus a "Sources" button appended to each location's popup HTML
  (e) Keep the 35+ unmatched locations flagged for alternate sourcing (typically out-of-region locations not covered by the Manitoba-focused Barkwell documents)
  
  Primary source documents from Lawrence Barkwell/Louis Riel Institute:
  - "Historic Métis Settlements in Manitoba and Geographical Place Names" (2018, 128 pages, ~127 settlements)
  - "20th Century Métis Displacement and Road Allowance Communities in Manitoba" (2019, 9 pages, ~24 communities)
  Together these cover ~193/228 map locations.

## Category Info Modal System (Added May 2026)

Educational context buttons (?) next to each map layer in the sidebar. Tapping opens a modal with historical description of what that category means.

**CSS:**
```css
.linfo{background:none;border:none;color:var(--t3);cursor:pointer;padding:0 4px;font-size:.85rem;line-height:1;transition:color .15s;flex-shrink:0}
.linfo:hover{color:var(--accent)}
.cat-modal{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.7);display:none;align-items:center;justify-content:center;padding:var(--lg)}
.cat-modal.show{display:flex}
.cat-modal-content{background:#232019;border:1px solid var(--brd2);border-radius:14px;max-width:500px;width:100%;max-height:80vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 12px 48px rgba(0,0,0,.6)}
.cat-modal-header{padding:var(--md);border-bottom:1px solid var(--brd);display:flex;align-items:center;justify-content:space-between}
.cat-modal-title{font-size:1rem;font-weight:700;color:var(--t1)}
.cat-modal-close{background:none;border:none;color:var(--t3);font-size:1.5rem;cursor:pointer;padding:0 4px;line-height:1}
.cat-modal-close:hover{color:var(--accent)}
.cat-modal-body{padding:var(--md);overflow-y:auto;color:var(--t2);font-size:.85rem;line-height:1.6}
```

**Data structure** — `CAT_DESC` object keyed by layer name:
```javascript
const CAT_DESC = {
    'Road Allowance Communities': '<p>...</p><p>...</p>',
    'Battles & Resistance': '<p>...</p>',
    // ... one entry per category
};
```

**HTML for the modal** — add after `</aside>`:
```html
<div class="cat-modal" id="cat-modal">
  <div class="cat-modal-content">
    <div class="cat-modal-header">
      <div class="cat-modal-title" id="cat-modal-title"></div>
      <button class="cat-modal-close" id="cat-modal-close">&times;</button>
    </div>
    <div class="cat-modal-body" id="cat-modal-body"></div>
  </div>
</div>
```

**JS — Info button injection in sidebar builder:**
```javascript
var infoBtn = CAT_DESC[name] ? '<button class="linfo" data-cat="' + name + '" title="Learn about this category">?</button>' : '';
d.innerHTML = '<span class="ldot on" style="background:' + color + '"></span>' + name + '<span class="lcnt">' + cnt + '</span>' + infoBtn;
// Click handler must skip info button clicks:
d.addEventListener('click', function(e) {
    if (e.target.classList.contains('linfo')) return;
    // ... existing toggle logic
});

// Event delegation for info buttons
ld.addEventListener('click', function(e) {
    if (e.target.classList.contains('linfo')) {
        var cat = e.target.getAttribute('data-cat');
        if (CAT_DESC[cat]) showCategoryInfo(cat, LC[cat] || '#c8956c');
    }
});
```

**Content writing guidelines** — Each category description should be historically grounded, explain WHY the category exists in Métis history, include concrete examples (place names, events), be 2-4 short `<p>` paragraphs, and be accessible to general users.

## Route/Trail Coordinate Quality (Added April 2026)

**Windiness ratio analysis** — To verify trail/route accuracy, compute the ratio of actual path length to straight-line distance using haversine (or planar for short trails):
```python
import math
floats = [...coords...]
straight = haversine(floats[0][0], floats[0][1], floats[-1][0], floats[-1][1])
actual = sum(haversine(floats[i][0], floats[i][1], floats[i+1][0], floats[i+1][1]) for i in range(len(floats)-1))
ratio = actual / straight  # 1.0 = perfectly straight, >1.2 = follows actual geography
```

**What the ratios mean:**
- 1.00-1.05x = essentially a straight line (broken/needs fixing for long routes)
- 1.05-1.20x = mildly curving, reasonable for flat prairie trails
- 1.20-2.0x = clearly follows waterways/terrain
- 2.0x+ = very winding (rivers, lake shorelines, circuitous routes)

**Fixing straight-line routes to follow actual waterways/settlements:**
1. Identify key control points along the route (settlements, river confluences, portage points)
2. Define waypoints at each control point with realistic lat/lng
3. Use curve interpolation between key points for natural feel:
```python
def curve_waypoints(key_pts, n_per_segment=6):
    result = []
    for i in range(len(key_pts) - 1):
        f, t = key_pts[i], key_pts[i+1]
        for j in range(n_per_segment):
            alpha = j / (n_per_segment - 1)
            lat = f[0] + (t[0] - f[0]) * alpha
            lng = f[1] + (t[1] - f[1]) * alpha
            offset = math.sin(alpha * math.pi) * 0.25  # S-curve offset
            dlat, dlng = t[0]-f[0], t[1]-f[1]
            dist = math.sqrt(dlat**2 + dlng**2)
            if dist > 0.01:
                perp_lat = -dlng/dist * offset
                perp_lng = dlat/dist * offset * 0.4
                lat += perp_lat
                lng += perp_lng
            result.append([round(lat, 2), round(lng, 2)])
    result.append([key_pts[-1][0], key_pts[-1][1]])
    return result
```
4. Replace the coords array in the HTML by finding the trail by name+year, locating the `[` bracket, counting bracket depth to find the matching `]`, then replacing the entire array

**Key insight:** For flat prairie trails (Red River, Assiniboine, Saskatchewan Landing), genuinely low ratios (1.01-1.05x) are geographically correct — these rivers don't wind much. Don't force curves where they don't belong. Focus on routes that should obviously follow waterways (Lake Winnipeg crossings, river systems with rapids, lake shorelines).

## Testing Leaflet Popups in Headless Browser

**CRITICAL: Leaflet popups DO NOT appear in the accessibility tree** — `browser_snapshot()` (even full=true) only captures the sidebar/controls. Popups are rendered as overlay `<div>` elements that the accessibility tree skips. To verify popup content:
- Use `browser_vision()` with a question like "What text appears in the popup window on the map?" — this sees the rendered overlay
- If vision is unavailable (credits exhausted), inject a temporary JS `document.querySelector('.leaflet-popup-content').textContent` via `browser_console()` output or evaluate
- Alternatively, open the popup programmatically: `page.evaluate(() => markers[0].openPopup())` then screenshot

**PRESSING ENTER in the search box can cause a FULL PAGE RELOAD** — Some browser automation triggers form submission (default action) when Enter is pressed in a text input, which reloads the single-file HTML page and resets all state. If the snapshot suddenly shows `element_count: 0` after pressing Enter, the page reloaded. Workaround: type the search term and let the map's auto-filter handle it (no Enter needed), or call the JS search function directly via evaluate.

**browser_vision returns 402 credit errors but still captures screenshots** — When OpenRouter credits are exhausted, `browser_vision` fails with a 402 error BUT still returns a `screenshot_path`. Share this path with the user via `MEDIA:<path>`. You can also use the screenshot with `vision_analyze()` as a fallback (different model, may have credits).

**Rich popup data completeness** — Location objects contain these fields: `name`, `lat`, `lng`, `type`, `founded`, `desc`, `region`, `layer`, `icon`, `ic`, `priority`. The popup should display ALL of them: name in header, type and priority as colored badges, founded/region/layer/coordinates in a data grid, and the full description scrollable below. Use inline CSS in bindPopup() for reliability — CSS class-based popups are fragile when CSS variables are undefined.

50. **CRITICAL: A single undefined JS variable crashes ALL downstream code on page load** — In a single-file HTML map, if any unhandled exception occurs during script execution (e.g., `lb.appendChild(jctBtn)` where `lb` was never defined instead of `ld`), **every script that comes after it in the file silently stops running**. This means the hamburger menu, era slider, popup handlers, and all other interactive features appear "broken" when the real bug is one typo dozens of lines earlier. When multiple unrelated features fail simultaneously:
  (a) ALWAYS check `browser_console()` for the FIRST error on page load — not the last symptom you noticed
  (b) Trace the error to its line number, then read surrounding code for typos or missing variable declarations
  (c) Fix the one root cause, reload, and verify ALL features work — no need to "fix" each broken feature separately
  (d) This was the root cause of v2's hamburger, slider, and sources buttons all appearing non-functional (fixed: `lb` → `ld` on line ~6570, May 2026)

51. **CRITICAL: Missing `});` on any addEventListener breaks ALL downstream code** — The `boatBtn` click handler was missing its closing `});`. The function body opened with `function() {` but jumped straight into the next code block without closing. This created a syntax error that prevented the sidebar toggle, era slider, and all downstream listeners from attaching. When features appear to have "no listeners attached" despite clean-looking code, check for unclosed event handlers.

52. **Stray `});` at the wrong scope level creates cascading parse errors** — The junction points code had `ld.appendChild(jctBtn);    updCount();` followed by a stray `});` that didn't match any opening brace. This happened because the original code nested jctBtn inside the boatBtn handler (missing closing brace), then added a `});` that became orphaned. When fixing such errors, ensure every `{` has a matching `}` at the CORRECT indentation/scope level.

53. **CRITICAL: Era slider toggle interaction bug — definitive fix** — `applyTimeline()` calls `cartTG.clearLayers()` then conditionally re-adds era-matching trails. But `cartTG` stays on the map (`map.hasLayer(cartTG)` = `true` even when empty!). The toggle check `map.hasLayer(cartTG)` returns true → thinks it's showing trails → removes the layer group → user can't toggle back ON.
  
  **DO NOT use `map.hasLayer()` for toggle state when trail groups are shared with an era filter.** The layer group is always "on the map" even when cleared to 0 layers. Neither `Object.keys(cartTG._layers)` nor `cartTG.getLayers().length` worked reliably in the live v3 context.
  
  **Definitive fix: use the button's `.on` class as the single source of truth**:
  ```javascript
  cartBtn.addEventListener('click', function() {
      if (cartBtn.classList.contains('on')) {
          map.removeLayer(cartTG);
          cartBtn.classList.remove('on');
      } else {
          cartTG.clearLayers();
          trails.forEach(function(t) {
              if (t.category === 'Red River Cart Trails') addTrailToGroup(t, cartTG);
          });
          map.addLayer(cartTG);
          cartBtn.classList.add('on');
      }
  });
  ```
  The era filter modifies layers INSIDE the group; the toggle controls whether the group is on the map AT ALL. They are conceptually separate concerns and should NOT share state logic.

54. **V3 development workflow** — Always save working versions with incremented version numbers (`Interactive_Homeland_Map_v3.html`, etc.). Keep previous versions as backup. NO pushing to production (GitHub Pages) until user explicitly confirms fixes are verified. Test every change locally (localhost HTTP server + `browser_console()`) before pushing. Push to raw GitHub URL for immediate testing, Pages deployment lags by 1-3 minutes. User confirms on mobile.

55. **CRITICAL: Before pushing ANY changes to the map file, verify all referenced JS functions actually exist** — In this session, `addTrailToGroup(t, grp)` was called in 5 places (trail toggles, timeline filter, reset function) but was never defined as a function. The initial trail rendering worked because it was inline (not calling the function). The toggle code silently failed because JavaScript throws "function is not defined" at runtime — invisible to the user, only caught by `browser_console()` or checking the function exists. **Always grep for all function references before committing**: `grep -n "addTrailToGroup\|function addTrailToGroup" file.html | grep -c "function"`. If count is 0 but function is called elsewhere, you've got a silent failure. This pitfall was introduced when the map was rebuilt through multiple patch/injection cycles — the function extraction was planned but never actually applied.

56. **Git push can silently fail with rebase conflicts on divergent branches** — When `git pull` shows divergent branches, the safe approach is: `git reset --hard origin/main` then re-apply your fix. Using `git stash` + `git pull --rebase` can create merge conflicts that corrupt the HTML file (add/add conflicts on single massive files are disastrous). The `reset --hard` approach is cleaner for single-file repos where the remote version is the ground truth. Always verify: `grep -n "function addTrailToGroup" file.html` after reset to confirm the function exists.

