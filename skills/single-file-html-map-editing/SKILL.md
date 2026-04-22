---
name: single-file-html-map-editing
description: Safely editing coordinate arrays and trail routes in single-file HTML maps without breaking embedded JS data.
category: devops
---

# Single-File HTML Map Editing

## When to use
Modifying coordinate arrays, trail routes, or location data in single-file HTML maps that embed JSON/JS data directly in `<script>` tags.

## Critical Rules

### NEVER use regex to match multi-line coordinate blocks
Regex patterns like `"coords":\s*\[([\s\S]*?)\n\s*\]` will **greedily match across array boundaries** and eat content between trails, corrupting the entire map. I lost 1,610 lines on an attempted trail smoothing because a non-greedy `[\s\S]*?` still matched the WRONG closing `]`.

**Safe approach**: Use bracket counting to find the exact boundaries of each array:
```python
bracket_open = content.index('[', coords_start)
depth = 0
pos = bracket_open
while pos < len(content):
    ch = content[pos]
    if ch == '[':
        depth += 1
    elif ch == ']':
        depth -= 1
        if depth == 0:
            bracket_end = pos
            break
    pos += 1
coords_text = content[bracket_open+1:bracket_end]
```

**Apply replacements in REVERSE order** (highest position first) so earlier string positions don't shift:
```python
for start, end, new_text in sorted(replacements, key=lambda x: x[0], reverse=True):
    content = content[:start] + new_text + content[end:]
```

After modifying, ALWAYS verify: `grep -c '</script>' file.html`, `grep -c 'const locations' file.html`, `grep -c '</html>' file.html`. Any unexpected count = corruption → revert immediately.

### Smoothing zigzag trail coordinates
When settlement coordinates were injected into trails, they created bounce-back patterns (alternating between trail position and settlement location). To fix:

1. Extract coordinates using bracket counting (see above)
2. Remove exact consecutive duplicates
3. Detect zigzag: count direction reversals in latitude. If >25% of consecutive segments reverse direction, apply smoothing
4. Use weighted moving average: `new[i] = 0.3*p[i-1] + 0.4*p[i] + 0.3*p[i+1]`
5. Keep first and last points EXACT (trail endpoints are usually important)
6. Replace the array in the file using reverse-order replacements

### NEVER touch string/description fields
When replacing coordinates, ONLY modify numeric coordinate arrays. Touching ANY description string can break the entire map:
- Unescaped internal quotes in descriptions break the JS parser
- Double-escaping (`\\"` vs `\"`) corruption cascades
- Missing opening/closing quotes on any field breaks subsequent entries
- The entire data structure is ONE massive JS object — a single broken string breaks everything downstream

### Safe coordinate replacement pattern
```python
# 1. Find trail by name
idx = content.find(f'"name": "{trail_name}"')

# 2. Find coords array start  
coords_start = content.find('"coords":', idx)
bracket_open = content.find('[', coords_start)

# 3. Find matching closing bracket (handle string skipping)
depth = 0
i = bracket_open
while i < len(content):
    if content[i] == '[': depth += 1
    elif content[i] == ']':
        depth -= 1
        if depth == 0:
            arr_end = i + 1
            break
    elif content[i] == '"':
        # Skip over string values to avoid matching brackets inside strings
        i += 1
        while i < len(content) and content[i] != '"':
            if content[i] == '\\' and i+1 < len(content):
                i += 2
            i += 1
    i += 1

# 4. Replace ONLY the coordinate array content
content = content[:bracket_open] + new_coords + content[arr_end:]
```

### Diagnosing and fixing broken desc fields (unescaped interior quotes)
When the page shows a blank map with "Loading..." spinner, check for `SyntaxError: Unexpected identifier` in the console. This means bare `"` characters exist inside `"desc": "..."` string values, causing the JS parser to terminate the string prematurely.

**Diagnosis**: Use hex dump to see raw bytes — bare `0x22` inside a string value without a preceding `0x5c` (backslash) is the problem:
```bash
sed -n 'LINENUMp' file.html | xxd
# Look for: 22 48 61 79 65 73  (= "Hayes) with NO 5c before the 22
```

