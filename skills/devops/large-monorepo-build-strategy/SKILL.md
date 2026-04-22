---
name: large-monorepo-build-strategy
description: Approach for installing and building massive TypeScript monorepos in environments with strict command timeouts.
---
# Large Monorepo Build Strategy (pnpm)

This skill outlines the approach for installing and building massive TypeScript monorepos (e.g., 20+ workspace projects, 600+ dependencies) in environments with strict command timeouts.

## Trigger Conditions
- Installing/building a monorepo with a high number of workspace projects.
- Encountering repeated `Command timed out` or `interrupted` errors during `pnpm install` or `pnpm build`.
- Heavy I/O or network-bound linking phases that exceed standard agent tool timeouts.

## Numbered Steps
1. **Environment Setup**: Ensure `pnpm` is installed and added to the `$PATH` for the current session.
2. **Avoid Sequential Tool Calls**: Do not run `pnpm install` and `pnpm build` in separate tool calls if the environment is prone to timeouts, as this duplicates the overhead and increases the chance of failure.
3. **Use Background Processes**: Launch the entire chain (install -> build -> verify) as a single background process using `terminal(background=true)`.
4. **Set Notification**: Enable `notify_on_complete=true` to allow the system to alert the agent upon process exit.
5. **Poll for Progress**: Use `process(action='poll')` to monitor the `uptime_seconds` and `status` without blocking the main conversation or risking a tool timeout.
6. **Verification**: Once the background process is `completed`, verify the binary using `pnpm exec <command> --version`.

## Pitfalls
- **Timeout Loops**: Running the same failing command with a slightly higher timeout often fails again if the task is fundamentally longer than the maximum allowed tool execution time.
- **Pathing**: Always `cd` into the root of the monorepo before executing `pnpm` commands to ensure the workspace manifest is found.
- **Lockfile Drift**: If `pnpm install` fails due to lockfile mismatches, use `--no-frozen-lockfile`.

## Verification
- Process status moves from `running` to `completed`.
- Binary check returns a valid version number.
