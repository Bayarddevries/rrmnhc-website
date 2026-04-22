---
name: environment-bootstrap-recovery
description: Systematic procedure for diagnosing and resolving missing Python dependencies and binary tools in restricted or virtualized environments.
---

# Environment Bootstrap & Dependency Recovery

A systematic procedure for diagnosing and resolving missing Python dependencies and binary tools in restricted or virtualized environments (like WSL2, sandboxes, or pre-configured agent venvs).

## Context
When an agent's tools fail due to "command not found" or "module not found" errors, it is often not a simple installation issue, but a mismatch between the system Python and the active runtime environment (e.g., a venv without `pip`).

## Protocol

### 1. Diagnostic Phase
- **Identify the mismatch:** Use `sys.executable` to find the exact Python binary currently running.
- **Check the environment type:** Determine if you are in a virtual environment (venv) by checking `sys.prefix` vs `sys.base_prefix`.
- **Audit dependencies:** Run a script to check for both system binaries (`which <cmd>`) and Python packages (`import <pkg>`).

### 2. Recovery Phase (Python)
If packages are missing and `pip` is unavailable in the active venv:
- **Bootstrap `pip`:** Use `sys.executable -m ensurepip --upgrade` to inject `pip` into the active virtual environment.
- **Targeted Installation:** Always use `sys.executable -m pip install <package>` rather than just `pip install`. This ensures the package is installed into the *correct* interpreter, avoiding the "installed but not found" error.
- **Handle PEP 668:** In externally managed environments, use the `--break-system-packages` flag if you are operating within a disposable sandbox/container where system integrity is secondary to tool availability.

### 3. Recovery Phase (System Binaries)
- **User-space fallback:** If `sudo apt install` is blocked by permission/password requirements, attempt to install Python-based versions of the tool via `pip` (e.g., `pyfiglet` instead of a system binary).
- **Logic Pivot:** If a CLI tool (like `excalidraw-cli`) is unavailable or broken, pivot to writing a native Python script that generates the required data format (e.g., JSON for Excalidraw) instead of relying on the external binary.

## Pitfalls
- **Version Mismatch:** Installing via system `pip` while the agent runs in a `venv` will result in "ModuleNotFoundError" despite successful installation logs.
- **Pathing issues:** User-installed binaries in `~/.local/bin` might not be in the `$PATH`. Always use absolute paths or re-verify with `which` after installation.

## Verification
- Re-run the diagnostic script from Phase 1 to ensure `import` statements now succeed for all targeted packages.
