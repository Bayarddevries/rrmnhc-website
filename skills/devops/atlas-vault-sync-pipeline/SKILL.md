---
name: atlas-vault-sync-pipeline
description: A professional workflow for bidirectional synchronization between a web-based Admin Dashboard and a Markdown research vault.
tags: [gis, vault, synchronization, markdown, python]
---

# skill: atlas-vault-sync-pipeline

## Overview
A specialized workflow for managing the bidirectional synchronization between a web-based Admin Dashboard (Atlas Engine) and a local Obsidian/Markdown-based research vault. This skill ensures that the "Single Source of Truth" remains the research vault while providing a high-performance web view.

## Workflow Stages

### 1. Data Ingestion & Compilation (The Build Engine)
- **KML Parsing**: Scans `data/raw/` for KML files and extracts Points, Polylines, and Polygons.
- **Markdown Parsing**: Scans the research vault for `.md` files, using regex to extract metadata (`Era:`, `Region:`, `Citation:`, `Type:`).
- **Manifest Generation**: Compiles all data into a single, highly optimized `atlas_data.json` file in `data/compiled/`.
- **Integrity Audit**: Generates a `build_integrity_report.json` flagging missing metadata or invalid coordinates.

### 2. Admin Management (The Bridge)
- **The Atlas Bridge**: A lightweight Flask/FastAPI REST API that serves as the nervous system.
- **Smart Linking (Reconciliation)**: The dashboard queries the bridge to search the vault in real-time. If a location matches an existing file, it links to it; otherwise, it prepares a new file creation.
- **Vault-Writing**: The `VaultWriter` module uses standardized templates to write/update `.md` files directly into the vault, ensuring consistent frontmatter and structure.

### 3. Visual Layer (The Atlas Map)
- **Geometry-Aware Interaction**: Implements Leaflet layer event listeners on `L.Polygon` and `L.Polyline` to trigger the Inspect Panel from any point within the shape, rather than relying on centroid markers.
- **Temporal Engine (Era Mode)**:
    - **State Transition**: Uses a `TemporalEngine` class to manage transitions between "Master Map" (all visible) and "Era Mode" (filtered).
    - **Ghostly Opacity**: Applies reduced opacity (e.g., 0.3) and dashed line styles to locations marked as 'Unknown', 'Oral', or undated, signaling historical uncertainty.
    - **Path Growth**: Uses `dashArray` animations to visually represent the growth of trails across time.

### 4. Deployment (GitHub Pages)
- **Orphan Branch Strategy**: Uses a dedicated `gh-pages` branch.
- **Selective Sync**: Only the `src/` (HTML) and `assets/` (CSS/JS/Images) directories are pushed to the public branch, keeping the massive research vault private.
