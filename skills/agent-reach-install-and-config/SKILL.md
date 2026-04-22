---
name: agent-reach-install-and-config
description: Install and configure Agent Reach CLI on WSL2/Ubuntu with all upstream tools for cross-platform content scraping (Twitter, Reddit, YouTube, GitHub, semantic search).
category: research
tags: [agent-reach, webscraping, research, twitter, reddit, youtube, semantic-search, wsl2]
---

# Agent Reach - Install & Configure on WSL2/Ubuntu

Install and configure [Agent Reach](https://github.com/Panniantong/Agent-Reach) — CLI scaffolding that gives AI agents the ability to read/search content across 15+ platforms without API keys.

## When to Use
- Web search/extract tools returning 400 errors or hitting rate limits
- Need to scrape Twitter/X, Reddit, YouTube, or blocked websites for research
- Want semantic search (Exa) instead of keyword-based web search
- Research requires accessing paywalled or login-gated content

## Core Dependencies Required on System
- **Python 3.10+** (usually pre-installed)
- **Node.js** (required for mcporter)
- **npm** (for mcporter and some CLI tools)
- **pip/pipx** (for Python CLI tools)

## Installation

### Step 1: Install Agent Reach
```bash
# On WSL2, pipx may not be installed. Use --break-system-packages:
pip install https://github.com/Panniantong/agent-reach/archive/main.zip --break-system-packages
```

### Step 2: Auto-install Environment
```bash
agent-reach install --env=auto
```
This installs upstream tools: yt-dlp (YouTube), feedparser (RSS), Jina Reader, and more. Reports what's working vs. needs config.

### Step 3: Fix Missing Dependencies (WSL2-Specific)

**GitHub CLI (gh)** — apt/snap often blocked in WSL2:
```bash
# Direct binary download (no sudo needed):
cd /tmp
LATEST=$(curl -s https://api.github.com/repos/cli/cli/releases/latest | grep "tag_name" | cut -d'"' -f4 | sed 's/v//')
curl -sL "https://github.com/cli/cli/releases/download/v${LATEST}/gh_${LATEST}_linux_amd64.tar.gz" -o gh.tar.gz
tar xzf gh.tar.gz
mkdir -p ~/.local/bin
cp gh_${LATEST}_linux_amd64/bin/gh ~/.local/bin/
```

**Reddit CLI (rdt-cli)** — Usually pre-installed. If not:
```bash
pip install rdt-cli --break-system-packages
```

**mcporter + Exa Search** (semantic web search):
```bash
npm install -g mcporter
mcporter config add exa https://mcp.exa.ai/mcp
# Test it:
mcporter call exa.web_search_exa query="your topic"
```

**Twitter CLI (twitter-cli)** — Required for full Twitter access:
```bash
pip install twitter-cli --break-system-packages
```
Twitter requires cookie authentication for anything beyond reading a single tweet URL.

### Step 4: Add ~/.local/bin to PATH Permanently
```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.profile
```

### Step 5: Run Diagnostics
```bash
export PATH="$HOME/.local/bin:$PATH"
agent-reach doctor
```

## Expected Status After Full Setup
- ✅ Web (Jina Reader)
- ✅ YouTube (yt-dlp)
- ✅ Reddit (rdt-cli)
- ✅ Semantic Search (Exa via mcporter)
- ✅ RSS (feedparser)
- ✅ Bilibili (yt-dlp)
- ✅ V2EX
- ✅ WeChat Articles (via Exa)
- ⚠️ GitHub (works for public repos, `gh auth login` needed for full)
- ⚠️ Twitter (needs cookie configuration — see below)

## Twitter Cookie Configuration
1. Install Chrome extension: [Cookie-Editor](https://chromewebstore.google.com/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm)
2. Log into Twitter/X in Chrome
3. Open Cookie-Editor, click Export
4. Set env vars:
```bash
# Extract TWITTER_AUTH_TOKEN and TWITTER_CT0 from the exported cookies
export TWITTER_AUTH_TOKEN="your_auth_token_value"
export TWITTER_CT0="your_ct0_value"
# Or add to ~/.hermes/.env
```
⚠️ **Use a burner account** — cookie auth can trigger Twitter's bot detection.

## Testing Each Channel

### Exa Semantic Search
```bash
mcporter call exa.web_search_exa query="Metis heritage research Canada"
```

### Reddit
```bash
# rdt-cli is installed, usage:
reddit search "Metis history"
```

### YouTube Subtitles
```bash
yt-dlp --dump-json "https://youtube.com/watch?v=VIDEO_ID"
```

### Twitter (needs cookies)
```bash
twitter tweet "https://x.com/user/status/123"
twitter search "Metis heritage"
```

## Common Pitfalls

### 1. `pip install` fails with "externally-managed-environment"
Use `--break-system-packages` flag or install pipx first: `sudo apt install pipx`

### 2. `snap install` fails in WSL2
snap requires systemd and often doesn't work in WSL2. Use direct binary downloads instead.

### 3. `mcporter call` gives "tool not found" errors
The tool names are `server.tool_name`, not just `tool_name`. Use `mcporter list exa --schema` to see exact tool names.

### 4. mcporter CLI argument parsing
mcporter expects `key=value` arguments, not JSON:
```bash
# WRONG: mcporter call exa.web_search_exa '{"query": "topic"}'
# RIGHT: mcporter call exa.web_search_exa query="topic"
```

### 5. `twitter-cli` command is `twitter`, not `twitter-cli`
The pip package is `twitter-cli` but the binary is just `twitter`.

### 6. Agent Reach can't find manually installed tools
If you installed tools to `~/.local/bin`, make sure that's in `~/.profile` so new shells pick it up. Agent Reach runs in new shell contexts.