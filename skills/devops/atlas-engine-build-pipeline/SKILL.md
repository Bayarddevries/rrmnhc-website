---
name: atlas-engine-build-pipeline
description: Workflow for compiling raw historical research (KML/GIS and Vault citations) into an optimized JSON manifest for the Homeland Map v2.0 Atlas Engine.
---

# Skill: Atlas Engine Build Pipeline

## Description
A specialized workflow for compiling raw historical research (KML/GIS data and Markdown/Vault citations) into a highly optimized, single-file JSON manifest (`atlas_data.json`) used by the Homeland Map v2.0 Atlas Engine.

## Purpose
To bridge the gap between unstructured research files and a high-performance, museum-grade interactive map. This avoids the performance overhead of loading raw KML/Markdown in the browser by pre-processing them into a unified data structure.

## Pipeline Stages

### 1. Scavenge & Ingest (Raw Layer)
- **Input**: KML files (from Google Earth), CSVs, and historical HTML map files.
- **Process**: Use regex or XML parsers to extract coordinate arrays (polygons, polylines, and points).
- **Output**: `data/raw/scavenged_geography.json`.

### 2. Contextual Synthesis (Research Layer)
- **Input**: Obsidian/Markdown files from the Metis Research Vault.
- **Process**: 
    - Match location names or IDs from the geography layer to Markdown headers or properties.
    - Extract `desc`, `type`, `region`, and most importantly, the **bibliographic citation**.
    - Extract image paths or URLs.
- **Output**: `data/raw/scavenged_research.json`.

### 3. Compilation (Manifest Layer)
- **Input**: `scavenged_geography.json` + `scavenged_research.json`.
- **Process**: 
    - Join datasets on a unique key (Location Name/ID).
    - Clean and format data for the frontend (e.g., ensuring all latitudes are floats).
    - Sanitize text for JSON compatibility.
- **Output**: `data/compiled/atlas_data.json`.

## Pitfalls & Troubleshooting
- **Coordinate Precision**: Ensure KML polygons are not "flattened" or losing precision during regex extraction.
- **Citation Mismatch**: If a location name in KML doesn't *exactly* match the Markdown header, the synthesis will fail for that point. Use fuzzy matching or a mapping dictionary if names vary.
- **Encoding Issues**: Always use `utf-8` when reading historical files to prevent breaking special characters (e.g., é, à, î).

## Verification Steps
- [ ] Check `atlas_data.json` for any `null` or `undefined` fields in critical areas (lat, lng, name).
- [ ] Verify that the total count of locations in the manifest matches the expected scavenged count.
- [ ] Ensure all citations follow the required bibliographic format.
