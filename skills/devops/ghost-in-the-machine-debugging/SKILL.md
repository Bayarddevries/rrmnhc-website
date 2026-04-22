---
name: ghost-in-the-machine-debugging
description: A diagnostic protocol for when the browser reports syntax errors (like 'Unexpected token const') in files that have been verified to contain no such keywords.
---

# Skill: Ghost-in-the-Machine Debugging (Environment Interference)

## Overview
A specialized diagnostic protocol used when the agent's code is demonstrably correct (e.g., verified via `cat` or `read_file`) but the browser continues to report errors that are physically impossible given the current file content. This identifies when the execution environment (Browser, Extensions, or OS-level proxies) is injecting "ghost" code into the rendering pipeline.

## When to Use
- When `execute_code` or `terminal` confirms the file content is clean (e.g., `content.count('const') == 0`).
- When `browser_console` reports syntax errors for keywords that do not exist in the file.
- When changing filenames, using Incognito, or switching to ES5 (replacing `const`/`let` with `var`) fails to clear the error.

## Diagnostic Workflow

### 1. The "Truth vs. Rendering" Audit
- **Step 1: Verify Content via CLI.** Use `execute_code` to read the target file. Search specifically for the keyword causing the error.
- **Step 2: Verify Content via Browser.** Use `browser_snapshot` or `browser_console` to check the rendered output.
- **Step 3: Compare.** If `CLI count == 0` and `Browser error count > 0`, the environment is compromised.

### 2. Isolation Tactics
If interference is detected, attempt the following in order:
1. **ES5 Downgrade:** Replace all modern JS (`const`, `let`, arrow functions, template literals) with legacy syntax (`var`, `function`, string concatenation) to bypass potential parser-level interference.
2. **The "New Identity" Test:** Rename the file to a completely random string (e.g., `test_999_random.html`) to bypass filename-based caching.
3. **The Incognito Test:** Instruct the user to load the file in a private/incognito window to bypass extensions.
4. **The Extension Audit:** Instruct the user to disable all browser extensions (Ad-blockers, Developer tools, Script injectors).

### 3. Conclusion & Escalation
- **If error persists in Incognito with ES5 code:** The issue is a system-level injection (WSL2 proxy, OS-level malware, or deep browser cache).
- **If error disappears:** The issue was a browser extension or local cache.

## Pitfalls
- **Don't assume the code is broken.** If the CLI says the keyword isn't there, believe the CLI.
- **Avoid Regex Loops.** Do not attempt to "patch" a ghost. If the code is correct, stop patching and start diagnosing the environment.
