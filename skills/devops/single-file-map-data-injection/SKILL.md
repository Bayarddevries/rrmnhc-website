---
name: single-file-map-data-injection
description: Procedure for surgically injecting structured research data (JSON) into a large single-file HTML map without destroying the surrounding JS/CSS shell.
---

# Single-File Map Data Injection

This skill describes the process of transitioning raw historical research data (from a research agent) into a functional JavaScript array within a single-file HTML map. It focuses on "Schema Mapping" to ensure that research output matches the map engine's expected keys.

## Trigger Conditions
- You have a JSON file of research data (e.g., trail waypoints, location lists).
- You have a large HTML file where this data must be injected into a specific JavaScript constant (e.g., `const trails = [...]`).
- The research data keys (e.g., `waypoints`) do not match the map engine keys (e.g., `coordinates`).

## Procedural Steps

### 1. Schema Audit
Before injecting, identify the target array's expected schema.
- Read the HTML file near the target constant.
- Identify required keys (e.g., `name`, `coordinates`, `color`, `weight`).
- Note any required data types (e.g., `coordinates` must be `[[lat, lng], ...]`).

### 2. Sandbox Creation
Never inject directly into the primary working file.
- Copy the `WORKING.html` to a `TEST_Surgical.html` sandbox.

### 3. Develop a Mapping Bridge
Write a Python script to bridge the gap between the research JSON and the HTML schema.
- **Load JSON:** Parse the research data.
- **Key Mapping:** Create a dictionary or logic to map research keys $\rightarrow$ engine keys.
- **Value Transformation:** 
    - Sanitize strings (replace double quotes `"` with single quotes `'` to avoid breaking JS).
    - Ensure coordinate arrays are formatted as valid JSON lists.
    - Dynamic Color Matching: If the map uses a color map (`LC` object), match the `layer` name to the corresponding hex code.

### 4. Surgical Replacement
Use Python to replace the specific array block without rewriting the entire file.
- Find the start line: `const [variable_name] = [`
- Find the closing bracket: `];`
- Replace the range between these indices with the newly formatted JS string.

## Pitfalls & Lessons Learned
- **F-String Backslashes:** In Python scripts, avoid putting backslashes (like `\"`) inside f-string expressions; use standard concatenation or `.replace()` outside the f-string.
- **Semicolon Anchors:** Always search for `];` as the anchor for the end of an array, as simple `]` matches may occur inside the coordinate arrays.
- **Direct Pathing:** When requesting user review of WSL files on Windows, always provide the path as `\\wsl.localhost\Ubuntu\home\...` to avoid DNS/URL errors.

## Verification
- Check the browser console for `TRAIL SKIP` or `undefined` errors.
- Verify that the "Organic Curvature" is visible by zooming into the waypoints.
