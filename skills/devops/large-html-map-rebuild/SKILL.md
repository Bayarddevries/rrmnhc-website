---
name: large-html-map-rebuild
description: Approach for incrementally rebuilding and modifying large HTML files with embedded JS data (Leaflet maps, etc.) without corrupting or losing data sections.
category: devops
---

# Large HTML Map Rebuild

## When to use
- Rebuilding a large HTML file (>5K lines) that has embedded JS data (locations arrays, trail coordinates, config objects)
- Adding new features (timelines, filters, themed popups) to existing single-file maps
- Injecting new data (full trail datasets) while preserving existing code

## Core approach: Three-part assembly

### 1. Extract data blocks by line number (NOT regex)
```python
with open('source.html', 'r') as f:
    lines = f.readlines()

# Read exact line ranges - much safer than regex for nested arrays/objects
locations_block = ''.join(lines[start:end])
trails_block = ''.join(lines[start2:end2])
lc_block = ''.join(lines[start3:end3])
```

**Don't** try to regex-extract `const arr = [...]` — bracket matching across 3000+ lines is fragile.

### 2. Build HTML in clear sections
```
[css + html structure]  →  static template string
[data block 1]          →  extracted from source
[data block 2]          →  extracted from source (or new JSON)
[data block 3]          →  extracted from source
[js logic]              →  hand-written, references data above
```

### 3. Inject incremental changes with patch tool
For CSS additions, JS additions, small fixes — use `patch()` with exact surrounding context:
```python
patch(path='map.html', old_string='existing context + code', new_string='existing context + new code')
```

**Critical: Always verify order after patching**
```python
for name in ['const locations', 'const trails', 'const LC', 'const map']:
    pos = content.find(name)
    print(f"{name}: {'OK' if pos > 0 else 'MISSING'} at {pos}")
```

## Common pitfalls

### Old code blocks survive alongside new code
When replacing sections, the old code often remains. Always search for stale references:
```python
if 'TG.addLayer' in content and 'TG = L.layerGroup' not in expected_place:
    # Dead code block exists - remove it
```

### Map init code gets swallowed
When replacing the trails array and there's JS logic immediately after it, a greedy replace can eat the map initialization code. **Fix:** always re-verify `const map = L.map` and `const LC = {` are present after any block replacement.

### Double-const syntax errors
When generating JS via f-strings, watch for: `const line = const line = L.polyline(...)` — this happens when the replacement string accidentally includes the variable declaration twice.

## Leaflet-specific patterns

### Layer separation pattern
Keep separate layer groups for different trail types (Cart Trails, Boat Routes) with independent sidebar toggles:
```javascript
const cartTG = L.layerGroup().addTo(map);
const boatTG = L.layerGroup().addTo(map);
trails.forEach(function(t) {
    var grp = t.category === 'Red River Cart Trails' ? cartTG : boatTG;
    // build line, add to grp
});
```

### Timeline filter pattern
Range slider parsing:
```javascript
var eras = [0, 1680, 1720, ..., 9999];
function parseFirstYear(text) {
    var m = text.match(/(\d{4})/);
    return m ? parseInt(m[1]) : 9999;
}
```

### Popup card pattern
Themed popup using CSS classes instead of inline styles:
```javascript
m.bindPopup(
    '<div class="loc-popup">' +
    '<div class="pop-header">...</div>' +
    '<div class="pop-desc">...</div>' +
    '</div>'
);
```

## Workflow checklist
After any edit, verify:
1. All data blocks present (locations, trails, LC)
2. Map init code intact (const map = L.map)
3. No duplicate const declarations
4. No stale references to removed objects
5. Open in browser, check console for JS errors