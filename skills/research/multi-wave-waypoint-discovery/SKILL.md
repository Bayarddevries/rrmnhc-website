---
name: multi-wave-waypoint-discovery
description: A systematic, tiered approach to mapping historical transport networks (water, land, or trail) by moving from broad corridors to granular, culturally-significant waypoints.
category: research
---

# Skill: multi-wave-waypoint-discovery

## Description
A systematic, tiered approach to mapping historical transport networks (water, land, or trail) by moving from broad corridors to granular, culturally-significant waypoints. This prevents "shallow" mapping and ensures the resulting data has both structural integrity (junctions) and historical depth (seasonal settlements).

## Use Cases
- Mapping historical York Boat or Canoe routes.
- Expanding cart trail networks.
- Reconstructing migration paths or seasonal movement patterns.

## The Three-Wave Framework

### Wave 1: The Backbone (Major Arteries)
**Goal**: Identify the primary "highways" and major junctions.
- **Focus**: Major rivers, large lakes, and the primary transshipment hubs (e.g., York Factory, Fort Garry).
- **Search Strategy**: Broad queries focusing on "major routes," "river junctions," and "primary corridors."
- **Output**: A skeletal map of the main transport system.

### Wave 2: The Connectors (Portage & Linkage)
**Goal**: Identify the land bridges that connect the water systems.
- **Focus**: Major portages, rapids/falls requiring bypass, and key land-based transfer points.
- **Search Strategy**: Queries focusing on "portage sites," "distance between [Point A] and [Point B]," and "river crossings."
- **Output**: A connected network of water and land segments.

### Wave 3: The Fine Detail (Cultural & Seasonal Nodes)
**Goal**: Add "density" and "soul" to the map through niche, documented sites.
- **Focus**: Minor landings, seasonal Métis/Indigenous encampments (*hivernements*), seasonal fishing/trapping camps, and minor ferry crossings.
- **Search Strategy**: Highly specific, niche queries using tools like Exa (e.g., "seasonal Métis encampments [River Name] 19th century" or "minor river landings [Region]").
- **Output**: A rich, dense, and historically authentic layer of "soft nodes" that provides texture to the map.

## Implementation Guidelines
1.  **Structured Registry**: Always store findings in a centralized, versioned Markdown registry (e.g., `York-Boat-Waypoints.md`) using a standardized table format.
2.  **Categorization**: Distinguish between:
    - **Hard Junctions**: Major transshipment/transfer hubs.
    - **Portages**: Land links between waterways.
    - **Soft Nodes**: Seasonal settlements, cultural sites, and minor landings.
3.  **Tiered Sourcing**:
    - **Wave 1/2**: Rely on official company logs (HBC/NWC) and survey maps.
    - **Wave 3**: Prioritize oral histories, community research, and niche ethnographic studies to find marginalized/seasonal locations.
4.  **Mapping Readiness**: Ensure every waypoint includes approximate coordinates and a citation to facilitate future GIS/Leaflet integration.

## Pitfalls
- **Over-reliance on "Big History"**: Standard web searches often only return the major hubs. Wave 3 *requires* specialized search (Exa/Tavily) to find the smaller, culturally significant sites.
- **Coordinate Drift**: Without rigorous documentation, "soft nodes" can easily be lost or misaligned. Always maintain a single source of truth in the vault.
