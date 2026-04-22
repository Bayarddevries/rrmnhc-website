---
name: design-system-token-maintenance
description: A procedural workflow for implementing and maintaining a centralized Design Token system to ensure visual consistency across a multi-page project.
---

# Design System Token Maintenance

This skill provides a systematic approach to managing a website's visual identity through CSS tokens (custom properties) and a "Design Lab" for visual verification. It prevents "style drift" and eliminates the need for repetitive, manual updates across multiple HTML files.

## Trigger Conditions
- Need to change a global style (color, spacing, font) across multiple pages.
- Desire to implement a new visual element (e.g., a navbar or button style) that must remain consistent.
- Need to audit the visual identity to ensure it matches a design spec.

## Procedural Steps

### 1. Token Definition (The Source of Truth)
Always define visual values as CSS variables within the `:root` selector in the master stylesheet.
- **Colors:** `--prefix-color-name: #hexcode;`
- **Typography:** `--prefix-font-family: 'Font Name', category;`
- **Spacing:** `--prefix-space-size: value;`
- **Radius/Shadows:** `--prefix-radius-size: value;`

### 2. Component Implementation
Avoid hardcoding values in HTML classes. Use the tokens in a centralized component class.
- **Bad:** `.navbar { background-color: #fdfcf9; }`
- **Good:** `.navbar { background-color: var(--rrmnhc-parchment); }`

### 3. The Design Lab Workflow
Maintain a `design_spec_showcase.html` page that serves as a "Living Lab."
- **Token Mapping:** Display the token name, the hex code, and a visual swatch.
- **Usage Tags:** Explicitly document which HTML elements or CSS classes consume which token (e.g., `Inter` $\rightarrow$ `body, navigation, card-body`).
- **Component Playground:** Render live examples of buttons, cards, and dividers that use the tokens.

### 4. Iterative Refinement (The "Verify-First" Loop)
When a design change is requested:
1. **Update Token:** Modify the value in the `:root` of the master CSS.
2. **Verify in Lab:** Refresh the Design Lab page to see how the change affects the components in isolation.
3. **Deploy & Audit:** Push changes to the live site and use `browser_vision` or manual audit to ensure no unintended side effects (e.g., contrast issues or "skin aging" texture effects).

## Pitfalls & Lessons Learned
- **Parallax Friction:** Avoid `position: fixed` for texture overlays when content scrolls; use `position: absolute` to ensure the texture moves with the images.
- **Opacity Balance:** High-opacity textures (e.g., > 0.3) can interfere with the clarity of portraits/faces. Keep background textures subtle (around 0.1).
- **Cache Interference:** Design updates may not appear immediately due to browser caching. Use hard refreshes (Ctrl+Shift+R) or append version query strings to the CSS link (`style.css?v=1.1`).
- **The "Nuclear Reset" Fallback:** When surgical string replacement in HTML leads to "leaked" code fragments, rebuild the page from a clean master template rather than attempting multiple patches.

## Verification Steps
- [ ] Check that all pages reference the same master stylesheet.
- [ ] Confirm that no hardcoded hex codes exist outside the `:root` tokens.
- [ ] Verify that the Design Lab correctly reflects the current values of the live site.
