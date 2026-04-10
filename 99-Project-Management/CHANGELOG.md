# RRMNHC Website Development - Change Log

All changes are tracked via Git. This log provides a high-level history of major architectural and design shifts.

## [Unreleased]
- *Pending implementation of Reader Rail prototypes.*

## [1.0.0] - 2026-04-09
### Added
- **Core Website Structure:** Established `index.html`, `news.html`, and `contact.html`.
- **Design System:** Created `assets/css/style.css` using a centralized Design Token system (Colors, Typography, Spacing, Shadows).
- **Design Lab:** Turned `rrmnhc_design_spec_showcase.html` into an interactive lab with typography usage tags.
- **News Pipeline:** Implemented the `rrmnhc-news-production-pipeline` skill for automated story and image deployment.
- **Deployment Workflow:** Established `main` (production) and `develop` (staging) branches on GitHub Pages.

### Fixed
- **Navigation Links:** Fixed broken navigation links on all pages using explicit relative paths.
- **News Grid Corruption:** Performed a "Nuclear Reset" on `news.html` to fix broken HTML tags and missing articles.
- **Image Mismatch:** Ensured Articles 2 and 3 display unique images.
- **Visual Interference:** Reduced `.doc-texture` opacity from `0.4` to `0.1` to prevent the texture from affecting faces.