**Verification script** — scans ALL desc lines for unescaped interior quotes:
```python
import re
with open('file.html', 'r') as f:
    lines = f.read().split('\n')
for i, line in enumerate(lines):
    if '"desc":' not in line: continue
    m = re.search(r'"desc":\s*"', line)
    if not m: continue
    rest = line[m.end():]
    # Walk to find where JS parser ends the string
    j = 0
    while j < len(rest):
        ch = rest[j]
        if ch == '\\' and j + 1 < len(rest): j += 2; continue
### Surgical Brace Repair (Depth-Tracking)
When editing large single-file maps, regex can easily break the brace balance (e.g., 708 vs 709). 

**Diagnosis**: If the map shows a blank screen or `SyntaxError: Unexpected token`, check the brace balance.
**Fix**: Use a depth-tracking algorithm to find the exact location of the imbalance.

```python
def fix_imbalance(content):
    depth = 0
    extra_brace_pos = -1
    for i, char in enumerate(content):
        if char == '{': depth += 1
        elif char == '}':
            depth -= 1
            if depth < 0:
                extra_brace_pos = i
                break
    if extra_brace_pos != -1:
        return content[:extra_brace_pos] + content[extra_brace_pos+1:]
    return content
```

### Data Re-Synthesis (Converting Attributes to Arrays)
In some map versions, the `trails` array is a shell of empty objects, while the actual data is embedded in the `locations` array as `cart_routes`.

**Workflow**:
1.  **Extract**: Parse the `locations` array to capture `{name, lat, lng, cart_routes}`.
2.  **Group**: Build a dictionary where keys are route names and values are lists of coordinates from members.
3.  **Reconstruct**: Transform these groups into a proper `const trails = [...]` array.
4.  **Inject**: Use the "Safe Injection" method to replace the empty shell with the reconstructed data.

### Safe injection approach for adding new features (lessons learned)
...


## Tools and file handling for large single-file HTML maps

### read_file silently truncates files with massive single-line content
Single-file HTML maps often have their location data on ONE enormous line (40K+ chars on a single line). `read_file` has a ~100K character limit and will silently return a truncated view. This caused a cascading failure during the v2 citations work — the file was 285KB but read_file only showed ~44KB, making it appear like content was missing or that write_file had corrupted the file.

**When working with large single-file HTML maps (>100KB), ALWAYS use `terminal` with `wc -c` for size and `grep -n` for content location instead of read_file:**
```bash
# Get actual file size
wc -c file.html

# Find where data/elements are in the file
grep -n "function\|const locations\|var locs\|</script>" file.html

# View specific line ranges
sed -n '300,320p' file.html

# Extract just the content between markers
sed -n "6851,7045p" file.html | head -5
```

### Base64-encode fix scripts to avoid heredoc escaping hell
When a Python fix script needs to contain JavaScript with nested quotes, backslashes, and HTML, even triple-quoted strings and heredocs fail:
```bash
python3 << 'PYEOF'
# Even with quoted PYEOF delimiter, JS like l.n.replace(/'/g, "\\'") breaks
# triple-quoted Python strings too
PYEOF  # FAILS
```

**Working approach**: Base64-encode the Python script and decode at runtime:
```python
import base64
script = """#!/usr/bin/env python3
# ... your fix script with all the JS escaping intact ...
"""
encoded = base64.b64encode(script.encode()).decode()
# Write and decode: base64 -d /tmp/script.b64 | python3
```
Or write the script with `write_file` using a simple Python script that constructs the b64 content.

### Pre-existing curly quotes (U+2019) in location data
The live map data contains curly apostrophes (') from copy-pasted text inside JS string values. Browsers handle these silently but Node.js `--check` reports "Invalid or unexpected token". This is NOT a bug in the browser — don't waste time "fixing" it with curl+node checks. If `browser_console` shows 0 errors, the page works.

### The v2 file has a different structure than documented
The v2 map (`Interactive_Homeland_Map_v2.html`) is a dark-themed Leaflet map with a different codebase than the lighter map:
- Uses `var locs` instead of `const locations`
- Uses `var trails` instead of `const trails`
- Has no `// DATA INJECTION` marker comment
- Uses `var locations` and `var trails` internally (not `const`)
- The main `<script>` block starts at a different line (~308) and ends at a much later line (~7047)
- Has inline popup building with string concatenation, not template literals

Always verify the actual file structure with `grep -n` before attempting edits.

## Safe injection approach for adding new features (lessons learned)

When adding new JavaScript (citations, modals, etc.) to a single-file map:

