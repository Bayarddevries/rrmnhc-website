---
name: single-file-map-layer-unification
description: Procedural approach for diagnosing and fixing "invisible" map layers in single-file HTML maps where UI toggles and rendering logic are disconnected.
---

# Single-File Map Layer Unification

This skill is used when map features (like trails or markers) are confirmed to exist in the data arrays but are not appearing on the map, specifically when the sidebar toggles do nothing despite the data being present.

## Trigger Conditions
- Data is verified in the browser console (`trails.map(...)` returns data), but the map is empty.
- Browser console shows `TypeError: Cannot read properties of undefined (reading 'getLayers')` when checking layer groups.
- Sidebar toggles change state (on/off) but do not affect the visibility of the map elements.

## Diagnostic Workflow
1. **Verify Data Presence:** Use the browser console to check the raw data array:
   `console.log(trails.map(t => t.name + " coords length: " + t.coords.length))`
2. **Check Layer Group Existence:** Check if the layer group mapped to the UI actually exists:
   `console.log(LG['Layer Name'].getLayers().length)`
3. **Identify the "Split Personality" Gap:** If the data exists but the `LG` group is undefined, search the source code for redundant global layer groups (e.g., `const cartTG = L.layerGroup()`) that are being used for rendering but are not linked to the `LG` registry.

## Implementation Steps (The Unification)
1. **Remove Redundant Globals:** Delete separate `L.layerGroup()` declarations that exist outside the main registry.
2. **Hard-Sync Layer Names:** Ensure the `category` or `layer` string in the data array exactly matches the key in the `LC` (Layer Color) and `LG` (Layer Group) objects.
3. **Inject Defensive Rendering:** Replace fragile rendering calls with defensive checks to ensure layers are created if they are missing:
   - **Fragile:** `LG[layer].addLayer(item);`
   - **Defensive:** `if(!LG[layer]){ LG[layer]=L.layerGroup(); LG[layer].addTo(map); } LG[layer].addLayer(item);`
4. **Rewire UI Toggles:** Update all `map.addLayer()` and `map.removeLayer()` calls in the sidebar event listeners to reference the `LG` registry instead of standalone globals.

## Pitfalls
- **Typo Sensitivity:** A single trailing space in a layer name (e.g., `"Cart Trails "` vs `"Cart Trails"`) will cause the engine to create a new, invisible layer.
- **Initialization Order:** Ensure the `LG` registry is initialized before the `forEach` loop that processes the data arrays.
- **Coordinate Key Mismatch:** Verify if the engine expects `coords` vs `coordinates` vs `waypoints`.

## Recovery Protocol (The 'Nuclear' Reconstruction)
If surgical patching leads to persistent 'Unexpected token' or 'Loading...' hangs (often caused by syntax errors in large JSON/Array injections), abandon the corrupted file and rebuild from a GOLDEN source:
1. **Extract Data**: Use Python to pull `locations`, `trails`, and `junctions` arrays into separate JSON files.
2. **Rebuild Shell**: Start with a known-stable GOLDEN HTML file.
3. **Fresh Injection**:
    - Overwrite the `LC` (Layer Color) object entirely to ensure all required keys (e.g., 'Red River Cart Trails') exist.
    - Inject the extracted arrays as clean, valid JS objects.
    - Replace the rendering loop with a unified system (e.g., using an `LG` object) to eliminate redundant global variables like `cartTG` or `boatTG`.
4. **Validate**: Test in a local HTTP server (to bypass `file://` CORS) and verify the "Loading..." banner clears.
