---
name: wsl2-local-http-server-diagnostic
description: Procedural approach to resolving "broken" browser behavior when attempting to view local HTML files (like Leaflet maps) in a WSL2/Windows environment.
---

# WSL2 Local Web Server & Browser Diagnosis

A procedural approach to resolving "broken" browser behavior when attempting to view local HTML files (like Leaflet maps) in a WSL2/Windows environment.

## Overview
When local `.html` files appear to "not work" (blank pages, broken scripts, missing data), the issue is rarely the browser engine itself. It is almost always the **CORS (Cross-Origin Resource Sharing) security policy** triggered by the `file://` protocol, which prevents local scripts from loading external or adjacent JSON/GeoJSON data.

## Symptoms
- Maps appear blank or uninitialized.
- Browser console reports `Access to XMLHttpRequest at... from origin 'null' has been blocked by CORS policy`.
- `net::ERR_FILE_NOT_FOUND` when trying to access specific assets via absolute paths.

## Diagnostic & Resolution Workflow

### 1. Verify Browser/CDP Connectivity
Before troubleshooting files, ensure the browser control interface is functional.
- **Test**: Navigate to `https://www.google.com`.
- **Pass**: If Google renders, the browser engine and remote debugging connection are fine.
- **Fail**: If this fails, troubleshoot the Chrome Remote Debugging connection (see `chrome-remote-debugging-troubleshoot`).

### 2. Identify the Target Environment (WSL2 vs. Windows)
In a WSL2 environment, the browser (Windows) and the files (WSL2) are in different network namespaces.
- **Check IP**: Run `ip addr show eth0` in the terminal to find the WSL2 internal IP (e.g., `172.18.x.x`).
- **Avoid `localhost`**: `localhost` in the Windows browser may not always resolve to the WSL2 instance depending on the `hosts` file and WSL2 networking mode. Always prefer the explicit WSL2 IP.

### 3. Deploy a Local HTTP Server (The Fix)
To bypass CORS, you must serve files via `http://` instead of `file://`.

1. **Navigate** to the root of the project or research vault.
2. **Start the server** in the background:
   ```bash
   python3 -m http.server 8000
   ```
3. **Access the file** via the browser using the format:
   `http://[WSL2_IP]:8000/[relative/path/to/file.html]`
   *(Note: Replace spaces in paths with `%20`)*

### 4. Verification
- Check the browser console for `404 Not Found` (indicates pathing error) vs. `CORS Error` (indicates protocol error).
- Confirm the `window` object contains expected data (e.g., `window.trailWaypoints`) via `browser_console`.

## Pitfalls
- **Wrong Directory**: Ensure the Python server is started in a directory that contains the relative path you are calling in the URL.
- **Port Conflicts**: If `8000` is taken, use a different port (e.g., `8080`).
- **Firewalls**: Ensure Windows Firewall allows traffic on the selected port from the WSL2 network.
