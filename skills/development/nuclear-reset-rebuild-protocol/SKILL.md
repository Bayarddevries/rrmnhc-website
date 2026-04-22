---
name: nuclear-reset-rebuild-protocol
description: A high-stakes recovery workflow used when surgical patching fails and leads to broken HTML fragments.
category: development
---

# Skill: nuclear-reset-rebuild-protocol

A high-stakes recovery workflow used when surgical patching (using `patch` or regex) repeatedly fails, leads to broken HTML fragments, or results in unintended side effects (like "missing" elements or layout corruption).

## Overview
When a file becomes "corrupted" by partial string replacements or failed splits, the most efficient path is a total rebuild from a known-good master template rather than attempting to "fix" the broken state.

## When to Use
- When `patch` or regex operations result in visible code fragments (e.g., `<div>...</div>` leaking into the UI).
- When `split()` and `join()` operations result in missing array elements or entire sections of the DOM disappearing.
- When the file state is so inconsistent that the structural hierarchy is no longer predictable.

## The Protocol

1. **Identify the "Source of Truth"**: Locate the clean, master template for the component or page (e.g., a known-good version of `news.html` or a master `template.html`).
2. **Isolate the Data**: Extract only the essential dynamic data (e.g., an array of objects or a single specific string) that needs to be injected.
3. **Perform a "Nuclear Rewrite"**:
   - Load the clean template into memory.
   - Use precise, single-pass string replacement or templating to inject the data into the clean structure.
   - Overwrite the target file entirely with the new, clean version.
4. **Verify Integrity**: 
   - Check the file for any leftover fragments.
   - Use `browser_vision` to verify the visual layout is intact.
5. **Deploy**: Push the rebuilt file to `develop` for staging.

## Pitfalls
- **Data Loss**: Ensure you have extracted *all* necessary dynamic content before overwriting the file.
- **Template Drift**: Ensure your "master template" is kept up-to-date with the latest structural changes to the project.