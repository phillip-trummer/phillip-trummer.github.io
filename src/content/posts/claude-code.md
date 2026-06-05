---
title: Claude Code Harness
description: Explaining the simple agent loop behind Claude Code.
date: 2026-05-16
tags:
  - claude code
  - harness engineering
---

The harness behind claude code is a surprisingly simple agent loop:

```python
def agent_loop() -> str:
    # Initialize conversation.
    messages = [{"role": "user", "content": "What is the meaning of life"}]

    while True:
        # Ask agent.
        response = client.messages.create(
            model=MODEL, system=SYSTEM, messages=messages,
            tools=PARENT_TOOLS, max_tokens=8000,
        )

        # Save agent response.
        messages.append({"role": "assistant", "content": response.content})

        # Return agent's final response.
        if response.stop_reason != "tool_use":
            text = "".join(b.text for b in response.content if hasattr(b, "text"))
            if text:
                return text

        # Run requested tools.
        results = []
        for block in response.content:
            if block.type == "tool_use":
                handler = TOOL_HANDLERS.get(block.name)
                output = handler(**block.input) if handler else f"Unknown tool: {block.name}"
                results.append({"type": "tool_result", "tool_use_id": block.id, "content": str(output)})

        # Add tool results to conversation as user messages.
        messages.append({"role": "user", "content": results})
```

A simple implementation of the bash tool looks like this: 

```python 
def run_bash(command: str) -> str:
    dangerous = ["rm -rf /", "sudo", "shutdown", "reboot", "> /dev/"]
    if any(d in command for d in dangerous):
        return "Error: Dangerous command blocked"
    try:
        r = subprocess.run(command, shell=True, cwd=WORKDIR,
                           capture_output=True, text=True,
                           encoding="utf-8", errors="replace", timeout=120)
        out = (r.stdout + r.stderr).strip()
        return out[:50000] if out else "(no output)"
    except subprocess.TimeoutExpired:
        return "Error: Timeout (120s)"
    except (FileNotFoundError, OSError) as e:
        return f"Error: {e}"

TOOL_HANDLERS = {
    "bash": run_bash,
    <other tools>
}

TOOLS = [
  {
    "name": "bash",
    "description": "Run a shell command.",
    "input_schema": {
        "type": "object",
        "properties": {"command": {"type": "string"}},
        "required": ["command"],
    }
  },
  {
    <other tools>
  }
    ]
```