---
name: notebooklm-to-obsidian-analysis
description: Extract, analyze, and cross-reference legacy journals exported from Google NotebookLM (.docx) with existing Master Journal data. Saves comprehensive analysis to Obsidian vault.
---

# NotebookLM to Obsidian Analysis

When user drops a legacy journal (NotebookLM export) into their inbox folder, follow this pipeline.

## Context

- Inbox path: `/home/bayard_devries/inbox/`
- Master Journal path: `/home/bayard_devries/inbox/master_journal.txt` (already extracted)
- Obsidian vault: `/mnt/c/Users/Bayard deVries/Documents/MMF Research/MMF Research/`
- Vault structure is PRE-EXISTING with numbered folders (00-Home through 99-Projects). NEVER overwrite this structure.

## Step 1: Extract .docx

docx files are zip archives containing XML. Extract with Python:

```python
import zipfile, re
docx_path = '/home/bayard_devries/inbox/[filename].docx'
with zipfile.ZipFile(docx_path) as z:
    if 'word/document.xml' in z.namelist():
        xml = z.read('word/document.xml').decode('utf-8')
        text = re.sub(r'<[^>]+>', '', xml)
        text = re.sub(r'\s+', ' ', text).strip()
        with open('/home/bayard_devries/inbox/[output].txt', 'w') as f:
            f.write(text)
```

## Step 2: Analyze Both Journals Together

```python
import re
with open('/home/bayard_devries/inbox/legacy.txt') as f:
    legacy = f.read()
with open('/home/bayard_devries/inbox/master_journal.txt') as f:
    recent = f.read()
combined = legacy + '\n\n\n=== MASTER JOURNAL ===\n\n' + recent

# Count themes, dates, people, projects, emotional terms
# Cross-reference findings
```

Key analysis dimensions:
- Date ranges covered by each journal
- People mentioned (frequency ranking)
- Projects mentioned (frequency + status)
- Emotional language (anxiety, stress, frustration mentions)
- Financial amounts and funding sources
- Unresolved items tracking
- Team dynamics patterns

## Step 3: Save Unified Analysis

Save to Obsidian vault at:
`99-Projects/Complete Work History Analysis.md`

Include:
- Timeline overview combining both journals
- Major projects ranked by priority
- Team dynamics analysis
- Financial/funding summary
- Recurring themes
- Unresolved items
- Contact/partner directory

## Pitfalls

- docx extraction via zipfile only works for standard .docx (not .doc)
- Memory is tight -- don't try to save large journal content to memory
- NotebookLM exports may include image URLs (lh3.googleusercontent.com) -- ignore these
- Preserve ALL existing vault folders -- never create conflicting structures
- The legacy file is typically much smaller than the Master Journal -- don't assume equal weight