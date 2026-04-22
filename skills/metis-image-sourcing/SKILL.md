---
name: metis-image-sourcing
description: Sourcing and linking open-source historical images for Red River Metis Homeland map - 228 settlement locations
category: research
---

# Metis Heritage Image Sourcing

Use this when sourcing open-source historical images for the 228 Red River Metis settlement locations for the interactive homeland map.

## Environment Constraints

- **Cloud sandbox IP is rate-limited** by Wikimedia Commons after ~100 API calls (429 errors)
- **CDN permanently blocks the sandbox IP** after ~100 combined search+download requests — even with aggressive 25s delays, HTTP 429 persists and does NOT recover. Message: "contact noc@wikimedia.org"
- **Web search tool returns 400 errors** on the WhatsApp/gateway session
- **Browser search pages work fine** — no rate limiting on page loads, only on programmatic API/download calls
- **Canadian government archives block cloud IPs** (Library and Archives Canada, Archives of Manitoba)

## Research Pipeline (Location Verification + Image Metadata)

**Problem**: `web_search` and `web_extract` are broken (HTTP 400). Cannot search the web normally.

**Working solution**: Use `execute_code` with a single Python script that calls three reliable APIs in sequence — all free, no API keys needed:

```python
# 1. Wikipedia API — search for location + extract article + coordinates
WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"
# Searches: "Metis {location} settlement OR history"
# Extracts: title, text extract, lat/lon from page coordinates

# 2. OpenStreetMap Nominatim — verify/lookup coordinates
OSM_API = "https://nominatim.openstreetmap.org/search"
# Queries: "Metis {location}" then falls back to bare location name
# Filters: lat 45-65, lon -120 to -80 (Western Canada bounding box)

# 3. Wikimedia Commons API — find historical images (metadata only, no downloads)
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
# Searches: "filetype:image historic {location} OR old"
# Returns: image URLs, thumbnails, dimensions, MIME types
```

**Important**: The `execute_code` sandbox is **ephemeral** — files don't persist between calls. You MUST do research, processing, and file output (HTML/CSV) in a single script execution. For large batches (>50 locations), use a 5-minute timeout and save progress incrementally.

**Typical success rate**: ~94% of Metis settlements get verified coordinates from Wikipedia+OSM. ~40% have Wikimedia Commons images.

## HTML Map Generation Pipeline

**Complete flow**: research data → Python script → self-contained HTML map file

Key features of the map (using Leaflet.js):
- Location pins with color coding (red=settlements, purple=trading, green=hunt)
- Click any pin → popup with name, description, coordinates, and embedded images
- Click any image → full-screen overlay for detailed viewing
- Toggleable layers (built dynamically from CSV data)
- Search bar to filter locations by name
- Trails rendered as colored dashed polylines (orange=cart, blue=boat) with popup descriptions

**Critical pitfall**: When embedding Python data into JavaScript inside an f-string, JavaScript curly braces `{}` conflict with Python f-string `{}` syntax. Solutions:
- Option A: Build HTML with string concatenation (data + template separately)
- Option B: Use `"""` triple-quoted strings with `.format()` instead of f-string
- Option C: Write JSON to separate file, load via JavaScript fetch
- Option D (BEST): Use f-string with `{{` and `}}` to escape JS braces

## Full Research-to-Wiki Consolidation Pipeline (April 2026)

When given 228+ locations with enriched data, follow this pipeline:

### Step 1: CSV Master File
Load `Settlements_and_locations.csv` from `RAW/CSV Data/`. This is the single source of truth. Archive old CSVs to `RAW/CSV Data/archive/`.

### Step 2: Image Metadata Search via Wikimedia API
**IMPORTANT**: Direct Python `requests` to Wikimedia Commons API **DOES work for metadata searches** — it only fails for downloading actual image files. Use this to get image URLs, titles, dimensions:

