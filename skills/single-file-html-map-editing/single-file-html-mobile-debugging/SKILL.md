---
name: single-file-html-mobile-debugging
description: Common pitfalls and fixes for single-file HTML maps that load on desktop but break or hang on mobile (Android/iOS). Covers loading overlay failures, CSS animation conflicts with transitions, and mobile touch event patterns.
category: single-file-html-map-editing
---

# Single-File HTML Map Mobile Debugging

## When to use
- Map loads fine on desktop but is stuck/broken on Android or iOS
- Loading spinner never dismisses on mobile
- Click/tap events don't work on mobile (buttons, toggles, close buttons)
- Sidebar or modal menus won't open/close on mobile
- Any interactive elements (hamburger menu, sliders, source buttons) don't respond despite UI rendering

## Pitfall 1: Loading overlay hangs on mobile

**Symptom**: Page shows "Loading..." spinner forever on mobile, works fine on desktop.

**Root cause**: `window.addEventListener('load', ...)` doesn't fire reliably on mobile browsers when maps/tiles take time to load. The entire page sits behind the overlay.

**Fix: Remove the loading overlay entirely.**
- Don't add fallbacks, timeouts, or multiple event listeners — these add complexity and can still fail
- Just let the browser render the map immediately during page load
- The map tiles will appear progressively as they load — this is fine
- Remove: the overlay HTML element, all CSS classes (`.map-loader`, `.loader-ring`, etc.), and all JS that references it

## Pitfall 1b: Cascading JS errors from structural issues

**Symptom**: Multiple interactive features fail simultaneously (hamburger menu, slider, source buttons) despite the page loading and rendering. Console shows "Cannot set properties of null" errors. Often multiple errors cascade from a single root cause.

**Root cause**: A single typo or syntax error early in the script halts execution, preventing all subsequent event listeners from attaching. Common culprits:

1. **Undefined variable reference**: `lb.appendChild(x)` when the variable was named `ld` — halts script immediately
2. **Missing closing `});` on an event listener**: the function body BLEEDS into the next code block, creating a syntax error that silently prevents ALL downstream JS from running
3. **Stray `});` closing the wrong block**: an extra `});` that was meant to close a function but actually closes an outer scope — causes "Unexpected token '}'" error
4. **Element ID typo**: `document.getElementById('foo')` where the element doesn't exist yet or has a typo in the ID

**Debugging approach**:
- Run the page and check console — count the errors
- Fix the first error you find, reload, recount
- Often fixing one error reduces the count dramatically (cascading)
- Keep fixing until you reach zero — then ALL features work at once
- The `grep` search for `\.textContent\s*=` helps find all DOM manipulation points at once

```bash
grep -n '\.textContent\s*=' file.html  # Find all textContent assignments
grep -n 'addEventListener' file.html    # Find all event listeners
```

## Pitfall 1c: Era filter/slider kills toggle buttons permanently

**Symptom**: After moving the era slider, clicking the "Cart Trails" or "Boat Routes" toggle button turns them OFF but they can't be turned back ON.

**Root cause**: The `applyTimeline()` function calls `cartTG.clearLayers()` and only rebuilds trails matching the selected era. When you click the toggle button to show trails again, it does `map.addLayer(cartTG)` — but `cartTG` is EMPTY because the era filter emptied it. The toggle doesn't rebuild the trails, it just shows the empty group.

**Fix**: When the toggle button is clicked to turn trails ON, rebuild ALL trails from the master `trails[]` array before adding the layer group:

```javascript
cartBtn.addEventListener('click', function() {
    if (map.hasLayer(cartTG)) {
        map.removeLayer(cartTG);
        cartBtn.classList.remove('on');
    } else {
        cartTG.clearLayers();
        trails.forEach(function(t) {
            if (t.category === 'Red River Cart Trails') addTrailToGroup(t, cartTG);
        });
        map.addLayer(cartTG);
        cartBtn.classList.add('on');
    }
});
```

**Key pattern**: Separation of concerns — the era filter handles temporal visibility, the toggle handles categorical visibility. They shouldn't interfere.

## Pitfall 1d: Source button in popup doesn't find location name

**Symptom**: Clicking "Sources" in a marker popup does nothing — no error, no modal, complete silence.

**Root cause**: The popup HTML uses inline styles (e.g., `<div style="font-weight:700">`) instead of semantic HTML elements (`<h2>`, `<h3>`). The `showSources()` function was querying `popup.querySelector('h2')` which returned null. The function then hit an early return, causing silent failure.

**Fix**: Use flexible selectors and add fallback matching:

