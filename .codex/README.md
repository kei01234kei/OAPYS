# Project Codex Configuration

**English** | [日本語](README.ja.md)

`config.toml` contains shared project settings. The current user-selected values are `approval_policy = "never"` and `sandbox_mode = "danger-full-access"`: Codex is configured to run without approval prompts and without its filesystem sandbox, subject to host and administrator restrictions. Model and authentication settings remain inherited.

Workflow instructions are in [AGENTS.md](../AGENTS.md). Japanese translations are for maintainers; Codex reads the active `AGENTS.md` file.
Project configuration is loaded only for trusted projects. It does not change repository visibility or override operating system or administrator restrictions.

Keep credentials, local state, and machine-specific paths out of this directory.

References: [OpenAI configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) and [AGENTS.md instructions](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
