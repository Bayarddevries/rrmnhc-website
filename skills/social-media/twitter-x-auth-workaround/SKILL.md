---
name: twitter-x-auth-workaround
description: Authenticate with Twitter/X from cloud/VM environments that are blocked by X's bot detection. Uses burner emails, manual cookie extraction from Chrome DevTools, and HTTP-based cookie validation instead of direct browser or library-based login.
version: 1.0.0
author: Baya + Hermes Agent
prerequisites:
  env_vars: [auth_token, ct0]
  commands: []
metadata:
  hermes:
    tags: [twitter, x, authentication, cloud-blocking, workarounds]
---

# Twitter/X Authentication Workaround

When trying to automate Twitter/X from cloud/VM environments (like WSL2 sandbox), X's bot detection aggressively blocks:
- Cloud browser login attempts (returns "Something went wrong. Try reloading.")
- Library-based logins like `twikit` (fails with "Couldn't get KEY_BYTE indices")
- Direct cookie database extraction (Chrome encrypts cookies with Windows DPAPI)

## The Working Approach

### 1. Create a Burner Email (Optional)
```python
import requests
import secrets
import string

username = "watcher_" + ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(6))
email = f"{username}@sharebot.net"  # Domain from mail.tm API
password = "SecurePass123!"

# Create account via mail.tm API
domains_resp = requests.get("https://api.mail.tm/domains", timeout=10)
domain = domains_resp.json()['hydra:member'][0]['domain']
email = f"{username}@{domain}"

create_resp = requests.post("https://api.mail.tm/accounts", 
    json={"address": email, "password": password}, timeout=10)

# Read inbox later
token_resp = requests.post("https://api.mail.tm/token", 
    json={"address": email, "password": password}, timeout=10)
token = token_resp.json()['token']
headers = {"Authorization": f"Bearer {token}"}
messages = requests.get("https://api.mail.tm/messages", headers=headers, timeout=10)
```

### 2. User Creates Account Manually
User signs up at x.com with the burner email, verifies the code.

### 3. Extract Cookies from User's Local Browser
Since cloud browsers can't authenticate, user must extract cookies from their own machine:

**Windows Chrome Steps:**
1. Open Chrome logged into the Twitter account
2. Press **F12** to open Developer Tools
3. Go to **Application** tab → expand **Cookies** → click **https://x.com**
4. Find and copy these two values:
   - `auth_token` (long alphanumeric string)
   - `ct0` (long alphanumeric string)
5. Send them to the agent

**iPhone Chrome Steps (Less Reliable):**
```
javascript:document.cookie.split(';').filter(c=>c.includes('auth_token')||c.includes('ct0')).map(c=>c.trim()).join('\n')
```

### 4. Validate and Store Cookies
```python
import json
import requests

# Save to file for future use
data = {
    "cookies": {"auth_token": "...", "ct0": "..."},
    "username": "watcher_account",
    "target": "primary_account"
}
with open("~/.hermes/.twitter_cookies.json", "w") as f:
    json.dump(data, f)

# Validate session works
session = requests.Session()
session.cookies.set("auth_token", auth_token, domain=".x.com")
session.cookies.set("ct0", ct0, domain=".x.com")
headers = {"x-csrf-token": ct0, "User-Agent": "Mozilla/5.0..."}
r = session.get("https://x.com/watcher_account/likes", headers=headers, timeout=10)
print(f"Status: {r.status_code}")
# 200 = valid session
```

### 5. Use for Automation
With valid cookies, you can:
- Make HTTP requests to pull likes, timeline, etc.
- Use `web_search` to find public activity for analysis
- Set up cron jobs that use the validated session

## What DOESN'T Work

| Method | Error | Why |
|--------|-------|-----|
| Cloud browser login (browser_navigate to x.com/login) | "Something went wrong. Try reloading." | X blocks cloud/VM IPs via bot detection — confirmed even with stealth/local features |
| `twikit` library login | "Couldn't get KEY_BYTE indices" or "no attribute 'key'" | Key exchange fails from server environments, library unusable from cloud |
| `x-cli` (official X API CLI) | Requires 5 API keys + paid plan ($100+/mo) | Free tier only supports posting tweets, not reading likes/timelines |
| Chrome cookie DB extraction (Linux side) | DPAPI encryption | Windows-specific encryption can't be decrypted from Linux |

## What DOES Work

| Method | Status | Details |
|--------|--------|---------|
| User extracts auth_token + ct0 from Chrome DevTools (F12) | ✅ Confirmed working | HTTP request returns status 200, session valid |
| `requests.Session()` with extracted cookies | ✅ Confirmed working | `session.get("https://x.com/username", headers=auth_headers)` returns 200 |

## Cron Job Setup Example
```
Schedule: 0 10 * * 6 (Saturday 10AM)
Deliver: whatsapp
Job: Use requests library with stored cookies to pull Twitter data, analyze topics, and push digest
```

## Pitfalls
- **Session expiry**: Twitter cookies expire (typically 30-90 days). You'll need to re-extract when they stop working.
- **Account suspension risk**: Using burner accounts for automation carries risk of suspension. Never use primary account credentials for automation.
- **Rate limiting**: Even with valid cookies, X has strict rate limits. Batch requests carefully.
- **No cloud browser magic**: Despite stealth features, cloud browsers WILL be detected by X. Accept this and use HTTP requests with extracted cookies instead.