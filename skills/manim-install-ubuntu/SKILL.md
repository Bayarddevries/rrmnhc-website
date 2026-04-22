---
name: manim-install-ubuntu
description: Install Manim Community Edition on Ubuntu 24.04 with WSL2, including handling dpkg locks, PEP 668 restrictions, and pangocairo dependency errors.
version: 1.0.0
---

# Manim Installation on Ubuntu 24.04 / WSL2

Follow these exact steps. Do not skip step 1, or you will hit "dpkg interrupted" locks.

## Step 1: Fix any interrupted apt sessions
If the user gets `E: dpkg was interrupted`, run:
```bash
sudo dpkg --configure -a
```

## Step 2: Install System Dependencies
Manim requires `cairo` and `pango` development headers. If these are missing, the python build for `manimpango` will fail with `Package pangocairo was not found`.

```bash
sudo apt install -y libcairo2-dev libpango1.0-dev pkg-config ffmpeg texlive texlive-latex-extra texlive-fonts-recommended texlive-fonts-extra texlive-pictures texlive-xetex texlive-science
```

## Step 3: Install Python pip (if missing)
```bash
sudo apt install -y python3-pip
```

## Step 4: Install Manim
On Ubuntu 24.04, pip blocks system-wide installs (PEP 668). You must use the `--break-system-packages` flag:

```bash
pip3 install manim --break-system-packages
```

**Note:** If the user is inside a WSL2 environment without root access to global site-packages, use:
```bash
pip3 install manim --break-system-packages --user
```

## Step 5: Verify
```bash
manim --version
# Expected output: Manim Community v0.20.1 (or newer)
```

## Step 6: Run a Quick Test
Create a `test_scene.py`:
```python
from manim import *
class Hello(Scene):
    def construct(self):
        self.play(Create(Text("Hello Manim!")))
```
Run it:
```bash
manim -qh -s test_scene.py
```
The output `.png` will be in the `media/images/` folder by default.

## Common Errors and Fixes

### 1. "dpkg was interrupted"
**Fix:** Run `sudo dpkg --configure -a` and let it finish (can take 1-2 mins) before attempting any other install.

### 2. "externally-managed-environment" (PEP 668)
**Fix:** Use `--break-system-packages`. This is safe on a local dev machine.

### 3. "Package pangocairo was not found"
**Fix:** `sudo apt install libcairo2-dev libpango1.0-dev pkg-config`. This is a C-level build dependency for `manimpango`, so apt is required (pip cannot provide it).

### 4. "sudo: a terminal is required to read the password"
**Fix:** If running in a non-interactive environment where sudo is blocked, guide the user to run the `sudo` commands directly in their local WSL2 terminal.