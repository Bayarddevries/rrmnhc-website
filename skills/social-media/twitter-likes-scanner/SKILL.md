---
name: twitter-likes-scanner
description: Scrape Twitter/X likes from a burner account, analyze interests, and generate curated recommendation digests. Handles X's bot detection via cookie-based auth rather than browser automation.
version: 1.0.0
platforms: [linux]
prerequisites:
  commands: [python3, uv]
  env_vars: []
metadata:
  hermes:
    tags: [twitter, x, social-media, scraping, cron]
    homepage: https://github.com/Infatoshi/x-cli
---

# Twitter Likes Scanner — Burner Account Pattern

## Problem

X/Twitter **blocks browser automation from cloud sandbox IPs**. The login page consistently shows "Something went wrong. Try reloading." when accessed from tools like browser_navigate. The official API (x-cli) requires paid developer credentials.

## Solution: Burner Account + Cookie Auth

Create a low-value "watcher" account that follows the target account. Use cookie-based authentication (saved from a real browser session) for programmatic access.

## Account Setup

1. Generate burner email via mail.tm API:
```python
import requests, secrets, string
username = "watcher_" + ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(8))
domains = requests.get("https://api.mail.tm/domains").json()
domain = domains['hydra:member'][0]['domain']
email = f"{username}@{domain}"
password = "StrongP@ss!"
requests.post("https://api.mail.tm/accounts", json={"address": email, "password": password})
print(f"Email: {email}, Password: {password}")
```

2. Create Twitter account manually (requires phone verification from human)
3. Follow target account (e.g., @saltyunderwater) from the burner
4. Share burner @handle and password with the agent

## Getting Cookies (One-Time Setup)

The user must log into the burner account in their **real browser** (not cloud sandbox) and export cookies:

1. Log into Twitter as the burner account
2. Open browser dev tools → Application/Storage → Cookies → x.com
3. Export these critical cookies:
   - `auth_token` (most important)
   - `ct0` (CSRF token)
   - `twid`
   - `att`
4. Save as JSON to `~/.hermes/.twitter_cookies.json`

## Scraping Likes via API Headers

Once cookies are saved, use the internal Twitter API directly from Python:

```python
import requests, json

# Load cookies
with open("~/.hermes/.twitter_cookies.json") as f:
    cookies = json.load(f)

HEADERS = {
    "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
    "x-csrf-token": cookies.get("ct0", cookies.get("csrf_token", "")),
    "x-twitter-active-user": "yes",
    "x-twitter-client-language": "en",
    "Cookie": "; ".join(f"{k}={v}" for k, v in cookies.items()),
}

# Get user ID first
def get_user_id(screen_name):
    url = f"https://api.x.com/graphql/user-by-screen-name?variables={{{\"screen_name\":\"{screen_name}\",\"withSafetyModeUserFields\":true}}}"
    r = requests.get(url, headers=HEADERS)
    return r.json()['data']['user']['result']['rest_id']

# Get likes
def get_likes(user_id, count=50):
    url = f"https://api.x.com/graphql/Likes?variables={{{\"userId\":\"{user_id}\",\"count\":{count},\"includePromotedContent\":true,\"withClientEventToken\":false,\"withVoice\":true,\"withV2Timeline\":true}}}"
    # Actually use POST with query
    r = requests.get(url, headers=HEADERS)
    return r.json()
```

## Cron Job Setup

Create a cron job that:
1. Reads cookies from file
2. Scrapes recent likes (last 7 days)
3. Analyzes topics, accounts, themes
4. Pushes digest to WhatsApp with:
   - 3-5 new accounts to follow
   - 2-3 conversations/topics to track
   - 2-3 articles worth reading

**Schedule:** `0 10 * * 6` (Saturday 10 AM)
**Deliver:** `whatsapp`

## Cookie Extraction from Windows Machine (When WSL Can't Read Them)

Chrome and Edge encrypt cookies using Windows DPAPI, which means they **cannot be decrypted from WSL/Linux**. If the agent's sandbox runs in WSL, the user must extract cookies directly from Windows.

Save the following script as `extract_twitter_cookies.ps1` and run it in PowerShell while Twitter is logged in:

```powershell
# Save as extract_twitter_cookies.ps1 and run in elevated PowerShell
Add-Type -AssemblyName System.Security
$paths = @(
    "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Network\Cookies",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Network\Cookies"
)
foreach ($db in $paths) {
    if (Test-Path $db) {
        $conn = New-Object System.Data.SQLite.SQLiteConnection
        $conn.ConnectionString = "Data Source=$db"
        $conn.Open()
        $cmd = $conn.CreateCommand()
        $cmd.CommandText = "SELECT name, encrypted_value FROM cookies WHERE host_key LIKE '%.x.com%' AND name IN ('auth_token','ct0','twid','att')"
        $reader = $cmd.ExecuteReader()
        while ($reader.Read()) {
            $enc = $reader.GetValue(1)
            try {
                $dec = [System.Security.Cryptography.ProtectedData]::Unprotect($enc, $null, [System.Security.Cryptography.DataProtectionScope]::CurrentUser)
                $val = [System.Text.Encoding]::UTF8.GetString($dec)
                Write-Output "$($reader.GetString(0))=$val"
            } catch {
                Write-Output "$($reader.GetString(0))=[decrypt_error]"
            }
        }
        $conn.Close()
    }
}
```

If SQLite isn't available in PowerShell, install it first:
```powershell
Install-Module -Name PowerShellSQLite -Scope CurrentUser -Force
```

Or use the simpler manual export method from browser dev tools (see "Getting Cookies" section above).

## Pitfalls

- **Cookies expire** — auth_token typically lasts 2-4 weeks. Set up a monthly reminder for the user to re-export cookies.
- **X rate limits** — scraping more than ~200 requests/hour from the same account triggers blocks.
- **Account suspension risk** — burner accounts may get flagged. Keep the account's activity as "normal" as possible (occasional likes, follows).
- **X blocks ALL cloud browser automation** — `browser_navigate` to x.com/login consistently shows "Something went wrong. Try reloading." from any cloud/VM IP. This is not a transient error; it is X's universal bot detection. Do not waste attempts retrying.
- **`twikit` library fails in sandbox** — `twikit` consistently fails with "Couldn't get KEY_BYTE indices" when connecting from cloud environments due to X's fingerprinting.
- **Chrome cookies are DPAPI-encrypted** — they **cannot** be read from WSL/Linux even though WSL can access the Windows filesystem at `/mnt/c/Users/`. The PowerShell script above must run natively on Windows.
- **Internal API changes** — Twitter changes their GraphQL endpoints frequently. If scraping breaks, check the X API changelog or reverse-engineer via browser network tab.

## Alternative: x-cli (Official API)

If the user has paid X developer credentials:
```bash
x-cli user timeline <username> --max 50
x-cli me likes --max 50  # May require elevated access
```
See the `xitter` skill for full setup.