---
name: single-file-map-rebuild
description: Incrementally rebuild a single-file HTML map (Leaflet-based) with rich data — extract data from source files, inject into new themed template, remove dead code, commit step-by-step. Adaptable to any mapping project with locations + trails/routes.
version: 1.0
author: Hermes Agent + Bayard DeVries
created: 2026-04-06
tags: [map, leaflet, html, single-file, rebuild, trails, locations, css-variables, dark-theme]
---

# Single-File HTML Map Rebuild

Pattern for incrementally rebuilding a Leaflet-based interactive map from existing data, adding new datasets, and improving UI one step at a time.

## WHEN TO USE
- You have an existing HTML map file with embedded data (locations, trails, etc.)
- You want to redesign the UI (theme, sidebar, popups) without losing data
- You have external data files (JSON, CSV) to inject
- User wants step-by-step incremental changes, not a full rewrite

## STEP-BY-STEP PLAN

### Step 0: Audit existing files
```bash
find /home/bayard_devries -name "*.html" | grep -i metis|map|heritage
find /home/bayard_devries -name "*.json" | grep -i trail|map
```
Identify: which file has the data, which has the map, which is the "source of truth".

### Step 1: Extract data blocks from source files
Use Python + read_file line ranges (NOT regex for large JSON — JSON.parse is too slow):

```python
with open('source.html', 'r') as f:
    lines = f.readlines()

# Extract by known line ranges from read_file
locations_block = ''.join(lines[loc_start:loc_end])
trails_block = ''.join(lines[trail_start:trail_end])
lc_block = ''.join(lines[lc_start:lc_end])
```

For external JSON files (trails_data.json, etc.), use `json.load()` directly.

### Step 2: Build the new HTML template
Write the CSS + HTML structure first, leave a `<script>` tag open:
```html
<!DOCTYPE html>...
<style>/* CSS variables, theme rules, leaflet overrides */</style>
</head><body>...</body><script>
```

### Step 3: Assemble the complete file
```python
final = html_top + locations_block + '\n\n' + trails_block + '\n\n' + lc_block + '\n' + map_js + '\n</script>\n</body>\n</html>'
```

**Data order matters:** `const locations` → `const trails` → `const LC` → map init JS

### Step 4: Verify all parts present
```python
checks = {
    'locations': 'const locations = [',
    'trails': 'const trails = [',
    'LC': 'const LC = {',
    'map': 'const map = L.map',
    'LG': 'const LG = {}',
}
```

### Step 5: Remove dead/old code
**CRITICAL:** When replacing functionality (e.g., old TG trail code with new split cartTG/boatTG), the old code block is NOT automatically removed by patch(). You MUST explicitly patch+remove it:

```python
# Find both old and new code
# Old: const TG = L.layerGroup().addTo(map); trails.forEach(...)
# New: const cartTG = ..., const boatTG = ..., trails.forEach(...)

# Remove the old dead block
patch(old_string='// ===== Trail lines =====\nconst TG...\n});\n', new_string='')
```

**Verify no stale references remain:**
```python
for pat in ['TG.addLayer', 'map.hasLayer(TG)', 'const TG =']:
    if pat in content and 'cartTG' not in pat and 'boatTG' not in pat:
        print(f"STALE REFERENCE: {pat}")
```

### Step 6: Open in browser and verify
```python
browser_navigate('file:///path/to/map_v2.html')
browser_console()  # Check for JS errors
```

### Step 7: Commit to git
```bash
cd /path/to/repo && git add Interactive_Homeland_Map_v2.html
git commit -m"Step N: description"
git push
```

## INJECTING EXTERNAL TRAIL DATA

When trails come from a separate JSON file (trails_data.json) with different schema than the HTML expects:

```python
import json

with open('trails_data.json', 'r') as f:
    trails_data = json.load(f)

# Convert format
new_trails = []
for t in trails_data:
    is_cart = t['type'] == 'cart'
    new_trails.append({
        "category": "Red River Cart Trails" if is_cart else "York Boat Routes",
        "name": t['name'],
        "desc": t['desc'],
        "year": t['year'],
        "color": "#E94560" if is_cart else "#2196F3",
        "dash": "8, 6" if is_cart else "12, 6",
        "weight": 3,
        "coords": t['wp']
    })

trails_js = 'const trails = ' + json.dumps(new_trails, indent=2)
```