```javascript
function showSources(btn) {
    var popup = btn.closest('.leaflet-popup-content');
    if (!popup) return;
    
    // Flexible selector — not everyone uses h2 in Leaflet popups
    var nameEl = popup.querySelector('[style*="font-weight:700"], h2, h3');
    if (!nameEl) return;
    var locName = nameEl.textContent.trim();
    
    // Exact match first
    var sources = LOCATION_SOURCES[locName];
    if (!sources || !sources.length) {
        // Case-insensitive fallback
        var lowerName = locName.toLowerCase();
        for (var key in LOCATION_SOURCES) {
            if (key.toLowerCase() === lowerName) {
                sources = LOCATION_SOURCES[key];
                break;
            }
        }
    }
    if (!sources || !sources.length) return;
    // ... render modal
}
```

**Lesson**: Leaflet popups are arbitrary HTML — don't assume semantic tags. Always query by style patterns or content structure.

## Pitfall 1e: Toggle button stuck after era filter with `Object.keys(_layers)` check

**Symptom**: You add a check like `if (Object.keys(cartTG._layers).length === 0)` to detect empty layer groups, but the toggle button still gets stuck in the OFF state and can't be turned back ON.

**Root cause**: Leaflet's internal `_layers` object is unreliable for emptiness checks. It may contain stale keys, internal references that persist after `clearLayers()`, or behave differently across Leaflet versions. This check can silently evaluate to the wrong boolean, causing the toggle logic to take the wrong branch.

**Fix: Don't check `_layers` at all.** After rebuilding from the master array, always call `map.addLayer()` and set the button to active. If the filter legitimately has zero matching items, that's a data issue, not a code issue:

```javascript
cartBtn.addEventListener('click', function() {
    if (map.hasLayer(cartTG)) {
        map.removeLayer(cartTG);
        cartBtn.classList.remove('on');
    } else {
        cartTG.clearLayers();
        trails.forEach(function(t) {
            if (t.category === 'Red River Cart Trails') addTrailToGroup(t, cartTG);
        });
        map.addLayer(cartTG);     // Always add, always set active
        cartBtn.classList.add('on');
    }
    updCount();
});
```

**Lesson**: Avoid accessing Leaflet's private `_layers` object. Use official APIs like `getLayers()` or just trust the rebuild logic.

## Pitfall 1f: Leaflet popup CSS classes resolve to translucent backgrounds

**Symptom**: Trail/route popups show text on a transparent or semi-transparent background, making descriptions unreadable over map tiles. Location pin popups work fine (solid dark background).

**Root cause**: Trail popups were built using CSS classes (`class="loc-popup"`, `class="pop-desc"`, `class="pop-header"`) that rely on CSS variables like `var(--bg2)`, `var(--bg3)`. These variables can resolve to semi-transparent values, or the CSS rules for those classes may be missing entirely in certain media queries. Location popups avoid this by using inline hardcoded styles.

**Fix: Use inline hardcoded styles for popup content, exactly matching the working location popup structure:**

```javascript
line.bindPopup(
    '<div style="background:#232019;">' +
        '<div style="height:4px;width:100%;background:' + t.color + '"></div>' +
        '<div style="padding:10px 12px 6px;">' +
            '<div style="font-size:13px;font-weight:700;color:#f0e6d8;">' + t.name + '</div>' +
            '<div style="display:flex;gap:4px;">' +
                '<span style="background:' + t.color + ';color:#fff;padding:2px 6px;border-radius:3px;font-size:9px;">' + t.category + '</span>' +
                '<span style="background:rgba(255,255,255,.1);color:#a89b8c;padding:2px 6px;border-radius:3px;font-size:9px;">' + t.year + '</span>' +
            '</div>' +
        '</div>' +
        '<div style="padding:4px 12px 10px;border-top:1px solid rgba(200,149,108,0.15);">' +
            '<div style="color:#a89b8c;font-size:11px;line-height:1.55;max-height:180px;overflow-y:auto;">' + t.desc + '</div>' +
        '</div>' +
    '</div>',
    { maxWidth: 340 }
);
```

**Key rules for popup content:**
- Solid hex background (`#232019`) — no `rgba()` on the popup container
- Description text in muted color (`#a89b8c`) on `#232019` — readable contrast
- `max-height:180px;overflow-y:auto;` on description to prevent walls of text
- No CSS classes that inherit from variables — all styles inline and hardcoded
- Match the working location popup structure: color bar header → name/badges → separator → description

## Pitfall 1g: Trail hover tooltips need solid backgrounds too

**Symptom**: Hover tooltips on trails show text floating over map tiles with no visible background.

**Root cause**: Tooltip CSS uses `rgba(26,23,20,0.95)` which appears nearly transparent on certain tile backgrounds.

**Fix: Use solid hex background + capped width + nowrap:**

