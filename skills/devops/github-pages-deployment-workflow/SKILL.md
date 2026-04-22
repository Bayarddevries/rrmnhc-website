---
name: github-pages-deployment-workflow
description: A professional workflow for deploying and maintaining a stable website on GitHub Pages using a dual-branch strategy (main/develop) and centralized design tokens.
---

# GitHub Pages Deployment Workflow

This skill outlines the process for maintaining a live public website while continuing active development, ensuring that the public-facing site remains stable and visually uniform.

## 1. Branching Strategy
To prevent breaking the live site during experiments, use a dual-branch system:
- **`main` branch**: The "Production" branch. GitHub Pages is configured to serve only from here. No direct commits; only merges from `develop`.
- **`develop` branch**: The "Staging" branch. All active coding, feature additions, and bug fixes happen here.

## 2. Centralized Design Tokens (CSS Variables)
To ensure uniformity across multiple pages (e.g., Home, News, Contact), avoid hardcoding styles in HTML files.
- **The Master Stylesheet**: Create `assets/css/style.css`.
- **Implementation**: Use CSS Custom Properties (Variables) for colors, fonts, and repeating geometry.
  - Example: `--rrmnhc-crimson: #8b0000;`
- **Linking**: Every page must link to this single CSS file in the `<head>`.
- **Benefit**: Changing one variable in the master CSS updates every page on the site instantly.

## 3. Deployment Pipeline
Follow this sequence for every update:
1. **Develop**: Make changes in the `develop` branch.
2. **Test**: Open local files in a browser to verify functionality.
3. **Sync**: Commit and push to `origin develop`.
4. **Release**: Merge `develop` into `main` and push to `origin main`.
   - `git checkout main && git merge develop && git push origin main`

## 4. Troubleshooting Common Issues

### GitHub Pages 404 Errors
If a page exists in the repo but returns a 404:
- **Build Delay**: GitHub Pages takes 30-120 seconds to redeploy after a push. Wait and refresh.
- **Cache Ghosting**: Browsers often cache the old version of the `index.html` routing. Use a Hard Refresh (`Ctrl+F5` / `Cmd+Shift+R`) or an Incognito window.
- **Case Sensitivity**: GitHub Pages is case-sensitive. `Contact.html` $\neq$ `contact.html`. Always use lowercase for filenames and links.
- **Path Ambiguity**: If links fail when URLs contain fragments (`#`), use explicit relative paths:
  - Use `./contact.html` instead of `contact.html` to force the browser to look in the current directory.

## 5. Verification Checklist
- [ ] Does the `main` branch match the desired public state?
- [ ] Are all pages linking to the centralized `style.css`?
- [ ] Do all navigation links work bidirectionally (e.g., Home $\rightarrow$ News $\rightarrow$ Home)?
- [ ] Is the active page highlighted in the navigation menu?
