---
name: twitter-interest-curating
description: Scrape Twitter/X user activity to analyze interests, generate recommendations for new accounts to follow, conversations to track, and articles to read. Uses a "watcher" account to bypass auth walls.
version: 1.0.0
prerequisites: [A dedicated Twitter "watcher" account that follows the target account]
---

# Twitter/X Interest Curating

## The Problem
Twitter/X "Likes" are behind a login wall. You cannot access a user's likes without being authenticated as that account. The official API costs ~$100/month.

## The Workaround: Watcher Account
Create a secondary Twitter account that follows the target account. This account can:
- See the target's public timeline
- See public mentions and interactions
- Be logged into with cookies exported from the user's own PC

### Step 1: Create the burner account
Use the mail.tm API to create a burner email (works from Python with `requests`):
```python
# Generate domain from https://api.mail.tm/domains
# POST https://api.mail.tm/accounts with {"address": "user@domain", "password": "password123"}
# POST https://api.mail.tm/token to get JWT for checking verification codes
```
The verification email arrives within minutes. Code is a 6-digit number. Use it to verify the X account.

### Step 2: IMPORTANT — You CANNOT log in via browser tool
X/Twitter aggressively blocks all cloud/VM/browser-tool IPs. The login page shows "Something went wrong. Try reloading." regardless of retries. The `twikit` Python library also fails with "Couldn't get KEY_BYTE indices" due to TLS fingerprinting. These approaches DO NOT WORK.

### Step 3: The ONLY working approach — Cookie Export from User's PC
1. Have the user log into the watcher account on THEIR OWN PC browser (Chrome/Firefox/Edge)
2. Press F12 to open DevTools, go to the Console tab
3. Paste this:
```js
[{name:'auth_token',value:document.cookie.split(';').find(c=>c.trim().startsWith('auth_token=')).split('=')[1]},{name:'ct0',value:document.cookie.split(';').find(c=>c.trim().startsWith('ct0=')).split('=')[1]}]
```
4. User pastes the output back to the agent
5. Save cookies to `~/.hermes/.twitter_cookies.json` for cron jobs and scripts

## Scanning Liked Tweets (Authenticated)
The browser tool can navigate to the "Likes" tab on the target profile once authenticated.

**Key steps:**
1. Navigate to `https://x.com/<username>/likes`
2. Use `browser_snapshot()` or `browser_scroll()` to capture tweet content
3. Extract topics, account mentions, and engagement patterns
4. Analyze and generate recommendations

## Weekly Cron Digest Format
Every Saturday morning, push a WhatsApp digest with:
- 3-5 new accounts to follow (with 1-line reasoning)
- 2-3 trending conversations or topics to track
- 2-3 articles/resources worth reading

## Important Rules
- **This is personal, not work.** Keep Heritage Centre content separate.
- **Prioritize quality over volume.** Better to recommend 1 great account than 5 mediocre ones.
- **If activity is sparse**, search for high-quality content in matching domains and note it as a general recommendation.

## Pitfalls
- **Twitter suspends burner accounts aggressively.** Expect to recreate the watcher account occasionally.
- **Session cookies expire.** Re-authenticate if scraping returns empty results.
- **Rate limits.** Add delays between scrolls. Don't scrape more than ~50 likes per run.
- **Likes tab requires the viewing account to be the same as the target.** If the watcher can't see @saltyunderwater's likes, you'll need to log in *as* @saltyunderwater itself (more risky).
- **Public API is extremely limited.** The free tier only allows posting tweets — reading timelines requires paid access.