### NEVER inject inside a `<script src="external.js">` tag
The v2 citations system originally broke because showSources() and LOCATION_SOURCES were injected between `<script src="leaflet.js">` and `</script>`. The browser sees a `<script>` with a `src` attribute and ignores inline content (or worse, partially executes it).

**Fix**: Delete the entire range between the leaflet script tag and the </script> that closes it, leaving just `<script src="leaflet.js"></script>`. Then inject your code in the main `<script>` block.

### DOM-reading onclick pattern (proven working)
When adding an onclick inside generated popup content, NEVER pass string arguments — the escaping hell is unavoidable:

**BAD** — guaranteed mangled backslashes:
```js
onclick="showSources(\'' + loc.name.replace(/'/g, "\\\\'") + '\')"
// Results in: \\\\\\\\\\\\' in the actual file
```

**GOOD** — zero escaping needed:
```js
// In the popup builder:
onclick="showSources(this)"

// In your function:
function showSources(btn) {
    var popup = btn.closest('.leaflet-popup-content');
    if (!popup) return;
    var h2 = popup.querySelector('h2');
    if (!h2) return;
    var locName = h2.textContent.trim();
    var sources = LOCATION_SOURCES[locName];
    // ... rest of your logic
}
```

### String concatenation over f-strings for JSON injection
When injecting JSON data into JS, f-strings silently consume `{` and `}` characters as if they were Python expressions:
```python
# BAD: f-string silently drops the JSON content
json_value = '{"key": "val"}'
js = f'var data = {json_value};'  # js = 'var data = ;'

# GOOD: plain concatenation
js = 'var data = ' + json_value + ';'
```

### Marker replacement whitespace trap
When injecting before a known marker like `\n// INIT\n`, the replacement can eat the newline and collapse adjacent lines:
```python
# BAD: html.replace("\n// INIT\n", "\n" + js)
# Result: "// INITbuildSB();" (buildSB() glued to comment!)

# GOOD: inject by position
marker = "\n// INIT\n"
idx = html.find(marker)
html = html[:idx + 1] + js + html[idx:]
```

### sed for surgical line-range operations
When you need to remove or replace a range of lines (like deleting the broken injection), sed is more reliable than string replace:
```bash
# Replace lines 8-55 with a clean script tag
sed -i '8,55c\    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>' file.html
```

But be careful — sed escaping of double quotes and backslashes can also fail. When in doubt, use Python with base64 encoding.

### Verify injection didn't nest inside another script
```bash
# Count opening/closing script tags — should match
grep -c '<script' file.html
grep -c '</script>' file.html

# Verify external scripts have proper self-closing tags
grep -n '<script src=' file.html
```

### Verify before committing
1. Run the verification script above — should output zero issues
2. Count total `"` characters — should be even
3. Check bracket balance: braces, parens, brackets should all sum to 0
4. Open file in browser (or use browser_navigate) to verify map loads
5. Check browser console for errors — zero JS errors required
6. Verify the page snapshot shows actual map elements, not just loader
7. If "0 visible" locations appears, check that locations array is not empty (grep for `locations.length` or the count logic)

### ### Post-deploy troubleshooting decision tree
Use this flow when the live page doesn't look right AFTER pushing:

**Step 1: Check the live content matches your commit**
```bash
# Compare live vs committed content - GitHub Pages caches aggressively
curl -sL "https://bayarddevries.github.io/Hermes/Interactive_Homeland_Map_v2.html" | grep -c 'specific_unique_string'
git show HEAD:Interactive_Homeland_Map_v2.html | grep -c 'specific_unique_string'
# If counts differ, GitHub hasn't propagated yet - wait 1-3 minutes
```

**Step 2: Classify the symptom**
| Symptom | Likely Cause | First Check |
|---------|-------------|-------------|
| Stuck spinner + page blank | JS syntax error | `browser_console` for SyntaxError |
| Stuck spinner + elements visible (search, layers) | Loader hide logic failed | Check if `DOMContentLoaded` fired, try incognito |
| "0 visible" locations + no errors | Locations array empty or initialization failed | `browser_snapshot` shows UI loaded, check locations array length |
| Map tiles gray/blank | Tile provider URL broken or network issue | Check network tab, verify Leaflet tile layer URL |
| Partial content (some markers, no trails) | Specific data array malformed | Check console for errors about that specific array |

