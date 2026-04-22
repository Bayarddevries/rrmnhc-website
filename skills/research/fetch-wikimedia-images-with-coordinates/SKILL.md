---
name: fetch-wikimedia-images-with-coordinates
description: Retrieve open‑license images from Wikimedia Commons that contain latitude/longitude metadata.
---
# Purpose
This skill queries Wikimedia Commons for files matching a search term, extracts GPS coordinates from the file metadata, filters for open‑license content, and returns a JSON array with useful fields (title, description, license, thumbnail URL, full image URL, latitude, longitude).

# Prerequisites
- Internet access.
- Python 3 with the `requests` library (available in the default environment).

# Steps
1. **Search for files** in the File namespace:
   ```python
   def search_files(query, limit=200):
       url = "https://commons.wikimedia.org/w/api.php"
       params = {
           "action": "query",
           "format": "json",
           "list": "search",
           "srsearch": query,
           "srnamespace": "6",  # File namespace
           "srlimit": str(limit),
           "utf8": "1",
       }
       resp = requests.get(url, params=params, timeout=20)
       return resp.json().get('query', {}).get('search', [])
   ```
2. **Fetch image metadata** (including EXIF GPS fields):
   ```python
   def get_metadata(title):
       url = "https://commons.wikimedia.org/w/api.php"
       params = {
           "action": "query",
           "format": "json",
           "titles": title,
           "prop": "imageinfo",
           "iiprop": "extmetadata|url",
           "iiurlwidth": 200,
       }
       resp = requests.get(url, params=params, timeout=20)
       pages = resp.json().get('query', {}).get('pages', {})
       for page in pages.values():
           info = page.get('imageinfo', [{}])[0]
           meta = info.get('extmetadata', {})
           lat = meta.get('GPSLatitude', {}).get('value') or meta.get('Latitude', {}).get('value')
           lon = meta.get('GPSLongitude', {}).get('value') or meta.get('Longitude', {}).get('value')
           license = meta.get('License', {}).get('value')
           description = meta.get('ObjectName', {}).get('value') or meta.get('ImageDescription', {}).get('value')
           return {
               "title": title,
               "description": description,
               "license": license,
               "lat": lat,
               "lon": lon,
               "thumb": info.get('thumburl'),
               "url": info.get('url'),
           }
   ```
3. **Combine search and filter**:
   ```python
   def fetch_images(search_query, desired_count=15, limit=200):
       results = search_files(search_query, limit=limit)
       images = []
       for item in results:
           meta = get_metadata(item['title'])
           if meta and meta['lat'] and meta['lon']:
               lic = meta['license'] or ""
               if "non-free" not in lic.lower():
                   images.append(meta)
           if len(images) >= desired_count:
               break
       return images
   ```
4. **Run the function** with your parameters, e.g.:
   ```python
   search_query = "Metis settlement"
   imgs = fetch_images(search_query, desired_count=15)
   print(json.dumps(imgs, indent=2))
   ```

# Tips & Pitfalls
- Not all Commons files have GPS metadata; you may need to broaden the search term or increase the `limit`.
- The license check filters out entries containing the word `non-free`. For stricter control, verify that `license` contains `CC‑BY` or `pd`.
- The API may throttle large requests; keep `limit` reasonable (≤ 500) and consider adding a short sleep between calls if needed.
- Verify relevance of returned images – the API can return satellite imagery or unrelated maps.

# Verification
After running, each entry in the returned list should have non‑null `lat` and `lon` fields and a permissive `license` (e.g., `cc-by-sa-4.0` or `pd`).

# References
- Wikimedia Commons API: https://www.mediawiki.org/wiki/Commons/API
- Extmetadata documentation: https://www.mediawiki.org/wiki/Extension:Metadata#Extmetadata
---