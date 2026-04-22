---
name: github-pages-nuclear-deployment-fix
description: A specialized workflow for deploying and repairing static websites hosted on GitHub Pages, specifically for resolving 404 errors on newly added assets.
---

# GitHub Pages Deployment & Troubleshooting (The Nuclear Option)

A specialized workflow for deploying and repairing static websites hosted on GitHub Pages, specifically designed for environments where directory structure changes (like adding new image folders) might not trigger a full deployment re-scan.

## Overview
GitHub Pages can sometimes fail to recognize newly added assets (images, CSS, JS) within new subdirectories, leading to 404 errors even when the files exist in the repository. This skill provides a "Nuclear Option" to force a complete rebuild and ensure path integrity.

## Core Principles
- **Dual-Branch Strategy:** Use `develop` for active feature work and `main` for the stable, public-facing production site.
- **Explicit Pathing:** Always use `./` (e.g., `./assets/img/file.jpg`) to ensure the browser resolves paths relative to the current page, preventing fragment (`#`) or trailing slash issues.
- **Cache Busting:** Use unique comments or versioned filenames to force the GitHub build engine to re-scan the entire directory structure.

## The "Nuclear Reset" Protocol
When a page is loading but assets (images/CSS) are returning 404s:

1. **Verify Local Integrity:**
   - Check that files exist in the correct directory (e.g., `assets/img/`).
   - Check that filenames and paths in the HTML use the `./` prefix.

2. **Perform the Reset:**
   Instead of trying to patch the broken file, **overwrite the file entirely** with a clean, standard template. This removes hidden whitespace issues or broken regex fragments.

3. **Trigger Re-scan (The Force Push):**
   - Commit the clean file.
   - Add a "cache-buster" comment to the end of the HTML file (e.g., `<!-- Force Redeploy: [random_hex] -->`).
   - Merge `develop` into `main`.
   - Push to `origin main`.

## Troubleshooting 404s on Static Assets
| Symptom | Likely Cause | Fix |
| :--- | :--- | :--- |
| Asset 404 while using `#` fragments | Relative path ambiguity | Use `./` prefix for all `src` and `href` attributes. |
| Asset 404 after adding a new folder | GitHub build cache | Add a unique comment to the HTML and push to `main`. |
| Image exists but won't load | Case-sensitivity | Ensure `Image.JPG` in code matches `image.jpg` in the file system. |
| Site looks unstyled | CSS pathing | Check `link` tag and ensure it uses `./assets/css/style.css`. |

## Example: Forceful Asset Injection (Python)
```python
import os
import re

# 1. Use a regex to replace the broken placeholder with the correct tag
# 2. Append a unique comment to the file to trigger a build
# 3. Push to origin main
```
