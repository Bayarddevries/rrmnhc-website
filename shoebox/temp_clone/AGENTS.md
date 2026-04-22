# Agent Instructions: Red River Métis Shoebox

This document provides critical context for AI Coding Agents working on this project. DO NOT remove existing performance optimizations without a documented reason.

## 🧠 Project Context
This application is a high-interactivity React SPA. It simulates a physics-free "pile" of photos. Large data sets (hundreds of photos) are a primary use case, so performance is the top priority.

## 🛡 Mandatory Performance Patterns

### 1. File Injection
- **Problem:** Adding 200 items to the state/DOM simultaneously crashes the browser or causes 1s+ long frames.
- **Solution:** Use the `visiblePhotoCount` state and the batching `useEffect` in `App.tsx`. 
- **Rule:** Never map over `photos` directly in the "unpacked" view; always use `photos.slice(0, visiblePhotoCount)`.

### 2. Layout & Reflow
- **Problem:** Synchronous `getComputedStyle` or `clientHeight` calls in hundreds of components (e.g., for auto-resizing titles) create a "Reflow Storm."
- **Rule:** Title resizing in `PhotoItem.tsx` MUST happen in a `useEffect` with a slightly randomized `setTimeout`. Avoid `useLayoutEffect` for mass-rendering items.

### 3. State Management
- **Rule:** Use pre-computed Maps for index lookups (e.g., `matchingIndices`) in `App.tsx`. 
- **Rule:** Do not use `findIndex` inside a `.map()` loop over the entire gallery. This turns an $O(N)$ render into $O(N^2)$.

## 🛠 Feature Guidelines
- **Icons:** Always use `lucide-react`.
- **Animations:** Use `motion` from `framer-motion` (aliased as `motion/react`).
- **Dependencies:** This is a static SPA. Avoid adding server-side dependencies like `fs` or `path` unless migrating to a full-stack architecture.

## 🤝 Handoff Priorities
When migrating to GitHub:
1. Ensure the `dist` folder is configured for static hosting.
2. The user prefers a "no-backend" approach for privacy, keeping all image data in browser memory (`URL.createObjectURL`).
