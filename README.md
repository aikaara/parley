# parley

A chat assistant for your business, set up and run from your coding agent.

- **Built from your website.** It answers with your hours, prices and policies. It never invents facts, and it hands over to you when it can't help.
- **On every page.** It adds one line to your site for a chat button. Optionally it also answers on WhatsApp or Telegram.
- **A daily email.** You hear who it talked to, what they asked, and which conversations need you.
- **Change anything by asking.** "Make it mention free delivery over ₹999", "show me yesterday's conversations".

## Install

In Claude Code, Cursor or Codex, open your website's folder and paste:

```
Set up parley on this site: run `curl -fsSL https://parley.aikaara.com/install.md` and follow it.
```

Or install the Claude Code plugin:

```
/plugin marketplace add aikaara/parley
/plugin install parley@parley
```

Using Claude in the browser or Claude Desktop instead? Add a custom connector with the URL `https://mcp.aikaara.com/parley`, then say "set up parley for my business".

You sign in with your email (a 6-digit code, or a passkey). There's nothing else to sign up for.

## What's in this repo

- `plugins/parley/skills/parley/SKILL.md`: the playbook your coding agent follows. `public/install.md` is generated from it (`node scripts/install-md.mjs`).
- `plugins/parley/.mcp.json`: connects the parley MCP server (`https://mcp.aikaara.com/parley`) when the plugin is installed.

The parley service itself runs on [Aikaara](https://aikaara.com).
