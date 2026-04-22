---
name: reader-rail-prototyping
description: Workflow for creating high-fidelity interactive displays for museum reader rails.
category: web-dev
---

# Reader Rail Prototyping

This skill describes the workflow for creating high-fidelity interactive displays for museum reader rails, specifically for the RRMNHC project.

## Trigger Conditions
Use this skill when creating a tablet-based interactive display that needs to integrate with a wider design system (e.g., the RRMNHC design tokens).

## Procedural Steps

1. **Content Sourcing**
   - Extract verified quotations from the research vault.
   - Source archival, public-domain portraits (ensure high resolution and proper attribution).
   - Map quotes to specific 'Modes' based on the emotion and length of the text.

2. **Asset Organization**
   - Store portraits in a dedicated folder (e.g., `assets/img/voices/`).
   - Generate placeholder audio using `text_to_speech` and store as `.ogg` files.

3. **Design Implementation (The Three Modes)**
   - **Hero Mode:** Full-bleed portrait background, large-scale typography, centered layout. For high-impact, prophetic quotes.
   - **Narrative Mode:** Split-screen layout (Portrait | Text). Focused on storytelling, context, and medium-length quotes.
   - **Snippet Mode:** Compact, tactical layout with a circular portrait and a focus on geography/location. For short, direct quotes.

4. **System Alignment**
   - Use a 'Tablet Frame' simulation to ensure correct aspect ratio and touch-target sizes.
   - Pull all colors, fonts, and spacing directly from the master `style.css` tokens.
   - Apply a global archival texture (e.g., `.doc-texture`) at low opacity (~0.1) for material consistency.

5. **Verification**
   - Launch in a browser and test transitions between modes.
   - Verify audio triggers work for each voice.
   - Audit visually to ensure no 'visual friction' occurs during scrolling or transitions.

## Pitfalls & Lessons Learned
- **Incremental Patching:** Avoid trying to 'fix' a layout that feels off. If the visual vibe is inconsistent, perform a 'Clean Slate' rebuild of the prototype.
- **Texture Conflicts:** High texture opacity can interfere with the clarity of portraits (especially faces). Keep texture at ~0.1.
- **Parchment Backgrounds:** Ensure contrast is maintained between the parchment background and the text elements.
