---
name: wikimedia-commons-image-search
description: Search Wikimedia Commons API for open-source historical images related to heritage locations, verify license validity, handle false positives, and produce a mapped CSV.
trigger: User needs open-source historical images for geographic locations, landmarks, or heritage sites with license verification
keywords: wikimedia commons, historical photos, open source images, heritage photos, image sourcing, CC license, public domain
---

# Sourcing Open-Source Historical Images from Wikimedia Commons

## Overview

Search Wikimedia Commons for open-source historical images tied to specific geographic locations. Key challenge: simple keyword matching produces many false positives — the API searches globally across all uploads, so "Bacon Ridge" matches Kevin Bacon Navy photos, "Baie de Canard" matches an Ontario river, etc.

## Process

### Step 1: Use the Commons Search API

```python
import urllib.request
import json
import urllib.parse

def search_commons(query, limit=10):
    """Search Wikimedia Commons for images (namespace 6 = File namespace)"""
    encoded = urllib.parse.quote(query.encode('utf-8'))
    # Namespace 6 restricts to File: namespace only
    url = f"https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch={encoded}&srwhat=text&srnamespace=6&srlimit={limit}"
    req = urllib.request.Request(url, headers={'User-Agent': 'ProjectName/1.0 (contact)'}
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    return data.get('query', {}).get('search', [])
```

### Step 2: Get image info + license verification

```python
def get_image_info(title):
    """Get image URL and license info for a Commons file"""
    encoded = urllib.parse.quote(title.encode('utf-8'))
    url = f"https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=File:{encoded}&prop=imageinfo&iiprop=url|extmetadata|canonicaltitle&iiurlwidth=800"
    req = urllib.request.Request(url, headers={'User-Agent': 'ProjectName/1.0'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    pages = data.get('query', {}).get('pages', {})
    for page_id, page in pages.items():
        if page_id == '-1': continue
        if 'imageinfo' in page:
            info = page['imageinfo'][0]
            meta = info.get('extmetadata', {})
            license_name = meta.get('LicenseShortName', {}).get('value', 'Unknown')
            # Verify it's actually an open license
            open_licenses = ['CC0', 'CC BY', 'CC BY-SA', 'CC BY 4.0', 'CC BY-SA 4.0',
                            'Public Domain', 'public domain', 'GFDL',
                            'CC BY 3.0', 'CC BY-SA 3.0', 'CC BY 2.0', 'CC BY-SA 2.0']
            is_valid = any(lic.lower() in license_name.lower() for lic in open_licenses)
            return {
                'title': page.get('title', '').replace('File:', ''),
                'url': info.get('url', ''),
                'license': license_name,
                'is_valid': is_valid,
                'artist': meta.get('Artist', {}).get('value', '')[:100],
            }
    return None
```

### Step 3: Multi-query strategy per location

Search 6–8 variants per location to maximize coverage:

```python
queries = [
    f"File:{clean_name}",                    # Direct file match
    f"File:{clean_name} historic",           # Historic qualifier
    f"File:{clean_name} historical",
    f"File:{clean_name} {region_short}",     # Region qualifier
    f"File:{clean_name} {year}",             # Year qualifier if known
    f"File:{clean_name} {type_keyword}",     # Type (fort, church, settlement)
    f"File:{clean_name} Metis",
    f"File:{clean_name} Métis",
]
```

### Step 4: Relevance verification (CRITICAL — avoid false positives)

**The biggest pitfall:** keyword matching finds globally unrelated images. "Bacon Ridge" matches Kevin Bacon. "Balsam Bay" matches a BC street.

```python
def check_relevance(loc_name, image_title, snippet):
    """Check if image is actually about this location"""
    clean_loc = loc_name.lower().replace(' (', ' ').replace(')', '').strip()
    # Extract meaningful keywords (skip short words)
    keywords = [p for p in clean_loc.split() if len(p) > 2 
                and p.lower() not in ('the', 'and', 'for', 'but')]
    
    title_lower = image_title.lower()
    snippet_lower = snippet.lower()
    
    # Require at least 2 keyword matches in title for confidence
    title_matches = sum(1 for kw in keywords if kw in title_lower)
    snippet_matches = sum(1 for kw in keywords[:3] if kw in snippet_lower)
    
    return title_matches >= 2 or (title_matches >= 1 and snippet_matches >= 1)
```

### Step 5: Track results

```python
# Output CSV columns:
# Location_Name, Latitude, Longitude, ..., 
# Image_Count, Image_1_Title, Image_1_URL, Image_1_License, Image_1_Artist,
# Image_2_Title, Image_2_URL, Image_2_License, Image_2_Artist,
# Image_3_Title, Image_3_URL, Image_3_License, Image_3_Artist,
# Research_Notes
```

## Key Pitfalls

1. **False positives on common words** — "Bacon Ridge" → Kevin Bacon US Navy photos. "Balsam Bay" → White Rock BC street. "Battle River Valley" → unrelated US battle area. Always require keyword overlap in BOTH title and snippet.
2. **Namespace restriction** — `srnamespace=6` limits to File: namespace. Without it, you get article results.
3. **Rate limiting** — Sleep 0.2–0.3s between API calls.
4. **License verification** — Always check `extmetadata` for actual license. Many files claim to be open source but have restrictive licenses.
5. **PDF results** — Some Commons results are PDFs, not images. Filter by URL extension (.jpg, .png, .svg, .tif, .webp) if needed.
6. **Progress saving** — Save every N results so if interrupted, resume without re-searching.

## Alternative Sources (when Commons is exhausted)

- Library and Archives Canada (collectionscanada.gc.ca)
- Archives of Manitoba
- Saskatchewan Archives
- University of Manitoba Digital Collections
- Metis Nation Historical Society
- Flickr Commons
- Provincial Heritage Photo Collections

## Expected Hit Rate

For niche Metis settlements: expect 20–30% hit rate from Wikimedia Commons. Major sites (Batoche, Upper Fort Garry, St. Boniface) will have multiple images. Remote road allowance communities likely have zero.
