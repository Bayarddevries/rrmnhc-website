# Technical Handoff: Red River Métis Shoebox

## 1. Project Overview
**Name:** Red River Métis Shoebox
**Mission:** A digital photo archive application for preserving community stories. Users upload photos (and optionally a `stories.json` manifest), which are then "unpacked" onto a virtual canvas where each photo acts as a physical object that can be moved, rotated, and explored.

## 2. Tech Stack
- **Frontend Framework:** React 19 (TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Animations:** Framer Motion (referred to as `motion/react`)
- **EXIF Parsing:** `exifr`
- **Mapping:** `react-leaflet` / `leaflet`

## 3. Key Performance Features
The app is optimized to handle hundreds of photos without crashing or freezing:
- **Client-Side Image Processing:** Images are compressed and resized (max 1200px) on the fly to minimize memory usage.
- **Incremental Metadata Processing:** Photos are processed in batches of 5 to keep the UI responsive.
- **Incremental DOM Injection:** When "unpacking," photos are rendered 20 at a time every 100ms.
- **Reflow Optimization:** Staggered title resizing avoids simultaneous synchronous layout triggers.
- **Efficient UI Logic:** Map-based index lookups replace expensive $O(N)$ filter searches during rendering.

## 4. Main Application States
- `upload`: File ingestion UI.
- `ready`: Data loaded, box closed.
- `unpacked`: Interactive workspace.
- `slideshow`: Fullscreen presentation.
- `slideshowSetup`: Configuration for the presentation.

## 5. File Structure
- `App.tsx`: Core engine, state coordination, and filtering logic.
- `types.ts`: `Photo` and `Story` definitions.
- `components/PhotoItem.tsx`: Draggable/rotatable photo component.
- `components/UploadScreen.tsx`: Batch-aware ingestion progress UI.

## 6. Integration Strategy for External Sites
The app is built as a standard Vite SPA.

### Strategy A: The Standalone Sub-page
The easiest way is to deploy this as its own entity and link to it.
`npm run build` -> Deploy `./dist` to GitHub Pages.

### Strategy B: iFrame Embed
Drop it into an existing page.
`<iframe src="[url]" width="100%" height="800px" frameborder="0"></iframe>`

### Strategy C: Component Integration
If the target site is React:
- Copy `components/`, `types.ts`, and core logic from `App.tsx`.
- Ensure `tailwindcss` and `framer-motion` are configured.

## 7. Future Considerations for AI Agents
- **Persistence:** Currently, data is lost on refresh (stored in memory via `URL.createObjectURL`). Implement **IndexedDB** or a cloud backend if persistence is requested.
- **Scale:** If collections exceed 500+ photos, consider implementing a **LOD (Level of Detail)** system for non-focused photos.
