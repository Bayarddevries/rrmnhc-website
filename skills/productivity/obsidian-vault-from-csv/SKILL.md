---
name: obsidian-vault-from-csv
description: Transform a structured CSV into a fully-linked Obsidian knowledge base with numbered folder hierarchy, individual pages, Maps of Content (MOCs), and a Home dashboard.
trigger: User has a CSV or spreadsheet of items and wants an Obsidian vault built from the data
keywords: obsidian, vault, csv, knowledge base, markdown, wiki, moc, map of content
---

# Building an Obsidian Vault from CSV Data

## Overview

Transform a structured CSV into a fully-linked Obsidian knowledge base with numbered folder hierarchy, individual pages, Maps of Content (MOCs), and a Home dashboard.

## When to Use

- User has a CSV/spreadsheet with many rows of items
- They want a browsable, cross-referenced collection in Obsidian
- Items can be grouped by 1+ categorical columns (region, type, theme, etc.)
- Output is a zip file delivered to the user

## Process

### Step 1: Read the CSV and audit columns

```python
import csv
csv_path = 'path/to/data.csv'
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    items = list(reader)
print(f"Loaded {len(items)} rows")
print("Columns:", list(items[0].keys()))
```

### Step 2: Define folder structure with number prefixes

Use numbered prefixes on subfolders so they appear in order in Obsidian's file explorer.

```
00-Home/
01-Settlements/01-Region-A
01-Settlements/02-Region-B
...
02-Themes/
03-Families/
04-Map Layers/
05-Raw Data/
99-Projects/
.obsidian/
```

Map CSV column values to folder names via a dict lookup.

### Step 3: Safe filename function (CRITICAL)

CSV values often contain `/`, `:`, `?`, `*` which break file paths:

```python
def safe_filename(name):
    name = name.replace('/', ' ').replace('\\', ' ')
    name = re.sub(r'[<>:"|?*]', '', name)
    return name.strip()
```

**Pitfall:** Forgetting this causes `FileNotFoundError` on rows with slashes in names (e.g. "Fouillard Town (The Corner / Li Kwayn)").

### Step 4: Generate individual pages

Each page needs:
- YAML frontmatter (tags, region, layer, coordinates, priority, etc.)
- Markdown headers for sections
- Tables for key-value pairs
- Related links (same region, same category)
- `clean_html()` function to strip HTML from descriptions

```python
def clean_html(text):
    if not text: return ""
    from html import unescape
    text = unescape(text)
    text = re.sub(r'<[^>]+>', '', text)
    return text.strip()
```

### Step 5: Generate MOCs (Maps of Content)

For each grouping field (region, theme, layer), generate a MOC page with wiki-links to all items in that group.

### Step 6: Generate Home page

Create `00-Home/Home.md` with tables linking to all region MOCs and category pages.

### Step 7: Zip and deliver

```python
shutil.make_archive('/tmp/output', 'zip', '/tmp/vault_dir')
```

## Key Pitfalls

1. **Unsafe filenames** — CSV columns containing `/` or `:` will crash `open()` unless sanitized
2. **Missing parent directories** — `os.makedirs(path, exist_ok=True)` before every write
3. **HTML in CSV fields** — Descriptions often contain `<span>`, `<a>` tags from web exports — strip with `clean_html()`
4. **Empty/None values** — Guard with `if field else "_Not documented._"` fallbacks
5. **Cross-referencing** — To build "same region" links, do a pre-pass collecting all items, then filter during page generation
6. **Delivery** — Deliver as zip via `shutil.make_archive()` and send the file

## Verification

After generation, verify:
- Total files = (items) + (MOCs) + (theme pages) + (layer pages) + (Home)
- All wikilinks use the exact page name (not sanitized filename)
