---
name: single-file-map-diagnostic-testing
description: A systematic QA protocol for diagnosing rendering and interactivity failures in single-file Leaflet HTML maps within WSL2/Windows environments.
---

# Single-File Map Diagnostic Testing

## Trigger Conditions
- Map loads but is blank or stuck on a "Loading..." banner.
- Map points (markers) are visible, but lines (trails/routes) are missing.
- User reports that markers are not clickable or interactive.
- Console reports `CORS` errors or `Unexpected token` / `ReferenceError`.

## Procedural Steps

### 1. Environment Isolation (The HTTP Shift)
**NEVER** test map files using the `file://` protocol. Modern browsers block local resource requests (JSON/GeoJSON) via CORS, which causes silent script failures.
- Start a local Python HTTP server in the project directory:
  `cd /path/to/map/folder && python3 -m http.server 8000`
- Navigate via the WSL2 IP: `http://[WSL2_IP]:8000/[filename].html`

### 2. The "Smoke Test" (UI Baseline)
Check the high-level UI indicators:
- **Loading Banner**: If the "Loading..." banner persists, the script has crashed during the parsing or initialization phase.
- **Visible Count**: If the "visible locations" count is 0 but markers are present, the `initMap` completion logic is not being reached.

### 3. Forensic Console Audit
Open the browser console and categorize the error:
- **SyntaxError (`Unexpected token`, `Identifier already declared`)**: The script is not executing. Look for duplicate `const` declarations (e.g., `LOCATION_SOURCES` declared twice) or missing commas in large data arrays.
- **ReferenceError (`X is not defined`)**: A variable (e.g., `cartTG`) was removed during an architectural shift but is still referenced in the drawing loop.
- **TypeError (`Cannot read properties of undefined`)**: Usually means a Layer Group (LG) was not initialized because its key was missing from the configuration object (LC).
- **Console Logs (`TRAIL SKIP no coords`)**: The data is loading, but the coordinate property name in the JSON does not match the expected key in the rendering loop.

### 4. Data-to-Render Pipeline Verification
If markers show but trails don't:
1. **Check LC Configuration**: Verify that all trail categories (e.g., 'Red River Cart Trails') exist as keys in the `LC` object.
2. **Verify LG Initialization**: Ensure the loop `Object.keys(LC).forEach(...)` is creating a `L.layerGroup()` for every key in `LC`.
3. **Coordinate Audit**: Verify that the `trails` array objects contain the expected coordinate key (e.g., `.coords` vs `.waypoints`).

## Pitfalls & Lessons Learned
- **Zombie Servers**: Ensure previous `http.server` instances are killed if changing ports.
- **Case Sensitivity**: Linux paths are case-sensitive; `Heritage Centre` is different from `heritage centre`.
- **Partial Migrations**: When moving from global variables (`cartTG`) to mapped objects (`LG['Name']`), a single missed reference will crash the entire rendering pipeline.
