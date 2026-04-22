---
name: hermes-model-routing
description: Configure and manage per-platform model routing, fallback chains, and multi-provider setups in Hermes Agent. Covers free tier usage, credit limits, and automatic failover between OpenRouter and Google AI Studio.
category: autonomous-ai-agents
tags: [hermes, models, routing, fallbacks, free-tiers, google-ai-studio, openrouter]
---

# Hermes Model Routing & Fallbacks

Manage per-platform model routing, fallback chains for rate limits/credit exhaustion, and multi-provider setups in Hermes Agent.

## When to Use
- User asks to use different models for different platforms (CLI vs Telegram vs WhatsApp).
- User hits `402` (credits exhausted) or `429` (rate limit) errors on a specific platform.
- User wants to leverage free tiers from multiple providers (OpenRouter, Google AI Studio, etc.).

## Best Free Models Available
| Model | Provider | Best For |
|-------|----------|----------|
| `meta-llama/llama-3.3-70b-instruct:free` | OpenRouter | Heavy reasoning, complex tasks |
| `google/gemini-2.0-flash-exp:free` | OpenRouter | Massive context reading, code |
| `qwen/qwen3.6-plus:free` | OpenRouter | General chat, creative writing |
| `openrouter/free` | OpenRouter | Primary Free Model |
| `deepseek/deepseek-r1:free` | OpenRouter | Math, logic, research |

## How It Works
Hermes allows per-platform overrides in `~/.hermes/config.yaml`. You can also set a global or per-platform `fallback_model` that auto-triggers on `402` or `429` errors.

### Basic Structure
```yaml
model:
  default: meta-llama/llama-3.3-70b-instruct:free
  provider: openrouter

# Global fallback
fallback_model:
  provider: google-ai-studio
  model: openrouter/free

# Platform-specific overrides
telegram:
  model: openrouter/free
  provider: google-ai-studio
  fallback_model:
    provider: openrouter
    model: qwen/qwen3.6-plus:free

whatsapp:
  model: openrouter/free
  provider: openrouter

# Don't forget to add the Google key in .env:
# GOOGLEAI_API_KEY=your_key_here
```

## Common Fixes

### 1. Rate Limit on OpenRouter (429)
**Symptom:** `Rate limit exceeded: limit_rpm/.../8 requests per minute`
**Fix:** Move that platform to a different provider (e.g., Google AI Studio) or a different free model with higher limits.

### 2. Credit Exhaustion on OpenRouter (402)
**Symptom:** `Error code: 402 - This request requires more credits, or fewer max_tokens`
**Fix:** 
- Top up OpenRouter at https://openrouter.ai/settings/credits
- OR route that platform to a different free provider like `google-ai-studio`.

### 3. Fallback Chain Not Working
**Cause:** Fallback models must be defined.
**Fix:**
```yaml
# Add this to the specific platform config
fallback_model:
  provider: openrouter
  model: google/gemini-2.0-flash-exp:free
```

## Diagnostic Commands
```bash
# Check if gateway is running
hermes gateway status

# View active session models (CLI)
hermes status

# Check gateway logs for errors
tail -n 50 ~/.hermes/logs/gateway.log
```

## Platform-Specific Pitfalls

