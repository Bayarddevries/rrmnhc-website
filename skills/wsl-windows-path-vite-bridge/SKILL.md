---
name: wsl-windows-path-vite-bridge
description: Configuring a Vite/React app running in WSL2 to dynamically serve and access files from a specific Windows path (C:\Users\...) at runtime without manual copying or ingestion scripts.
tags: [wsl2, vite, react, development, windows-bridge]
---

# WSL2 Windows Path Bridge for Vite

## Context
When developing a local webapp (React/Vite) in WSL2 that needs to access media or data files from a Windows directory, this skill creates a Vite plugin that acts as a dynamic bridge. It scans the folder, optionally uses `exiftool` to extract Lightroom metadata (Titles, Keywords, Locations), and serves the files in real-time.

## Implementation

### 1. Configure vite.config.ts
Create a custom Vite plugin in your `vite.config.ts`. This plugin adds two middleware routes: one to list files and one to serve the files.

```typescript
import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Fix ESM __dirname (Vite uses ESM modules)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 1. Define the Windows path (accessible via /mnt/c/...)
const WINDOWS_PATH = '/mnt/c/Users/YourName/Pictures/YourFolder'
const PROJECT_ROOT = path.resolve(__dirname)

function windowsBridgePlugin(): Plugin {
  return {
    name: 'vite-plugin-windows-bridge',
    configureServer(server) {
      // 2. Middleware to LIST files (API)
      server.middlewares.use('/api/files', (req, res, next) => {
        if (!fs.existsSync(WINDOWS_PATH)) {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Directory not found' }))
          return
        }

        const files = fs.readdirSync(WINDOWS_PATH)
        const photos = files.filter(f => /\.(jpe?g|png|webp|heic|tiff?)$/i.test(f))
        
        const manifest = photos.map((filename, index) => ({
          id: index,
          filename: filename,
          src: `/api/file/${filename}`,
          date: new Date().toISOString()
        }))

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ files: manifest, count: manifest.length }))
      })

      // 3. Middleware to SERVE files (Images/Media)
      server.middlewares.use('/api/file/', (req, res, next) => {
        const filename = req.url!.substring(1)
        const fullPath = path.join(WINDOWS_PATH, filename)
        
        if (fs.existsSync(fullPath)) {
           const ext = path.extname(fullPath).toLowerCase()
           const mimeTypes: Record<string, string> = {
             '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', 
             '.gif': 'image/gif', '.webp': 'image/webp'
           }
           res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' })
           fs.createReadStream(fullPath).pipe(res)
        } else {
           next()
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    windowsBridgePlugin() // ADD THIS
  ],
  server: {
    fs: {
      strict: false, // CRITICAL: Relaxed strict mode prevents 403 on app's own files
      allow: [WINDOWS_PATH, PROJECT_ROOT] // CRITICAL: Must include BOTH the Windows path AND the project root, otherwise Vite blocks index.html with 403
    }
  },
})
```

### 2. Update Frontend Fetch
Update your React `useEffect` to fetch from the new API endpoint instead of local state or manual uploads.

```typescript
// Inside your main App component
useEffect(() => {
  fetch('/api/files')
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      if (data) {
        console.log(`Loaded ${data.count} files from Windows folder`);
        setFileList(data.files);
      }
    })
    .catch(err => console.error("Bridge connection failed"));
}, []);
```

## Pitfalls
- **Path Not Found:** Ensure the WSL2 instance is mounted correctly. The path `/mnt/c/...` must be exact. If the user renamed their "Pictures" folder, it will fail.
- **Permissions:** Windows files must be accessible by the WSL2 user. If the folder is on a non-NTFS drive or a network share, permissions might block Node.js access.
- **Caching:** Browsers aggressively cache images. If the user updates the Vite plugin, they should do a hard refresh (Ctrl+F5) to ensure the new images are requested.
- **ESM `__dirname` is undefined:** Vite configs use ESM by default, so `__dirname` doesn't exist. Use `const __filename = fileURLToPath(import.meta.url); const __dirname = path.dirname(__filename);` to resolve the project root. Without this, the project root won't be added to `server.fs.allow` and the entire app will 403.
- **`server.fs.allow` blocks your own app:** If you set `allow: [WINDOWS_PATH]` only, Vite will return 403 on `index.html` and other project files because you've implicitly restricted access to that single path. You MUST include both `WINDOWS_PATH` and `PROJECT_ROOT` in the `allow` array, and set `strict: false`.
- **403 Troubleshooting:** If you get "The request url is outside of Vite serving allow list", check that `server.fs.strict` is `false` and that `PROJECT_ROOT` (the actual absolute path of your project folder) is in `server.fs.allow`.
- **URL encoding of filenames in the middleware:** Filenames with spaces, parentheses, or Unicode characters (very common in user-uploaded photos) will 404 if not properly encoded. When building the `src` field for items in the `/api/files` response, use `encodeURIComponent(filename)` to produce safe URLs. In the `/api/file/` serving middleware, use `decodeURIComponent(req.url!.substring('/api/file/'.length))` to map the URL-encoded request back to the actual filename on disk. Without both halves, you get broken images for files like `1975 St. Eustache.jpg` or `Seven Oaks (Sept Chênes).jpg`.
- **Drag position snap-back:** When implementing drag-and-drop on photo cards, compute the final position from drag state (`startPos + delta`) in `handleInteractionEnd` -- do NOT parse the position back out of the DOM `transform` string with regex. The regex approach (`translate3d\(([^p]+)px, ...`) is unreliable with floating-point coordinates and causes the card to animate back to its starting position because the parsed value is wrong.
- **Modal disappearing on state updates:** When a modal displays a Photo object, store its ID (e.g., `selectedPhotoId`) and derive the current photo from state on each render (`photos.find(p => p.id === selectedPhotoId)`). If you store the full Photo object as state, it becomes a stale snapshot -- subsequent state updates (geocoding, drag, etc.) cause re-renders that make the modal flicker or disappear because its reference is no longer in the current state tree.
- **Geocoding useEffect triggering excessive re-renders:** If you update the `photos` array with geocoded coordinates, use functional state updates (`setPhotos(prev => prev.map(...))`) with `.id` comparison to avoid touching other photos. A broad `.location === location` match in the map callback can update multiple photos simultaneously, causing cascading re-renders that interfere with modals and drag operations.
- **Photo objects with EXIF metadata:** Images with EXIF/IPTC/XMP metadata will have rich titles, captions, keywords, and people data extracted automatically at server startup via `exiftool`. Images without metadata will fall back to filename-derived titles. The server-side metadata extraction happens in `extractMetadataAsync()` inside the Vite plugin, not in the frontend.
- **Server-side `server.host: '0.0.0.0'` for WSL2 access:** When running Vite in WSL2 and accessing from the Windows browser, you MUST set `server.host: '0.0.0.0'` in the Vite config, otherwise it defaults to localhost which may not be reachable from the Windows side in all WSL2 configurations.
- **Local git checkpoint pattern:** Before making risky changes to any WSL2 project, always: (1) `git init` if not already a repo, (2) commit with a clear message, (3) create a tag like `git tag working-before-X`, (4) add a `RECOVERY.md` and simple `revert.sh` script. This gives instant rollback without needing GitHub push or dealing with remote auth. For WSL2 projects specifically, never commit large media files or Windows paths to git -- keep source code separate. Images on Windows are accessed read-only via `/mnt/c/...` and are never part of the repo.