```python
# Search Wikimedia Commons via API (works!)
url = "https://commons.wikimedia.org/w/api.php"
params = {
    "action": "query",
    "generator": "search",
    "gsrsearch": f"filetype:image {location_clean_name}",
    "gsrnamespace": "6",
    "gsrlimit": 3,
    "prop": "imageinfo",
    "iiprop": "url|extmetadata|size|mime",
    "iiurlwidth": "800",
    "format": "json"
}
```

Save results to `outbox/IMAGE_SEARCH_RESULTS.json`. Typical yield: ~87% of locations get at least one image URL. 228 locations → ~580 images.

### Step 3: Download Working Images
Direct downloads from sandbox are BLOCKED (HTTP 429). But the API returns valid URLs you can:
- Embed as direct `<img src="...">` links in HTML (browser loads them, sandbox doesn't need to download)
- Link in Obsidian wiki pages as `[View on Wikimedia Commons](url)`
- For actual downloads: only works from user's residential PC — generate PowerShell script

### Step 4: Build Combined Image Manifest
Create `RAW/Photos/COMBINED_MANIFEST.json` mapping each location to its image URLs. Include both Wikimedia URLs and any local photos already in `RAW/Photos/`.

### Step 5: Update All 228 Wiki Pages
For each location page in `wiki/Locations/`:
1. Match CSV row to wiki page by normalizing the filename (strip periods, parens, special chars, collapse to lowercase)
2. Write complete markdown with: YAML frontmatter (tags, priority, type, founded, rights_context, story_theme), Description, Heritage Story, Key Historical Events (bulleted), Key Families (wiki-linked), Metis Rights Context, Visiting Today, Historical Images section with `![[RAW/Photos/filename.jpg|400]]` embeds for local photos and URL links for Wikimedia images
3. End with `[[Interactive_Homeland_Map|...]]` and `[[Red River Métis Settlements|← Back]]` links

### Step 6: Rebuild HTML Map
Update the HTML popup templates to include:
- Description section (always first, bold)
- Heritage Story section
- Key Events, Key Families, Metis Rights, Visitor Access sections
- Local image embeds: `src="./../../RAW/Photos/{filename}"`
- Write to `Heritage Centre/Interactive_Homeland_Map.html`, `outbox/maps/`, and `99-Projects/`

### Step 7: Set Up Web Server
Create `start-map-server.sh` and `start-map-server.bat` that:
- Kill existing process on port 8000
- `python3 -m http.server 8000 --bind 0.0.0.0` from the Heritage Centre folder
- User can then access map from phone on same WiFi via `http://<WINDOWS_IP>:8000/Interactive_Homeland_Map.html`

**File delivery**: The `~/99-Projects` folder exists on the user's actual machine. Writing to `~/99-Projects/filename.html` puts the file directly where the user can double-click to open it. Also available: `/home/bayard_devries/Documents/metis_research/` for research outputs.

## Tool Status (Updated April 4, 2026)

**BROKEN tools (HTTP 400 errors):**
- `web_search` — HTTP 400 errors on ALL sessions (main + delegate). The search service is down or misconfigured. Do NOT retry.
- `web_extract` — HTTP 400 errors on ALL sessions. Confirmed broken.

**PARTIAL tools:**
- `delegate_task` — WORKS for simple bounded tasks with clear endpoints. FAILS when sub-agents rely on broken tools (web_search). A delegate that uses `web_search` will fail. A delegate that uses `terminal` or `browser` will succeed.
- `terminal` / `execute_code` — work but have 5-minute sandbox timeout

**Reliable tools:**
- `browser_navigate` + `browser_get_images` + `browser_vision` — works perfectly, no rate limiting on page loads
- `execute_code` — Python via urllib to Wikipedia API works perfectly (confirmed: search + extract both return valid data)
- File operations via WSL mount (`/mnt/c/...`) — works perfectly for reading/writing to PC

**Current working state:**
- `browser_navigate` + `browser_get_images` + `browser_vision` — **WORKS** but slow (one page at a time)
- `execute_code` — **WORKS** for file manipulation, data processing, HTML generation
- `terminal` + `execute_code` — Python downloads from CDN are rate-blocked, but file operations via `/mnt/c/...` to PC mount works perfectly

**Only viable workflow: Browser → Collect URLs → PowerShell on PC**
1. Navigate to Commons search pages via browser (not rate-limited)
2. Use `browser_get_images` to see thumbnails (identifying real photos vs PDFs)
3. Click on actual photo files to get the full-resolution CDN URL
4. Save all URLs to JSON file
5. Generate PowerShell download script → user runs on their PC

## Recommended Workflow (Updated)

1. **Browser search via delegation → collect URLs → PowerShell download** (PREFERRED):
   - Delegate 5-10 locations per subagent with `toolsets=["browser"]`
   - Subagent searches Commons, verifies real photos (not PDFs), saves URLs to JSON
   - Generate PowerShell script from collected URLs
   - User runs script on their PC — instant downloads from residential IP

2. **Direct API approach DOES NOT work:**
   - Cloud sandbox IP is permanently rate-limited by Wikimedia CDNs
   - Even 25-second delays between downloads trigger HTTP 429
   - Do NOT use urllib/requests for Commons downloads from this environment

3. **WSL mount paths for direct PC access:**
   - `/mnt/c/Users/Bayard devries/Documents/...` writes to Windows filesystem
   - Use this to deliver PowerShell scripts and tracking files
   - The cloud sandbox can write files TO the PC mount, but cannot download FROM Wikimedia CDN

## False Positives to Avoid

- **"St. Laurent Ferry" photos are Saskatchewan** (St. Laurent de Grandin on the South Saskatchewan River), NOT the Manitoba Métis settlement at Fond du Lac on Lake Manitoba. These ferry crossing photos (5+ on Commons) are the #1 trap for the St. Laurent search.
- **Red River Settlement / Winnipeg photos** are interesting Métis context but are NOT specific settlement photos — use as supplementary only.
- **Duck Bay** returns bird/nature papers about Lake Winnipegosis, not settlement photos. Also risk of Duck Bay, Scotland false positives.
- **La Grenouillère / Frog Plain** returns only historical PDFs/djvus on Commons, no photos.
- **La Grenouillère / Frog Plain** returns only historical PDFs/djvus on Commons, no photos.
- **Lac Ste. Anne is in Alberta, not Manitoba.** Searching "Lac Ste Anne Manitoba" returns generic Manitoba documents. Use "Lac Ste Anne Alberta" or "Lac Ste Anne pilgrimage" for relevant results.
- **Oak Point Manitoba** returns mostly Killarney campground photos (Oak Point Provincial Park), not the Métis settlement. Try "Oak Point Red River" or "Oak Point St Francois Xavier" for heritage context.

## Batch Search Tracking

Batch file at `/home/bayard_devries/Documents/metis-research-vault/Heritage Centre/image_search_batch.txt` tracks current batch (1-6). Each run processes 5 locations, then increments the batch number (6→1 to cycle). Updated with `echo -n N > path` to keep file size minimal.

## PDF Thumbnail Trap — CRITICAL

- Expect 0 images 60-80% of the time
- Commons focuses on notable landmarks, not small communities
- Generic "Manitoba" or "Prairie" photos may show the region but not the specific settlement
- Be honest in results: report "no verified images" rather than forcing generic matches

## Search Strategy Refinements

When adding region keywords (Manitoba/Saskatchewan/Alberta), try multiple query orderings:
- `LocationName Manitoba` (standard)
- `LocationName Saskatchewan` (alternative)
- `"Location Name"` (exact phrase, fewer results but more specific)
- `LocationName historic` / `LocationName historic photo` / `LocationName church`
- For French names: try `LocationName` AND `LocationName` (with/without accents)
- For settlements known by multiple names: search ALL known names (e.g., Grantown + St François Xavier + White Horse Plains)
- St. François Xavier = White Horse Plains: the search term "White Horse Plains Manitoba" returns the historic "Buffalo Meat Drying, White Horse Plains, Red River" photo — confirmed Métis activity

## License Extraction Quick Tip

Use the Email link mailto: URL on image file pages to get license info fast. The body contains the attribution string:
```
mailto:?subject=ImageName&body=https%3A%2F%2Fcommons...%0A%0AAuthor, License, via Wikimedia Commons
```
Parse the attribution portion for license type (CC BY-SA 3.0, CC0, Public domain, etc.).

## Automated Search Limitations — CRITICAL UPDATE (April 5, 2026)

### What DOES NOT work for image sourcing (confirmed failures):

1. **Library and Archives Canada (BAC) Collection Search** — The search interface at `recherche-collection-search.bac-lac.gc.ca` requires JavaScript interaction that browser automation cannot trigger. The page loads the search UI but clicking the Search button times out or fails. **Do NOT attempt to automate BAC searches.**

2. **Archives of Manitoba website** — Old URL patterns (`www.gov.mb.ca/chc/archives/_docs/...`) now redirect to 404. The new Canada.ca structure is also difficult to automate. **Manual browsing required.**

3. **Flickr API search for obscure Metis locations** — Returns almost entirely irrelevant false positives. "Brandon House" returns nothing, "Birsay" returns random Orkney island photos, "Desjarlais" returns airplane photos. **Flickr search is useless for niche historical Metis terms.**

4. **Wikimedia Commons API for the hardest 30 locations** — Already confirmed in prior runs. These 30 locations are genuinely too obscure for any digital archive. They need manual research at physical archives.

### What the automated search CAN do:
- **~87% of locations (198/228)** get Wikimedia Commons image URLs via API
- **~15% of locations (31/228)** have actual local photos in `RAW/Photos/`
- **~13% of locations (30/228)** have NO digital images available anywhere — these need archive research

### The realistic ceiling:
You WILL NOT find images for these types of locations through any digital search:
- Road allowance communities (1950s-1980s) — rarely photographed, no institutional documentation
- Pre-1880 trading posts — photography technology was limited or non-existent
- Flooded/displaced communities — destroyed before photography was common
- Small family settlements with <100 residents — too small for any photographer to visit
- Metis-specific names for places documented under different colonial names

**Accept this ceiling.** The `outbox/IMAGE_SOURCING_GUIDE.md` provides manual archive research paths for the remaining 30 locations. For road allowance and extremely obscure locations, consider commissioning contemporary site photography or using period illustrations of similar settlements.

## File Naming Convention

Images saved as: `{Location Name}.jpg`
Example: `Upper Fort Garry.jpg`, `Seven Oaks (Sept Chenes).jpg`

## Obsidian Vault Integration

**Location:** `C:\Users\Bayard devries\Documents\metis-research-vault\`

**Structure (as of April 5, 2026):**
- `wiki/Locations/` — 228 location .md pages (names match CSV Location Name with periods, parens, slashes stripped)
- `wiki/Regions/` — 18 regional MOC pages
- `wiki/Families/` — Family pages (not fully populated)
- `wiki/Map Layers/` — Map layer pages
- `wiki/Rights Contexts/` — Rights context pages
- `wiki/Story Themes/` — Story theme pages
- `MOC/` — 7 Maps of Content indices (Home, Regions, Families, Settlements, Land Rights, Map Layers, Story Themes)
- `RAW/CSV Data/` — Master CSV at `Settlements_and_locations.csv` (447 KB, 228 rows)
- `RAW/CSV Data/archive/` — Old incremental versions
- `RAW/Photos/` — Historical images + MANIFEST.json + COMBINED_MANIFEST.json
- `Heritage Centre/Interactive_Homeland_Map.html` — Main map file
- `outbox/` — Generated maps, images, reports, data exports
- `inbox/` — Empty, ready for user uploads
- `Templates/Location.md` — Template for new location pages

**Location page naming:** Filenames strip periods, parentheses, quotes, commas. Example: CSV "St. François Xavier" → file "St Francois Xavier.md". Matching logic: normalize both CSV name and filename by removing all punctuation, lowercasing, and comparing.

**Location page template:**
```markdown
---
tags: [location, {layer-tag}, {region-tag}]
priority: "{High|Medium|Low}"
type: "{community type}"
founded: "{date}"
rights_context: "{rights text}"
story_theme: "{theme text}"
---

# {Location Name}

**Type:** {type}
**Founded:** {founded}
**Region:** [[{region}]]
**Priority:** {priority}

## Description
{Description from CSV}

## Heritage Story
{Expanded narrative from CSV Story field}

## Key Historical Events
- {event 1}
- {event 2}

## Key Families
[[{Family (family)|Name]]

## Metis Rights Context
{rights context from CSV}

## Visiting Today
{access info from CSV}

## Historical Images
![[../../RAW/Photos/{filename}|400]]
[View on Wikimedia Commons]({url})

---
**[[Interactive_Homeland_Map|View on Interactive Metis Homeland Map]]**
**[[Red River Métis Settlements|← Back to Settlements Index]]**

## PowerShell Download Script

Always deliver as a working `.ps1` file the user runs on their PC. The script should:
- Create output directories if missing
- Download images from Wikimedia CDN (no rate limits from residential IP)
- Save to both Obsidian vault folder and research folder
- Report success/failure with file sizes
- Use `-ErrorAction Continue` so it doesn't stop on failed downloads

## Tracking Files

- `~/Documents/metis_research/verified_image_urls.json` — all verified URLs with metadata
- `~/Documents/metis_research/image_tracking_status.csv` — status per location
- `~/Documents/metis_research/archive_search_guide.json` — prioritized search guide for HIGH priority locations
- `download_images.ps1` — PowerShell script for user's PC
- Image tracking dashboard in Obsidian vault: `99-Projects/image-research/Image Tracking Dashboard.md`

## Archive Sources (in order of priority)

1. Wikimedia Commons (commons.wikimedia.org)
2. Library and Archives Canada (collectionscanada.gc.ca)
3. Archives of Manitoba (manitoba.ca/archives)
4. Metis Nation Historical Society (metisnation.ca/history)
5. Saskatchewan Archives (saskarchives.com)
6. Flickr Commons (flickr.com/commons)

## PC Paths

- User PC vault: `/home/bayard_devries/Documents/metis-research-vault/` (WSL path)
- User PC vault (Windows): `C:\Users\Bayard devries\Documents\metis-research-vault\`
- Research data: `/home/bayard_devries/Documents/metis_research/` (old location, some data still here)
- WSL access: `/home/bayard_devries/Documents/metis-research-vault/`
- 99-Projects: `/home/bayard_devries/99-Projects/` (copy of map also saved here)

## File Matching Logic for Wiki Pages

Filenames in `wiki/Locations/` strip periods, parentheses, quotes, commas from the CSV Location Name. 

Matching algorithm:
```python
def norm(name):
    n = name.lower()
    n = re.sub(r"[^\w\sÀ-ÿ]", '', n)  # remove punctuation except accents
    n = n.replace(' ', '').replace('-', '').replace("'", '')
    return n

# Compare:
#   CSV: "St. Boniface" → norm: "stboniface"
#   File: "St Boniface.md" → norm: "stboniface"
#   MATCH ✓
```

228/228 locations match with this logic.

## PowerShell Download Template

```powershell
$images = @(
    [PSCustomObject]@{ Filename = "Batoche.jpg"; Url = "https://..." },
    # ...
)
foreach ($img in $images) {
    Invoke-WebRequest -Uri $img.Url -OutFile "C:\Users\Bayard devries\Documents\metis_research\images\$($img.Filename)"
}
```
