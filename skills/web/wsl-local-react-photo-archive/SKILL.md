---
name: wsl-local-react-photo-archive
category: web
description: Build a React photo gallery/archive app in WSL2 that serves photos directly from a Windows filesystem folder via a Vite middleware plugin. Extracts metadata from filenames when EXIF is unavailable.
version: 1.0.0
---

# WSL2 Local Photo Archive with Vite Middleware

Connect a React app to a Windows folder containing photos, serving them through a custom Vite middleware plugin without requiring a separate backend server.

## Problem
Browser-based photo apps can't read local files directly. In AI studio environments the user has to manually upload photos on every load. The solution is to use a Vite plugin to serve files from the Windows filesystem via the WSL2 mount point.

## 1. Vite Config Plugin Pattern

Create `vite.config.ts` with a custom middleware plugin:

```typescript
import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Windows path via WSL2 mount
const PHOTO_PATH = '/mnt/c/Users/Bayard deVries/Pictures/Shoebox export'
const PROJECT_ROOT = path.resolve(__dirname)

function localGalleryPlugin(): Plugin {
  return {
    name: 'vite-plugin-local-gallery',
    configureServer(server) {
      // Endpoint 1: Return metadata as JSON
      server.middlewares.use('/api/photos', (req, res) => {
        if (!fs.existsSync(PHOTO_PATH)) {
          res.writeHead(404); res.end('404'); return
        }
        const files = fs.readdirSync(PHOTO_PATH)
        const images = files.filter(f => /\.(jpe?g|png|webp|heic|tiff?)$/i.test(f))
        const photos = images.map((filename, index) => {
          const meta = parseFilenameMetadata(filename)
          return { id: index, filename, src: `/api/photo/${encodeURIComponent(filename)}`, ...meta }
        })
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ photos, count: photos.length }))
      })
      
      // Endpoint 2: Serve individual image files
      server.middlewares.use('/api/photo/', (req, res, next) => {
        const filename = req.url!.substring(1)
        const fullPath = path.join(PHOTO_PATH, filename)
        if (fs.existsSync(fullPath)) {
          const mimeTypes: Record<string, string> = {
            '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
          }
          const ext = path.extname(fullPath).toLowerCase()
          res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' })
          fs.createReadStream(fullPath).pipe(res)
        } else { next() }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), localGalleryPlugin()],
  server: {
    fs: {
      strict: false,                    // Critical: disable strict mode
      allow: [PHOTO_PATH, PROJECT_ROOT] // Or Vite blocks index.html
    }
  },
})
```

## 2. Filename Metadata Extraction (Fallback for EXIF)

Lightroom exports often have no embedded EXIF/IPTC/XMP text metadata. Instead, parse the filename structure:

```typescript
function parseFilenameMetadata(filename: string) {
  const base = filename.substring(0, filename.lastIndexOf('.'))
  // Pattern: "NUMBER - Description"
  let description = base.replace(/^\d+[-–_\s]+/, '').replace(/[-_]/g, ' ').trim()
  const title = description.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  
  // Auto-detect locations from a known list
  const locations: string[] = []
  // ... match against known city/province keywords
  
  return { title, caption: description, location: locations.join(', '), keywords: [] }
}
```

## 3. App.tsx Integration

```typescript
useEffect(() => {
  fetch('/api/photos')
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data?.photos.length > 0) {
        const enriched = data.photos.map((p, i) => ({
          ...p, position: { x: randomX, y: randomY },
          rotation: randomR, scale: 1, zIndex: i, // ⚠️ scale: 1 IS REQUIRED
        }))
        setPhotos(enriched)
      }
    })
}, [])
```

## Critical Pitfalls

### Photos Stack in a Vertical Line
- **Cause:** Missing `scale: 1` property on Photo objects. Without `scale`, the browser's CSS `transform: translate3d() rotate()` is completely ignored, leaving all photos at `top: 0` in a column.
- **Fix:** Always set `scale: 1`, `initialScale: 1`, and `initialRotation` in the initial photo data AND in the `handleUnpack` scatter function.

### 403 Filesystem Restriction on `index.html`
- **Cause:** Adding a custom `server.fs.allow` path overrides Vite's default allowlist, blocking the app from serving its own `index.html`.
- **Fix:** Set `server.fs.strict: false` AND include both the photo path and `PROJECT_ROOT` in the allow array.

### EXIF Parsers Fail on Lightroom Exports
- `exifr` and `exif-reader` both return null/undefined for JPEGs exported from Lightroom due to non-standard Adobe Carousel APP1 markers.
- `exiftool` confirmed ZERO embedded text metadata (no IPTC/XMP Title, Caption, Keywords in exported JPEGs).
- **Solution:** Parse meaningful metadata from filenames since Lightroom users embed descriptions in the export filename (e.g., `10-Daniel - Grandmas grandfather.jpg`).

### Duplicate `extractMetadataAsync` Function
- When patching `vite.config.ts`, multiple versions of `extractMetadataAsync` can coexist in the file causing silent failures. **Always rewrite the entire file** if major refactoring is needed.

### Stale Vite Cache Blocks Config Changes
- After changing `vite.config.ts`, kill the old Vite process and run `npx vite` again. Changes do NOT hot-reload. The Vite plugin only runs on server startup.

### Filenames with Spaces/Special Characters Break Image Loading
- **Cause:** When photo filenames contain spaces, parentheses, Unicode characters (e.g., "à", "è", "ê", "é", "ç", accented quotes), the `src` field in the API response contains raw spaces like `/api/photo/1975 St. Eustache Amanda.jpg`. The browser sends this as-is in the request URL, which fails or truncates.
- **Fix on the server side (vite.config.ts):**
  1. In `extractMetadataAsync()`, URL-encode the filename in the `src` field:
     ```typescript
     src: `/api/photo/${encodeURIComponent(filename)}`,
     ```
  2. In the `/api/photo/` middleware, decode the incoming URL:
     ```typescript
     const filename = decodeURIComponent(req.url!.substring('/api/photo/'.length));
     ```
- Both sides are needed: encode on output, decode on input. Without encoding, spaces/special chars break. Without decoding, `%20` doesn't match the filename on disk.

### Windows Path with Unicode Characters
- Paths like `C:\Users\Bayard deVries\` contain accented characters in the name. The WSL2 mount at `/mnt/c/Users/Bayard deVries/` works fine, but double-check `fs.existsSync()` succeeds before relying on the path.

### 403 Filesystem Restriction on `index.html`
- Set `appState` to `unpacked` (not `'upload'`) so the app skips the upload screen and goes straight to the gallery.
- Remove the `<UploadScreen />` import and render block entirely.

### Sidebar Filters Disappear When Empty
- The LeftSidebar component hides itself if there are no stories, familyNames, or tags. Force it to show by removing the conditional: `{appState === 'unpacked' && (` instead of `{appState === 'unpacked' && (stories.length > 0 || sortedFamilyNames.length > 0 || sortedTags.length > 0) && (`.