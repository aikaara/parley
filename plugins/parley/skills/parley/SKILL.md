---
name: parley
description: Build a product's conversations on parley — the agent, its channels (email, Telegram, WhatsApp, your own app), its tools, transcripts, human takeover and self-learning — from the user's codebase. Use when the user says "set up parley", "use parley for our assistant/bot/support", "add an email or Telegram channel to our agent", "check parley", "show parley conversations", or wants an agent that learns from its owner.
---

# parley

parley is the conversation layer you build a product on. Your app keeps the product logic; parley runs the agent and everything around the conversation:

- **Agents:** instructions (versioned) plus **your app's HTTP endpoints as tools**. The agent calls them with JSON arguments.
- **Channels:**
  - **email:** each agent gets its own address, or your app hands parley the mail it receives;
  - **Telegram:** one shared bot for every agent, with links that bind a chat to an agent;
  - **WhatsApp**;
  - **your own app:** a `message` API with named threads.
- **Conversations:** threads, transcripts with tool calls, a dashboard with "reply as a human", and buttons. Voice notes are transcribed; files become URLs.
- **Self-learning:** the agent picks up its owner's standing preferences from corrections, follows them, and the owner can review or remove any of them.
- **Owner email:** a daily summary of what the agent did and what needs a human.
- **Model gateway:** an OpenAI-compatible endpoint with per-customer usage, transcription, and file/URL → text.

You work through the **parley MCP server** (`https://mcp.aikaara.com/parley`). Your app's server talks to the same endpoint with a service token.

**Who you're helping:** usually a developer building a product. Be precise about interfaces, and never put secrets in code, files or chat.

## 0. Connect parley

If the parley tools aren't available yet:

- **Claude Code:** run `claude mcp add --transport http parley https://mcp.aikaara.com/parley`, then have the user type `/mcp` → parley → **Authenticate**. They sign in with an email code or a passkey.
- **Cursor:** add `"parley": { "url": "https://mcp.aikaara.com/parley" }` to `.cursor/mcp.json` and sign in from Settings → MCP.
- **Other tools (Codex, claude.ai, Claude Desktop):** add an MCP server or custom connector with that URL.

Signing in creates the user's parley workspace.

**For their app's server:** call `create_service_token{name}`. Have the user store the token as a secret in their app (e.g. `PARLEY_TOKEN`); never write it to a file you commit. The app sends it as `Authorization: Bearer` to the same MCP URL (JSON-RPC `tools/call`).

## 1. Look before you ask

Read the codebase:
- what the product does;
- who the agent talks to: the product's customers, or its owner;
- which actions the agent will need. These become tools: existing API routes, or ones you add.
- which channels the product already uses: an email provider, a Telegram bot, WhatsApp.

Then ask once for anything you couldn't find:
- what the agent is for;
- what it must never do;
- which channels to use;
- whether it should learn from the people it talks to. Only when those people ARE the owner.

## 2. The agent and its tools

1. Run `create_agent{name, instructions, slug, greeting}`. Write the instructions from facts in the codebase and from the user; never invent policies.
2. For each action, expose an HTTP endpoint in the app and register it with `add_tool{agent, name, description, url, parameters (JSON Schema), headers}`.
   - **Request:** a POST whose body is the arguments.
   - **Timeouts:** connect 30s, read 60s. Return quickly and post slow results back later with `send_message`.
   - **Response:** 2xx with a short JSON result, which goes to the model; non-2xx with `{"error": "…"}`. Make writes idempotent, since there are no retries.
   - **Headers** may use `{{agent.slug}}`, `{{conversation.id}}`, `{{user.ext_uid}}`, and `{{credential.<name>}}` for a secret the user enters in the parley dashboard (Configuration → Credentials). Never put the secret itself in headers.
   - **Shared tools:** the same tool name + URL on many agents is one shared tool. A product with one agent per customer registers the tool once and tells the agents apart by `{{agent.slug}}`.
3. Test with `chat{agent, message}`: the common cases, one it must refuse, and one that calls each tool.

