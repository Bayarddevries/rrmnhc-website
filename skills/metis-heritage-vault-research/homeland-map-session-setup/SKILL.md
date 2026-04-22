---
name: homeland-map-session-setup
title: Homeland Map Session Setup
description: Create a persistent session state file for the Homeland map project, verifying repository structure and documenting active files.
---

## Purpose
This skill records the current state of the Homeland map development environment so the user can resume work later without losing context.

## Steps
1. **Verify Project Path**
   ```bash
   ls -d /home/bayard_devries/Documents/metis-research-vault
   ```
   Ensure the vault directory exists.
2. **Locate Primary Map Files**
   ```bash
   search_files "path":"/home/bayard_devries/Documents/metis-research-vault","pattern":"*.html","target":"files"
   ```
   Identify the latest interactive map HTML (e.g., `Interactive_Homeland_Map_v3.html`).
3. **Create Session State Markdown**
   Write a file `HOMELAND_SESSION_STATE.md` at the vault root with:
   - Session header and timestamp
   - Paths to primary map, latest version, and archive folder
   - Brief project context (research vault, GitHub repo, map layers)
   ```bash
   write_file 
     path="/home/bayard_devries/Documents/metis-research-vault/HOMELAND_SESSION_STATE.md" 
     content="# Homeland Map Session State\nSession: Homeland Map Development\nLast Updated: $(date +%Y-%m-%d)\nVault Path: /home/bayard_devries/Documents/metis-research-vault\n\n## Active Project Files\n- Primary Map: /home/bayard_devries/Documents/metis-research-vault/Heritage Centre/Interactive_Homeland_Map.html\n- Latest Version: /home/bayard_devries/Documents/metis-research-vault/Heritage Centre/Interactive_Homeland_Map_v3.html\n- Backup/Archive: /home/bayard_devries/Documents/metis-research-vault/Heritage Centre/archive/\n\n## Project Context\n- Research Vault: Metis Research Vault (WSL2)\n- Repository: GitHub (Remote)\n- Map Layers: Communities, Destroyed Communities, Wintering Grounds, Resource Harvesting, etc."
   ```
4. **Confirm Creation**
   ```bash
   read_file path="/home/bayard_devries/Documents/metis-research-vault/HOMELAND_SESSION_STATE.md"
   ```
5. **Optional**: Add the file to version control if desired.
   ```bash
   cd /home/bayard_devries/Documents/metis-research-vault && git add HOMELAND_SESSION_STATE.md && git commit -m "Add session state for Homeland map"
   ```

## Pitfalls & Tips
- Ensure the correct user directory (`bayard_devries`).
- Verify that the latest map version is indeed the most recent before recording.
- Run the `date` command to keep the timestamp current.
- If the vault path changes, update the skill accordingly.

## Verification
After execution, opening `HOMELAND_SESSION_STATE.md` should show the populated sections with accurate file paths.

## Reuse
Invoke this skill whenever starting a new session on the Homeland map or after significant changes to the map files.
