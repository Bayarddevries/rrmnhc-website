---
name: debug-single-file-html-map
description: Systematic diagnosis and repair of JavaScript syntax errors in large single-file Leaflet maps.
---

# Debugging Single-File HTML Maps

When a large single-file HTML map (Leaflet-based) fails to render (stuck on loading screen, 0 markers visible), it is often due to a JavaScript syntax error that halts the entire script execution.

## Trigger Conditions
- Page loads but map area remains blank or shows "Loading..." indefinitely.
- Browser console reports `Unexpected token '}'` or `ReferenceError: X is not defined`.
- Recent bulk edits or automated patches were applied to the HTML file.

## Procedural Steps

### 1. Zero-Base Browser Audit
Before analyzing the complex map file, create a minimal `PING_TEST.html` to ensure the browser/CDP connection is healthy:
```html
<html><body><h1 id="t">Testing...</h1><script>document.getElementById('t').innerText='OK';</script></body></html>
```
If this fails, the issue is the environment (WSL2/CDP), not the code.

### 2. Locate the Syntax Error
Use the browser console to find the exact line of the error. If the file is too large for manual scrolling:
- Use a brace-matching script to find mismatched `{}` or `()`.
- Search for closing tags `});` that lack a corresponding opening loop (e.g., `.forEach(function(item) {`).

### 3. Identify Common Failure Patterns
- **Missing Loop Headers:** Check if a `.forEach` or `for` loop opening was deleted, leaving the body of the loop as "floating" code.
- **Undefined Variables:** Look for variables like `m` (marker), `loc` (location), or `j` (junction) that are used before being defined.
- **Dangling Braces:** Extra `}` characters often appear at the end of corrupted blocks.

### 4. Remediation
- **Precise Patching:** Replace the corrupted block entirely rather than adding single lines.
- **Standard Marker Template:** Use a clean marker loop structure:
  ```javascript
  locations.forEach(function(loc) {
      var m = L.circleMarker([loc.lat, loc.lng], { ... }).addTo(map);
      var popupContent = [ ... ].join('');
      m.bindPopup(popupContent);
      LG[loc.layer].addLayer(m);
  });
  ```

### 5. Verification
1. Reload the page.
2. Open Browser Console $\rightarrow$ Clear all $\rightarrow$ Refresh.
3. Confirm 0 errors and verify that the marker count in the UI updates from "0" to the expected number.

## Pitfalls
- **Partial Patches:** Adding a loop header without fixing the variables inside the loop will just move the error from a `SyntaxError` to a `ReferenceError`.
- **Encoding Issues:** Be careful with special characters in descriptions (e.g., M\u00e9tis) when patching.
