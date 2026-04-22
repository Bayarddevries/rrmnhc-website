---
name: single-file-map-structural-repair
description: Procedural approach for diagnosing and repairing large, single-file Leaflet maps with syntax errors or missing logic blocks.
category: single-file-map-rebuild
---

# Single-File HTML Map Structural Repair

A procedural approach for diagnosing and repairing large, single-file Leaflet-based HTML maps that have become non-functional due to syntax errors, missing logic blocks, or variable corruption.

## Overview
When a map fails to render (stuck on "Loading..." or showing "0 visible" markers) and standard console logs indicate `Unexpected token` or `is not defined` errors, the file has likely suffered a structural failure rather than a simple typo.

## Diagnostic Workflow

1. **Verify Browser Health:**
   - Navigate to a simple `BROWSER_PING_TEST.html` to ensure the engine and CDP connectivity are functional.
   - If the ping test works but the map doesn't, the problem is strictly in the target HTML file.

2. **Identify the Error Type:**
   - Use `browser_console` to capture the error.
   - **Type A: `Unexpected token '}'` or `Unexpected token ')'`:** Usually indicates a missing loop header (e.g., `locations.forEach(...)`) or an extra closing brace from a corrupted edit.
   - **Type B: `[variable] is not defined`:** Indicates a scope failure, often caused by the missing loop header mentioned above, or a variable that was renamed/deleted during an edit.

3. **Locate the "Broken Block":**
   - Do **not** rely solely on line numbers from automated scripts if they don't align with the text.
   - Use `read_file` to inspect the area around the error.
   - Look for "floating" code: logic that uses variables (like `loc.lat` or `m.bindPopup`) but lacks the surrounding `forEach` or `map` wrapper.

## Repair Strategies

### Strategy 1: The Structural Patch (Preferred)
Instead of patching single lines, replace the entire broken functional block.
1. **Identify the boundaries:** Find the start of the broken logic (e.g., `// ===== Location markers =====`) and the end of the block (e.g., the closing `});` of the loop).
2. **Reconstruct the standard block:** Write a clean, standard version of that logic (e.g., a standard `locations.forEach` loop with proper marker and popup creation).
3. **Execute `patch`:** Use a single `patch` call to replace the entire problematic range. This prevents "whack-a-mole" debugging of individual variables.

### Strategy 2: The SKELETAL Restore (If Strategy 1 fails)
If the file is too corrupted to repair surgically:
1. Locate a known stable "SKELETAL" version (e.g., `Homeland_Map_SKELETAL_FIXED.html`).
2. Extract the core data arrays (`locations`, `trails`, `junctions`) from the broken file.
3. Inject the data into the stable skeletal template.

## Pitfalls
- **Avoid "Whack-a-Mole":** Do not try to fix `r is not defined` and then `m is not defined` one by one. This is a symptom of a missing loop. Fix the loop, and all variables will resolve at once.
- **Scope Awareness:** When reconstructing, ensure all variables used in the popup/marker logic (e.g., `loc`, `m`, `popColor`) are explicitly declared within the new loop header.
