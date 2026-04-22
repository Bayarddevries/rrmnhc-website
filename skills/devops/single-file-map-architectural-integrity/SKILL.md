---
name: single-file-map-architectural-integrity
description: Procedures for upgrading complex, single-file HTML maps (Leaflet/Mapbox) while preventing "prototype degradation" and maintaining UI/UX fidelity.
version: 1.0.0
author: Hermes Agent
---

# Single-File Map Architectural Integrity

This skill prevents the "Skeletal Prototype" trap—where solving a technical crash (e.g., a SyntaxError) leads to the accidental stripping of CSS, UI components, and professional polish.

## 🚩 The "Prototype Trap" Warning
Success in a single-file map is **NOT** defined by the absence of console errors. It is defined by:
`Success = (Code Stability) + (Design Fidelity) + (Data Accuracy)`
If you fix the code but lose the CSS or the Sidebar, you have failed the build.

## 🛠️ Operational Patterns

### 1. The "Surgical Injection" Pattern (Preferred)
When adding new features (e.g., Spline curves, ID Resolvers) to a "GOLDEN" source:
- **NEVER** rebuild the HTML shell from a minimal template.
- **Surgical Path:** `GOLDEN Source` $\rightarrow$ `Targeted Regex Replacement` $\rightarrow$ `Verification`.
- **Targeted Areas:** Only touch the `const data = [...]` blocks and the specific `function render...()` logic. Leave the `<style>` and `<header>` blocks untouched.

### 2. The "Nuclear Reconstruction" Protocol (Last Resort)
Use only when the GOLDEN source is too corrupted to patch.
- **Step 1: Component Extraction.** Extract the exact `<style>` block and HTML layout from the GOLDEN source.
- **Step 2: Component Re-Assembly.** Paste those blocks into the new file first.
- **Step 3: Logic Integration.** Add the new JS engine.
- **Step 4: Integrity Audit.** Run a script to verify that the file size and key CSS selectors are present before claiming "stability."

### 3. The "Dynamic Network" Standard
To move from "visualization" to "research tool," implement **Anchor-Based Routing**:
- **Logic:** Define trails as sequences of IDs (`route: ["A", "B", "C"]`) rather than static coordinates.
- **Resolver:** Implement a `getWaypointById()` function with a **Fallback Mode** (if ID is missing $\rightarrow$ use raw lat/lng) to prevent map-wide crashes.
- **Interpolation:** Use **Catmull-Rom Splines** for organic curvature to avoid the "skeleton/zigzag" look of `L.polyline`.

## 🧪 Verification Checklist (The "Integrity Audit")
Before delivering a build, verify:
- [ ] **UI Fidelity:** Does the CSS match the GOLDEN version? (Check sidebar, timeline, and custom popups).
- [ ] **Functional Continuity:** Do existing features (Search, Era Filters) still work?
- [ ] **Data Completeness:** Are all settlement markers and trails present?
- [ ] **Console Health:** Are there zero `ReferenceError` or `SyntaxError` logs?
- [ ] **Loading State:** Does the "Loading..." banner clear successfully?

## ⚠️ Common Pitfalls
- **Duplicate Declarations:** Be cautious of `const` variables being declared twice during merge.
- **Skeletal Regressions:** Avoid the urge to "start fresh" with a minimal template to solve a bug; this almost always results in loss of design polish.
- **Unanchored Trails:** Avoid static coordinate arrays for trails; they break when settlement markers are moved for accuracy.
