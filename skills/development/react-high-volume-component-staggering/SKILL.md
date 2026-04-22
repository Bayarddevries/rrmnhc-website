---
name: react-high-volume-component-staggering
description: Pattern for preventing main-thread freeze when rendering large numbers of complex React components via staggered batching.
---
# React High-Volume Component Staggering
A performance pattern for preventing "main-thread freeze" and "black screens" when rendering a large number (100+) of complex components (e.g., images with CSS transforms) simultaneously.

## Trigger Conditions
- App freezes or exhibits a "black screen" during a transition to a view containing many complex components.
- Rendering a large array of components all at once causes the browser to hang or "pop-in" images choppy.
- Pre-loading assets is already implemented but the DOM insertion itself is the bottleneck.

## Steps to Implement

### 1. State Separation
Instead of mapping over the full data array, create a separate `visibleItems` state.
```typescript
const [allItems, setAllItems] = useState<Item[]>([]);
const [visibleItems, setVisibleItems] = useState<Item[]>([]);
```

### 2. Implement the Drip-Feed Logic
In the transition function (e.g., `handleUnpack` or `onViewChange`), use an async loop to move items from the full list to the visible list in small batches.

```typescript
const staggerItems = async () => {
  setVisibleItems([]); // Clear current view
  const batchSize = 15; // Number of elements to add per tick
  const delay = 20; // Milliseconds between batches

  for (let i = 0; i < allItems.length; i += batchSize) {
    const nextBatch = allItems.slice(i, i + batchSize);
    
    // Use a small timeout to yield the main thread back to the browser
    await new Promise(resolve => setTimeout(resolve, delay));
    
    setVisibleItems(prev => [...prev, ...nextBatch]);
  }
};
```

### 3. Update the Render Loop
Map over the `visibleItems` array instead of the `allItems` array.
```tsx
{visibleItems.map(item => (
  <ComplexComponent key={item.id} data={item} />
))}
```

## Pitfalls & Tuning
- **Batch Size**: If the UI still hitches, reduce `batchSize` (e.g., to 5). If it feels too slow, increase it (e.g., to 30).
- **Delay**: The `delay` must be non-zero. Even `1ms` allows the browser to handle paint events and input, preventing the "frozen" feel.
- **State Updates**: For very large sets (1000+), consider using a `useRef` for the queue and a `requestAnimationFrame` loop to avoid excessive React re-renders.

## Verification
- Open Browser DevTools $\rightarrow$ Performance Tab.
- Record the transition.
- Verify that the "Main" thread shows many small blocks of activity rather than one giant, multi-second "Long Task" (red bar).
