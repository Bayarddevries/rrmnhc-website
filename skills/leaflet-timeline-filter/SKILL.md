---
name: leaflet-timeline-filter
description: Implement a working timeline/era filter for Leaflet maps that can show/hide markers and trails by date ranges.
version: 1.0
created: 2026-04-06
tags: [leaflet, timeline, filter, markers, dynamic]
---

# Leaflet Timeline Filter Pattern

Add a bottom-bar timeline slider to filter map markers and trails by era.

## CRITICAL RULE: Store Direct Marker References

When creating location markers, ALWAYS store a direct reference on the data object:

```javascript
locations.forEach(function(loc) {
    var m = L.circleMarker([loc.lat, loc.lng], { ... });
    LG[loc.layer].addLayer(m);
    loc._marker = m;  // <-- CRITICAL: store direct ref
});
```

**Why?** Once a marker is `removeLayer()`'d from a LayerGroup, you CANNOT find it back with `eachLayer()`. The marker is completely invisible to group searches. Direct refs are the only reliable way to find hidden markers.

## HTML Structure

```html
<div class="timeline">
  <div class="tl-head">
    <span class="tl-title">Timeline Filter</span>
    <span class="tl-year" id="tl-year">All Eras</span>
    <span class="tl-count" id="tl-count"></span>
    <button class="tl-reset" id="tl-reset">Reset</button>
  </div>
  <input type="range" class="tl-slider" id="tl-slider" 
         min="0" max="12" value="12" step="1"/>
  <div class="tl-labels">
    <span>1680</span><span>1720</span>...<span>All</span>
  </div>
</div>
```

**Slider defaults to max (All=12)** so map loads with everything visible.

## CSS

```css
.timeline {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 1000;
  background: rgba(26,23,20,0.92); backdrop-filter: blur(12px);
  padding: 4px 24px 8px; border-top: 1px solid rgba(200,149,108,0.12);
}
.tl-head {
  display: flex; align-items: center; justify-content: space-between;
}
.tl-year { font-size: 0.95rem; color: var(--accent); font-weight: 700; }
.tl-slider {
  width: 100%; height: 4px; margin: 4px 0;
  -webkit-appearance: none; background: linear-gradient(to right, var(--brd) 0%, var(--bg3) 100%);
}
.tl-slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 18px; height: 18px;
  border-radius: 50%; background: var(--accent);
  box-shadow: 0 0 0 3px var(--bg), 0 0 0 4px var(--accent-glow);
  cursor: pointer;
}
.tl-reset {
  background: var(--bg3); border: 1px solid var(--brd2);
  border-radius: 6px; padding: 4px 8px; font-size: 0.65rem;
  cursor: pointer; color: var(--t2);
}
.tl-reset:hover { background: var(--accent); color: #fff; }
```

## JavaScript Implementation

### 1. Era configuration
```javascript
// 13 positions matching 13 labels
// Left (0) = most restrictive, Right (12) = all
var eras = [1680, 1720, 1760, 1800, 1820, 1840, 1860, 1870, 1880, 1890, 1900, 1950, 99999];
```

### 2. Year parsing function
```javascript
function parseFirstYear(text) {
    if (!text) return 99999;
    var low = text.toLowerCase();
    // Treat vague dates as very old (always visible)
    if (low.indexOf('ancient') > -1 || low.indexOf('historic') > -1 || 
        low.indexOf('oral') > -1 || low.indexOf('traditional') > -1 ||
        low.indexOf('approximate') > -1) return 1;
    var m = text.match(/(\d{4})/);
    return m ? parseInt(m[1]) : 99999;
}
```