**Step 3: Verify data integrity in the live page**
When JS loads without errors but content is missing:
```javascript
// In browser console, check:
locations.length      // Should match expected count (228)
trails.length         // Should match expected trail count
map                   // Should be a Leaflet map object, not undefined
layerGroups           // Should be initialized
```

**Step 4: If the live page is wrong but your commit is right**
Force a redeploy by making a tiny change:
```bash
# In the HTML file, add a comment or whitespace
git commit --amend --no-edit && git push --force
```
Or wait — GitHub Pages can take 2-10 minutes but usually < 60 seconds.

After committing, always test the deployed version
Navigate to the live URL in the browser and verify:
- No "Loading..." spinner stuck on screen
- Check browser console for JS errors
- Map tiles render
- Interactive elements respond

### Missing event listener closing braces break all downstream code
In large single-file HTML maps, event handlers can lose their closing `});` when code is edited or features added. A missing `});` means the next code block becomes part of the handler function, causing a cascade of issues:

**Symptom**: Zero console errors during parsing, but event listeners don't fire (hamburger won't toggle, slider doesn't update, buttons unresponsive). The syntax error halts execution mid-script.

**Diagnosis**: If `browser_console` shows `Unexpected token '}'` or similar structural errors, trace backwards from the error line:
```bash
# Find what function/bracket is open at a given line
sed -n '6550,6600p' file.html | grep -n 'function\|}\|{'
```

**Common patterns**:
- `addEventListener('click', function() {` followed by logic but no `});`
- Code block inserted between a handler and its closing brace
- A stray `});` placed at the wrong scope level (closing something it shouldn't)

**Fix**: Ensure every `function() {` has a matching `});`. Use bracket counting to verify the structure around problematic areas.

### Undefined variable typos cause silent runtime failures
A typo referencing an undefined variable (e.g., `lb.appendChild(...)` when the variable is `ld`) causes a runtime `ReferenceError` or `TypeError` that silently kills all downstream JS execution. The map may appear to load but interactive features (sidebar toggle, time slider, popups) won't work.

**Diagnosis**: Check `browser_console` for `Cannot set properties of null` or `ReferenceError: XXX is not defined`. Then grep for the variable:
```bash
# If error says "cannot set properties of null (setting 'textContent')":
grep -n 'var lb\|var ld\|var cartTG\|var boatTG' file.html
# Find where each variable is declared and where it's first used
```

**Fix**: Use sed to replace the typo on the specific line:
```bash
sed -i 's/lb\.appendChild/ld.appendChild/' file.html
```

### If the map won't load, restore immediately
```bash
# If the map stops loading after your changes, revert BEFORE iterating:
git checkout HEAD~1 -- Interactive_Homeland_Map_v2.html
git commit -m "Restore working version"
git push
```
Trying to fix a broken map incrementally makes it worse. Always restore first.

## Adding new objects/trails to existing JS arrays (lessons from cart trail insert)

When adding new array entries (trails, locations, markers) to `const trails = [...]` in a single-file HTML map, there are three easy-to-make insertion errors that **silently break the entire map**:

### The three insertion boundary bugs

**Bug 1: Missing closing brace `}`**
When calculating the insertion point before the terminating `];`, it's easy to replace the final `}` with just `,`, producing `]\n,\n{` instead of `]\n},\n{`. The `}` that closes the last object MUST remain.

**Bug 2: Double closing brace `}}`**
When the insertion script's position calculation overshoots, it can produce `}}` instead of `}` before `];`. This causes `SyntaxError: Unexpected token '}'` which kills the entire page load.

**Bug 3: Double semicolon `];;`**
Similarly, the insertion point can produce `];;` instead of `];`. This also breaks JS parsing.

### The safe approach for adding entries to an existing JS array

1. **Backup first** — ALWAYS: `cp file.html file_backup.html`

2. **Use Node.js to parse the array exactly** — Don't use Python regex. Node.js `eval()` the raw JS text (the same engine the browser uses):
```bash
# Find the exact bounds using bracket counting in Node.js
node -e "
const fs = require('fs');
const c = fs.readFileSync('file.html', 'utf8');
const m = 'const trails = ';
const s = c.indexOf(m) + m.length;
let d=1, p=s; while(d>0 && p<c.length){if(c[p]=='[')d++;if(c[p]==']')d--;p++;}
// p is right after ]; - the array is c.substring(s, p-1)
console.log('Start:', s, 'End:', p);
"
```

