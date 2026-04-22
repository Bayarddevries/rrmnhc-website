---
name: rrmnhc-design-system-sync
description: A protocol for implementing global design updates using CSS Design Tokens to ensure perfect uniformity across the RRMNHC website ecosystem.
category: web-dev
---

# RRMNHC Design System Sync

This skill manages the systematic application of design changes across the RRMNHC website (Home, News, Contact, and Map components) using the centralized Design Token system.

## Core Philosophy
Never "patch" individual elements. Always update the **Design Token** (the source of truth) in `assets/css/style.css` and verify the cascading effect across the entire site.

## The Design Token Registry

### 1. Color Palette
- `--rrmnhc-crimson`: `#8b0000` (Primary accent/beadwork)
- `--rrmnhc-crimson-light`: `#b30000` (Hover states)
- `--rrmnhc-parchment`: `#fdfcf9` (Main background)
- `--rrmnhc-cream`: `#f4f1ea` (Secondary background/sections)
- `--rrmnhc-charcoal`: `#2c2c2c` (Primary text)
- `--rrmnhc-charcoal-light`: `#555555` (Muted text)
- `--rrmnhc-border`: `#e5e7eb` (Dividers/Borders)
- `--rrmnhc-white`: `#ffffff` (Card/Overlay backgrounds)

### 2. Typography Scale
- `--font-serif`: `'Playfair Display', serif` (Headings/Authority)
- `--font-sans`: `'Inter', sans-serif` (Body/Readability)
- `--font-cinzel`: `'Cinzel', serif` (Monumental/Captions)
- Scales: `--text-xs` through `--text-6xl`

### 3. Spacing & Geometry
- **Spacing:** `--space-xs` through `--space-3xl` (Modular scale)
- **Radius:** `--radius-sm` (Cards/Buttons), `--radius-md`, `--radius-lg`, `--radius-pill`
- **Shadows:** `--shadow-sm`, `--shadow-md`

## Operational Workflow

### Phase 1: The "Lab" Test
Before applying changes to the production site:
1.  **Modify the Lab:** Navigate to `design-system/rrmnhc_design_spec_showcase.html`.
2.  **Update the Token:** Edit `assets/css/style.css` to change the specific variable requested by the user.
3.  **Visual Audit:** Open the Showcase page in a browser. Confirm the change looks correct in the "Component Playground" and "Token Grid."

### Phase 2: The "Global Sync"
Once the design is approved in the Lab:
1.  **Verify Cascade:** Open the main pages (`index.html`, `news.html`, `contact.html`) in the browser.
2.  **Confirm Uniformity:** Ensure the change has correctly cascaded to all components (e.g., all buttons, all headings, all cards).
3.  **Commit & Deploy:**
    *   `git add .`
    *   `git commit -m "Design System: [Description of change, e.g., Update Crimson to darker shade]"`
    *   `git push origin develop`
    *   `git checkout main && git merge develop && git push origin main`

## Troubleshooting
- **"The change isn't showing up":** This is likely a browser cache issue. Perform a **Hard Refresh** (`Ctrl+F5` or `Cmd+Shift+R`).
- **"The layout broke":** Ensure you didn't accidentally delete the `:root` block or any essential structural tokens like `--space-md`.
- **"The color looks different on different pages":** Check if any page has a hardcoded color (e.g., `color: #8B0000`) instead of using the token `color: var(--rrmnhc-crimson)`.
