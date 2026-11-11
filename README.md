# parley

The conversation layer to build products on. Your app keeps its product logic; parley runs the agent and everything around the conversation.

- **Agents** whose tools are your app's own HTTP endpoints.
- **Channels:**
  - email: a native address per agent, or a bridge for mail your app receives;
  - Telegram: one shared bot, with a link per customer;
  - WhatsApp;
  - your own UI, through a threads API.
- **Conversations:** transcripts, a dashboard with "reply as a human", buttons, voice notes transcribed, and files as URLs.
- **Self-learning:** agents learn their owner's standing preferences from corrections, and the owner can review and remove them.
- **A model gateway:** OpenAI-compatible, with per-customer usage, transcription and file/URL → text.

## Install

In Claude Code, Cursor or Codex, open your product's repo and paste:

```
Set up parley for this product: run `curl -fsSL https://parley.aikaara.com/install.md` and follow it.
```

Or install the Claude Code plugin:

```
/plugin marketplace add aikaara/parley
/plugin install parley@parley
```

The MCP server is `https://mcp.aikaara.com/parley`. You sign in with an email code or a passkey, and your app's server uses a service token.

## In this repo

- `plugins/parley/skills/parley/SKILL.md`: the playbook. `public/install.md` is generated from it with `node scripts/install-md.mjs`.
- `plugins/parley/.mcp.json`: connects the parley MCP server when the plugin is installed.