3. **Insert using Python's find + string concat** — NOT patch or string replace:
```python
# Find the closing }; of the LAST entry in the array (the one right before ])
# Pattern is: ...last_coord]\n}\n];
# We want to insert BETWEEN the } and the ];
brace_pos = content.rfind('}', 0, bracket_pos)  # } of last entry
# Verify context: should be ]\n}\n];
context = content[brace_pos-5:brace_pos+5]
if ']\\n}' not in context:
    print("WARNING: Unexpected context")
    
# Insert after the }, before the ];
new_entries = ',\n'.join([format_trail(t) for t in new_trails])
# The replacement replaces just the } with },\n{new entries}\n
content = content[:brace_pos] + '},\n' + new_entries + '\n' + content[brace_pos+1:]
```

4. **Verify JSON validity before writing**:
```bash
# Extract just the array and try to parse it
node -e "
const fs = require('fs');
const c = fs.readFileSync('file.html', 'utf8');
// ... same bracket counting ...
const arr = eval('[' + c.substring(s, p-1) + ']');
console.log('Parsed', arr.length, 'entries');
"
```

5. **Use `patch` for quick syntax fixes** — If the map breaks after insertion, `patch` with find-and-replace is much faster and safer than re-running the insertion script:
```python
# Fix }}, fix ];;, fix missing }, etc. - one-liner patches
```

6. **Always serve and test locally immediately after**:
```bash
python3 -m http.server 8080 &
# Then use browser_navigate to verify the page loads, check console for errors
```

### The definitive insertion pattern (tested and working)

```python
import json

FILE = "map.html"
with open(FILE, 'r') as f:
    content = f.read()

# 1. Find array bounds
start_marker = "const trails = ["
start_pos = content.find(start_marker) + len(start_marker)
depth = 1
pos = start_pos
while depth > 0 and pos < len(content):
    if content[pos] == '[': depth += 1
    elif content[pos] == ']': depth -= 1
    pos += 1

# 2. The ; is at pos. The ] is at pos-1. Find the } before the ];
end_bracket = pos - 1  # position of the ]
brace_pos = content.rfind('}', 0, end_bracket)

# 3. Verify
print(content[brace_pos-5:brace_pos+8])  # Should look like "  ]\n}\n];\n"

# 4. Format new entries
def format_entry(entry):
    return '{\n  ' + ',\n  '.join(
        f'"{k}": {json.dumps(v)}' if isinstance(v, str) else f'"{k}": ' + json.dumps(v)
        for k, v in entry.items()
    ) + '\n}'

new_text = ',\n'.join(format_entry(e) for e in new_entries)

# 5. Reconstruct: everything + }, + new entries + rest (from ] onwards)
# brace_pos points to the }, so we keep it and append
content = content[:brace_pos+1] + ',\n' + new_text + '\n' + content[brace_pos+1:]

# 6. Write
with open(FILE, 'w') as f:
    f.write(content)
```

## Safe code injection (adding new features/JS)

When adding new JavaScript functions, modals, or data objects to a single-file map:

### NEVER inject inside a `<script src="external.js">` tag
This is the most common injection mistake. A `<script>` tag with an external `src` attribute CANNOT contain inline code — the browser will either ignore the inline content or fail to load the external script. The citations system broke because `showSources()` and `LOCATION_SOURCES` were injected between `<script src="leaflet.js">` and `</script>`, corrupting Leaflet loading.

**Correct approach**: Find the `</script>` that closes the external script tag, then inject BEFORE the NEXT `<script>` block:

```python
# BAD: injects outside the Leaflet script but inside the main script
# GOOD: inject in its own <script> block or at the top of the main script
close_pos = content.find('</script>', leaflet_open_pos)
# Inject AFTER the closing tag of the last external script, before the main inline script:
injection = f'<script>\n// ===== CITATIONS/SOURCES =====\n{new_code}\n</script>\n'
content = content[:close_pos + 9] + '\n' + injection + content[close_pos + 9:]
```

**Better yet**: Inject at a known-safe point — just before `</body>` or right before the closing `</script>` of the LAST inline script block that contains the map initialization. This ensures all your dependencies (Leaflet, location data) are already loaded.

