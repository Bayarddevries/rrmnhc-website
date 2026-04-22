---
name: vault-peer-review-fixes
description: Systematic approach to applying peer review fixes to Metis heritage research vault files - removing bad citations, expanding stubs, standardizing frontmatter, and verifying completeness.
category: research
---

## Trigger Conditions
Apply after a peer review identifies issues in vault markdown files: Wikipedia citations, fabricated sources, factual errors, stub files under 2000 bytes, inconsistent frontmatter, or non-Metis entries in Metis-specific files.

## Workflow

### Phase 1: Audit (don't fix yet)
1. Search all target files for each issue type:
   - `[Ww]ikipedia` in content
   - `metismuseum\.ca` URLs
   - Files under 1500 bytes (stub detection)
   - Missing `created:` or `importance:` in frontmatter
   - Specific flagged claims (e.g., "Half-Breed Scholarship Fund")
2. Document findings with file names and line numbers

### Phase 2: Citation Fixes
1. **Wikipedia citations**: Replace in-text "As documented in Wikipedia..." references by rewriting the claim with an academic source attribution. Then remove from source list. Rewrite the sentence to flow naturally with the academic source.
2. **Fabricated citations**: Remove and replace with verified sources. If claim can't be supported, reframe using general historical narrative with a verified contextual source.
3. **Unverifiable specific claims**: Research the claim. If verifiable, add source. If not, REFRAME the entire section to use verified historical context (e.g., "Half-Breed Scholarship Fund" -> Section 31 scrip system and educational provisions). Do NOT just remove -- rewrite the section to preserve the narrative intent while grounding it in verified facts.

### Phase 3: Content Expansion (Stub Files)
For compound theme stubs under 2000 bytes:
1. Read current content - preserve TLDR, core facts, listed communities, and any existing citations
2. Expand to 2000-5000+ bytes with:
   - 3-4 narrative paragraphs in oral history/interpretive panel voice
   - Historical context specific to the intersection of the two themes
   - Case study examples (named communities, events, people)
   - Connection to academic sources
3. Add sections if missing:
   - `## Related Themes` with wikilinks to connected vault files
   - `## Sources` with academic citations
4. Add `compound-theme` to tags list

### Phase 4: Content Cleanup
1. **Non-Metis entries**: Remove or reframe entries about non-Metis individuals from Metis-specific files
2. **Frontmatter standardization**: Ensure every file has:
   - `tags:` (include `story-theme`, `metis-homeland`, and specific tags; add `compound-theme` for intersection files)
   - `created: 2026-04-06` (or actual date)
   - `importance:` (Low/Medium/High/Very High/Critical)
3. **Patch carefully**: When using patch tool, verify the TLDR block isn't accidentally truncated

### Phase 5: Verification Sweep
Run comprehensive checks:
```bash
# Wikipedia check
grep -rl '[Ww]ikipedia' *.md

# File sizes
for f in *.md; do [ "$f" != "INDEX.md" ] && echo "$(wc -c < "$f") $f"; done | sort -n

# Frontmatter consistency
for f in *.md; do
  if [ "$f" != "INDEX.md" ]; then
    echo "$f | tags:$(grep -c '^tags:' "$f") created:$(grep -c '^created:' "$f") importance:$(grep -c '^importance:' "$f")"
  fi
done

# Specific claim checks
grep -rl 'Half-Breed Scholarship Fund' *.md
```

## Pitfalls
- **Patch truncation**: When replacing frontmatter lines with patch tool, always include the FULL line content in old_string. If old_string only includes part of a line (e.g., just the TLDR text without the full blockquote marker), the patch will truncate the line. Always verify the patched file immediately after with terminal `head` or `cat`.
- **Spaces in filenames**: Shell commands need proper quoting for files with spaces like "Land Dispossession.md". Use `"$f"` not `$f` in bash loops, or better yet, use `find -print0 | xargs -0` or just use Python `os.listdir` instead of shell.
- **read_file caching**: The read_file tool returns cached content if a file was read earlier and supposedly unchanged. After modifying files, use `terminal("head -N file")` to verify current state. Never trust read_file after patching without a fresh terminal check.
- **delegate_task parallelism**: Works excellently for expanding multiple stub files simultaneously (3 at a time). But each subagent may fail silently on web search if sites block extraction - have them use the verified bibliography from the skill. Verify each completed file individually.
- **Frontmatter consistency check at end**: After all patches, run a comprehensive grep loop checking every file for `tags:`, `created:`, and `importance:` fields. Even files that seem fine often have one missing field. Fix each one with a targeted patch.

## Standard Academic Sources
- Ens, Gerhard J. *Homeland to Hinterland*
- Teillet, Jean. *The North-West Is Our Mother*
- Daschuk, James. *Clearing the Plains*
- Sprague, D.N. *Canada and the Metis* / *Manitoba's Land Questions*
- Pannekoek, Frits. *A Snug Little Flock*
- Morton, W.L. *Manitoba: The Birth of a Province*
- Barkwell, Lawrence J. *Metis history works*
- MMF v. Canada (2013 SCC 14)

## Voice Guidelines
- Write in warm, community-focused oral history or interpretive panel voice
- NOT academic dry, NOT AI-generated content
- Center Metis agency and resilience
- Name specific communities, people, and events
- Connect historical injustice to contemporary relevance