## THEMING WITH CSS VARIABLES

Use a unified CSS variable system for consistent dark themes:
```css
:root {
  --bg:#1a1714; --bg2:#232019; --bg3:#2e2a22;
  --accent:#c8956c; --accent2:#e6a97c; --accent3:#d4865a;
  --glow:rgba(200,149,108,0.15);
  --t1:#f0e6d8; --t2:#a89b8c; --t3:#7a6f63;
  --brd:rgba(200,149,108,0.12); --brd2:rgba(200,149,108,0.25);
  --r1:6px; --r2:10px; --r3:14px;
}
```

## POPUP REDESIGN PATTERN

Replace generic Leaflet popups with themed cards:
```javascript
m.bindPopup(
  '<div class="loc-popup">' +
  '<div class="pop-header"><div class="pop-accent" style="bg:COLOR"></div>' +
    '<h3>Name</h3><span class="pop-type">Type</span>' +
  '</div>' +
  '<div class="pop-meta"><span>meta1</span><span>meta2</span></div>' +
  '<div class="pop-desc">Description</div>' +
  '<div class="pop-footer"><badge>Priority</badge></div>' +
  '</div>'
);
```

## COMMON PITFALLS

### Deploying to GitHub Pages — remote might not match local
When you `git push` a file, the remote is what the live page serves. If a previous push introduced broken code (syntax errors, bloated CSS/data), the **deployed version is broken even if your local copy is fine**. Before debugging, always compare local vs remote:

```python
import urllib.request
with urllib.request.urlopen(url) as resp:
    remote = resp.read().decode('utf-8')
# Compare sizes, find first diff
```
If they differ, the fix is: copy the working local version to the repo, commit, and push.

### Git push can silently introduce bugs from a stale remote
When you `git push` a file, the remote might already have diverged from your local copy. If a previous commit added broken code, your local version might be a completely different file. **Before debugging, ALWAYS compare local vs remote:**

```python
import urllib.request
with urllib.request.urlopen(url) as resp:
    remote = resp.read().decode('utf-8')
# Compare sizes, find first diff
```
If they differ significantly (e.g. remote is 44KB larger with different CSS/data), the fix is: copy the working local version to the repo, commit, and push.

### Duplicate closing brackets in forEach blocks
When building inline popups inside a `locations.forEach()` loop, the popup HTML template often has closing `)` characters in strings (e.g., `)</div>`). If a patch removes one `});` too many or adds one extra, you get stray `});` that are hard to spot in 6000+ lines. Always extract the JS and do a bracket count:

```python
lines = js.split('\n')
stack = []
for i, line in enumerate(lines, 1):
    for j, ch in enumerate(line):
        if ch in '{([': stack.append((ch, i))
        elif ch in '})]':
            if not stack:
                print(f"ORPHAN '{ch}' at line {i}")
            else: stack.pop()
```
The telltale error: "Unexpected token '}'" — it's usually a duplicate `});` right after a `forEach` closes.

### Sidebar button HTML entity mismatch
When injecting buttons near existing elements, match the exact HTML entity used. The existing sidebar toggle uses `&#9776;` (hamburger), NOT the Unicode `☰`. String replacements will fail if you use the wrong one. When in doubt, search the file first.

### Popups rendering but invisible — map recentring is the key diagnostic
If tapping a marker causes the map to recentre, Leaflet's `autoPan` IS firing and the popup IS opening — it's just invisible. This is a CSS problem, not a click problem. Common culprits: undefined CSS variables in popup styles, `z-index` layering issues, or `visibility:hidden`/`opacity:0` on wrapper elements. **Strip down to inline HTML styles first** to verify the popup pipeline works, then layer CSS classes back on.

### Debug overlay pattern for mobile interaction issues
When popups/taps don't work on mobile, add a visible debug panel and test marker to isolate the issue:
```javascript
// Add a large red test marker with inline HTML popup
var testMarker = L.circleMarker([52.0, -99.0], {
    radius: 25, fillColor: 'red', color: 'yellow', weight: 3,
    fillOpacity: 1, opacity: 1
}).addTo(map);
testMarker.bindPopup('<div style="color:#f0e6d8;background:#1a1714;padding:10px;">TEST - Tap works!</div>');
testMarker.on('click', function() { testMarker.openPopup(); });

// Map eachLayer to count markers
var count = 0;
map.eachLayer(function(l) { if(l.getLatLng) count++; });
console.log('Visible markers:', count);
```

