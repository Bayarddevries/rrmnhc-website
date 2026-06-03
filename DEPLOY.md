# Deploy contract: rrmnhc-website

## Live site
https://bayarddevries.github.io/rrmnhc-website/

## How it deploys
GitHub Pages from `master` branch.
No build step; serves static HTML/CSS/JS.

## Local preview
python3 -m http.server 8080

## Verification
- index.html loads with MMF logo and nav
- artifacts-viewer.html loads without JS console errors
- Shoebox alias `/shoebox-v2` resolves when symlink is present

## Rollback
git revert HEAD
git push origin master