### 3. Filter function
```javascript
function applyTimeline() {
    var idx = parseInt(document.getElementById('tl-slider').value);
    
    // At max position — show everything
    if (idx === eras.length - 1) {
        resetTimeline();
        return;
    }
    
    var cutoff = eras[idx];
    document.getElementById('tl-year').textContent = 'Up to ' + cutoff;
    
    // Filter markers using DIRECT _marker refs
    var visibleCount = 0;
    locations.forEach(function(loc) {
        var year = parseFirstYear(loc.founded);
        var m = loc._marker;  // <-- DIRECT REF, not eachLayer()
        if (!m) return;
        
        if (year <= cutoff) {
            if (!LG[loc.layer].hasLayer(m)) {
                LG[loc.layer].addLayer(m);
                visibleCount++;
            }
        } else {
            if (LG[loc.layer].hasLayer(m)) {
                LG[loc.layer].removeLayer(m);
            }
        }
    });
    
    // Rebuild trail groups from scratch
    cartTG.clearLayers();
    boatTG.clearLayers();
    trails.forEach(function(t) {
        var startYear = parseFirstYear(t.year);
        if (startYear <= cutoff) {
            var grp = t.category === 'Red River Cart Trails' ? cartTG : boatTG;
            addTrailToGroup(t, grp);
        }
    });
    
    // Update sidebar counts
    cartBtn.querySelector('.lcnt').textContent = cartTG.getLayers().length;
    boatBtn.querySelector('.lcnt').textContent = boatTG.getLayers().length;
    
    document.getElementById('tl-count').textContent = visibleCount + ' locations';
    document.getElementById('vc').textContent = visibleCount;
}

function resetTimeline() {
    document.getElementById('tl-slider').value = eras.length - 1;
    document.getElementById('tl-year').textContent = 'All Eras';
    
    locations.forEach(function(loc) {
        if (loc._marker && !LG[loc.layer].hasLayer(loc._marker)) {
            LG[loc.layer].addLayer(loc._marker);
        }
    });
    
    cartTG.clearLayers();
    boatTG.clearLayers();
    trails.forEach(function(t) {
        addTrailToGroup(t, t.category === 'Red River Cart Trails' ? cartTG : boatTG);
    });
}

document.getElementById('tl-slider').addEventListener('input', function() {
    applyTimeline();
});

document.getElementById('tl-reset').addEventListener('click', function() {
    resetTimeline();
    map.setView([52.0, -99.0], 5);
});
```

## Common Pitfalls

### eachLayer() can't find hidden markers
Once `removeLayer()` is called, the marker is gone from the group. `eachLayer()` returns nothing for it. **Always use direct refs stored during creation.**

### Marker ref matching too strict
Coordinate matching tolerance of 0.0001 can miss some markers after rounding. Use 0.001 if doing coordinate-based lookup (but prefer direct refs).

### Slider orientation confusion
- Position 0 = most restrictive (shows only oldest locations)
- Position max = shows everything
- Slider should DEFAULT to max so map loads fully visible
- "Ancient" and "Historic" should parse to year 1 (always visible)

### Trail rebuilding
Always clear and rebuild both trail groups (cartTG, boatTG) from the full trails array each time. Don't try to selectively remove individual trail lines.

### Reset button is essential
Users need an obvious way to return to the default view. Include a "Reset" button that sets slider to max and restores all markers/trails.

### Trail toggle buttons break after era filtering
When a timeline slider filters trails (e.g., `cartTG.clearLayers()` then adds a subset), the trail layer group `cartTG` is STILL `map.hasLayer(cartTG) === true` even when it's empty. A toggle button that only checks `map.hasLayer(cartTG)` will think "trails are showing" and will remove the group instead of rebuilding.

**WRONG:**
```javascript
// Fails after era filter empties the group
if (map.hasLayer(cartTG)) { map.removeLayer(cartTG); } // "hides" an empty group
else { /* rebuild and add */ }
```

**CORRECT:** Check both layer presence AND trail count:
```javascript
var hasTrails = map.hasLayer(cartTG) && cartTG.getLayers().length > 0;
if (hasTrails) { map.removeLayer(cartTG); cartBtn.classList.remove('on'); }
else {
    cartTG.clearLayers();
    (window.allTrails || []).forEach(function(t) {
        if (t.category === 'Red River Cart Trails') addTrailToGroup(t, cartTG);
    });
    map.addLayer(cartTG);
    cartBtn.classList.add('on');
}
```

**CRITICAL rules for trail toggles:**
1. Use `cartTG.getLayers().length`, NOT `Object.keys(cartTG._layers).length` — `_layers` is a Leaflet internal that can be unreliable
2. When turning ON: always rebuild from the full source array (`window.allTrails` or `trails`), not from the current filtered state
3. After rebuild, call `map.addLayer(cartTG)` even if it was already on the map — this ensures visibility
4. Sync the button's `.on` class with actual state, not the layer group's presence
5. Apply the same pattern to all trail category toggles (cart, boat, etc.)