---
name: single-file-html-map-rebuild-recovery
description: Procedure for recovering and rebuilding a single-file HTML Leaflet map corrupted by session context poisoning or syntax errors.
---

# single-file-html-map-rebuild-recovery

A systematic procedure for recovering and rebuilding a single-file HTML Leaflet map that has become corrupted, "poisoned" by session context, or syntactically broken due to improper data injection.

## Overview
When a single-file map stops rendering or displays raw text (e.g., `<memory-context>`), it is usually due to **Byte-Level Poisoning** (raw text injected into the HTML) or **Race Conditions** (data injected before the library loads). This skill implements a "Nuclear Scrub" and "Bottom-Up Rebuild" approach.

## Phases

### 1. Forensic Diagnosis
*   **Identify the Symptom:**
    *   *Black Screen:* Usually a JavaScript syntax error or race condition.
    *   *Raw Text/Bracketed Text on Screen:* Byte-level poisoning (session context injected into the file).
    *   *ERR_EMPTY_RESPONSE:* Server binding issue (try binding to `0.0.0.0`).
*   **The `about:blank` Test:** To determine if the issue is the **File** or the **Browser Environment**, open `about:blank` in a new tab and paste suspected "poison" text.
    *   If text appears on the white page -> Environment/Buffer leak.
    *   If nothing happens -> The Map File is the source of corruption.

### 2. The Nuclear Scrub (Rebuild from Golden Source)
**Never attempt to "patch" a poisoned file.** Always revert to a known-good "Golden" version.

1.  **Locate the Golden Source:** `Interactive_Homeland_Map_v3_GOLDEN.html` (or equivalent).
2.  **Execute an Atomic Rebuild (Python Script):**
    *   **Scrubbing:** Use Regex to strip any `<memory-context>` or `<supermemory-context>` tags.
    *   **Theme Injection:** Inject CSS into the `<head>` using `replace` or `re.sub` to ensure clean encoding.
    *   **Data Injection (The Bottom-Up Rule):** Instead of injecting data into existing `<script>` blocks (which causes race conditions), inject a **new** `<script>` block at the very end of the file, just before `</body>`.
    *   **The "Bridge" Pattern:** If the map engine expects a specific object (e.g., `all_trails_array`) but you are providing a different structure (e.g., `routes`), include a "Glue/Bridge" script at the bottom to translate the data.

### 3. Verification
*   **Syntax Check:** Use `re.search` to ensure no unclosed tags or trailing commas exist in injected JSON/JS.
*   **Encoding Audit:** Check for Null bytes (`\x00`) or illegal control characters using `rb` (read binary) mode.
*   **Console Audit:** If the map loads but is empty, check the Browser Console (`F12`) for `TypeError` or `undefined` errors.

## Pitfalls
*   **Race Conditions:** Injecting `window.data` at the top of the file before `leaflet.js` has loaded. Always prefer injecting at the end of the `<body>`.
*   **String Poisoning:** Copy-pasting text from the chat window can accidentally include system tags. Always clean the buffer.
*   **Regex Fragility:** When patching, ensure regex patterns account for potential whitespace variations (`\s*`).

## Example Python Implementation (Atomic Rebuild)
```python
import re

def rebuild_map(source, target, css, data_script):
    with open(source, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Scrub
    content = re.sub(r'<(memory|supermemory)-context>.*?</(memory|supermemory)-context>', '', content, flags=re.S)
    
    # 2. Theme
    content = content.replace('<head>', f'<head>{css}')
    
    # 3. Bottom-Up Data Injection
    content = content.replace('</body>', f'{data_script}</body>')
    
    with open(target, 'w', encoding='utf-8') as f:
        f.write(content)
```
