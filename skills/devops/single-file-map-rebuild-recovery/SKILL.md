---
name: single-file-map-rebuild-recovery
description: Procedural approach for diagnosing and repairing single-file HTML Leaflet maps failing due to script crashes or data/logic mismatches.
---

# Single-File HTML Map Reconstruction & Debugging

A procedural approach for diagnosing and repairing large, complex, single-file HTML Leaflet maps that are failing to render or crashing due to data/logic mismatches.

## Overview
When a single-file map is "blank" or "not loading," it is rarely a hosting issue and almost always a JavaScript runtime failure. This skill provides a forensic path from visual failure to a "Clean Room" rebuild.

## Detection Phase
If the user reports a blank map:
1. **Verify Hosting:** Confirm the file is accessible in a browser.
2. **Check Console:** Use `browser_console` (if available) to look for `SyntaxError` (usually duplicate `const` declarations) or `TypeError` (usually coordinate property mismatches).
3. **Identify Failure Type:**
    - **Type A: Script Crash.** The script stops executing early (e.g., duplicate `const routes`).
    - **Type B: Data Mismatch.** The script runs, but can't find the data (e.g., looking for `loc.lat` when data is `loc.coords[0]`).
    - **Type C: Zero-Height.** The map container has no CSS height.

## Troubleshooting Workflow

### 1. The "Scrub" (For Type A: Script Crash)
If `browser_console` shows a `SyntaxError` regarding duplicate declarations:
- Use regex-based line-by-line scanning to identify all instances of the offending variable.
- Comment out all but the first declaration.
- **Caution:** Do not use simple string replacement; use line-based commenting to avoid breaking logic flow.

### 2. The "Logic Trace" (For Type B: Data Mismatch)
If the script runs but the map is blank:
- **Static Analysis:** Write a Python script to:
    - Parse the JSON/Array data structure.
    - Inspect the first few items to determine format (e.g., `[lat, lng]` vs `{lat, lng}`).
    - Locate the Leaflet rendering calls (`L.polyline`, `L.circleMarker`).
    - Compare the data format against the engine's access method (e.g., `item[0]` vs `item.lat`).
- **Correction:** If a mismatch is found, avoid patching complex loops. Rebuilding is safer.

### 3. The "Clean Room Rebuild" (The Gold Standard)
If patching fails or the code is too tangled:
- **Extract:** Pull the raw JSON data and the essential HTML/CSS scaffolding.
- **Synthesize:** Write a completely new, minimal HTML file from scratch.
- **Implement Robust Engine:** Use a clean, explicit rendering loop that is explicitly written to match the discovered data structure (e.g., `trail.coords.forEach(...)`).
- **Verify:** Use a Python-based "Runtime Simulation" (logic trace) to verify the new logic before handing it back to the user.

## Pitfalls
- **The 'Localhost' Trap:** Attempting to use `browser_vision` on a local server in a sandbox often fails due to CDP connection issues. Rely on **Static Logic Trace** (Python) instead.
- **Patching Loops:** Trying to use `sed` or simple regex to fix complex `forEach` loops is dangerous. Rebuilding is faster and safer.
- **Silent Failures:** A map with no height (`height: 0`) looks exactly like a broken script. Always check the CSS.
