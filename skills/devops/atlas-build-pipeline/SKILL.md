---
name: atlas-build-pipeline
description: Professional GIS workflow for transforming KML/Markdown research into a schema-validated Digital Heritage Atlas.
tags: [gis, leaflet, python, heritage, mapping]
---

# Skill: atlas-build-pipeline (V2: High-Rigor GIS)

## Overview
A professional-grade GIS (Geographic Information System) workflow designed to transform fragmented historical research (KML/Markdown) into a highly optimized, schema-validated, interactive "Digital Heritage Atlas."

## Workflow Stages

### 1. Data Ingestion (Raw Layer)
- **KML Data**: Source for precise spatial geometries (Points, Polylines, Polygons) from tools like Google Earth.
- **Research Vault**: Markdown files containing the "intellectual" layer (descriptions, citations, eras, regions).
- **Scavenged Data**: Recovered legacy coordinate arrays.

### 2. The Build Engine (Python-based)
The engine performs a multi-pass compilation:
- **Pass 1 (Spatial)**: Parses KML files using namespace-agnostic XML parsing. Implements **Centroid Anchoring** (calculating center points for labels/markers) while retaining full geometry for interaction.
- **Pass 2 (Intellectual)**: Links spatial points to Markdown notes via name-matching and **Alias Mapping** (handling naming inconsistencies between tools).
- **Pass 3 (Validation)**: Applies a **High-Rigor Schema Validation** (e.g., via Pydantic or custom validation classes) to ensure all required fields (lat, lng, name) exist and are correctly typed.
- **Pass 4 (Manifest Generation)**: Outputs a single, optimized `atlas_data.json` for the frontend.

### 3. Integrity Reporting
Every build generates a `build_integrity_report.json`.
- **SUCCESS**: All data passed schema validation.
- **WARNING**: Data passed but contains "Integrity Issues" (e.g., missing citations, unlinked locations, or malformed coordinates). This report is critical for identifying research gaps.

### 4. Frontend Rendering (Leaflet Layer)
- **Geometry-Aware Interaction**: Uses the full geometry for clicking (not just the marker) to support territory/pathway selection.
- **Temporal Slider**: Employs **Chronological Segmenting** and **Line-Dash Animation** to "grow" or "retract" trails as the user moves through time.
- **Visual Cues**:
    - **Evergreen/Ambiguous**: Uses "Ghostly Opacity" (pulsing) for undated/uncertain sites.
    - **Legacy Traces**: Uses "Faint Dashed Lines" for abandoned historical paths.

## Pitfalls & Troubleshooting
- **Namespace Errors**: KML files often have complex XML namespaces; always use wildcard `{*}` searches in ElementTree.
- **Pathing**: In a GitHub Pages environment, all frontend assets (CSS/JS/JSON) **must** use relative paths (`./assets/`).
- **Data Desync**: If the map looks "empty," check the `build_integrity_report.json` for schema violations or pathing errors in the Build Engine.

## Verification Checklist
- [ ] Run `build_engine.py`.
- [ ] Check `build_integrity_report.json` for `WARNING` status.
- [ ] Verify `atlas_data.json` contains the expected location count.
- [ ] Confirm `index.html` loads the manifest via relative paths.