### WhatsApp Bridge Crash Loop (Code -15)
**Symptom:** WhatsApp works but then repeatedly crashes with `WhatsApp bridge process exited unexpectedly (code -15)`.
**Cause:** When the API hits a `402` (credits) or `429` (rate limit) error, the entire Node.js WhatsApp bridge process is killed (SIGTERM/SIGKILL), not just the individual request. The gateway.log will show `Fatal whatsapp adapter error (whatsapp_bridge_exited)`.
**Fix:**
1. `hermes gateway stop && sleep 3 && hermes gateway start` — always use **stop + start**, never just `restart` (restart doesn't fully clear the dead bridge process)
2. Route WhatsApp to a model with higher free limits (Gemma 12B on OpenRouter free tier is very stable at 8 RPM minimum)
3. Consider switching from `self-chat` mode to a proper bot account if stability is critical

### Telegram Timeouts with Google AI Studio
**Symptom:** Telegram configured with `google-ai-studio` provider never responds, hangs indefinitely, or returns generic timeout errors.
**Cause:** Google AI Studio endpoints can be blocked, filtered, or significantly slower depending on the user's network (especially on WSL2/Windows setups with DNS resolution). The key is already in `.env` as `GOOGLEAI_API_KEY` but the HTTP connection can't complete.
**Fix:** Revert to OpenRouter free tier (`qwen/qwen3.6-plus:free` or `google/gemini-2.0-flash-exp:free`) which uses standard HTTPS and is more reliable across networks. Always set a fallback_model pointing to OpenRouter when using Google AI Studio.

### Llama 3.3 70B Low RPM Limit
**Symptom:** `meta-llama/llama-3.3-70b-instruct:free` works but fails with `limit_rpm` at just 8 requests per minute during active use.
**Cause:** Very high demand model on OpenRouter free tier. Shared with all other users on the free tier.
**Fix:** 
- Use `qwen/qwen3.6-plus:free` as your primary for CLI — it's more stable with much higher rate limits and comparable quality
- Keep Llama 70B only as a fallback for tasks that specifically need its capabilities
- If you must use Llama 70B, spread requests out and avoid rapid sequential calls

### Model Token Budget (402 Even on Free Tier)
**Symptom:** `Error code: 402 - You requested up to 65536 tokens, but can only afford 15097`
**Cause:** OpenRouter free tier has a dynamic token budget based on your account usage. Long-context sessions (40k+ tokens) will blow through the remaining free budget in a single request.
**Fix:** 
- Set `context_length` in config.yaml to a lower value (e.g., 8192 or 16384)
- Use `/compress` to reduce session context before long tasks
- For heavy sessions, switch to Google AI Studio which has separate (generous) limits
- Consider starting a new session for complex tasks rather than continuing a 50k-token session

## Vision/Image Analysis Specifics

### Vision Uses a SEPARATE Model from Main LLM
**Critical:** The vision tool (`vision_analyze`) uses `_OPENROUTER_MODEL = "google/gemini-3-flash-preview"` by default, which is NOT a free tier model. Even if your main session model is `:free`, vision calls still burn paid credits.
**Symptom:** Photos arrive on Telegram fine (`Cached user photo at ...` in gateway.log), but vision analysis fails with `Error code: 402`.
**Fix:** Set `AUXILIARY_VISION_MODEL=google/gemini-2.0-flash-exp:free` in your .env to use the free tier Gemini model that supports vision. Or set up Google AI Studio as vision provider:
```yaml
# In config.yaml under auxiliary section (or via env vars):
AUXILIARY_VISION_PROVIDER=google-ai-studio
AUXILIARY_VISION_MODEL=gemini-2.0-flash
AUXILIARY_VISION_API_KEY=${GOOGLEAI_API_KEY}
```
This completely separates vision from your OpenRouter account, giving free unlimited vision calls.

### Vision Model Priority for Free Usage:
1. `google/gemini-2.0-flash-exp:free` via OpenRouter -- free, supports images
2. `gemini-2.0-flash` via Google AI Studio -- generous free tier, no credits
3. `google/gemini-3-flash-preview` via OpenRouter -- PAID, will exhaust credits

## Troubleshooting Table
| Error | Meaning | Fix |
|-------|---------|-----|
| `402` (vision) | Vision model not free tier | Set `AUXILIARY_VISION_MODEL` to `google/gemini-2.0-flash-exp:free` |
| `402` (general) | Out of credits on current provider | Use `:free` models or switch provider |
| `429` | Rate limit hit (too many RPM) | Change model or move to secondary provider |
| `whatsapp_bridge_exited` (code -15) | WhatsApp bridge killed by API error | Full `stop && start`, not just `restart` |
| `404` | Model name typo | Check OpenRouter model ID format |
| `telegram_timeout` | Google AI Studio endpoint unreachable | Switch to OpenRouter free tier |
