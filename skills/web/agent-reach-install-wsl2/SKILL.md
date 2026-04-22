---
name: agent-reach-install-wsl2
description: Install and configure Agent Reach on WSL2/Ubuntu environments with common pitfalls and workarounds.
category: web
tags: [agent-reach, web-scraping, research, wsl2, ubuntu]
---

# Agent Reach Installation on WSL2/Ubuntu

Install and configure [Agent Reach](https://github.com/Panniantong/Agent-Reach) - CLI tools for AI agents to access Twitter, Reddit, YouTube, GitHub, and more.

## When to Use
- Web search/extract returning 400 errors
- Need to scrape content from blocked platforms (X/Twitter, Reddit, YouTube)
- Want semantic web search via Exa
- Building research pipelines for heritage projects

## Installation Steps

### 1. Base Install
```bash
pip install https://github.com/Panniantong/agent-reach/archive/main.zip --break-system-packages
agent-reach install --env=auto
```

Note: pipx not always available, --break-system-packages is safe in WSL2.

### 2. Install Missing Dependencies
Agent-reach auto-detects but some tools need manual install:

```bash
# Reddit CLI (often pre-installed but not detected)
pip install rdt-cli --break-system-packages

# mcporter for Exa semantic search
npm install -g mcporter
mcporter config add exa https://mcp.exa.ai/mcp

# GitHub CLI (manual binary install - no sudo available)
cd /tmp
LATEST=$(curl -s https://api.github.com/repos/cli/cli/releases/latest | grep "tag_name" | cut -d'"' -f4 | sed 's/v//')
curl -sL "https://github.com/cli/cli/releases/download/v${LATEST}/gh_${LATEST}_linux_amd64.tar.gz" -o gh.tar.gz
tar xzf gh.tar.gz
mkdir -p ~/.local/bin
cp gh_${LATEST}_linux_amd64/bin/gh ~/.local/bin/

# Twitter CLI
pip install twitter-cli --break-system-packages
```

### 3. Fix PATH for Detection
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.profile
export PATH="$HOME/.local/bin:$PATH"
```

### 4. Configure Twitter (Cookie Auth Required)
```bash
# Test Twitter CLI
~/.local/bin/twitter --help

# For cookie setup:
# 1. Install Cookie-Editor Chrome extension
# 2. Log into Twitter in Chrome
# 3. Export cookies
# 4. Set TWITTER_AUTH_TOKEN and TWITTER_CT0 env vars
```

### 5. Verify Setup
```bash
export PATH="$HOME/.local/bin:$PATH"
agent-reach doctor 2>&1

# Test Exa search
mcporter call exa.web_search_exa query="your search term" numResults=3
```

## What Works WITHOUT Config
- Web pages (Jina Reader)
- YouTube (yt-dlp)
- Reddit (rdt-cli)
- RSS feeds
- V2EX
- WeChat articles
- Exa semantic search (after mcporter config)
- GitHub public repos (after gh install)

## What Needs Cookies
- Twitter/X (search, timeline, full access)
- LinkedIn (advanced features)
- XiaoHongShu

## Common Pitfalls

### 1. Externally Managed Python
Symptom: `externally-managed-environment` error
Fix: Use `--break-system-packages` flag

### 2. gh CLI Install Timeout
Symptom: `apt install` or `snap install` timing out
Fix: Download binary directly from GitHub releases

### 3. Agent-Reach Can't Find Installed Tools
Symptom: `agent-reach doctor` shows tools as unavailable even though they're installed
Fix: Add `~/.local/bin` to PATH. Tools install there but detection scripts don't always find them.

### 4. Twitter CLI Not Found
Symptom: `twitter: command not found`
Fix: twitter-cli installs to `~/.local/bin/twitter`, not `twitter-cli`. Use `~/.local/bin/twitter` directly.

### 5. mcporter Syntax
Symptom: JSON argument parsing errors
Fix: Use key=value syntax: `mcporter call exa.web_search_exa query="term" numResults=3`

## Post-Install Benefits
- Semantic search replaces broken web_search tool
- Direct URL reading via Jina Reader replaces broken web_extract
- Reddit access without auth
- YouTube subtitle extraction for oral history sources
- Twitter access with cookie auth (requires manual setup)