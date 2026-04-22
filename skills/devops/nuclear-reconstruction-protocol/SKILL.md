---
name: nuclear-reconstruction-protocol
description: A high-stakes recovery workflow used when surgical patching and incremental updates to complex single-file HTML maps fail, causing catastrophic regressions or structural corruption.
---

# Nuclear Reconstruction Protocol (NRP)

A high-stakes recovery workflow used when surgical patching and incremental updates to complex single-file HTML maps (like the Homeland Map) fail, causing catastrophic regressions or structural corruption.

## When to Use
- When surgical regex patches cause "cascade failures" (e.g., breaking the UI while fixing the data).
- When the file becomes unusable due to massive syntax errors (e.g., `Unexpected token '['` or redeclaration errors).
- When the user desires a functional version that preserves all existing UI/UX/Design elements rather than a "skeletal" fix.

## The Protocol

### 1. Identify the "True Golden Source"
Before any reconstruction, identify the last known-good version of the file (the "Golden Source"). This is the version that had the correct CSS, sidebar, search, and UI/UX, even if it lacked the latest data.

### 2. The "Surgical-Only" Recovery (Preferred over NRP)
Instead of rebuilding the entire file, attempt a single, clean surgical replacement of only the broken data blocks.
- **Step A:** Identify the specific failing block (e.g., `const trails = [...]`).
- **Step B:** Prepare a "Perfect Block" in a separate buffer.
- **Step C:** Use a single, massive string replacement to swap the broken block for the perfect one.
- **Step D:** Verify the `locations` and `junctions` arrays are also present to prevent secondary crashes.

### 3. The "Full-Rebuild" (NRP - Last Resort)
If the surgical approach fails, perform a total reconstruction using a clean template.
- **WARNING:** Do not use a minimal/skeletal template. This is a "regression trap."
- **Requirement:** The reconstructed file must include the original CSS/HTML structure and the original `initMap()` logic from the Golden Source.
- **Procedure:**
    1. Extract core data (Locations, Junctions) from the Golden Source.
    2. Extract the new research data (Wave 3 Trails) from the research agent.
    3. Build a fresh HTML shell that combines the Golden CSS/UI + the extracted data + the new research data.
    4. Ensure all variable names (e.g., `coords` vs `waypoints`) are unified to match the rendering engine.

## Pitfalls to Avoid
- **The "Skeletal Map" Trap:** Replacing a complex, polished file with a minimal HTML template. This "fixes" the error but destroys the project's utility.
- **The "Partial Migration" Trap:** Deleting old global variables (like `cartTG`) without updating every single reference in the rendering loop. This causes `ReferenceError` and fatal crashes.
- **The "Regex Cascade":** Using multiple, sequential regex patches that interfere with each other. Always aim for one single, clean pass.
