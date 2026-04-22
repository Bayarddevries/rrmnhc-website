---
name: docker-mcp-wrapper-integration
description: A procedural approach for integrating MCP servers that run within Docker containers into the Hermes Agent environment using a shell wrapper.
---

# Skill: Docker-Based MCP Wrapper Integration

## Description
A procedural approach for integrating MCP (Model Context Protocol) servers that run within Docker containers into the Hermes Agent environment. This solves the problem of complex dependency management and environment isolation by using a lightweight shell wrapper to pass secrets (like PATs) into a containerized MCP server.

## Use Cases
- Running MCP servers that require specific toolchains (Node, Python, etc.) without polluting the host environment.
- Securely passing API keys/Tokens to containerized MCP processes.
- Managing MCP servers that require specific Docker images.

## Procedure

### 1. Create the Wrapper Script
Create a bash script (e.g., `~/run-[mcp-name].sh`) that executes the `docker run` command. This script acts as the entry point for Hermes.

**Template:**
```bash
#!/bin/bash
docker run -i --rm \
  -e [ENV_VAR_NAME]=[YOUR_SECRET_TOKEN] \
  [IMAGE_NAME]
```

### 2. Secure the Wrapper
Ensure the script is executable and permissions are correct.
- `chmod +x ~/run-[mcp-name].sh`

### 3. Configure Hermes
Add the wrapper script to the `mcpServers` section of `~/.hermes/config.yaml`.

**Example Configuration:**
```yaml
mcpServers:
  [mcp-name]:
    command: "/home/[username]/run-[mcp-name].sh"
    args: []
    env: {}
```

### 4. Verification & Reload
1. **Validate YAML:** Use `python3 -c "import yaml; yaml.safe_load(open('~/.hermes/config.yaml'))"` to ensure no syntax errors.
2. **Verify Image:** Run the wrapper script manually in the terminal once to ensure the image pulls and the server starts (`docker run ...`).
3. **Restart Hermes Gateway:** Since Hermes loads MCP servers on startup, you must restart the gateway process to pick up the new configuration.
   - Identify the gateway PID: `ps aux | grep -i hermes`
   - Kill the process: `kill [PID]`
   - Restart the gateway (or let your supervisor/systemd restart it).
4. **Final Check:** Run `hermes mcp list` to confirm the new server appears with a `✓ enabled` status.

## Pitfalls
- **Pathing:** Always use absolute paths in `config.yaml` (e.g., `/home/user/...` instead of `~/...`).
- **Permissions:** Ensure the user running the Hermes gateway is in the `docker` group.
- **Blocking Processes:** If the gateway doesn't restart, check for zombie processes using `ps aux`.
- **Environment Variables:** If passing multiple variables, ensure they are correctly escaped in the wrapper script.
