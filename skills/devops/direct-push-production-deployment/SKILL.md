---
name: direct-push-production-deployment
description: A high-reliability deployment strategy for static web assets in volatile sandbox environments, bypassing local filesystem inconsistencies by bundling production code and pushing directly to GitHub via MCP/API.
---

# Direct-Push Production Deployment

## Trigger Conditions
- Deploying a frontend project (HTML/CSS/JS) to GitHub Pages.
- Encountering "Ghost Files" or filesystem volatility where files are written but not persisted or found by audit scripts.
- The need for an atomic "Production Bundle" to ensure no partial or corrupted files are deployed.

## Procedural Steps

### 1. The Production Bundle Phase
Instead of relying on a directory structure that may be volatile, consolidate all production assets into a single "Bundle" (JSON or dictionary).
- **Surgical Extraction**: Extract the finalized strings for all HTML, CSS, and JS files into a centralized object.
- **Relative Path Audit**: Ensure all internal links (e.g., `<script src="assets/js/main.js">`) use relative paths, as absolute paths (`/home/user/...`) will break on GitHub Pages.
- **Manifest Validation**: Verify that the data manifest (e.g., `atlas_data.json`) is included in the bundle.

### 2. The "Clean Slate" Deployment
Avoid incremental updates in volatile environments. Use a "Nuclear Reset" approach for the deployment branch:
- **Target Branch**: Use `gh-pages` for static hosting.
- **Atomic Push**:
    - Initialize/Checkout the deployment branch.
    - Clear existing files to prevent "stale asset" bugs.
    - Write the Production Bundle files directly to the branch.

### 3. The Visual Audit Loop
Never deploy "blind." Use a browser-based verification step before and after the push:
- **Local Preview**: Load the `index.html` via a browser MCP to verify the DOM and CSS rendering.
- **Console Check**: Use the browser console to verify that JS modules (e.g., `TemporalEngine`) are successfully instantiated.
- **Live Verification**: Once pushed, navigate to the `.github.io` URL to confirm the remote environment matches the local a-z audit.

## Pitfalls & Troubleshooting
- **Ghost Files**: If files appear missing during audit but the browser shows them, the filesystem is likely experiencing a sync lag. Use absolute paths for writing and relative paths for linking.
- **CORS Issues**: When using a backend bridge (like a Flask API), ensure `flask-cors` is implemented to allow the frontend to communicate across different ports/domains.
- **Pathing Breaks**: If the site loads but CSS/JS is missing, check the `src` attributes for leading slashes (use `assets/js/...` instead of `/assets/js/...`).

## Verification Steps
- [ ] `index.html` renders without 404s in the console.
- [ ] All CSS tokens are applied (correct colors/fonts).
- [ ] JS event listeners (e.g., Timeline Slider) trigger expected state changes.
- [ ] GitHub Pages URL returns a 200 OK status.
