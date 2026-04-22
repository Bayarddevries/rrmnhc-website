---
name: wsl2-vite-windows-bridge-debug
description: Diagnose and fix broken image/file loading when a Vite dev server in WSL2 serves assets from a mounted Windows directory (/mnt/c/...).
category: devops
tags: [wsl2, vite, windows-mount, path-resolution, debugging]
---

# WSL2 Vite Windows Bridge Debugging

## Scenario
A Vite project running in WSL2 serves static assets (like images for the Metis Shoebox) from a Windows mount (`/mnt/c/...`). The app loads the metadata/manifest correctly, but individual files appear as broken images (404 or 500).

## Common Cause: Path Prefix Leak
When using a custom Vite middleware to serve files from a local disk, a common error is failing to strip the API endpoint prefix from the request URL before joining it with the physical file path.

**Incorrect Logic:**
```typescript
server.middlewares.use('/api/photo/', (req, res, next) => {
  const filename = decodeURIComponent(req.url!.substring(1)) 
  // req.url is '/api/photo/image.jpg' -> substring(1) is 'api/photo/image.jpg'
  const fullPath = path.join(resolvedPhotoPath, filename)
  // Result: /mnt/c/.../Shoebox export/api/photo/image.jpg (FAILED)
})
```

**Correct Logic:**
```typescript
server.middlewares.use('/api/photo/', (req, res, next) => {
  const filename = decodeURIComponent(req.url!.replace('/api/photo/', ''))
  // Result: /mnt/c/.../Shoebox export/image.jpg (SUCCESS)
  const fullPath = path.join(resolvedPhotoPath, filename)
})
```

## Debugging Workflow

### 1. Verify File Access (Server Side)
Use a Python script or `ls` to confirm the Linux environment can actually see the files at the expected Windows mount point.
```bash
ls "/mnt/c/Users/[User]/Pictures/[Folder]" | head -n 5
```

### 2. Check Browser Console (Client Side)
Inspect the **Network Tab** in Chrome DevTools.
- **404 Not Found:** Path resolution error. Check if the request URL includes the API prefix twice or if the folder structure is mismatched.
- **500 Internal Server Error:** Permissions issue or crash in the middleware (e.g., `exiftool` failure).

### 3. Verify WSL2 Networking
If the site "can't be reached":
- Check if the process is listening: `sudo lsof -i :5173`.
- Try the direct WSL IP: `http://[WSL_IP]:5173`.
- Ensure `vite.config.ts` has `server.host: '0.0.0.0'` to allow external (Windows) access.

## Verification Steps
1. Restart Vite server: `npm run dev`.
2. Refresh browser.
3. Verify images load; check console for `200 OK` on `/api/photo/...` requests.
