---
name: robust-web-content-retrieval
description: A systematic approach for retrieving web content when standard tools fail, including self-correction and fallbacks for specific site types like GitHub.
---
# Robust Web Content Retrieval

This skill outlines a strategy for handling situations where standard web content retrieval tools (`web_extract`, `web_search`) are insufficient or fail, particularly for complex sites or when the agent needs to correct its own self-perceived limitations.

## Trigger Conditions

*   When `web_extract` or `web_search` fail on a URL, especially for repository content (e.g., GitHub).
*   When the user corrects the agent's stated inability to access URLs or perform web actions.
*   When the task requires accessing raw file content from repositories that might not be well-served by generic extraction tools.

## Approach

1.  **Capability Verification & Self-Correction:**
    *   If there's user doubt or a direct correction regarding the agent's ability to access web content, immediately confirm capability using `browser_navigate`.
    *   If the agent previously stated inability but can now, acknowledge the correction and proceed.

2.  **Standard Retrieval Attempts:**
    *   Prioritize using `web_extract` for specific URLs or `web_search` for general queries.
    *   If these tools return errors or no useful content, do not give up.

3.  **GitHub/Raw Content Fallback:**
    *   For GitHub repositories or similar sites where direct `web_extract` might fail on the main page, attempt to construct and navigate to the **raw file URL**.
    *   For example, if `https://github.com/user/repo` is problematic, try navigating directly to `https://raw.githubusercontent.com/user/repo/main/README.md` (or the appropriate branch/file).

4.  **Snapshotting for Raw Content:**
    *   Once successfully navigated to a raw content URL (like a raw README file), use `browser_snapshot(full=true)` to retrieve the entire page's text content. This is often more reliable than `web_extract` for plain text files served via a browser.

5.  **Process and Present:**
    *   Analyze the content obtained via `browser_snapshot`. Summarize it, extract relevant information, or perform other requested tasks.

6.  **Report Limitations:**
    *   If, after attempting these steps, content retrieval remains unsuccessful, clearly inform the user about the specific limitations encountered and offer alternative solutions (e.g., asking the user to paste the content).

## Pitfalls & Considerations

*   **URL Shorteners:** Always resolve shortened URLs (like `t.co`, `bit.ly`) first, either by direct navigation or by understanding they might redirect.
*   **Dynamic Content:** `web_extract` might struggle with heavily JavaScript-dependent pages. `browser_navigate` followed by `browser_snapshot` can sometimes be more robust for static text content.
*   **GitHub Structure:** GitHub's web pages are complex. Directly accessing raw file content via `raw.githubusercontent.com` is often more reliable for plain text files (like READMEs, code, config files).
*   **File Paths:** Ensure correct file paths are constructed for raw content access. For GitHub, this typically involves `raw.githubusercontent.com/<owner>/<repo>/<branch>/<path/to/file>`.
*   **Tool Failures:** Be prepared for `browser_navigate` or `browser_snapshot` to also fail under certain network conditions or if the URL is invalid/inaccessible.

## Verification

*   Manually check the retrieved content against what's visible on the webpage (if possible) or against what the user provided as context to ensure accuracy.
*   Confirm that the obtained content directly addresses the user's request or the task at hand.
