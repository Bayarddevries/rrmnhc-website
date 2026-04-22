---
name: academic-research-ingestion-pipeline
description: Workflow for transitioning raw historical research from an intake inbox into a verified academic ledger and then surgically injecting that data into a Leaflet HTML map.
---

# Academic Research Ingestion & Vault-to-Map Sync

This skill provides a robust, multi-stage workflow for transitioning raw historical research (from PDFs, HTML, or Docs) into a verified, interactive digital map (Leaflet-based HTML). It prioritizes academic integrity and data provenance.

## Overview

Moving from "searching" to "committing" requires a structured pipeline to prevent data corruption and ensure every visual element on the map has a traceable citation. This skill manages the transition from **Raw Intake** $\rightarrow$ **Academic Synthesis** $\rightarrow$ **Map Injection**.

## Workflow Stages

### 1. Intake & Ingestion (The Inbox)
- **Source:** Unstructured files (HTML, PDF, DOCX) in a designated `inbox/` directory.
- **Action:** Use `grep`, `ls`, and `cat` to identify files, bypassing potential issues with special characters (e.g., NBSP) in filenames.
- **Extraction:** Use `web_extract` or custom Python cleaning scripts to strip HTML/CSS boilerplate. 
- **Fallback Chain:** If Python-based reading (`read_file`) returns empty strings or fails due to encoding, use terminal `grep` with wildcard loops (e.g., `for f in *; do grep "..." "$f"; done`) to mine raw text directly from the filesystem. If PDF tools (`pdftotext`) are unavailable, prioritize searching for the corresponding HTML versions of the same research in the inbox.

### 2. Academic Synthesis (The Vault)
- **Target:** A centralized `Sourced_Trail_Evidence.md` (or similar) in the primary research vault.
- **Format:** Every entry must include:
    - **Segment/Node Name**
    - **Verified Fact** (Coordinates, Waypoints, or descriptive text)
    - **Source** (Filename and specific section/page)
    - **Direct Quote** (The original text for provenance)
    - **Confidence Level** (Verified / Provisional / Inferred)
- **Cross-Validation:** Perform a "Geographic Reality Check." Compare extracted coordinates against known historical geography to catch "collision errors" (e.g., different sites accidentally assigned the same coordinate) before map injection.
- **Requirement:** This document acts as the "Truth Source." No data should enter the map without appearing here first.

### 3. The Injection Pipeline (The Sync)
- **Target:** The `locations` and `cart_routes` arrays in the active HTML map file.
- **Method:** 
    - **Avoid:** Full file rewrites (risk of BOM/encoding/data loss) or fragile ledger-parsing loops.
    - **Preferred:** Surgical regex-based injection using Python or Terminal `sed`.
- **Capabilities:**
    - **Node Injection:** Adding new settlements/anchors.
    - **Coordinate Update:** Correcting existing nodes with verified historical data.
    - **Route Injection:** Adding connectivity between nodes.
    - **Waypoint Support:** Using `window.trailWaypoints` to inject historical curvature (e.g., "horse-shoe" river crossings, bog avoidance) to allow organic paths without creating fake settlement markers.

## Pitfalls & Troubleshooting

- **Filename Special Characters:** Files from "Saved Page" exports often contain non-breaking spaces. Use `glob.glob()` in Python or `ls -la` in terminal to identify and handle them.
- **Empty Body Problem:** Many "Saved Pages" use iframes or dynamic JS. If `read_file` returns empty text, the data may be in a sub-folder (e.g., `_files/`) or requires direct `grep` on the raw file.
- **Regex Failures:** When parsing the Ledger, be wary of escaped characters (e.g., `\rightarrow`). Use flexible regex (e.g., `\[([-?\d.]+),\s*([-?\d.]+)\]`) to capture coordinates regardless of surrounding symbols.
- **Injection Safety:** Always verify the existence of the `locations` or `routes` array before attempting a `re.sub` or `replace`.

## Verification Steps
1. Check `Sourced_Trail_Evidence.md` for the new entry.
2. Inspect the HTML map via browser to confirm the visual presence of the new route/node.
3. Verify the "SmoothFlow" engine is correctly rendering the new segments.
