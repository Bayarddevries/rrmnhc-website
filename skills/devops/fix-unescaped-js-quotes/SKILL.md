---
name: fix-unescaped-js-quotes
description: Find and fix unescaped double quotes inside JavaScript string literals in single-file HTML maps (or any large JS file). Prevents silent SyntaxError crashes that break entire page load.
category: devops
---

# Fix Unescaped Interior Quotes in JavaScript

## When to use
- Page loads blank or hangs on a spinner with no visible errors
- Browser console shows "Unexpected identifier" or "SyntaxError: Invalid or unexpected token"
- JavaScript string literals (in JSON-like data arrays) contain citation patterns like `[Author, "Title"]` where the inner `"` terminates the string prematurely
- Large single-file HTML maps with embedded JS data (e.g., 228 location objects with `desc` fields)

## Root cause

In JavaScript: `"desc": "Parks Canada, \"Hayes River\""` works fine, but `"desc": "Parks Canada, "Hayes River""` does not. The first `"` inside the value acts as a string terminator, and everything after it is a syntax error.

This is especially common with citation patterns:
```
"desc": "[Parks Canada, \"Hayes River\"; Canadian Encyclopedia, \"York Boat\"]"
```
When the backslash escapes are missing, the JS parser sees:
- String opens at `"desc": "`
- String continues through `Parks Canada, `
- String **ends** at the `"` before `Hayes`
- `Hayes River"; Canadian Encyclopedia, "York Boat"]",` → garbage → SyntaxError

## Diagnostic steps

### 1. Check browser console
```
"Unexpected identifier 'Something'"
"SyntaxError: Invalid or unexpected token"
```

### 2. Find all problematic lines
```bash
# Find all desc lines with multiple bare " characters
grep -n '"desc":' file.html | while read line; do
    # Count raw " chars after the opening quote
    echo "$line"
done | awk -F'"' 'NF > 8'
```

### 3. Use Python for precise detection
```python
import re

with open('file.html', 'r') as f:
    lines = f.read().split('\n')

for i, line in enumerate(lines):
    if '"desc":' not in line:
        continue
    m = re.search(r'"desc":\s*"', line)
    if not m:
        continue
    val_start = m.end()
    rest = line[val_start:]
    
    # Where JS parser would stop (first unescaped ")
    j = 0
    while j < len(rest):
        ch = rest[j]
        if ch == '\\' and j + 1 < len(rest):
            j += 2
            continue
        if ch == '"':
            break
        j += 1
    
    # If there's meaningful content after the premature close, it's broken
    if j < len(rest):
        after = rest[j+1:].strip()
        if not after.startswith(',') and not after.startswith('}') and not after.startswith('//'):
            print(f"  BROKEN line {i+1}: JS stops at pos {j}")
            print(f"    JS-parsed value ends with: {repr(rest[max(0,j-30]:j])}")
            print(f"    After closing quote: {repr(after[:60])}")
```

## Fix script

Save the following as a standalone Python file (NOT a heredoc — heredoc escapes are unreliable):

```python
#!/usr/bin/env python3
"""Fix unescaped interior quotes in JS string fields of an HTML file."""
import re

FILEPATH = "/path/to/file.html"
FIELD_NAME = "desc"  # Change to match your field name

with open(FILEPATH, 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')

fixed = 0
details = []

for i, line in enumerate(lines):
    if f'"{FIELD_NAME}":' not in line:
        continue
    
    m = re.search(r'f'"{FIELD_NAME}" + r':\s*"', line)
    if not m:
        continue
    
    val_start = m.end()
    rest = line[val_start:]
    
    # Find ALL raw " positions
    quote_positions = [pos for pos, ch in enumerate(rest) if ch == '"']
    if len(quote_positions) <= 1:
        continue
    
    # Find where JS parser stops
    j = 0
    while j < len(rest):
        ch = rest[j]
        if ch == '\\' and j + 1 < len(rest):
            j += 2
            continue
        if ch == '"':
            break
        j += 1
    
    if j >= len(rest):
        continue
    
    # Find the REAL closing quote (last " followed by , or })
    last_valid = -1
    for qp in reversed(quote_positions):
        after_quote = rest[qp+1:].strip()
        if (after_quote.startswith(',') or 
            after_quote.startswith('}') or 
            after_quote.startswith('//') or
            after_quote == ''):
            last_valid = qp
            break
    
    if last_valid < 0 or last_valid <= j:
        continue
    
    # Escape ALL bare " in the intended value range
    value = list(rest[:last_valid])
    escapes = 0
    for qi in range(len(value)):
        if value[qi] == '"':
            if qi == 0 or value[qi-1] != '\\':
                value[qi] = '\\"'
                escapes += 1
    
    if escapes > 0:
        lines[i] = line[:val_start] + ''.join(value) + rest[last_valid:]
        fixed += 1
        details.append(f"Line {i+1}: escaped {escapes} quote(s)")

print(f"Fixed {fixed} lines:")
for d in details:
    print(f"  {d}")

if fixed > 0:
    with open(FILEPATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f"\nFile saved with {fixed} fixes.")
```

**Important**: Save this as a `.py` file and run it. Do NOT use inline heredoc or `python3 -c` — Python string escaping layers will eat the backslashes.

## Verification

After fixing, verify:

```python
# Re-run the diagnostic — should report 0 remaining issues
python3 /tmp/fix_quotes.py
```

Also verify manually:
```bash
# Check a known-bad pattern is now escaped
grep -c 'Canada, \\"Hayes' file.html
# Should return > 0
```

In browser console: should show zero JS errors.

## Key pitfalls

1. **Don't use heredoc or inline Python** — The shell/Python escaping layers will consume backslashes. Always use a standalone `.py` file.

2. **Don't use simple regex replacement** — `sed 's/", "/\", "/g'` is too crude and will break valid JSON structure. You need to identify the INTENDED string boundary (last `"` before `,` or `}`) and escape everything inside.

3. **The fix is about escaping, not removing** — Replace interior `"` with `\"`, don't delete the content.

4. **After fixing, the browser must reload from server** — GitHub Pages can take 1-2 minutes to propagate. Force-refresh on mobile (Android Chrome: long-press Refresh > "Empty Cache and Hard Reload", or use Incognito).

5. **The loading spinner may mask the actual error** — If a page shows a loading overlay that never hides, the JS may have crashed BEFORE the loader-dismiss code runs. Always check the console first.

6. **If console shows zero errors but page still broken** — The JS may be loading successfully but the data structure (locations array, coords, layer groups) got corrupted by a previous fix. Check `locations.length`, `typeof map`, and layer group counts via `browser_snapshot` or console injection.

7. **GitHub Pages aggressively caches on mobile** — After pushing fixes, Android Chrome may serve a cached version for minutes. Always test in Incognito/Private mode or do "Empty Cache and Hard Reload" (long-press Refresh in Chrome).