### Prefer DOM-reading onclick over string argument passing
When adding an onclick handler inside generated popup/JS content, NEVER pass the location name as a string argument:

**BAD** — quote escaping nightmare, guaranteed to break:
```js
h+='<a onclick="showSources(\'' + l.n.replace(/'/g, "\\'") + '\')">Sources</a>';
// Results in mangled backslashes: \\\\\\'\ in the file, causing "Invalid or unexpected token"
```

**GOOD** — read the name from the DOM, zero escaping needed:
```js
h+='<a class="src-btn" href="javascript:void(0)" onclick="showSources(this)">Sources</a>';

// Then in the function:
function showSources(btn) {
    var popup = btn.closest('.leaflet-popup-content');
    if (!popup) return;
    var h2 = popup.querySelector('h2');
    if (!h2) return;
    var locName = h2.textContent.trim();
    var sources = LOCATION_SOURCES[locName];
    // ...
}
```
This works because the popup title (h2) always contains the exact location name that matches the LOCATION_SOURCES key. No single-quote escaping, no `replace(/'/g)`, no backslash escaping hell.

### NEVER use Python f-strings for JS/JSON injection
When building injection strings that contain JSON data (which is full of `{` and `}`), f-strings will interpret those braces as expression delimiters and silently corrupt the content:

**BAD** — f-string swallows JSON braces:
```python
json_value = '{ "key": "value" }'
js = f'var data = {json_value};'
# Result: js = 'var data = {json_value};' -- the braces consumed!
```

**GOOD** — use plain string concatenation:
```python
json_value = '{ "key": "value" }'
js = 'var data = ' + json_value + ';'
# Result: 'var data = { "key": "value" };'
```

Or if you must use formatting, use `str.replace()`:
```python
js = 'var data = PLACEHOLDER;'
js = js.replace('PLACEHOLDER', json_value)
```

Always verify the injection landed correctly by grepping for the variable declaration in the written file: `grep -c "var LOCATION_SOURCES" file.html` should return 1 or more.

### Beware marker replacement collapsing adjacent content
When injecting JS before a known marker like `// INIT`, the replacement must preserve the exact surrounding whitespace. A common bug:

**BAD** — the `\n` gets consumed and merges lines:
```python
# If original is: "\n// INIT\nbuildSB();"
# And you do: html.replace("\n// INIT\n", "\n" + js)
# Result: "\n{js}\n// INITbuildSB();" <- buildSB() glued to INIT!
```

**GOOD** — inject by position, don't use string replace:
```python
marker = "\n// INIT\n"
idx = html.find(marker)
if idx > 0:
    html = html[:idx + 1] + js + html[idx:]  # Keep the leading \n
```

### Always verify injection didn't nest inside another script
After injecting, run these checks:
```bash
# Count opening/closing script tags — should match
grep -c '<script' file.html
grep -c '</script>' file.html

# Verify external scripts still have proper closing tags
grep -n '<script src=' file.html
# Then confirm each <script src="..."> has a </script> nearby (no inline content between them)
```

### Test locally before pushing
Serve the file with a local HTTP server and open in a real browser:
```bash
cd "<directory>" && python3 -m http.server 8888
# Open http://localhost:8888/filename.html
```

Check:
1. **No JS errors in console** — `browser_console` should return empty `js_errors`
2. **Page doesn't go blank** — if the map disappears after interaction, check for nested script tags
3. **All interactive elements work** — search, popups, layer toggles
4. **Snapshots show map content** — `browser_snapshot` should return map elements, not "Empty page"

### If page goes blank after any interaction
This almost always means a critical JS error during initialization. Common causes:
- Code injected inside `<script src="...">` tag (see above)
- Reference to an undefined variable in global scope (executes immediately)
- Duplicate `const`/`let` declarations
- Missing closing `}` or `)` that breaks the entire script block

**Fix strategy**: Find the last thing you injected, remove it, and verify the page loads. Then re-inject at the correct location.

## File structure awareness
Single-file maps typically follow this order:
1. CSS styles
2. HTML structure (header, sidebar, map div, timeline)
3. External `<script src="...">` tags (Leaflet, etc.)
4. `<script>` containing:
   - `const locations = [...]` — location pin data
   - `const trails = [...]` — trail/route data
   - `const junctionPoints = [...]` — route intersections
   - `const LC = {...}` — layer color config
   - `const CAT_DESC = {...}` — category descriptions
   - Map initialization code (`L.map()`, layer groups, etc.)
   - Loading overlay hide logic (`window.addEventListener('load', ...)`)

