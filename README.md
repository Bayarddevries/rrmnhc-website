# RRMNHC Website — Red River Métis National Heritage Centre

**Status:** Active development
**Live site:** https://bayarddevries.github.io/rrmnhc-website/
**Platform:** Static HTML/CSS/JS + TailwindCSS (CDN)

---

## 📋 Documentation Suite
This project follows a standardized documentation structure:
- [**AGENTS.md**](/AGENTS.md) — Operating instructions for AI agents.
- [**ISSUES.md**](/ISSUES.md) — Local task and bug tracking.
- [**CHANGELOG.md**](/99-Project-Management/CHANGELOG.md) — High-level history of major shifts.
- [**README.md**](/README.md) — Project overview and technical architecture.

---

## Overview

Website for the **Red River Métis National Heritage Centre** — a living
landmark preserving and sharing Métis culture, history, and artifacts.
The site features a homepage, news section, artifacts 3D viewer, and
contact page.

Pages are cross-linked with the Métis Homeland Map and Shoebox
Digital Archive via shared navigation (see `site-nav.js`).

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Hero landing page — "Opening 2027" |
| `news.html` | News grid with article cards |
| `artifacts-viewer.html` | 3D artifact viewer (Three.js + GLTF models) |
| `contact.html` | Contact form & information |

## Design System

- **Colors:** Dark forest (#131A0F), crimson (#8B0000), parchment (#FDFCF9)
- **Fonts:** Cinzel (headings), Inter (body), Playfair Display (accents)
- **Framework:** TailwindCSS via CDN + custom CSS (`assets/css/style.css`)
- **Typography tokens:** Centralized design token system in `style.css`

See `design-system/rrmnhc_design_spec_showcase.html` for full spec.

## Architecture

```
rrmnhc-website/
├── index.html                    # Landing / hero
├── news.html                     # News grid
├── artifacts-viewer.html         # 3D artifact viewer (Three.js)
├── contact.html                  # Contact page
├── rrmhc_news.html               # News production pipeline output
├── assets/
│   ├── css/style.css             # Design system + custom styles
│   ├── audio/voices/             # Historical audio narrations
│   └── img/                      # Images and graphics
├── Artifacts/                    # 3D models (.glb) + thumbnails
├── design-system/                # Design lab & prototypes
├── shared/site-nav.js            # Local cross-site navigation
├── shoebox/                      # Shoebox integration (embedded)
├── 99-Project-Management/        # Changelog & session logs
├── AGENTS.md                     # AI Agent instructions
├── ISSUES.md                     # Task tracking
└── website archived/             # V1 & V2 archived versions
```

## Artifacts Viewer

The artifacts viewer uses **Three.js** to display 3D scans of cultural
artifacts in the browser. Models are stored as `.glb` files in
`Artifacts/` with PNG thumbnails.

Features:
- OrbitControls for 3D rotation/zoom
- GLTFLoader for model loading
- Audio narration (MP3/OGG) per artifact

## Shared Navigation

This site is part of the RRMNHC web suite, linked via `site-nav.js`
to:
- [Métis Homeland Map](https://bayarddevries.github.io/metis-homeland-map/)
- [Shoebox Digital Archive](https://bayarddevries.github.io/shoebox-v2/)

Navigation is loaded from both a local copy (`shared/site-nav.js`) and
the shared CDN (`https://bayarddevries.github.io/shared-assets/site-nav.js`).

## Related Repos

- [shared-assets](https://github.com/Bayarddevries/shared-assets) — Shared navigation & styles
- [shoebox-v2](https://github.com/Bayarddevries/shoebox-v2) — Digital archive
- [metis-homeland-map](https://github.com/Bayarddevries/metis-homeland-map) — Interactive map