### Inline HTML popups are more reliable than CSS class-based ones
Complex popup HTML with external CSS classes can fail silently on mobile. When debugging popups, switch to fully inline HTML:
```javascript
var popupContent = [
    '<div style="font-family:sans-serif;color:#f0e6d8;min-width:250px;">',
    '<div style="background:#c8956c;color:#fff;padding:10px;border-radius:8px 8px 0 0;font-weight:700;">', loc.name, '</div>',
    '<div style="padding:10px;background:#232019;font-size:13px;">', loc.desc, '</div>',
    '</div>'
].join('');
m.bindPopup(popupContent, { maxWidth: 350, autoPan: true });
```
Once this works, gradually add CSS classes back.

### Invisible hit area for small markers on mobile
CircleMarkers smaller than ~12px radius are hard to tap on touch screens. Add a transparent wider circle behind each one:
```javascript
// Invisible wider touch target for mobile (20px radius)
var hitArea = L.circleMarker([loc.lat, loc.lng], {
    radius: 20, fillColor: 'transparent', color: 'transparent',
    fillOpacity: 0, opacity: 0, weight: 0, interactive: true
}).addTo(map);
hitArea.on('click touchend', function() { m.openPopup(); });
```

### Undefined CSS variables silently break interactivity
Missing CSS variable definitions (e.g. `--accent-glow`, `--font`, `--sh2`, `--sh3`) cause elements to render but become invisible or unclickable — no JS errors, no console warnings. The map tiles load, markers show, but popups don't appear and nothing is clickable. Always audit CSS variables after major edits:

```python
vars_used = set(re.findall(r'var\(--([a-zA-Z0-9_-]+)\)', content))
vars_defined = set(re.findall(r'--([a-zA-Z0-9_-]+)\s*:', content))
undefined = vars_used - vars_defined
```

If any are undefined, add them to `:root` before pushing. Also bump popup z-index to `9999!important` if popups are behind other elements.

### Toggle UI: prefer existing sidebar layer controls
Don't add floating toggle buttons on the map — there's already a sidebar layer panel. If the user wants trail toggles visually separated from point layers, add a section header (style: muted uppercase label, non-clickable) before the trail toggles in the sidebar. Users will reject floating buttons with emoji icons.

### Marker references for layer filtering
When filtering/hiding markers (timeline, search, etc.), NEVER use `eachLayer()` to find markers once they've been hidden — removed markers are invisible to `eachLayer()` and can't be brought back. **Always store direct refs:**

```javascript
// During marker creation — store the ref
LG[loc.layer].addLayer(m);
loc._marker = m;

// During filtering — use the direct ref (not eachLayer search)
var m = loc._marker;
if (year <= cutoff) {
    if (!LG[loc.layer].hasLayer(m)) LG[loc.layer].addLayer(m);
} else {
    if (LG[loc.layer].hasLayer(m)) LG[loc.layer].removeLayer(m);
}
```

### Duplicate trail code
When adding new trail rendering (e.g., split into cart/boat groups), the OLD trail code block often survives. Always check for and remove it. Symptoms: trails render double, old combined toggle still exists alongside new split toggles.

### JSON too large for browser tools
Files >100KB won't load well in browser. Use Python extract → inject into template approach instead.

### Line-based extraction is more reliable than regex
For large embedded JSON arrays, use read_file with offset/limit to find start/end lines, then Python string slicing. Regex for bracket counting is slow and error-prone.

### Unescaped quotes in JS strings cause complete page hang (NO console errors)
When embedding JSON data with rich descriptions inside a single-file HTML, unescaped quotes inside string values will cause the **entire page to hang** — the loading overlay never disappears, map tiles never load, and **the browser console shows ZERO errors**. This is the single most common cause of a broken deploy.

**The diagnostic pattern:** Loading overlay stuck forever + no JS errors + no tile rendering = syntax error in the script that kills the parser before anything runs.

