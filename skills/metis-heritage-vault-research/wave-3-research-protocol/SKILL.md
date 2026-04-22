---
name: wave-3-research-protocol
version: 2.1
category: metis-heritage-vault-research
description: Protocol for high-rigor historical data processing in Wave 3 homelands research. Automates inbox/project folder scanning, high-value data extraction (summary + key facts), cross-referencing with vault context, and discrepancy flagging.
---

## Workflow
1. **Data Harvesting**: Scan designated folders (05-Raw Data, 99-Projects, NotebookLM) using file_tools.read()
2. **Extraction**: Use deep-research skill to identify key facts (dates, geographical coordinates, cultural terms) from raw text/docs
3. **Cross-Reference**: Compare against vault databases (04-Map Layers, 02-Themes) using search algorithms
4. **Discrepancy Detection**: Flag conflicts with [CONFLICT] markers
5. **Output**: Structured summary with source tracking (file paths + excerpt)

## Rules
- Raw .docx/binary files = Hard Stop + user options (Web-Search/Manual Plain-Text)
- Coordinates must follow organic terrain (JSON array, no straight lines) to prevent 'lake-cutting'
- Maintain observation bias - never assume historical accuracy without verification

## Required Tools
- `file_tools.read`
- `deep-research`
- `search-client`

## Example Usage
`hermes @mode:wave3 "Audit 05-Raw Data/1890_SettlementRecords.pdf for displacement patterns"`