```css
.trail-tooltip {
    background: #1a1714 !important;  /* solid, not rgba */
    color: #f0e6d8 !important;
    max-width: 280px !important;
    white-space: nowrap !important;
    font-weight: 600 !important;
}
```

## Pitfall 1h: Helper function referenced but never defined

**Symptom**: Trail toggle buttons do nothing when clicked. No visible change, trails don't reappear after era filter removes them, reset button doesn't restore trails. No obvious error in the UI.

**Root cause**: A helper function like `addTrailToGroup(t, grp)` is called in 4-5 places (initial setup loop, era filter `applyTimeline()`, reset function, toggle button `else` branch) but the function was never actually defined. JavaScript throws a silent `ReferenceError: addTrailToGroup is not defined` — the catch block or event handler swallows it, so nothing happens.

This happens when code is refactored: the trail-building logic was originally inline inside a `trails.forEach()` loop. At some point, someone changed loop calls to `addTrailToGroup(t, grp)` but never extracted the function. Every downstream caller (toggle, filter, reset) was broken.

**How to detect it**:
```bash
# If the function is called but grep finds no definition, there's your bug
grep -n "addTrailToGroup" file.html          # Shows 5 call sites
grep -n "function addTrailToGroup" file.html  # Returns nothing — BINGO
```

**Fix**: Extract the inline polyline creation into the missing function:

```javascript
function addTrailToGroup(t, grp) {
    if (!t.coords || t.coords.length < 2) return;
    var line = L.polyline(t.coords, {
        color: t.color, weight: t.weight,
        dashArray: t.dash, opacity: 0.82,
        lineCap: 'round', lineJoin: 'round'
    });
    line.bindPopup(
        '<div style="background:#232019;">' +
            '<div style="height:4px;width:100%;background:' + t.color + '"></div>' +
            '<div style="padding:10px 12px 6px;">' +
                '<div style="font-size:13px;font-weight:700;color:#f0e6d8;">' + t.name + '</div>' +
                '<div style="display:flex;gap:4px;">' +
                    '<span style="background:' + t.color + ';color:#fff;padding:2px 6px;border-radius:3px;font-size:9px;">' + t.category + '</span>' +
                    '<span style="background:rgba(255,255,255,.1);color:#a89b8c;padding:2px 6px;border-radius:3px;font-size:9px;">' + t.year + '</span>' +
                '</div>' +
            '</div>' +
            '<div style="padding:4px 12px 10px;border-top:1px solid rgba(200,149,108,0.15);">' +
                '<div style="color:#a89b8c;font-size:11px;line-height:1.55;">' + t.desc + '</div>' +
            '</div>' +
        '</div>',
        { maxWidth: 340 }
    );
    line.bindTooltip(t.name, { sticky: true, direction: 'top', offset: [0, -4] });
    grp.addLayer(line);
}
```

**Debugging workflow for this class of bug**:
1. `grep -n "function fnName"` — does the function exist?
2. `grep -n "fnName(" file.html` — how many call sites?
3. If calls exist but no definition: the function was never created or was accidentally deleted during a previous edit
4. Add debug `console.log()` inside the function once defined, verify it fires

**Lesson**: When refactoring inline code into functions, always verify the function definition exists BEFORE replacing inline calls with function references. This is especially important in single-file HTML where everything is in one enormous file — it's easy to lose a function definition during search-and-replace or patch operations.

## Pitfall 2: CSS animations conflict with transitions

**Symptom**: Clicking a close button or toggle does nothing — the element doesn't move or hide despite class being toggled correctly in the DOM.

**Root cause**: An entry animation with `animation: name duration fill-mode: both` persists its final computed value. When you add a class like `.closed` that changes `transform` or `opacity`, the animation's computed value wins because `both` fill-mode locks it in place.

**Example that breaks:**
```css
.sidebar {
  animation: slideIn .3s both;  /* <-- "both" locks the final transform */
  transition: all .25s;
}
.sidebar.closed {
  transform: translateX(-100%);  /* <-- NEVER VISIBLE, animation wins */
}
@keyframes slideIn {
  from { transform: translateX(-100%); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}
```

**Fix: Remove the conflicting animation on the closed state, or remove the animation entirely:**
```css
/* Option A: Remove animation, rely on transition */
.sidebar {
  transition: all .25s cubic-bezier(.4,0,.2,1);
}
.sidebar.closed {
  transform: translateX(-100%);
  opacity: 0;
}

/* Option B: Kill animation when .closed is added */
.sidebar.closed {
  animation: none !important;
  transform: translateX(-100%);
  opacity: 0;
}
```

## Pitfall 3: Click events don't fire on mobile

**Symptom**: Close button (×), toggle button (☰), or menu items work on desktop but not on phone.

