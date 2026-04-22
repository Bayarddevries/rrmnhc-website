---
name: web-research-delegation-recovery
description: A procedural recovery pattern for bypassing direct web tool failures by delegating research to a subagent with an independent web session.
tags: [recovery, web-search, delegation, troubleshooting, research]
---

# web-research-delegation-recovery

## Overview
When the primary agent's direct web tools (`web_search`, `web_extract`) encounter persistent technical failures (HTTP 400, 502, timeouts, or non-JSON responses), this skill provides a way to recover by delegating the research to a subagent. Subagents run in isolated sessions and may bypass session-specific tool limitations or gateway errors.

## When to Use
- **Persistent 400/502 Errors**: The `web_search` tool returns error messages instead of results.
- **Search Failures**: The tool consistently returns empty sets despite valid queries.
- **Extraction Timeouts**: `web_extract` fails to retrieve content from multiple target URLs.
- **Tool Instability**: Intermittent failures that prevent complex, multi-step research workflows.

## Recovery Procedure

### 1. Diagnosis
Confirm the failure is technical and not query-related. 
- If the error is a `400 Bad Request`, it is a tool/gateway failure.
- If the error is a `403 Forbidden`, the target site may be blocking the agent's specific crawler.

### 2. Delegate Task
Do NOT attempt to retry the same tool in the same session more than twice. Instead, use `delegate_task`.

**Subagent Configuration:**
- **Toolsets**: Must include `['web']`.
- **Goal Construction**: The goal must be a "self-contained research brief." 
    - **Bad Goal**: "Search the web for Métis quotes."
    - **Good Goal**: "Research and find 5-10 verified, cited quotations from prominent Métis figures (e.g., Louis Riel, Gabriel Dumont). For each quote, include: 1) The exact text, 2) Full academic citation (source, page, year), 3) Historical context, and 4) Whether it is a translation from Michif or French."

### 3. Integration
Once the subagent returns the research summary:
1. **Validate**: Ensure the subagent's results meet the required quality/citation standards.
2. **Synthesize**: Map the subagent's findings back to the original task (e.g., writing a new `.md` file in the vault or updating an existing one).
3. **Document**: If this was a significant failure, note the tool instability in the `99-Project-Management/` logs if relevant.

## Pitfalls
- **Redundancy**: Do not delegate simple tasks that *can* be solved by fixing a malformed query.
- **Over-reliance**: Use delegation as a recovery mechanism, not as the default way to search.
- **Context Loss**: Ensure the subagent's `goal` contains *all* necessary context, as it cannot see the previous conversation history.
