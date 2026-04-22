---
name: single-file-html-map-data-synthesis
description: Reconstructs a centralized 'trails' array from fragmented 'route' metadata embedded within individual location objects in single-file HTML maps.
category: devops
tags: [leaflet, map-data, synthesis, reconstruction, metadata, javascript]
---

# Single-File HTML Map Data Synthesis

Use this skill when a Leaflet-based HTML map contains route/trail information (e.g., `cart_routes`, `water_routes`) inside individual location objects rather than in a dedicated central `const trails = []` array.

## When to Use
- The map shows location markers but no visible trails/lines.
- Audit reveals `cart_routes` or similar properties exist within the `locations` array.
- The `trails` array is currently empty or only contains empty placeholder objects.
- You need to transition from a "Location-Centric" data model to a "Unified Trail Array" model for better connectivity analysis.

## The Synthesis Workflow

### 1. Extraction (The "Scavenger" Phase)
Do not use simple regex for the whole file. Instead, extract the `locations` array first, then iterate through each object to scavenge metadata.

**Safe Extraction Logic (Python):**
```python
# 1. Find the locations array start
start_marker = "const locations = ["
start_pos = content.find(start_marker)

# 2. Use bracket counting to extract the full array string
depth = 1
pos = start_pos + len(start_marker)
while depth > 0 and pos < len(content):
    if content[pos] == '[': depth += 1
    elif content[pos] == ']': depth -= 1
    pos += 1
locations_str = content[start_pos:pos]

# 3. Parse objects and scavenge keys
# Use a regex that identifies the object and then look for keys like 'cart_routes'
obj_pattern = re.compile(r'\{[^{]*?"name":\s*"[^"]+"[^}]*\}', re.DOTALL)
matches = obj_pattern.findall(locations_str)

scavenged_data = []
for obj in matches:
    # Extract name, lat, lng, and specific route keys
    # e.g., name_match = re.search(r'"name":\s*"([^"]+)"', obj)
    # e.g., route_match = re.search(r'"(cart_routes|water_routes)":\s*\[(.*?)\]', obj, re.DOTALL)
    # ...
```

### 2. Grouping (The "Web-Building" Phase)
Convert the scavenged location-based routes into a group-based dictionary.

**Grouping Logic:**
```python
route_groups = {}
for loc in scavenged_locations:
    for route_name in loc['routes']:
        if route_name not in route_groups:
            route_groups[route_name] = []
        route_groups[route_name].append(loc)
```

### 3. Reconstruction (The "Array-Building" Phase)
Transform the groups into the final `trails` array format. 

**CRITICAL: Heuristic Sorting**
Since the original data lacked a sequence, sort the coordinates in each route to prevent "zigzagging" or messy lines. For Red River trails, sorting by **Longitude (West to East)** or **Latitude (North to South)** is usually the most historically accurate way to reconstruct the path.

```python
reconstructed_trails = []
for route_name, members in route_groups.items():
    # Sort members by longitude to create a smooth path
    sorted_members = sorted(members, key=lambda x: x['coords'][1])
    coords_array = [m['coords'] for m in sorted_members]
    
    reconstructed_trails.append({
        "category": "Red River Cart Trails", # or appropriate category
        "name": route_name,
        "desc": f"Reconstructed from {len(sorted_members)} historical nodes.",
        "coords": coords_array
        # ... other metadata
    })
```

### 4. Integration (The "Safe Injection" Phase)
Replace the empty `const trails = [...]` block in the HTML file with the newly built `reconstructed_trails` array.

**Safe Injection Pattern:**
1.  Find `const trails = [`.
2.  Find the corresponding `];`.
3.  Replace the entire content between the opening `[` and closing `]` with the new JSON-stringified array.
4.  **Verify Brace Balance** immediately after.

## Common Pitfalls

### 1. The "Empty Shell" Trap
If you only replace the *content* inside the brackets, ensure you don't accidentally leave trailing commas or duplicate semicolons (e.g., `];;`).

### 2. Heuristic Sorting Errors
If the trails look like a "spiderweb" of messy lines, your sorting heuristic is wrong.
*   **Fix:** Check if the route is a North-South route (sort by Lat) or an East-West route (sort by Lng).

### 3. Category Mismatch
If the synthesized trails don't show up, check if the `category` name in your new array matches the `category` name the map's rendering logic expects (e.g., `"Red River Cart Trails"` vs `"Cart Trails"`).

## Verification Checklist
- [ ] `const trails` array is no longer empty in the HTML.
- [ ] `trails.length` in browser console matches your reconstructed count.
- [ ] `browser_snapshot` shows lines/polylines on the map.
- [ ] All `cart_routes` and `water_routes` from the original locations are accounted for.
