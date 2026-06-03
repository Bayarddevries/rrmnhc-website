# Deploy contract: rrmnhc-website

## Live site
https://bayarddevries.github.io/rrmnhc-website/

## How it deploys
GitHub Pages from `master`.
No build step; static HTML/CSS/JS served directly.

## Local preview
python3 -m http.server 8080

## Verification
- index.html loads with navigation and Hero
- contact.html and news pages render
- artifacts-viewer.html loads without JS console errors

## Rollback
git revert HEAD
git push origin master

## Issue Tracking
GitHub Issues: https://github.com/Bayarddevries/rrmnhc-website/issues
Board: "RRMNHC Website" (project #4 + #6)
 