---
name: historic-archive-photo-research
description: Research, verify, download, and catalog historic photographs from Wikimedia Commons and other open archives — with CSV metadata for mapping projects. Handles rate limiting, URL verification, and geographic coordinate assignment.
category: research
---

When the user asks to source historic photographs from open archives (Wikimedia Commons, Library and Archives Canada, Flickr CC, etc.) for mapping or research:

## Approach

1. **Search Wikimedia Commons** via browser navigation (not API-only, since the API search often returns books/PDFs):
   ```
   https://commons.wikimedia.org/w/index.php?search=SEARCH_TERM&type=image&title=Special:Search
   ```
   Add `-filemime:pdf -filemime:djvu` to filters to exclude documents.

2. **Verify each photo exists** by navigating to its Commons page before adding to download list. Never assume a URL works without confirming.

3. **Download with delays** to avoid Wikimedia 429 rate limiting:
   - Use `urllib.request` with `User-Agent: Mozilla/5.0` header
   - Wait 3-5 seconds between downloads (`time.sleep(3 + random.random() * 2)`)
   - Validate downloaded file size > 5000 bytes (anything smaller is likely an HTML error page)
   - If rate-limited, fall back to the browser tool to download individual files

4. **Create structured CSV** with these columns:
   `photo_id, title, date, description, location, latitude, longitude, license, source, attribution, filename`

5. **Assign coordinates** based on actual settlement/community location (historical photos rarely have embedded GPS):
   - Use known historic settlement coordinates (Batoche: 52.7547, -106.1181; Red River/Winnipeg: 49.8950, -97.1385; St. Boniface: 49.8844, -97.1156; etc.)
   - Note approximate vs. precise in comments

6. **Save everything together** in a single project folder with images and CSV co-located.

## Critical: Cloud Server ≠ User's PC

**The #1 user confusion**: Files saved on the cloud server (e.g., `~/Documents/metis_research/`) are NOT visible in the user's Windows File Explorer. The cloud server is a separate machine on the internet.
- Always explain clearly: "Files are on my server. Download them from this chat to get them on your PC."
- Deliver files via `MEDIA:` tags so the user can tap/download directly
- If the user can't find the folder, it's because it exists on the cloud server, not their local machine
- Bundle images + CSV into a zip and send via `MEDIA:` tag for convenient batch download

## Important Pitfalls

- **URL paths are tricky** — Wikimedia file paths use hashes like `1/1b/Filename.jpg`. Always verify by navigating to the file page first
- **Rate limiting is aggressive** — after ~5-6 rapid requests, Wikimedia returns 429. Use deliberate delays (3-5 seconds minimum between requests)
- **IP-level blocks are terminal** — if Wikimedia fully blocks your IP (all requests return 429 including thumbnails), neither urllib, curl, nor the browser tool will work. You cannot recover within the same session. Download what you have early and often, rather than batching all downloads at the end.
- **Progressive download strategy** — download each photo immediately after verifying it exists (don't collect a full list first, then download). This way you keep what works and can resume later for failures.
- **Thumbnail URLs work better than full-size** — use `https://upload.wikimedia.org/wikipedia/commons/thumb/X/XX/Filename.jpg/1280px-Filename.jpg` instead of the full-resolution URL. Wikimedia is less restrictive on thumbnail endpoints.
- **Many search results are PDFs** — Wikimedia indexes full books. Use `Special:Search` with `-filemime:pdf -filemime:djvu` filters, or browse category pages directly
- **Only return photographs** — explicitly exclude paintings, engravings, maps, prints from the final collection unless user requests them
- **File sizes matter** — if a download is <5KB it's almost certainly an HTML error page, not an image
- **Complex search terms return zero results** — the Wikimedia API may return 0 results for queries with many qualifiers. Use simpler, broader search terms and filter results manually
- **Standardized naming** — use `MET###.jpg` (e.g., MET001.jpg) format for filenames. Makes CSV linking trivial and keeps files organized
- **Copy-paste errors in source data** — When enriching existing CSV files, check for description copy-paste errors (e.g., Fish Creek had Catfish Creek's description). Verify geography: if a description mentions the wrong river, city, or province, it's likely misattributed
- **Duplicate entries** — Check for same-named locations at different coordinates. Keep the correct one, remove duplicates
- **Cross-reference descriptions** — Some entries say "See entry for X" instead of having real descriptions. Replace these with full content

## Key Métis settlement coordinates for reference

| Community | Lat | Lon |
|-----------|-----|-----|
| Batoche SK | 52.7547 | -106.1181 |
| Red River/Winnipeg | 49.8950 | -97.1385 |
| St. Boniface | 49.8844 | -97.1156 |
| St. Norbert | 49.7028 | -97.1558 |
| White Horse Plains | 49.8333 | -97.7500 |
| Duck Lake | 52.7667 | -106.2167 |
| Paddle Prairie AB | 57.7590 | -117.6120 |
| Dakota Territory (exile) | 46.0000 | -99.5000 |
