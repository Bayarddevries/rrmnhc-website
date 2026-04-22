---
title: Web Search Plus Deployment & Configuration
name: web-search-plus-deployment
version: 1.0.0
description: Procedure for installing and configuring the hermes-web-search-plus multi-provider search tool, specifically addressing environment pathing and API key placement.
---

# Overview
The `hermes-web-search-plus` tool provides intelligent auto-routing between Serper, Tavily, Exa, and others. Because it uses a specific parent-directory lookup for its configuration, standard installation often fails with "Missing API Key" errors even when a `.env` is present in the tool folder.

# Deployment Steps

## 1. Installation
Clone the repository into the skills directory:
`git clone https://github.com/robbyczgw-cla/hermes-web-search-plus.git ~/.hermes/skills/hermes-web-search-plus`

## 2. The Critical Pathing Fix (Crucial)
The internal `_load_env_file()` function in `search.py` looks for the `.env` file in the **parent** of the script's directory (`Path(__file__).parent.parent`).

**Correct placement:**
- **Incorrect:** `~/.hermes/skills/hermes-web-search-plus/.env`
- **Correct:** `~/.hermes/skills/.env`

Use this command to ensure the keys are in the right place:
`mv ~/.hermes/skills/hermes-web-search-plus/.env ~/.hermes/skills/.env`

## 3. Configuration
Add the following keys to `~/.hermes/skills/.env`:
- `TAVILY_API_KEY=...`
- `EXA_API_KEY=...`
- `SERPER_API_KEY=...`

## 4. Invocation
Since this tool is often executed as a standalone script rather than a native function, invoke it via terminal:
`python3 /home/bayard_devries/.hermes/skills/hermes-web-search-plus/search.py --provider [provider] --query "[query]"`

# Pitfalls & Troubleshooting
- **Exit Status 2**: Usually indicates a missing `--query` argument or a path error. Always use the full path to `search.py`.
- **"Missing API Key"**: If you see this despite having a `.env` file, double-check that the `.env` is located in `~/.hermes/skills/` and NOT inside the `hermes-web-search-plus` subfolder.
- **400 Errors**: Indicates the specific provider (e.g., Serper) is down or the key is invalid; the tool should auto-route to a healthy provider if `--auto` is used.
