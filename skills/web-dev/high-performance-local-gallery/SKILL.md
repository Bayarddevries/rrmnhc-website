---
name: high-performance-local-gallery
description: Implementing a fast, metadata-rich local image gallery using Vite, Node.js, and Sharp in a WSL2 environment.
category: web-dev
tags: [vite, sharp, exiftool, wsl2, performance, image-optimization]
---

# High-Performance Local Image Gallery

This skill outlines the architecture for serving thousands of high-resolution local images through a web interface without crashing the browser or causing long load times.

## Core Architecture
To avoid browser memory crashes and slow "popping" of images, the system uses a **Three-Tier Asset Strategy**:
1. **Metadata Manifest**: A JSON file cached on disk to avoid re-scanning folders with `exiftool` on every restart.
2. **Thumbnail Proxy**: A server-side middleware that resizes images on-the-fly using `sharp` and caches them in memory.
3. **Async Pre-loader**: A frontend loop that pre-caches all thumbnails into the browser before the "Unpack" animation triggers.

## Implementation Steps

### 1. Server-Side: The Thumbnail Proxy
Do not serve high-res images to the board view. Implement a proxy in `vite.config.ts`:

```typescript
import sharp from 'sharp';

// In localGalleryPlugin middleware:
server.middlewares.use('/api/photo/thumb/', async (req, res, next) => {
  const filename = decodeURIComponent(req.url!.replace('/api/photo/thumb/', ''));
  const fullPath = path.join(resolvedPhotoPath, filename);
  
  if (!fs.existsSync(fullPath)) return next();

  // In-memory LRU cache for buffers
  if (thumbCache.has(filename)) {
    const cached = thumbCache.get(filename);
    res.writeHead(200, { 'Content-Type': cached.contentType });
    return res.end(cached.buffer);
  }

  const buffer = await sharp(fullPath).resize(400, 400, { fit: 'cover' }).toBuffer();
  // ... cache and serve buffer
});
```

### 2. Server-Side: Persistent Manifest
Avoid calling `exiftool` on every reload. Save the results to `public/data/manifest.json`.

```typescript
async function extractMetadataAsync() {
  const MANIFEST_PATH = path.resolve(PUBLIC_DATA_PATH, 'manifest.json');
  if (fs.existsSync(MANIFEST_PATH)) {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  }
  // ... else run exiftool and fs.writeFileSync(MANIFEST_PATH, ...)
}
```

### 3. Frontend: The Pre-load Loop
To prevent "choppy" loading, pre-cache all thumbnails before revealing the board.

```typescript
const handleUnpack = async () => {
  setIsUnpacking(true);
  
  const preloadPromises = photos.map(photo => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = photo.src.replace('/api/photo/', '/api/photo/thumb/');
      img.onload = resolve;
      img.onerror = resolve;
    });
  });
  
  await Promise.all(preloadPromises);
  setAppState('unpacked');
  setIsUnpacking(false);
};
```

## Critical Pitfalls & Fixes

### ⚠️ The Path Prefix Bug
**Error:** Images return 404 even if the file exists.
**Cause:** Using `req.url.substring(1)` on a route like `/api/photo/img.jpg` results in `api/photo/img.jpg`, which is then appended to the root path.
**Fix:** Always use `.replace('/api/photo/', '')` to isolate the filename.

### ⚠️ WSL2 Network Bridge
**Issue:** `localhost` not reachable in Windows browser.
**Fix:** Ensure the Vite server is bound to `0.0.0.0` and use the WSL2 IP if `localhost` forwarding is broken.

### ⚠️ Memory Leaks
**Issue:** High-res images in a scatter board cause the browser to lag/crash.
**Fix:** Use the `thumbnail` endpoint for the board and only use the full-res endpoint in the Detail Modal.
