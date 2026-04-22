---
name: leaflet-cart-trail-connectivity-fix
description: Diagnose and fix disconnected trail networks in single-file Leaflet HTML maps by analyzing endpoint coordinates and adding connector trails.
category: single-file-html-map-editing
tags: [leaflet, trails, connectivity, coordinates, debugging, map-fix]
---

# Leaflet Trail Connectivity Fix

Diagnose and fix disconnected trail networks in single-file Leaflet HTML maps.

## When to Use
- User reports trails look disconnected or floating on map
- Need to verify all trails in a network are properly connected
- Adding geographic context to isolated trail segments
- Debugging coordinate issues in large single-file HTML maps

## Diagnosis Steps

### 1. Extract Trails from HTML
Use Node.js to safely parse the JavaScript trails array:

```bash
# Write parse script to avoid shell escaping issues
# Parse the trails array by counting brackets
node -e "
const fs = require('fs');
const content = fs.readFileSync('path/to/map.html', 'utf8');
const startMarker = 'const trails = [';
const startIndex = content.indexOf(startMarker);
let depth = 1;
let pos = startIndex + startMarker.length;
while (depth > 0 && pos < content.length) {
    if (content[pos] === '[') depth++;
    if (content[pos] === ']') depth--;
    pos++;
}
const trailsStr = content.substring(startIndex + startMarker.length, pos - 1);
const trails = eval('[' + trailsStr + ']');

// Filter by category
const cartTrails = trails.filter(t => t.category === 'Red River Cart Trails');
console.log('Total: ' + trails.length + ', Cart: ' + cartTrails.length);

// Print endpoints
cartTrails.forEach(t => {
    const coords = t.coords || [];
    const s = coords[0], e = coords[coords.length-1];
    console.log(t.name + ': ' + coords.length + 'pts -> [' + 
        s[0].toFixed(2) + ',' + s[1].toFixed(2) + '] to [' +
        e[0].toFixed(2) + ',' + e[1].toFixed(2) + ']');
});

// Save for analysis
fs.writeFileSync('/tmp/cart_trails.json', JSON.stringify(cartTrails, null, 2));
"
```

### 2. Find Disconnected Components
Run Python connectivity analysis:

```python
import json

with open('/tmp/cart_trails.json') as f:
    trails = json.load(f)

def dist(p1, p2):
    return ((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)**0.5

THRESHOLD = 0.5  # ~50km proximity threshold

# Build adjacency list
connections = {}
for i, t1 in enumerate(trails):
    connections[i] = set()
    start1, end1 = t1['coords'][0], t1['coords'][-1]
    for j, t2 in enumerate(trails):
        if i == j: continue
        start2, end2 = t2['coords'][0], t2['coords'][-1]
        if (dist(start1,start2) < THRESHOLD or dist(start1,end2) < THRESHOLD or
            dist(end1,start2) < THRESHOLD or dist(end1,end2) < THRESHOLD):
            connections[i].add(j)

# BFS to find connected components
visited = set()
components = []
for i in range(len(trails)):
    if i in visited: continue
    component = []
    queue = [i]
    while queue:
        curr = queue.pop(0)
        if curr in visited: continue
        visited.add(curr)
        component.append(curr)
        for n in connections[curr]:
            if n not in visited: queue.append(n)
    components.append(component)

# Report
for idx, comp in enumerate(components):
    print(f"Component {idx+1}: {len(comp)} trails")
    for t_idx in comp:
        t = trails[t_idx]
        print(f"  - {t['name']}")
    
# Find totally disconnected trails
disconnected = [c for c in components if len(c) == 1]
print(f"\nTotally disconnected: {len(disconnected)}")
```

### 3. Add Connector Trails
For each disconnected trail, find nearest trail endpoint and create connector:

```python
# For each disconnected trail, find nearest connection
for comp in disconnected:
    t = trails[comp[0]]
    s = t['coords'][0]
    e = t['coords'][-1]
    
    # Find nearest trail (from non-disconnected components)
    nearest_dist = 999
    nearest_trail = None
    nearest_point = None
    
    for j, t2 in enumerate(trails):
        if j in comp: continue  # Don't connect to self
        s2 = t2['coords'][0]
        e2 = t2['coords'][-1]
        for pt in [s2, e2]:
            d = dist(e, pt)  # Connect from end point
            if d < nearest_dist:
                nearest_dist = d
                nearest_trail = t2['name']
                nearest_point = pt
    
    # Generate intermediate points for smooth connector
    def interpolate(start, end, n=5):
        points = []
        for i in range(n+2):  # Include start and end
            t_val = i / (n+1)
            lat = round(start[0] + t_val * (end[0] - start[0]), 4)
            lng = round(start[1] + t_val * (end[1] - start[1]), 4)
            points.append([lat, lng])
        return points
    
    connector = {
        "category": t['category'],
        "name": f"{t['name']} Connector",
        "desc": f"Connector trail linking to {nearest_trail}.",
        "year": t.get('year', '1850s-1880s'),
        "color": t.get('color', '#E94560'),
        "dash": t.get('dash', '8, 6'),
        "weight": 2,  # Slightly thinner for connectors
        "coords": interpolate(e, nearest_point)  # Start from end, go to nearest
    }
    
    # Save or insert into HTML
```

### 4. Insert Connectors into HTML

