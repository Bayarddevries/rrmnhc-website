---
name: atlas-deployment-verification-protocol
description: Procedural workflow for deploying interactive maps to GitHub Pages, preventing "Demo Mode" fallbacks by ensuring data manifest integrity.
category: devops
---

# Atlas Engine Deployment & Verification Skill

A procedural workflow for deploying single-file or directory-based HTML5 interactive maps (like the Atlas Engine) to GitHub Pages, ensuring that critical data assets and manifest files are correctly bundled and accessible.

## Overview

When deploying interactive maps, a common failure mode is the "Demo Mode" fallback, where the application fails to find its primary data manifest and reverts to hardcoded/placeholder data. This skill provides a protocol for verifying directory structure and data presence before and after deployment.

## Workflow

### 1. Pre-Deployment Audit
- **Identify Data Source**: Locate the primary data manifest (e.g., `atlas_data.json`) in the project's central data directories (e.g., `~/atlas_engine/data/compiled/`).
- **Verify Deployment Path**: Check the structure of the deployment folder (e.g., `~/atlas_engine/atlas/`).
- **Ensure Relative Path Integrity**: Confirm that the deployment directory contains a mirror of the required data structure. For the Atlas Engine, this typically means:
  - `index.html` (root)
  - `assets/js/` (logic)
  - `data/compiled/atlas_data.json` (actual research data)

### 2. Deployment Execution
- **Initialize/Update Repository**:
  - If new: `git init` -> `git add .` -> `git commit` -> `git remote add origin <URL>`
  - If existing: `git add .` -> `git commit` -> `git push`
- **Authentication Fallback**: If standard Git authentication fails with 403 errors, use the PAT-embedded remote URL:
  `git remote set-url origin https://<USERNAME>:<PAT>@github.com/<USERNAME>/<REPO>.git`
- **Enable Pages**: Ensure GitHub Pages is enabled in the repository settings.

### 3. Post-Deployment Verification (The "No-Demo" Check)
- **Live Audit**: Navigate to the GitHub Pages URL (e.g., `https://<user>.github.io/<repo>/`).
- **Console Diagnostics**: Open the browser developer tools and check:
  - **Network Tab**: Confirm `fetch` requests for `.json` files return `200 OK` and not `404 Not Found`.
  - **Console Tab**: Check for "Using Demo Mode" warnings or `fetch` errors.
  - **Global State**: Verify that `eraManager` and `atlasMain` are correctly initialized and loaded.

## Pitfalls & Solutions

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| **Map shows demo/test data** | Missing data directory/file in the deployment folder. | Copy `data/compiled/` from the project root into the deployment folder. |
| **403 Forbidden on push** | Authentication/PAT permissions. | Use the PAT-embedded remote URL method. |
| **Files not loading (404)** | Incorrect relative paths in `index.html` (e.g., absolute vs relative). | Ensure assets and data are referenced via relative paths (e.g., `assets/js/...` not `/assets/js/...`). |
| **Blank Map** | JavaScript syntax errors or missing Leaflet/Tailwind dependencies. | Check Console for `L is not defined` or `tailwindcss` errors. |
