---
name: github-pages-deploy-recovery
description: Workflow for deploying local projects to GitHub Pages when terminal git pushes encounter 403 Forbidden errors despite active 'gh' authentication.
---

# GitHub Pages Deploy Recovery

This skill outlines the process for pushing a local directory to a new GitHub repository and preparing it for GitHub Pages when standard `git push` fails with 403 errors.

## Trigger Conditions
- Need to deploy a local project to GitHub Pages.
- `gh auth status` shows a logged-in account, but `git push` returns `remote: Permission to ... denied` or `HTTP 403`.
- Repository needs to be created and initialized from a specific local sub-directory.

## Procedure

### 1. Repository Creation
Create the public repository using the GitHub CLI:
```bash
gh repo create <repo-name> --public
```

### 2. Local Initialization & Staging
Navigate to the specific project folder (e.g., the folder containing `index.html`) and initialize git:
```bash
cd /path/to/project/folder
git init
git add .
git commit -m "Initial deploy"
```

### 3. Authentication Bypass (The 403 Fix)
When `git push` fails with 403 despite `gh` being authenticated, use a Personal Access Token (PAT) embedded in the remote URL to force authentication:
```bash
git remote add origin https://<username>:<token>@github.com/<username>/<repo-name>.git
# OR if remote already exists:
git remote set-url origin https://<username>:<token>@github.com/<username>/<repo-name>.git
```
Then push the branch:
```bash
git branch -M main
git push -u origin main
```

### 4. GitHub Pages Configuration
Note that `gh repo edit` may not support `--enable-pages` depending on the CLI version/token scope. 
- **Manual Step:** The user must navigate to `https://github.com/<username>/<repo-name>/settings/pages`.
- **Configuration:** Set "Build and deployment" $\rightarrow$ "Source" to "Deploy from a branch".
- **Branch:** Select `main` and folder `/(root)`.
- **Save.**

## Pitfalls & Troubleshooting
- **Token Scope:** Ensure the PAT has `repo` and `workflow` scopes.
- **Wrong Directory:** Ensure you are initializing git in the folder containing the `index.html` file, not the parent project root, unless the root is the intended site root.
- **Branch Naming:** Always ensure the branch is renamed to `main` via `git branch -M main` before pushing to align with GitHub defaults.

## Verification
- Verify the files are present at `https://github.com/<username>/<repo-name>`.
- Once Pages is enabled, verify the site loads at `https://<username>.github.io/<repo-name>/`.
