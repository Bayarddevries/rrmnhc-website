---
name: html-file-restyle
description: Extract data from an existing large HTML file and rebuild it with new CSS/theme while preserving all data arrays intact. Useful for restyling single-file web apps without risking data corruption.
---

# HTML File Restyle (Data-Preserving)

When you need to restyle a large single-file HTML app (with inline `<script>` data arrays), follow this approach:

## Trigger
- File with 500+ lines of inline data (JSON/JS arrays)
- Need to change CSS, theme, or UI structure
- Data must be preserved exactly — no modification to data content

## Approach

### 1. Identify data boundaries
Read the original file and locate data blocks by line number:
```python
with open(file, 'r') as f:
    lines = f.readlines()

# Map line numbers to content
# e.g., const locations = [ at line 131
# closing ]; at line 3096
# const trails = [ at line 3097
# const LC at line 3422
```

### 2. Extract data blocks by line range
```python
locations_block = ''.join(lines[130:3096])  # 0-indexed
trails_block = ''.join(lines[3096:3420])
config_block = ''.join(lines[3421:3434])
```

### 3. Build new template with top CSS/HTML
Write the new CSS + HTML structure as a separate string variable. Include:
- New CSS (can use CSS variables for theming)
- New HTML structure (header, sidebar, map div, etc.)
- Opening `<script>` tag

### 4. Build new JS logic section
Write the JS that uses the data (map init, markers, layer controls, etc.) as a separate string. Use ES5 `function()` syntax for maximum compatibility, and wrap event handlers in closures if capturing loop variables.

### 5. Assemble in correct order
```
full_html = html_top + locations_block + '\n\n' + trails_block + '\n\n' + config_block + '\n' + js_logic
```

**Critical ordering:**
- CSS in `<head>`
- HTML in `<body>`
- `const locations = [...]` first
- `const trails = [...]` second  
- `const LC = {...}` third (config objects)
- Map initialization code last (depends on data)

### 6. Verify before shipping
- Check that all data blocks are present: `'const locations = [' in full_html`, etc.
- Check no duplicate/missing keywords: `'const line = const line' not in full_html`
- Open in browser, check console for errors
- Verify element count matches expectations via `browser_snapshot`

## Common Pitfalls

### Data ordering errors
If JS references `LC` before it's defined, you get `LC is not defined`. Always put data/config blocks BEFORE the code that uses them.

### Duplicate variable declarations
When pasting data blocks + handwritten JS, watch for accidentally doubled code like `const line = const line = L.polyline(...)`. Always search for `const ... const` patterns after assembly.

### File not found after write
The new file should be written to the same directory as the original project, not a temporary location. Use the project directory structure.

### Unicode encoding
Always open with `encoding='utf-8'` when reading/writing HTML files that may contain non-ASCII characters (accented names like M\u00e9tis).

## Verification checklist
1. `browser_navigate` to the file URL
2. `browser_console` — check for JS errors
3. `browser_snapshot` — verify UI elements exist (header, sidebar, layer buttons)
4. Visually confirm markers appear on map via `browser_vision` or screenshot