**Root cause**: Mobile browsers fire `touchend` before/instead of `click`, and the timing can cause `click` to be swallowed or intercepted by the browser's default touch behavior.

**Fix: Add both `click` and `touchend` handlers with `preventDefault()`:**
```javascript
var closeBtn = document.getElementById('sb-x');

// Option A: Separate handlers
closeBtn.addEventListener('click', function(e) { e.preventDefault(); doThing(); });
closeBtn.addEventListener('touchend', function(e) { e.preventDefault(); doThing(); });

// Option B: Inline HTML (nuclear option, never fails)
// <button onclick="doThing()" ontouchend="doThing()">X</button>
```

**Nuclear option** — if JS event listeners aren't working for any reason, use inline handlers:
```html
<button onclick="document.querySelector('.sidebar').classList.add('closed')"
        ontouchend="document.querySelector('.sidebar').classList.add('closed')">
  &times;
</button>
```

## Pitfall 4: Tap target too small on mobile

**Symptom**: Button exists but can't be reliably tapped on phone (touch events miss).

**Fix: Ensure minimum touch area of 36x36px:**
```css
.sb-x {
  min-width: 36px;
  min-height: 36px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

## Pitfall 5: Mobile sidebar slides from wrong position

**Symptom**: On mobile, sidebar starts hidden or in wrong position.

**Root cause**: Mobile CSS sets initial `transform` that conflicts with desktop rules.

**Fix: Ensure mobile starts visible (no transform) when open:**
```css
@media (max-width: 768px) {
  .sidebar {
    top: 60px; left: 0;
    width: calc(100vw - 16px);
    max-height: 65vh;
    /* NO transform here — starts visible */
  }
  .sidebar.closed {
    transform: translateX(-100%);
    opacity: 0;
    pointer-events: none !important;
  }
  .sidebar:not(.closed) {
    transform: translateX(0);
    opacity: 1;
  }
}
```

## Debugging workflow

1. **Test locally first** — serve the file and open in browser before pushing:
   ```bash
   cd directory && python3 -m http.server 8765
   # Open http://localhost:8765/file.html
   ```

2. **Check console for JS errors** — if there are syntax errors, nothing renders:
   ```bash
   # In browser console, should be clean (zero errors)
   ```

3. **Verify DOM structure renders** — all UI elements (sidebar, search, layers) should appear in the accessibility tree/snapshot.

4. **Push and test on device** — GitHub Pages may take 1-2 minutes. Force-refresh on mobile.

5. **Iterate one change at a time** — don't bundle the coordinate smoothing, sidebar fix, and loading overlay removal into the same push. If something breaks, you need to know which change caused it.

## Critical Git workflow for single-file HTML

When patching a massive single-file HTML (200-300KB, thousands of lines), the following Git pattern prevents headaches:

**DO THIS before every patch:**
```bash
cd /path/to/repo && git fetch
git diff origin/main HEAD -- file.html  # See if your local matches remote
```

**If there are merge conflicts, DO NOT fight them:**
```bash
# Abort any messy rebase/merge
git rebase --abort 2>/dev/null
git merge --abort 2>/dev/null

# Reset to the remote truth
git fetch
git reset --hard origin/main

# Re-apply your fix cleanly from scratch
# (read the remote file, find the bug, apply the patch)
git add file.html && git commit -m "fix: ..." && git push
```

**Why:** Single-file HTML maps have thousands of lines with no semantic structure — merge conflicts on a 280KB HTML file are virtually impossible to resolve correctly. It's always faster to pull the remote truth and patch it clean.

## Debugging checklist order (do NOT skip)

When trail toggles or era filters break, check in THIS exact order:

1. **Is the helper function defined?** `grep -n "function addTrailToGroup" file.html` — if it returns nothing, nothing else matters. 100% of trail rebuild failures trace back to this.
2. **Are `trails[]` and `window.allTrails` populated?** If the data array is empty or undefined, the rebuild has nothing to iterate.
3. **Are trail objects valid?** `t.coords` must exist and have 2+ points. Add a guard: `if (!t.coords || t.coords.length < 2) return;`
4. **Does `getLayers()` work?** Use `cartTG.getLayers().length` NOT `Object.keys(cartTG._layers).length`
5. **Is the layer group on the map?** `map.hasLayer(cartTG)` returns true even when the group is empty
6. **Is the toggle's `.on` class in sync?** Check both `map.hasLayer()` AND the button's `.on` class

## Key principle

When debugging single-file HTML maps:
- **Zero JS errors** is the first milestone (fix syntax/string issues)
- **All UI elements render** is the second milestone (check DOM loads correctly)
- **All interactions work** is the third milestone (clicks, toggles, search, filters)
- Fix these in order. Don't skip ahead to cosmetics or data enrichment.
