---
name: rrmnhc-news-production-pipeline
description: Automates the "Command Center" workflow for transforming raw text and image assets into deployed HTML news stories on the RRMNHC website.
category: web-dev
---

# RRMNHC News Production Pipeline

A specialized workflow for transforming raw text and images into professional, deployed news stories for the Red River Métis National Heritage Centre (RRMNHC) website.

## Overview
This skill automates the "Command Center" workflow: taking unformatted user input (Markdown-style text and image attachments) and converting them into structured, styled, and deployed HTML articles within the `news.html` file.

## Workflow Steps

### 1. Data Ingestion
The agent receives a message from the user containing:
- **Targeting Keyword:** [NEW], [UPDATE], or [FEATURE].
- **Location/ID:** (If [UPDATE] or [FEATURE]) The specific article target (e.g., "Featured Post", "Article 1", "Article 2", etc.) or the Headline.
- **Headline:** The title of the article.
- **Category:** (e.g., Construction Update, Heritage, Community, Exhibits).
- **Date:** The publication date.
- **Summary/Body:** The narrative text.
- **Image:** An attached image file.

**Interactivity Rule:** If the user provides an `[UPDATE]` or `[FEATURE]` command without specifying the target article, the agent MUST ask: *"Which article would you like to update? (Featured Post, Article 1, Article 2, Article 3, etc.)"* before proceeding.

### 2. Asset Processing
- **Image Storage:** The image is moved from the temporary cache to `rrmnhc-website/assets/img/`.
- **Naming Convention:** Images are renamed to a clean, slugified format (e.g., `headline-slug.jpg`) to ensure URL stability.
- **Verification:** The agent confirms the image exists and is accessible before proceeding.

### 3. HTML Assembly (The "Template Engine")
The agent injects the data into the `news.html` template using the following rules:
- **Featured Article:** If it's a new primary story, it is injected into the "FEATURED POST" section.
- **Grid Articles:** If it's a standard update, it is appended to the "NEWS GRID" section.
- **Style Injection:** The agent ensures all links use the robust `./filename.html` format and that the "Active Page" CSS class is applied to the navigation.

### 4. Deployment (The "Safe Release" Protocol)
To maintain site stability, the agent follows a strict Git workflow:
1. **`git add .`** and **`git commit`** with a descriptive message.
2. **`git push origin develop`**: Pushes the new story to the staging environment.
3. **`git checkout main && git merge develop && git push origin main`**: Merges to production only after the agent has verified the local build.
4. **Cache Busting:** Adds a unique comment to `news.html` to force GitHub Pages to refresh the deployment.

**CRITICAL: Anti-Corruption Rule**
DO NOT use string splitting (`.split()`) or complex regex to modify the `news.html` file. This has historically led to "leaking" HTML tags and corrupted grid structures. 
- For minor updates, use very specific, unique string replacements.
- For structural changes or multiple updates, use a **"Nuclear Reset"**: Rewrite the entire file from a clean master template and inject all current content and assets fresh. This is the only way to guarantee structural integrity.

## Pitfalls & Troubleshooting
- **Image Path Errors:** If an image fails to load, the agent must check if the path uses `./assets/img/` and verify the file exists in the actual directory.
- **Broken Nav Links:** Always ensure the navigation links in the new HTML match the global `style.css` and use `./` for relative stability.
- **GitHub Cache:** If the user reports a 404 or an old version, trigger a "Nuclear Reset" (re-writing the file with a new unique comment) to force a GitHub rebuild.

## Verification Steps
- [ ] Check that the image is visible in the browser.
- [ ] Verify the headline and date match the user's input.
- [ ] Confirm the "News" link in the navigation is highlighted as the active page.
- [ ] Confirm the live URL is accessible via the `main` branch.
