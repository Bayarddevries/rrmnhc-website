# Red River Métis Shoebox

A digital photo archive application designed to preserve and explore the stories of the Red River Métis community through an interactive, scrapbook-style interface.

## 🚀 The Approach: "The Virtual Shoebox"
Unlike traditional photo galleries that use rigid grids, this application treats photos as physical objects. When "unpacked," photos are scattered across a workspace, allowing users to move, rotate, and layer them as they would on a kitchen table.

### Key Philosophy
- **Tactile Interaction:** Photos retain their "physicality" via rotation, scaling, and z-index management.
- **Story-First:** The app doesn't just show images; it links them to audio testimonies and text narratives, automatically associating files with matching names.
- **Accessibility:** Designed with memory-efficient processing to ensure it runs smoothly even on older devices used in community centers.

## 🛠 Technical Implementation

### Performance & Stability (Crucial for Handoff)
To handle collections of 200+ high-resolution photos in a single browser tab, we implemented several custom optimizations:

1. **Client-Side Processing Pipeline:**
   - **Compression:** All uploaded images are intercepted and resized (max 1200px) and compressed using the Canvas API before being saved to memory.
   - **EXIF Extraction:** Automatic parsing of metadata for locations and dates.

2. **Incremental Rendering Logic:**
   - **Batch Loading:** During file processing, the UI updates every 5 photos so the user isn't stuck on a loading screen.
   - **Staggered DOM Injection:** When opening the box, photos are added to the workspace in small batches (20 per 100ms) to prevent the "Unpack" animation from stuttering or crashing the browser.

3. **Rendering Optimization:**
   - **Reflow Minimization:** The text-resizing logic for photo titles uses a random-delay strategy to prevent simultaneous synchronous layout calculations across hundreds of components.
   - **O(N) Complexity:** Filtering and search logic utilizes pre-computed Map indices, ensuring that highlighting matching photos is near-instant regardless of gallery size.

## 📦 Getting Started

### Development
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```
The output will be in the `dist/` directory, ready to be hosted as a static site (GitHub Pages, Vercel, etc.).

## 📂 Project Structure
- `App.tsx`: Main logic for state management, file ingestion, and filtering.
- `types.ts`: Core data structures for `Photo` and `Story`.
- `/components`:
  - `PhotoItem.tsx`: The draggable, rotatable photo component.
  - `ShoeboxCover.tsx`: The interactive entry point.
  - `UploadScreen.tsx`: Batch-aware upload interface.
  - `StoryLinker.tsx`: Tool for manual media association.
