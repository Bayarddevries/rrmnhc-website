---
name: live-html-dashboard-server
category: devops
description: Build a live-updating, auto-refreshing HTML dashboard using a Python HTTP server. Includes specific patterns to avoid JS syntax errors and browser caching issues.
version: 1.0.0
---

# Live HTML Dashboard Server

A self-contained dashboard using a lightweight Python `http.server` to serve HTML and a local JSON API for live data.

## 1. Folder Structure
```
dashboard/
├── dashboard.html  (The frontend UI)
└── server.py       (The Python backend API + Server)
```

## 2. `server.py` Implementation
Must handle both static file serving for the HTML and a dynamic JSON endpoint.

```python
#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
import signal
import sys

PORT = 8765
DASHBOARD_DIR = '/path/to/dashboard'  # <-- MUST BE CORRECTED

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DASHBOARD_DIR, **kwargs)

    def do_GET(self):
        if self.path == '/api/state':
            # 1. Collect your live data here
            state = {
                "timestamp": "...",
                "status": "Idle",
                "sessions": [],
                "inbox": []
            }
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(state).encode())
        elif self.path == '/':
            # Serve dashboard at root
            self.path = '/dashboard.html'
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
        else:
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
    
    def log_message(self, fmt, *args):
        pass # Silence logs for clean terminal

class ThreadedServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    allow_reuse_address = True

server = ThreadedServer(('0.0.0.0', PORT), Handler)
print(f"Dashboard running at http://localhost:{PORT}")
server.serve_forever()
```

## 3. `dashboard.html` Critical Patterns
To avoid the "Loading forever" bug, follow these rules:
1.  **JS Syntax:** Use ES5 style (`function`, `var`) if embedding directly in HTML to avoid scope/brace issues. When patching, verify ALL braces match after every edit.
2.  **No Missing IDs:** Every `getElementById('id')` in JS must have a matching `<div id="id">` in HTML. One missing element breaks the entire render pipeline silently.
3.  **Fetch Function:**
    ```javascript
    async function refresh() {
      try {
        const r = await fetch('/api/state');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const d = await r.json();
        lastData = d;
        render(d);
      } catch(e) {
        console.error('Dashboard fetch failed:', e);
      }
    }
    ```
4.  **Auto-Refresh with Delay:** `setTimeout(refresh, 300); setInterval(refresh, 15000);` — the 300ms delay ensures the DOM is fully loaded before first fetch.
5.  **Always Verify Before Serving:** Before telling the user the dashboard is ready, verify with a script that ALL `getElementById` calls in JS have matching HTML elements. Unmatched IDs cause silent JS halts.
6.  **Complete Rebuild > Incremental Patches:** If the JS has been patched 3+ times, scrap it and rewrite the entire `<script>` block from scratch. Incremental patches to JS in HTML are extremely error-prone and the number one cause of "Loading..." forever bugs.

## 4. Deployment
Start the server in the background:
```bash
nohup python3 /path/to/dashboard/server.py > /dev/null 2>&1 &
```

## 5. Cache-Busting Troubleshooting
If the browser loads a broken, cached version:
- Change the filename (e.g., `dashboard-v2.html`) and serve that at `/`.
- Or use `Ctrl+F5` (Hard Refresh) on the client.