## 3. Channels

- **Email (native):** `connect_email{agent}` gives the agent `<handle>@mail.parley.aikaara.com`.
  - Replies go out in the same thread. Buttons become links, attachments become URLs, and audio is transcribed.
  - Customers can also forward a support inbox to that address.
- **Email (bridge, the app already receives mail):** the app calls `receive_email{agent, from, subject, text, message_id, in_reply_to, references, attachments, deliver:"app"}` for each inbound email.
  - parley threads it and returns `reply`. The app sends the reply itself.
  - With buttons, the app also gets `button_links` to include.
- **Telegram:** `connect_telegram{shared:true, bot_token}` connects one bot for every agent.
  - `telegram_claim{agent}` returns a one-time `t.me/<bot>?start=<code>` link. Opening it binds that chat to the agent.
  - Pass the bot token straight to the tool; never repeat it or store it.
- **WhatsApp:** `connect_whatsapp{agent, phone_number_id, access_token, app_secret}`, then put the returned webhook URL and verify token into the Meta app.
- **Your own app's UI:** `message{agent, thread, text}` returns the agent's reply for a named thread. `log_message{agent, thread, role, text}` records an exchange that happened elsewhere, such as a Claude connector, without a reply.

**Proactive messages and buttons:** `send_message{conversation_id, text, buttons:[{label, value}]}`.
- Telegram shows an inline keyboard; email and app threads get links.
- A press reaches the agent as `[button] <label> (<value>)`.
- Scheduling, for example a morning message at the owner's local time, stays in the app.

## 4. Learning (optional)

`set_learning{agent, enabled:true, learn_from, kinds?}`:
- `learn_from: "users"`: ONLY when the people the agent talks to are its owner, such as a personal assistant or a newsletter chief of staff.
- `learn_from: "owner"` (default): learns only from the owner's own tests, dashboard replies and evidence the app posts. Use this for anything customer-facing, so customers can never teach it rules.

The app can feed outcomes and read the rules:
- `add_evidence{agent, text, origin?, kind?}`: e.g. "first draft vs the version the owner approved";
- `record_metric{agent, name, value}` and `metrics{agent}`: is it improving;
- `list_lessons{agent}` → `prompt_block`: inject it into any prompt the app runs itself;
- `lessons_digest{agent}`: new rules plus ready-made buttons, for a weekly check-in.

The owner can ask the agent "what have you learned?" or "forget that rule"; the agent calls its built-in `list_lessons` / `change_lesson`.

## 5. Model gateway (optional)

For the app's own LLM calls:
- **Endpoint:** OpenAI-compatible, `https://api.aikaara.com/gateway/v1`, with a `grk_` key the user creates in the dashboard (AI Gateway → LLM routing clients). Send it as `Authorization: Bearer`.
- **Usage per customer:** send `user` (or an `X-Tenant` header); read it back with `GET /gateway/v1/usage?group_by=end_user`.
- **Model choice:** the request's `model` can pick another of the workspace's models if the key allows it.
- **Also:** `POST /gateway/v1/audio/transcriptions` and `POST /gateway/v1/extract` (file or URL → text).

## 6. Leave a note

In `CLAUDE.md` (and `AGENTS.md` if present), add:

```md
## parley
This product's conversations run on parley (agents: <slugs>; MCP https://mcp.aikaara.com/parley; app token in <secret name>).
Tools are this app's endpoints under <path>. Playbook: https://parley.aikaara.com/install.md
```

## Check / operate

- **Check:** `list_agents`, `usage`, and `conversations{agent?, channel?}` → `[{id, agent, channel, status, …}]`; `read_conversation{conversation_id}` for one transcript.
- **Change behaviour:** `get_agent`, then a minimal edit to `instructions` with `update_agent`, then `chat` to re-test. Every change is a revision.
- **Pause:** `update_agent{active:false}`.
- **Daily owner email:** `set_digest`.
- **Human takeover:** the dashboard conversation view → **reply as a human**, sent over the conversation's channel.
- **Bugs in parley itself:** `report_bug`.
