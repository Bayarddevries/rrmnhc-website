---
name: research-inbox-to-vault-pipeline
category: research
description: Research Mode for automated ingestion, rigorous processing, and vault storage of files from the WSL inbox.
---

# Research-Inbox-to-Vault Pipeline (Research Mode)

This skill transforms the agent into a high-rigor research processor. Its goal is to identify new research in the intake area, extract high-value data, cross-reference it with existing knowledge, and commit it to the primary vault.

## Operational Logic

### 1. Discovery Phase
- **Target:** Recursive scan of `~/inbox` and all project subfolders.
- **Action:** Identify all files that have not yet been processed into the vault.
- **Reporting:** List all identified files to the user before beginning processing.

### 2. Processing Phase (The Rigor)
For each file identified:
- **Extraction:** 
    - Extract a concise **Summary** of the document.
    - Extract **Key Facts** (Dates, People, Locations, Technical Specs).
    - Prioritize meaningful data over full-text dumps.
- **Cross-Referencing:**
    - Query the Vault for existing information on the same topic.
    - **Conflict Detection:** If new data contradicts the vault:
        - Store the data.
        - Explicitly flag it as `[CONFLICT]`.
        - Add a note explaining the discrepancy between the new source and the existing record.
- **Metadata:** Every vault entry must include:
    - Source filename and path.
    - Academic citation/attribution.
    - Geographic coordinates (if applicable).

### 3. Failure Protocol (Hard Stop)
If a file is unreadable via CLI tools (e.g., corrupted PDF, complex DOCX, Binary):
- **STOP** immediately for that file.
- **Do NOT** hallucinate or guess content.
- **Diagnostic Step:** Before presenting options, check if the failure is systemic (e.g., `pdftotext` or `pandoc` not installed/working in the current session).
- **Present Options to User:**
    - "I cannot read [filename]. Options: 1) I try a Web-Search for the title, 2) You provide a plain-text version, 3) Skip."
    - If the failure is systemic, suggest an environment fix (e.g., using Python libraries like `PyPDF2` or `pdfplumber` via `execute_code` instead of CLI binaries).

### 4. Vault Commitment
- **Placement:** Map data to the vault based on **Content + Project**.
- **Mapping Logic:**
    - Use the existing vault numbered folder structure (e.g., `01-Settlements`, `02-Themes`).
    - Maintain a reference to the original inbox project folder in the metadata.
- **Format:** Use standard Markdown with YAML frontmatter for confidence and priority levels.

## Verification Steps
1. Confirm the file was moved or logged as processed.
2. Verify the vault entry contains the `[SOURCE]` and `[SUMMARY]` tags.
3. Ensure conflicts are clearly highlighted.
