---
name: atlas-data-recovery-and-deploy
description: Workflow for restoring high-fidelity historical data from a monolithic HTML source into a structured JSON manifest and deploying it to GitHub Pages.
trigger: Atlas Engine missing descriptions or running in Demo Mode
---

# Atlas Data Recovery & Deployment Protocol

This skill handles the process of extracting structured location data from a "Golden" single-file HTML map (where the data is embedded in JavaScript arrays) and injecting it into the Atlas Engine's production JSON manifest for deployment.

## 1. Diagnostic Phase
- **Verify Live State:** Navigate to the live URL and use the browser console to check if the site is in "Demo Mode".
- **Inspect Data Flow:** Check if `data/compiled/atlas_data.json` exists on the server.
- **Compare Sources:** Compare the `desc` fields in the production JSON against the "Golden" HTML source file in the research vault.

## 2. Extraction Phase (Python)
When the production JSON is stripped of descriptions, use a Python script to extract the `locations` array from the source HTML.

**Key Extraction Logic:**
- Use `re.DOTALL` to capture the `const locations = [...]` block.
- Since the JS array often mirrors JSON format, try `json.loads()` on the extracted block first.
- **Fallback:** If `json.loads` fails due to JS-isms (trailing commas, single quotes), split the block by `},` and clean each object string before parsing.

## 3. Deployment Phase
- **Structure Mirroring:** Ensure the file is placed exactly at `atlas/data/compiled/atlas_data.json`.
- **Git Push (PAT Fallback):** If standard `git push` returns a 403 Forbidden error, use a PAT-embedded remote URL:
  `git remote set-url origin https://<username>:<PAT>@github.com/<username>/<repo>.git`
- **Cache Busting:** If changes don't appear, perform a "Force Commit" (e.g., `touch test_file.txt`) to trigger a new GitHub Pages build.

## 4. Verification Phase
- **Visual Audit:** Click a known location (e.g., "Ash House") and verify the description panel is populated.
- **Network Audit:** Use browser DevTools to ensure `atlas_data.json` is returning a `200 OK` and contains the updated strings.

## Pitfalls
- **Surgical vs. Total Replace:** Always rebuild the entire `atlas_data.json` from the Golden HTML to prevent partial data loss.
- **Security Scanners:** When using PATs in the terminal, be aware that security scanners may flag the command; ensure user approval is obtained.
- **Demo Mode Silence:** The Atlas Engine fails silently into Demo Mode if the fetch fails; always check the console for "Using Demo Mode" warnings.
