---
name: chrome-remote-debugging-troubleshoot
description: Systematic diagnosis and resolution of CDP connection failures for Chrome on Windows/PowerShell.
---

# Skill: Chrome Remote Debugging Troubleshooting (Windows/PowerShell)

## Overview
This skill provides a systematic approach to diagnosing and fixing connection failures when an AI agent attempts to control a user's Chrome browser via the Chrome DevTools Protocol (CDP) on a Windows machine.

## The Problem
The agent receives `Failed to connect via CDP to http://localhost:9222` even when the user has launched Chrome with the `--remote-debugging-port=9222` flag.

## Root Causes
1. **Zombie Processes**: Existing Chrome processes are still running in the background without the debugging flag, causing new instances to "attach" to them without the flag.
2. **PowerShell Syntax Errors**: Using `--` in PowerShell without the call operator (`&`) causes parameter interpretation errors.
3. **Profile Locking**: The main user profile is in use, preventing the debugging port from initializing correctly.
4. **Port Conflict**: Another service is already using the target port.

## Troubleshooting Workflow

### Phase 1: Verify the Port is Listening
Check if any process is actually listening on the intended port.
```powershell
netstat -ano | findstr :9222
```
*   **If empty**: The port is NOT open. Proceed to Phase 2.
*   **If populated**: The port IS open. The issue is likely a firewall or security software blocking the agent.

### Phase 2: The "Hard Reset" (The Sledgehammer)
To ensure no zombie processes exist, force-kill all Chrome instances and launch a fresh, isolated instance with a new port and a temporary user directory.

1. **Kill all Chrome processes:**
   ```powershell
   Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

2. **Verify no processes remain:**
   ```powershell
   netstat -ano | findstr :9222
   ```

3. **Launch with unique port and temporary directory:**
   Use the `&` operator and a different port (e.g., `9223`) to bypass potential conflicts.
   ```powershell
   & "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9223 --user-data-dir="C:\temp\chrome_debug_new"
   ```

### Phase 3: Verification
Once launched, the agent should attempt a `browser_snapshot` or `browser_navigate` to the new port.

## Pitfalls
- **Don't forget the `&`**: In PowerShell, always use `&` before the executable path when using flags.
- **Check installation path**: Chrome might be in `C:\Program Files` or `C:\Program Files (x86)`. Use `Get-ChildItem` to find it if unsure.
- **Zombie processes are sneaky**: Even if no Chrome windows are visible, a background process will prevent the debugging flag from working.
