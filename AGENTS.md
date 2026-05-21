# AGENTS.md — RRMNHC Website Operating Instructions

This file provides instructions for AI agents working on the RRMNHC Website.

---

## Project Overview

Website for the **Red River Métis National Heritage Centre** — a living landmark preserving and sharing Métis culture, history, and artifacts.

**Live site:** https://bayarddevries.github.io/rrmnhc-website/
**Repo:** github.com/Bayarddevries/rrmnhc-website
**Local dev server:** http://100.108.183.33:8080/index.html (port 8080)

---

## Critical Architecture Facts

### Tech Stack
- **Platform:** Static HTML/CSS/JS
- **Styling:** TailwindCSS (via CDN) + custom design system in `assets/css/style.css`
- **3D Rendering:** Three.js (used in `artifacts-viewer.html`)
- **Navigation:** Shared navigation component via `site-nav.js` (linked to Métis Homeland Map and Shoebox Digital Archive).

### Data & Content
- **News:** Hand-coded/managed articles in `news.html` and `rrmnhc_news.html`.
- **Artifacts:** 3D models (`.glb`) stored in `Artifacts/` with associated PNG thumbnails and audio narrations.
- **Shared Assets:** Navigation is synchronized across the RRMNHC suite using `shared/site-nav.js` and the CDN version from `shared-assets`.

### Design System (MMF Branding — 2026-05-19)
- **Primary color:** `--mmf-crimson: #8b0000` (original dark crimson — NOT MMF bright red `#cf152d`)
- **MMF logo:** Layered in as image asset (`assets/logo_nav_v2.webp`, 10KB); color palette unchanged
- **Logo variants:** `logo_nav.webp` (12KB), `logo_sidebar.webp` (29KB), `logo_hero.webp` (66KB)
- **All 5 pages branded:** `index.html`, `artifacts-viewer.html`, `news.html`, `rrmnhc_news.html`, `contact.html`
- **Unified nav:** `shared/site-nav.js` — sidebar/overlay with MMF logo, z-index hierarchy (logo:1800, overlay:1900, sidebar:1950, toggle:2000)
- **Image optimization:** All artifact thumbnails converted to WebP (~45% size reduction)

### Served Projects (Port 8080)
The RRMNHC website server also serves:
- **Shoebox v2** at `/shoebox-v2/` — symlink to `/home/bayarddevries/shoebox-v2/shoebox/`
- **Hide & Fling** at `/src/index.html` — two-player physics tag game
- **Air Hockey** — also on port 8080

**⚠️ Symlink must point to `shoebox-v2/shoebox/` (build output), NOT `shoebox-v2/` (source).**

---

## What NOT To Do

- **Do not add a build step, framework, or bundler.** This is a static site intended for GitHub Pages.
- **Do not modify the core design system tokens** without verifying impact on the entire site.
- **Do not break the cross-site navigation.** Ensure `site-nav.js` remains functional and correctly linked.
- **Do not upload large unoptimized assets.** Maintain the site's performance for mobile/low-bandwidth users.
- **Do not change `--mmf-crimson` to MMF bright red `#cf152d`.** User prefers the original `#8b0000` palette.

---

## Common Tasks

### Updating News
1. Create/Edit article content in the appropriate HTML files (`news.html` or `rrmnhc_news.html`).
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
| `assets/logo_nav_v2.webp` | MMF RRM logo (10KB, navbar) |
| `assets/mmf_logo.png` | Original 710KB MMF logo source |

---

## Server Management

### Start the server
```bash
cd /home/bayarddevries/rrmnhc-website && python3 -m http.server 8080
```

### Check if running
```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/index.html
```

### Fix symlink (if Shoebox shows blank/broken)
```bash
rm /home/bayarddevries/rrmnhc-website/shoebox-v2
ln -s /home/bayarddevries/shoebox-v2/shoebox /home/bayarddevries/rrmnhc-website/shoebox-v2
```

## Engineering Discipline (from Karpathy's CLAUDE.md)

Bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that *your* changes made unused.
- Don't remove pre-existing dead code unless asked.

**Test:** Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