**CRITICAL:** Always backup before modifying. Write connectors to a separate JSON file first to avoid escaping issues.

```python
import json
import shutil

FILE_PATH = "path/to/Interactive_Homeland_Map_v3.html"

# Step 1: Backup
shutil.copy(FILE_PATH, FILE_PATH + ".backup_before_connectors")

# Step 2: Load pre-formatted connectors from JSON file
with open('/tmp/connector_trails.json') as f:
    connectors = json.load(f)

# Step 3: Find the trails array end by bracket counting
start_marker = "const trails = ["
start_pos = content.find(start_marker) + len(start_marker)
depth = 1
pos = start_pos
while depth > 0 and pos < len(content):
    if content[pos] == '[': depth += 1
    elif content[pos] == ']': depth -= 1
    pos += 1
# pos is now RIGHT AFTER the closing ];

# Step 4: Find the closing brace } of the LAST trail object
end_bracket_pos = pos - 2  # position of the ] in ];
brace_pos = content.rfind('}', 0, end_bracket_pos)

# Step 5: Build connector text (each as formatted JS object)
def format_js_object(trail):
    # ... format as { "category": ..., "name": ..., ... }
    pass

connector_blocks = ',\n'.join([format_js_object(c) for c in connectors])

# Step 6: Replace just the trailing } with }, + connectors + \n];
# The key insight: we keep the original ]; and insert BEFORE it
replacement = "},\n" + connector_blocks + "\n];"
new_content = content[:brace_pos] + replacement + content[end_bracket_pos + 2:]

# Step 7: Write and verify
with open(FILE_PATH, 'w') as f:
    f.write(new_content)

# Verify no double semicolons
if '];;' in new_content:
    print("ERROR: Double semicolon detected!")
    # Restore from backup
    shutil.copy(FILE_PATH + ".backup_before_connectors", FILE_PATH)
```

**Why this works:** The old approach tried to find an "insertion position" mathematically and got it wrong. The new approach finds two known landmarks (the last } and the ]; after it) and replaces the span between them with the correctly formatted content. The original ]; is preserved.

**Common failure modes:**
- `}}` before `];` — missing closing brace on last trail
- `];;` — inserted semicolon duplicates existing one
- `],\n{` without `}` — trail object never closed

## Verification
```bash
# Re-run the parse script to confirm all trails load
node parse_trails.js

# Check component count reduced
python3 analyze_connectivity.py

# Test locally
python3 -m http.server 8080
```

## Common Pitfalls

### 1. Shell Escaping Issues
Node one-liners with template literals break in bash. Write scripts to files first.

### 2. JSON Parse Errors
HTML files contain escaped quotes and special characters in descriptions. Use `eval()` in Node.js context instead of `JSON.parse()` for JavaScript arrays.

### 3. Coordinate Format Mismatch
Some trails use `[lat, lng]` array of arrays, others use alternating lat/lng flat arrays. Always check the format before processing.

### 4. Threshold Too Strict/Loose
0.5 degrees (~50km) works for prairie cart trails. Adjust based on map scale:
- Large regional maps: 0.3-1.0 degrees
- Local/city maps: 0.01-0.05 degrees
- Continental maps: 1.0-3.0 degrees

### 5. Breaking the JS Array Syntax — CRITICAL PITFALLS
The insertion script had TWO bugs that completely broke the map (white screen, no tiles, no controls):

**Bug 1: Missing closing brace** — The script replaced `}\n];` but left the previous trail object without its closing `}`. The file had `]\n,\n{` (comma between coords array and new object) instead of `]\n},\n{`. Always preserve the `},` pattern — each trail object needs both `]` (coords) and `}` (object).

**Bug 2: Double semicolon** — The insertion produced `];;` instead of `];` because the script counted the array position and inserted at `pos - 3`, but the `];` was already at that position. Result: duplicate semicolon breaks JavaScript parsing.

**Correct approach:** 
```python
# Find the LAST trail object's closing brace }
brace_pos = content.rfind('}', 0, end_bracket_pos)

# Replace just the } with }, + connectors + \n];
# The original ]; stays intact
replacement = "},\n" + connector_blocks + "\n];"
new_content = content[:brace_pos] + replacement + content[brace_pos+1:]
# Skip past the original } by using brace_pos+1, not the full ]; position
```

**Verification checklist ALWAYS before pushing:**
1. `node -e "eval(require('fs').readFileSync(file).match(/const trails = \\[([\\s\\S]*?)^\\];/m)[1])"` — should not throw
2. Check line count hasn't exploded (should grow by ~80 lines per connector)
3. Open in browser — if white screen, check `];` isn't doubled and all `{` have matching `}`

### 6. Browser Shows Loading Forever — Not Just a Syntax Error
If the map shows "Loading..." text but no tiles render, it could be:
- A second syntax issue (double semicolon, missing brace) — check console
- The server not serving files correctly
- Mobile cache issues — always Empty Cache and Hard Reload on Android Chrome

### 7. Local Test Server for WSL2
On WSL2, the server address for mobile testing is NOT localhost. Find the actual IP:
```bash
hostname -I | awk '{print $1}'
# e.g., 172.18.215.145:8080
```
However, work networks may block direct IP access. Fallback: open the file via Windows path:
```
\\wsl.localhost\Ubuntu\home\bayard_devries\Documents\metis-research-vault\Heritage Centre\Interactive_Homeland_Map_v3.html
```