---
name: sourcing-historic-images
category: research
description: Source open-source historic photographs with coordinates/metadata for mapping and archival use. Sourcing from Wikimedia Commons and alternative archives.
---

# Sourcing Historic Images with Coordinates

Use this workflow when gathering open-source historic photographs that need location data (latitude/longitude) for mapping purposes. Focus on **actual photographs** (no paintings, maps, or illustrations) with verified source, license, and geographic metadata.

## Trigger Conditions
- User needs historic/open-source images with location data
- Building image libraries for maps, GIS, or research
- Sourcing public domain or CC-licensed archival photographs
- Wikimedia Commons rate-limiting blocks bulk downloads

## Step-by-Step Workflow

### 1. Search Wikimedia Commons via Browser (API IS BROKEN)
**CRITICAL**: The `web_search` tool consistently returns HTTP 400 errors for Wikimedia queries. The `web_extract` tool ALSO returns HTTP 400 for Wikimedia Commons URLs (both category pages and file pages). The Commons API often returns empty results for complex queries. The ONLY reliable method is `browser_navigate` + `browser_get_images`:
```
https://commons.wikimedia.org/w/index.php?search=QUERY&type=image&title=Special:Search
```

Better search strategies:
- Use `title=Special:Search` (not `Special:MediaSearch` which is a JS app that doesn't render well)
- Add `-filemime:pdf -filemime:djvu` to exclude document results
- Search for specific settlements/people/dates: `"Batoche 1885 photograph"`, `"Metis 1873 1880 1890"`
- Try Wikipedia article pages for specific topics — they often contain verified Commons files
- Browse category pages directly: `https://commons.wikimedia.org/wiki/Category:Batoche`

### 2. Find Actual Image File URLs
Use `browser_get_images` on category pages or file pages to extract real image URLs. Look for:
- Links containing `/thumb/` or direct `/f/filename.jpg` paths
- The full file URL pattern: `https://upload.wikimedia.org/wikipedia/commons/HASH/FILENAME`

Verify files by visiting their page URLs:
```
https://commons.wikimedia.org/wiki/File:FILENAME.jpg
```

### 3. Verify Photos (Not Paintings/Maps)
- Check page descriptions: look for "Photograph of..." vs "Painting", "Engraving", "Map", "Sketch"
- Avoid SVG files, PDFs, DjVu files
- Prioritize `.jpg` files from historical periods (1870s-1910s for Metis history)
- When in doubt, open the file page and read the description

### 4. Collect Metadata for Each Photo
For each verified photograph, gather:
- **Title** — short descriptive name
- **Date** — when the photo was taken
- **Description** — what the photo shows (1-2 sentences)
- **Location** — geographic area/settlement name
- **Latitude & Longitude** — either embedded GPS from EXIF or community/settlement coordinates
- **License** — CC-BY-SA, CC-BY 2.0, Public Domain (avoid "Non-free")
- **Source** — Wikimedia Commons, Library and Archives Canada, Flickr, etc.
- **Attribution** — photographer or contributor name
- **Filename** — consistent naming scheme (e.g., MET001.jpg)

Sources for coordinates:
- Wikimedia EXIF GPS (via `imageinfo` API `iiprop=extmetadata`)
- Community/settlement central coordinates (for historic photos without embedded GPS)
- Wikidata location data linked to Commons files

Step 5. Download Strategy (Avoid Rate Limits)
**CRITICAL**: Wikimedia aggressively blocks automated downloads from cloud environments, and the cloud sandbox IP is particularly aggressive about blocking.

- **Preferred: Download on user's PC directly** — If the user has WSL2 or a cloud sandbox with PC access, files can be saved to `/mnt/c/Users/...` paths and appear directly in their Windows file system. This bypasses all cloud rate limits.
- **Alternative 1**: Deliver via `MEDIA:` tags in chat for direct download
- **Alternative 2**: Create a PowerShell script that the user runs locally to batch download
- **Alternative 3**: Bundle into a zip for batch delivery:
  ```python
  import zipfile, os
  with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
      for f in images:
          z.write(f, os.path.basename(f))
  ```
- **If downloading from cloud sandbox**: the IPs are heavily rate-limited by Wikimedia. Use thumbnail URLs (`/thumb/FILENAME/800px-FILENAME.jpg`) which have higher rate limits. Use **15+ second delays** between requests. Always verify downloaded files are >5KB (smaller = HTML error page meaning you were blocked).
- **When cloud sandbox is fully blocked** (HTTP 429 even with delays on thumbnail URLs): stop trying. Switch to browser-based search to find and verify URLs, then deliver as MEDIA attachments or provide a local download script.

Always verify downloaded files are >5KB (smaller = HTML error page).

### 6. Deliver to the User
**IMPORTANT**: Files are stored on the cloud server, NOT on the user's local computer.

- Deliver images via `MEDIA:` tags in chat for direct download
- Bundle into a zip for batch delivery:
  ```python
  import zipfile, os
  with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
      for f in images:
          z.write(f, os.path.basename(f))
  ```
- Include a CSV file with the metadata schema:
  ```
  photo_id,title,date,description,location,latitude,longitude,license,source,attribution,filename
  ```
- Explain clearly that files are on the cloud server and must be downloaded from the chat to appear on their PC

### 7. Coordinate Assignment for Historic Photos Without GPS
For historic photos (1800s-1910s) that lack embedded GPS, use the settlement/community center coordinates:

| Community | Lat | Lon | Notes |
|-----------|-----|-----|-------|
| Batoche SK | 52.7547 | -106.1181 | Site of 1885 resistance |
| Red River Settlement | 49.8950 | -97.1385 | Modern Winnipeg area |
| St. Boniface Winnipeg | 49.8844 | -97.1156 | Historic Metis heartland |
| St. Norbert MB | 49.7028 | -97.1558 | Early agricultural settlement |
| St. Laurent SK | 51.1667 | -106.6167 | River lot settlement |
| Duck Lake SK | 52.7667 | -106.2167 | Important Metis community |
| Paddle Prairie AB | 57.7590 | -117.6120 | One of 8 Alberta settlements |
| Pembina/Turtle Mountain ND | 48.5000 | -98.0000 | Post-1870 migration area |
| Upper Fort Garry | 49.8890 | -97.1300 | 1869-70 Resistance site |
| Fort Dufferin MB | 49.0833 | -97.1000 | Trading post/border crossing |

## Pitfalls

1. **Wikimedia rate limits (HTTP 429)** — Triggers after ~10 bulk downloads. Mitigate with browser-based download, longer delays, or switching to thumbnail URLs.
2. **404 on API-discovered files** — File names from the API search don't always correspond to actual files. Always verify by checking the file page.
3. **Cloud server vs local PC** — Files saved on the cloud server are invisible to the user's Windows File Explorer. Always explain: "Files are on my server, download from this chat to get them on your PC."
4. **Small file sizes (<5KB)** — Indicates HTML error page, not a real image. Check size before assuming success.
5. **Paintings vs photos** — Many "historic" results are paintings or engravings. Read descriptions carefully; look for "photograph", "photo", or check for camera/exif data.
6. **Flickr searches yield nothing** — Flickr's CC search is sparse for specific historic topics. Better to use Wikimedia Commons or Library and Archives Canada.

7. **Empty Commons categories for small communities** — Many small Métis settlements have empty Wikimedia Commons categories (e.g., Lac Ste. Anne, Oak Point MB, Pine Creek MB). Don't waste time scraping these — check the Wikipedia article for embedded images or broaden the search to related locations/settlement names.

## Quality Checklist
- [ ] All files are actual photographs (not paintings, maps, illustrations)
- [ ] All files downloaded successfully (>5KB each)
- [ ] Each photo has: title, date, description, location, lat, lon, license, source, attribution
- [ ] CSV includes photo_id matching filename for easy linkage
- [ ] Licenses are open (Public Domain or CC — not "Non-free")
- [ ] User understands files are on cloud server and must download via chat
- [ ] At least 3-4 diverse locations represented (not all from one site)
