---
name: github-direct-push-protocol
description: A high-reliability deployment procedure for pushing complex, multi-file asset bundles to a GitHub repository when the standard terminal/CLI environment lacks write permissions (403 Forbidden).
---

# SKILL: github-direct-push-protocol

## DESCRIPTION
A high-reliability deployment procedure for pushing complex, multi-file asset bundles to a GitHub repository when the standard terminal/CLI environment lacks write permissions (403 Forbidden). This skill replaces unreliable `git push` commands with direct, atomic MCP tool calls to ensure the deployment actually occurs.

## WHEN TO USE
- When `git push` via terminal returns a `403 Forbidden` error.
- When the local sandbox environment does not have authenticated SSH/HTTPS access to the target repository.
- When deploying a "Siloed" architecture (e.g., moving a sub-project into a `/subdirectory/` to protect a root site).
- When the deployment requires a "Verify-Then-Deliver" workflow (verifying the live URL in a browser before reporting success).

## PROCEDURE

### 1. Bundle Preparation (The Architect's Payload)
- Create a "Production Bundle" (JSON object) containing all required files.
- **Crucial**: Ensure all paths are relative to the target deployment root (e.g., `atlas/index.html` instead of `src/index.html`).
- Verify that internal links (CSS/JS/Images) within the HTML files match the new directory structure.

### 2. Atomic MCP Injection
Instead of using `subprocess` or `shell` to run `git`, use the `github` MCP tool (or `mcporter` bridge) to perform individual file writes.
- **Sequence**:
    1. `github.create_or_update_file(repo: <repo>, branch: <branch>, path: <path>, content: <content>, message: <msg>)` for every file in the bundle.
- **Batching**: Process files one by one to allow for error isolation.

### 3. Post-Push Verification (The Truth-Seeker)
- **Do NOT** assume the push worked because the tool returned a success code.
- **Action**: Use the `browser_navigate` tool to visit the **actual live URL** (e.g., `https://user.github.io/repo/subpath/index.html`).
- **Audit**: Use `browser_vision` to confirm the page renders correctly and is not a 404 or a broken CSS layout.

## PITFALLS & WARNINGS
- **The Simulation Trap**: NEVER report a successful deployment based on terminal output or simulated logic. Only a live browser visit constitutes verification.
- **Path Drift**: When moving files into a subdirectory (e.g., `/atlas/`), you MUST update the internal relative paths within the HTML files to match the new structure.
- **The 403 Error**: If `git push` fails with 403, immediately pivot to the MCP tool. Do not attempt to "fix" the terminal permissions.
