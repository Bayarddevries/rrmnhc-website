---
name: metis-research-vault-audit
description: Systematic quality control and consistency audit for the Metis Heritage Research Vault.
tags: [quality-control, audit, sourcing, consistency, heritage-research]
---

# Metis Research Vault Audit Procedure

This skill defines the mandatory quality control (QC) standards for auditing the Metis Heritage Research Vault. The primary goal is to eliminate "Split-Brain" data states and ensure academic rigor.

## 🎯 Audit Objectives
1. **Truth Synchronization**: Ensure "Golden Sources" (Evidence Ledgers) match "Implementation Trackers" (Connectivity/Project files).
2. **Sourcing Integrity**: Identify and flag non-academic citations (e.g., social media, unverified blogs).
3. **Structural Compliance**: Verify the presence of the 'Data Gaps & Colonial Record' section in all research files.
4. **Technical Standardization**: Ensure coordinates are stored as ordered JSON-style arrays `[[lat, lng], [lat, lng]]` rather than descriptive text or arrows.

## 🛠️ Audit Workflow

### Step 1: Cross-Reference Mapping
- Compare `Sourced_Trail_Evidence.md` (The Truth) against `RESEARCH_CART_TRAILS_CONNECTIVITY.md` (The Tracker).
- **Red Flag**: If a trail is "Verified" in Evidence but "Searching/TBD" in Connectivity, this is a **High Priority Split-Brain Error**.

### Step 2: Citation Forensic Scan
- Scan all `.md` files for source citations.
- **Red Flag**: Any citation referencing "Facebook", "Twitter/X", "Family group chats", or "Personal memory" without a supporting archival link must be flagged with `⚠️ [REPLACE: CITATION UNVERIFIED]`.

### Step 3: Structural Verification
- Check for the existence of the following mandatory sections in research files:
    - YAML Frontmatter (title, category, source_confidence).
    - `## Data Gaps & Colonial Record` (Analysis of archival erasure and bias).
- **Red Flag**: Missing 'Data Gaps' section in any finalized research file.

### Step 4: Coordinate Format Audit
- Search for coordinates using regex to find arrow notation (`->`) or single-point clusters.
- **Requirement**: All route coordinates must be converted to: `[[lat1, lng1], [lat2, lng2], ...]`

## 📋 Remediation Pattern
When errors are found, apply patches in this order:
1. **Sync Truth**: Update trackers to match evidence.
2. **Flag Citations**: Use the `⚠️` tag to mark unstable sources.
3. **Standardize Formats**: Convert coordinate strings to arrays.
4. **Inject Structure**: Append the 'Data Gaps' section based on the specific archival gaps identified during the scan.

## ⚠️ Pitfalls
- **Avoid Over-writing**: When patching, ensure you aren't deleting the 'Sourcing Guidelines' or existing footnotes.
- **Interpolation Warning**: Note when coordinates are interpolated rather than explicitly sourced; this must be documented in the 'Data Gaps' section.