Modifying one section incorrectly breaks everything downstream.

## Mobile-specific pitfalls
- `window.load` event does NOT reliably fire on Android Chrome or mobile Safari
- The loading overlay can get stuck forever if the load event never fires
- **Always add fallbacks** for the loader:
  ```js
  var loaderHidden = false;
  function hideLoader() {
      if (loaderHidden) return;
      loaderHidden = true;
      var loader = document.getElementById('map-loader');
      if (loader) { loader.classList.add('done'); }
      try { map.invalidateSize(); } catch(e) {}
      setTimeout(function() { try { map.invalidateSize(); } catch(e) {} }, 500);
  }
  window.addEventListener('load', function() { hideLoader(); });
  document.addEventListener('DOMContentLoaded', function() { setTimeout(hideLoader, 3000); });
  setTimeout(hideLoader, 6000);
  ```
- `map.invalidateSize()` can throw ReferenceError before `map` is fully initialized on mobile — always wrap in try/catch
- After fixing and pushing, tell the user to **force-refresh on mobile** (Chrome: long-press Refresh > Empty Cache and Hard Reload, or use Incognito tab)
- If the map loads on PC but shows a stuck spinner on mobile, the issue is the loading overlay, NOT string quoting — fix the fallbacks, not the data
- The browser console may show NO JS errors even when the spinner is stuck — the DOMContentLoaded handler may have silently failed
- **Consider removing the loader entirely** if it keeps failing on mobile — the map renders fine without it. Simply delete the CSS `.map-loader` rules, the HTML `<div class="map-loader">` element, and the JS hideLoader() code.

## Interactive element pitfalls (buttons not responding to tap/click)

### CSS animation locks transition state
- If a sidebar or overlay has an **entry animation** (e.g., `animation: slideIn .3s both`) AND a **CSS transition** for close/open, the animation's `both` fill-mode will persist its final computed transform and **override any subsequent transition**. The `.closed` class will be added but visually nothing happens.
- **Fix**: Either remove the entry animation entirely and rely on the transition, OR ensure `.closed` has `animation: none !important` to override the lingering animation state.
- **Verification**: In the browser, manually add the `.closed` class via console and check if the element moves. If not, the animation is locking it.

### Mobile touch event handling
- `click` events alone may not fire reliably on Android Chrome / mobile Safari for small tap targets
- **Always add `touchend` handlers** alongside `click`:
  ```js
  btn.addEventListener('click', function(e) { e.preventDefault(); closeSidebar(); });
  btn.addEventListener('touchend', function(e) { e.preventDefault(); e.stopPropagation(); closeSidebar(); });
  ```
- Make tap targets **at least 36×36px** (min-width/min-height) for reliable mobile tapping
- **Nuclear option**: Use inline `onclick` and `ontouchend` directly on HTML elements. This bypasses all event listener timing issues:
  ```html
  <button onclick="document.querySelector('.sidebar').classList.add('closed')" 
          ontouchend="document.querySelector('.sidebar').classList.add('closed')">&times;</button>
  ```

### CSS specificity issues on mobile
- Mobile media queries can override desktop rules in unexpected ways. Always check BOTH the base CSS AND the `@media (max-width: ...)` query
- Common mobile bug: `.sidebar.closed` has `opacity:1` instead of `opacity:0` inside a mobile media query (making it invisible yet interactable, or vice versa)
- Use `pointer-events:none !important` on closed state to ensure the element is truly inert
- **Verification**: `browser_click` on the close button in the accessibility tree tells you immediately if the interaction works. Click the element, then call `browser_snapshot` to see if the layout changed.

### Debugging interactive elements across sessions
1. **Test in the browser yourself first** — use `browser_click` on the close button ref, then `browser_snapshot` to check if the sidebar disappeared
2. **If browser_click works but user reports it doesn't on mobile**: The issue is touch event handling. Add `touchend` listeners or inline `ontouchend`
3. **If browser_click also fails**: The issue is CSS (animation blocking transition, or wrong selector). Check if the `.closed` class is actually being added by inspecting the element's style
