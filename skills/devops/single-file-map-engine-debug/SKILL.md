---
name: single-file-map-engine-debug
description: Systematic approach for diagnosing and repairing broken JavaScript engines (Spline engines, Resolvers, and Route Dispatchers) within large, single-file HTML Leaflet maps.
---

# Skill: single-file-map-engine-debug

## Description
A systematic approach for diagnosing and repairing broken JavaScript engines (Spline engines, Resolvers, and Route Dispatchers) within large, single-file HTML Leaflet maps. This skill is used when the map UI loads correctly but the dynamic features (trails, markers, filters) fail to render.

## When to Use
- The map UI (Leaflet, layers, search) loads, but trails/routes are missing.
- The browser console reports `TRAIL SKIP no coords` or `Resolver ERROR: Waypoint ID not found`.
- The map is "blank" or showing syntax errors like `Unexpected token 'function'`.

## Workflow

### Phase 1: Syntax & Structure Audit
1. **Check for Syntax Errors:** Open the browser console. If `Unexpected token` or similar errors appear, the script is crashing before execution.
2. **Identify "Dirty" Code:** Look for duplicate constant declarations (e.g., `const locations = [...]` appearing twice) or functions declared inside array initializers.
3. **Perform a "Nuclear Reset" on the Script Block:** 
   - Instead of surgical patching, identify the boundaries of the problematic `<script>` block.
   - Rewrite the block entirely to ensure a clean, single-declaration structure.

### Phase 2: Resolver & Data Integrity Audit
If the script runs but trails don't appear:
1. **Inspect Resolver Logs:** Check console for `[Resolver] ERROR: Waypoint ID "[ID]" not found`.
2. **The Naming Mismatch Check:**
   - **Step A:** Extract the exact string values from the `locations` array (the "Source of Truth").
   - **Step B:** Extract the `route` arrays from the `trails` configuration.
   - **Step C:** Perform a character-perfect comparison. Common culprits: `/` vs `&amp;`, `St. Vital / St. Boniface` vs `St. Vital & St. Boniface`, or extra spaces.
3. **Verify ID-to-Coord Mapping:** Ensure the `getWaypointById` function is actually being called by the `renderTrails` loop.

### Phase 3: Implementation & Verification
1. **Patch via String Match:** Use character-perfect strings from the registry to patch the `route` arrays.
2. **Browser-Based Verification:**
   - Verify the presence of UI elements (confirming JS didn't crash).
   - Verify the absence of "Skip" logs in the console.
   - **Visual Audit:** Confirm the existence of organic, curved polylines.

## Pitfalls
- **Duplicate Declarations:** Attempting to patch a script that has two `const locations` declarations will often fail or result in the wrong one being updated.
- **String Encoding:** Be wary of HTML entities (like `&amp;`) appearing in the JavaScript strings, which will cause name mismatches in the resolver.
- **Cache Issues:** Always refresh the browser or use a hard reload after applying large script patches.