**CRITICAL: Do NOT blindly replace all `\"` with `"`** — this removes legitimate escaping and creates MORE broken strings. The file can end up with **double-escaped quotes** (`\\"`) from multiple patch rounds, which is worse than no escaping.

**Correct fix workflow:**
1. **Extract the script from the HTML** and run a syntax check:
```python
import re
with open('map.html', 'r') as f: content = f.read()
script_start = content.index('<script>') + 8
script_end = content.index('</script>')
script = content[script_start:script_end]
with open('/tmp/check.js', 'w') as f: f.write(script)
```
```bash
node --check /tmp/check.js 2>&1
```
Node will report the EXACT line and reason of the parse failure (e.g., `SyntaxError: Unexpected string`).

2. **Read the exact line** Node flagged to see the broken string:
```python
lines = script.split('\n')
print(lines[error_line_number])  # 0-indexed
```

3. **Identify the specific type of problem:**
   - `\"` (raw quote inside double-quoted string) → needs escaping as `\"`
   - `\\"` (double-escaped quote) → should be `\"`
   - `'` inside single-quoted JS string → needs escaping as `\'`
   - Unclosed string due to premature `'` → escape the apostrophe

4. **Fix at the source** — patch only the affected string values, not the entire file.

5. **Re-run `node --check`** to confirm it passes before pushing.

**When the file is too corrupted from multiple bad edits:**
Restore from last known-good git commit, then re-apply only the intentional changes:
```bash
cd /path/to/repo && git checkout <good-commit-hash> -- Interactive_Homeland_Map_v2.html
```

**Prevention: always run `node --check` after any description edits.**

**Double-quoted strings** (`"desc": "value"`): Any `"` inside the value must be escaped as `\"`:
```javascript
// BROKEN:
"desc": "Critical junction. [Parks Canada, \"Hayes River\"]"
// Wait, this looks right but if the escaping gets corrupted during patch:
"desc": "Critical junction. [Parks Canada, "Hayes River"]"
// This causes JS parse error BEFORE anything runs
```

**Single-quoted JS strings** (`'key': 'value'`): Apostrophes like `Métis'` must be escaped as `\'`:
```javascript
// BROKEN:
'Métis': 'The Métis' own system of land occupation'
// The apostrophe in Métis' terminates the string prematurely
```

**The diagnostic:** If the map shows a loading overlay that never goes away AND no JS errors in console, the page has a parse error that kills the script before the `window.load` handler fires. The fix: scan all description strings for unescaped quotes and apostrophes, escape them, and push.

**Prevention script** — run after any description edits:
```python
import re
with open('map.html', 'r') as f: content = f.read()
# Find all desc fields and check for unescaped quotes
for m in re.finditer(r'"desc"\s*:\s*"((?:[^"\\]|\\.)*)"', content):
    desc = m.group(1)
    if desc.count('"') > desc.count('\\"'):
        print(f"PROBLEM at pos {m.start()}: unescaped quotes in desc")
# For single-quoted JS object values:
# Scan for 'key': 'value' where value contains unescaped apostrophes
for val_m in re.finditer(r":\s*'([^']*(?:\\'[^']*)*)'", content):
    val = val_m.group(1)
    if "'" in val.replace("\\'", ""):
        print(f"PROBLEM at pos {val_m.start()}: unescaped apostrophe")
```

### Coordinate routes: make trails follow real geography
Routes drawn as straight lines between endpoints look obviously fake. The fix:
1. Identify key historic stops/settlements as anchor waypoints
2. Interpolate between stops using `curve_waypoints()` to add natural perpendicular offsets
3. Verify with **windiness ratio**: `actual_path_distance / straight_line_distance`
   - Ratio > 1.3x: route visibly curves
   - Ratio 1.0-1.1x: effectively a straight line
   - Short trails (< 30km) can legitimately be ~1.0x

