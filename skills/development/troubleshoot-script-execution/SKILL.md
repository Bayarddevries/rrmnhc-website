---
name: troubleshoot-script-execution
description: Troubleshoots errors encountered when executing complex command-line scripts, particularly those involving bash, sudo, virtual environments, and external dependencies.
author: Hermes AI
version: 1.1.0
created_at: 2024-04-07
updated_at: 2026-04-08
category: development
---

# Skill Description
This skill outlines a systematic approach to debugging and executing shell scripts that may fail due to syntax errors, privilege issues, or complex dependency management. It emphasizes identifying the root cause of script failure and adapting execution strategies when direct tool execution is insufficient.

# Use Cases
- Debugging custom shell scripts intended for installation or setup tasks.
- Handling scripts that require `sudo` privileges.
- Resolving issues with Python virtual environments and package installations (`pip`, `pipx`).
- Adapting scripts for execution in different environments (e.g., `execute_code` sandbox vs. `terminal`).

# Stages

## Stage 1: Initial Execution Attempt & Error Analysis
1.  **Attempt Script Execution:** Use `execute_code` or `terminal` for the initial run of the provided script.
2.  **Analyze Error Output:**
    *   **Syntax Errors (e.g., `SyntaxError: invalid syntax` in `execute_code`):** This often indicates that the `execute_code` sandbox is not suitable for the script's syntax (e.g., bashisms in a Python environment).
    *   **Permission Errors (`sudo: a password is required`):** This signifies the script requires elevated privileges that cannot be automatically provided by the agent.
    *   **Dependency Errors:** Look for messages indicating missing commands, libraries, or packages (`apt`, `pip`, `pipx`).
    *   **Runtime Errors:** Analyze stack traces or command-specific error messages.

## Stage 2: Adapting the Execution Strategy

### Scenario A: Bash Syntax Errors in `execute_code`
- **Finding:** `execute_code` is a Python sandbox. Bash commands with bash-specific syntax (like `set -euo pipefail`) will fail.
- **Solution:** Use the `terminal` tool instead, ensuring the command is passed correctly. For complex bash scripts, consider using `bash -lc '...'` to ensure a proper shell environment.

### Scenario B: `sudo` Permission Errors
- **Finding:** Scripts requiring `sudo` cannot be automated directly by the agent due to security.
- **Solution:**
    1.  **Inform the User:** Clearly state that `sudo` requires user interaction.
    2.  **Provide Manual Steps:** Offer detailed, step-by-step instructions for the user to run the script locally, including how to handle the `sudo` password prompt.
    3.  **Break Down Privileged Steps:** If possible, separate the script into non-privileged and privileged sections. Guide the user to run the privileged parts manually.

### Scenario C: Dependency Errors
- **Finding:** The script fails because required tools or packages are missing.
- **Solution:**
    1.  **Identify Dependencies:** Parse error messages or the script's own `apt`, `pip`, or `pipx` commands.
    2.  **Provide Installation Commands:** Give the user explicit commands to install these dependencies.
    3.  **Update Script:** If feasible, modify the script to include dependency installation steps (using `sudo apt install`, `pip install`, `pipx install`).

## Stage 3: Script Refinement and User Guidance

- **Iterative Debugging:** If a fix is applied, re-run the script and analyze the new output.
- **Clear Communication:** Always explain *why* a method failed and *why* the new approach is being taken.
- **User Action Required:** Explicitly state what user action is necessary (e.g., "Please run this command in your local terminal," "You will need to enter your sudo password").

# Example Walkthrough (Agent Reach Installation)

1.  **Initial Attempt:** User provides a bash script. Agent tries `execute_code`.
2.  **Failure:** `SyntaxError: invalid syntax` occurs because `set -euo pipefail` is bash syntax, not Python.
3.  **Strategy Change:** Agent recognizes `execute_code` is wrong for bash. Switches to `terminal` tool with `bash -lc`.
4.  **New Failure:** Script starts, but `sudo apt update` prompts for a password. Agent cannot proceed.
5.  **User Guidance:** Agent informs the user about the `sudo` limitation and provides a manual execution plan for them to follow locally.

# Related Skills
- `systematic-debugging`: For general bug fixing.
- `docker-script-execution`: For running scripts within Docker containers.

# Pitfalls
- **Hardcoded Paths:** Avoid hardcoding paths that may not exist in the execution environment.
- **Interactive Prompts:** Fully interactive scripts (beyond simple password prompts) are difficult to automate.
- **Tool Limitations:** Understand the sandbox limitations of `execute_code`.
