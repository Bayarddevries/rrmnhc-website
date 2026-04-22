---
name: design-systems-reference
description: Complete catalog of 59 real-world DESIGN.md files from popular websites and apps. Drop any one into a project to give coding agents precise design specifications. Located locally at ~/design-systems-reference/.
---

# Design Systems Reference Library

A locally cloned collection of **59 complete DESIGN.md files** from popular websites and applications. Each file contains a detailed design system specification (colors, typography, spacing, components, layout patterns, shadows, borders) in a structured markdown format that AI coding agents can use to build matching UI.

## Location

```
~/design-systems-reference/design-md/
```

## Available Design Systems

### Fintech & Payments
- **coinbase/** — Dark mode crypto exchange, clean data visualization
- **wise/** — International money transfer, friendly green palette, card-based UI
- **revolut/** — Modern banking app, bold gradients, mobile-first
- **raycast/** — Productivity launcher, sleek dark mode, command-bar focused
- **clickhouse/** — Analytics database, developer-focused dark theme

### SaaS & Productivity
- **notion/** — Minimal workspace, off-white backgrounds, block-based content
- **linear.app/** — Project management, dark theme, clean typography, subtle gradients
- **airtable/** — Database-spreadsheet hybrid, colorful field-type indicators
- **intercom/** — Customer messaging, warm colors, conversational UI
- **zapier/** — Automation platform, bright orange accents, card-based
- **cal/** — Scheduling, minimal dark mode, time-block focused
- **composio/** — Integration platform
- **miro/** — Whiteboard, colorful, collaborative

### AI & Developer Tools
- **claude/** — Anthropic's chat, clean and warm, conversational
- **figma/** — Design tool UI, dark primary, tool palettes
- **framer/** — Web design platform, bold, creative
- **ollama/** — Local LLM runner, terminal-inspired, dark
- **x.ai/** — Grok/xAI, dark, minimal, futuristic
- **mistral.ai/** — AI models, clean European design
- **elevenlabs/** — AI voice, dark mode, audio visualization
- **superhuman/** — Email client, premium feel, keyboard shortcuts

### Automotive
- **ferrari/** — Luxury sport, bold red, high-contrast
- **bmw/** — Premium automotive, elegant, clean
- **spacex/** — Aerospace, dramatic full-bleed imagery, dark

### Big Tech & Enterprise
- **apple/** — Minimalist, lots of white space, product photography
- **ibm/** — Enterprise, structured, accessible, systematic
- **hashicorp/** — Infrastructure, developer-focused, purple accent
- **nvidia/** — GPU/tech, green accents, data visualization heavy
- **mongodb/** — Database, green, developer-friendly
- **vercel/** — Deployment platform, Vercel black/white, geometric
- **resend/** — Email API, warm, clean, developer-focused

### Media & Content
- **spotify/** — Music streaming, dark mode, vibrant accents, card-based
- **posthog/** — Analytics, open-source, friendly, playful illustration
- **lovable/** — AI coding, warm, inviting

### Social & Community
- **pinterest/** — Visual discovery, masonry grid, red accent, image-heavy

### Services
- **uber/** — Ride-sharing, dark/light, map-centric
- **webflow/** — Web builder, design-focused, colorful
- **renault/** — Automotive, European design sensibility

## How to Use

When building any web interface or UI component, you can reference any of these design systems. Example prompt:

```
Build a settings page for the Heritage Centre admin panel.
Use the Linear.app design system as a reference for the dark theme,
typography scale, and component spacing.
See ~/design-systems-reference/design-md/linear.app/DESIGN.md
```

Or pick multiple:

```
For the public-facing Heritage Centre website, use a warm, heritage-appropriate design.
Reference the Apple DESIGN.md for minimalist layout principles,
and the IBM DESIGN.md for accessible color contrasts and typography.
```

## Creating a DESIGN.md for Our Own Projects

The pattern is:
1. Document colors (with hex values)
2. Document typography scale (font families, sizes, weights, line heights)
3. Document spacing system (padding, margin scales)
4. Document component specs (buttons, cards, modals, inputs)
5. Document layout patterns (grid, responsive breakpoints)
6. Document shadows, borders, border-radius values
7. Document icon system
8. Document interaction states (hover, focus, active, disabled)