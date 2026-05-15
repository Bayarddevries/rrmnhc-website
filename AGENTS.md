# AGENTS.md — RRMNHC Website Operating Instructions

This file provides instructions for AI agents working on the RRMNHC Website.

---

## Project Overview

Website for the **Red River Métis National Heritage Centre** — a living landmark preserving and sharing Métis culture, history, and artifacts.

**Live site:** https://bayarddevries.github.io/rrmnhc-website/
**Repo:** github.com/Bayarddevries/rrmnhc-website

---

## Critical Architecture Facts

### Tech Stack
- **Platform:** Static HTML/CSS/JS
- **Styling:** TailwindCSS (via CDN) + custom design system in `assets/css/style.css`
- **3D Rendering:** Three.js (used in `artifacts-viewer.html`)
- **Navigation:** Shared navigation component via `site-nav.js` (linked to Métis Homeland Map and Shoebox Digital Archive).

### Data & Content
- **News:** Hand-coded/managed articles in `news.html` and `rrmhc_news.html`.
- **Artifacts:** 3D models (`.glb`) stored in `Artifacts/` with associated PNG thumbnails and audio narrations.
- **Shared Assets:** Navigation is synchronized across the RRMNHC suite using `shared/site-nav.js` and the CDN version from `shared-assets`.

---

## What NOT To Do

- **Do not add a build step, framework, or bundler.** This is a static site intended for GitHub Pages.
- **Do not modify the core design system tokens** without verifying impact on the entire site.
- **Do not break the cross-site navigation.** Ensure `site-nav.js` remains functional and correctly linked.
- **Do not upload large unoptimized assets.** Maintain the site's performance for mobile/low-bandwidth users.

---

## Common Tasks

### Updating News
1. Create/Edit article content in the appropriate HTML files (`news.html` or `rrmhc_news.html`).
2. Ensure images and audio assets are placed in `assets/`.
3. Verify layout integrity in the news grid.

### Adding/Updating Artifacts
1. Place new `.glb` models in `Artifacts/`.
2. Add corresponding thumbnails and audio files to `assets/`.
3. Update `artifacts-viewer.html` to include the new artifact in the viewer logic.

---

## Testing After Changes

Agents must verify:
1. **Visual Integrity:** Check that Tailwind/Custom CSS doesn't cause layout shifts.
2. **Navigation:** Confirm the sidebar/menu (if implemented) and top-level links work across all pages.
3. **3D Rendering:** Verify Three.js models load and respond to OrbitControls in `artifacts-viewer.html`.
4. **Mobile Responsiveness:** Test that the mobile view (Tailwind breakpoints) handles content gracefully.
5. **Console Errors:** Zero JavaScript errors in the browser console.

---

## Key File Paths

| File | Purpose |
|------|---------|
| `index.html` | Hero landing page |
| `news.html` | News grid/articles |
| `artifacts-viewer.html` | 3D artifact viewer |
| `contact.html` | Contact information |
| `assets/css/style.css` | Main design system & custom CSS |
| `shared/site-nav.js` | Local cross-site navigation |
| `Artifacts/` | 3D models and assets |
| `99-Project-Management/` | Changelog & session logs |
