---
name: historical-network-discovery
description: A multi-wave framework for transforming fragmented historical records into high-fidelity, interconnected map networks (roads, trails, river routes).
---

# Historical Network Discovery Framework

This skill provides a systematic approach to researching historical transportation networks to ensure they are "Map-Ready"—meaning they are logically sequenced, organically curved, and 100% interconnected (zero dangles).

## 🌊 The Three-Wave Research Process

### Wave 1: The Continental Arteries (The Skeleton)
Focus on the "highways" of the era. 
1. **Identify Hubs**: Locate the primary start/end points and major administrative centers (Forts, Capital Cities).
2. **Establish Primary Corridors**: Map the most frequented routes between hubs.
3. **Sequence the Backbone**: Organize waypoints in a strict travel order (`[0], [1], [2]...`). This is critical for automated polyline rendering.

### Wave 2: The Parish & Settlement Webs (The Connective Tissue)
Focus on the "local roads" that feed into the arteries.
1. **Identify Soft Nodes**: Find seasonal camps, parishes, and minor settlements.
2. **Map the Spurs**: Search for local trails that link these soft nodes to the nearest artery.
3. **Bridge the Gaps**: Ensure every local node has a verified path leading back to the primary backbone.

### Wave 3: High-Resolution Curvature (The Organic Layer)
Focus on transforming straight lines into authentic paths.
1. **Hunt for Micro-Waypoints**: Search for river bends, ridgelines, and specific topographical detours.
2. **Extract Distance Intervals**: Find "mile-markers" (e.g., "12 miles west of X") to calculate the correct "stretch" of the line.
3. **Apply Sinuosity Logic**: 
    - **High Sinuosity**: Route follows a river bank or coastline (meandering).
    - **Moderate Sinuosity**: Route follows ridgelines or parkland (curved).
    - **Low Sinuosity**: Route is a direct prairie crossing (relatively straight).

## 🛠️ The Interconnect Audit (Zero-Dangle Phase)

Before synthesizing data for a map, perform a structural audit to eliminate "islands."

1. **Identify Dangles**: Find nodes that are documented but not linked to the main network.
2. **Interpolate Bridges**: Use topographical logic or historical " launder" paths (e.g., "followed the river to the nearest trail") to create a connection.
3. **Verify Reachability**: Ensure every single node in the registry can be reached by following the sequence from the primary hub.

## 📝 Map-Ready Documentation Standard

When recording findings in a registry, use this format to facilitate automated drawing:

| Sequence | Waypoint Name | Category | Coordinates | Significance | Sinuosity/Logic |
|---|---|---|---|---|---|
| [0] | Hub A | Hub | lat, lng | Start Point | N/A |
| [1] | Waypoint B | Soft Node | lat, lng | River Crossing | High (Follows river) |
| [2] | Hub C | Hub | lat, lng | End Point | Moderate (Ridgeline) |

## 🚩 Pitfalls & Tips
- **Avoid the "Straight Line" Trap**: Never connect two distant hubs with a single line. Always insert at least one intermediate "curvature node" based on topography.
- **The "Water-Land" Gap**: Remember that historical networks are often multi-modal. Create explicit "Transfer Nodes" where a boat route ends and a cart trail begins.
- **Source Hierarchy**: Prioritize detailed diaries and survey maps over general historical summaries for Wave 3 data.