```python
import math

def curve_waypoints(stops, n_per_segment=6, curviness=0.3):
    """Interpolate between anchor points with natural curvature."""
    result = []
    for i in range(len(stops) - 1):
        f, t = stops[i], stops[i + 1]
        n = max(3, n_per_segment)
        for j in range(n):
            alpha = j / (n - 1)
            lat = f[0] + (t[0] - f[0]) * alpha
            lng = f[1] + (t[1] - f[1]) * alpha
            # Perpendicular offset for natural feel
            offset = math.sin(alpha * math.pi) * curviness
            dlat, dlng = t[0] - f[0], t[1] - f[1]
            dist = math.sqrt(dlat**2 + dlng**2)
            if dist > 0.01:
                lat += -dlng / dist * offset
                lng += dlat / dist * offset * 0.4
            result.append([round(lat, 2), round(lng, 2)])
    result.append([stops[-1][0], stops[-1][1]])
    return result

# Example: Carlton Trail through historic stops
stops = [
    [49.89,-97.14],  # Fort Garry
    [49.92,-97.55],  # Grantown
    [49.96,-98.31],  # Portage la Prairie
    [50.48,-101.27],  # Fort Ellice
    [52.75,-106.12],  # Batoche
    [53.54,-113.49],  # Edmonton
]
coords = curve_waypoints(stops, n_per_segment=8)
```

### Always validate JS before opening in browser
After patching, run `node -c` on the extracted JS before testing:
```python
import subprocess
js = content[content.index('<script>') + len('<script>'):content.index('</script>', content.index('<script>'))]
with open('/tmp/check.js', 'w') as f: f.write(js)
result = subprocess.run(['node', '-c', '/tmp/check.js'], capture_output=True, text=True)
```
This catches stray quotes, duplicate `});`, and mismatched braces that browser_console errors obscure.

### Watch for HTML artifacts in string replacements
When doing string `.replace()` on large files, stray characters (`'`, `"`) can be left behind. Always verify with grep after replacement. Common symptoms: "Unexpected token" errors in browser but `node -c` passes on extracted JS (because the artifact is in HTML, not JS).

### Responsive design breakpoints
Use 3-tier responsive approach:
- **768px**: Tablet/mobile transition — stacked header, full-width slide-in sidebar, compact timeline (hide year labels), larger touch targets (24px slider thumb, 36px buttons), legend stretches full-width
- **480px**: Small phones — hide subtitle, smaller fonts, thinner header
- **1200px**: Large desktops — slightly wider sidebar (280px)

### Loading overlay pattern
Add a spinner overlay that fades out after window load:
```html
<div class="map-loader" id="map-loader">
  <div class="loader-ring"></div>
  <div class="loader-text">Loading...</div>
</div>
```
```javascript
window.addEventListener('load', function() {
    var loader = document.getElementById('map-loader');
    if (loader) setTimeout(function() { loader.classList.add('done'); }, 400);
});
```

### Entry animations
Add subtle entry animations for polish:
```css
.sidebar{animation:slideIn .3s .2s both}
.legend{animation:fadeUp .4s .3s both}
.timeline{animation:fadeUp .3s .4s both}
@keyframes slideIn{from{transform:translateX(calc(-100% - 8px));opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
```
Override `.closed` class with `animation:none` to avoid conflict.

### Sidebar toggle with slide animation
Add a close button (×) in the sidebar header and a toggle button (☰) outside it:
```css
.sidebar.closed{transform:translateX(calc(-100% - var(--md)));opacity:0;pointer-events:none}
.sb-tog.open{opacity:0;pointer-events:none;transform:scale(.95)}
```
```javascript
sbX.addEventListener('click', function() {
    sidebar.classList.add('closed');
    sbTog.classList.remove('open');
});
sbTog.addEventListener('click', function() {
    sidebar.classList.remove('closed');
    sbTog.classList.add('open');
});
```

### Legend repositioning when timeline is active
When adding a bottom bar (timeline), push the legend up:
```javascript
document.querySelector('.legend').style.bottom = '90px';
```

### parseFirstYear for vague dates
Handle fuzzy historical dates that should always appear:
```javascript
function parseFirstYear(text) {
    if (!text) return 99999;
    var low = text.toLowerCase();
    if (low.indexOf('ancient') > -1 || low.indexOf('historic') > -1 || 
        low.indexOf('oral') > -1 || low.indexOf('traditional') > -1 ||
        low.indexOf('approximate') > -1) return 1;
    var m = text.match(/(\d{4})/);
    return m ? parseInt(m[1]) : 99999;
}
```