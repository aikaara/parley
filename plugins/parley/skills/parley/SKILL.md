---
name: parley
description: Set up, check, change or remove a parley chat assistant for the user's business. Use when the user says "set up parley", "add a chat assistant / chatbot to my site", "check parley", "show my parley conversations", "change what the assistant says", or "connect email/WhatsApp/Telegram to my assistant". parley answers the business's customers on its website (and optionally WhatsApp or Telegram), emails the owner a daily summary, and is managed entirely by asking the coding agent.
---

# parley

parley gives a business its own chat assistant:

- It answers visitors on the website through a chat button on every page, and optionally by email, WhatsApp or Telegram.
- Its knowledge and rules come from the business's own website and the owner's answers. It doesn't make things up, and it hands over to a human for anything it can't handle.
- Each morning the owner gets an email: how many people it talked to, what they asked, and which conversations need a human.
- The owner changes anything, such as what it says, what it must never say, or its name or greeting, by asking their coding agent. That's you.

You manage parley through the **parley MCP server** (`https://mcp.aikaara.com/parley`). Its tools are `create_agent`, `update_agent`, `get_agent`, `list_agents`, `chat`, `publish_web`, `conversations`, `read_conversation`, `set_digest`, `usage`, `connect_email`, `connect_whatsapp`, `connect_telegram`, `send_message` and `report_bug`.

**The person you are helping is probably not a developer.** Use plain words. Never ask them to edit code, and never paste terminal output or JSON at them. Ask only what you can't find out yourself. Explain each thing they have to click in one or two short sentences.

## 0. Connect parley (once per tool)

If the parley tools aren't available to you yet, connect the server, then have the owner sign in. Sign-in is by email: they get a 6-digit code and can add a passkey.

- **Claude Code:** run `claude mcp add --transport http parley https://mcp.aikaara.com/parley`. Then tell the owner: "Type `/mcp`, pick **parley** and choose **Authenticate**. A browser page asks for your email and a code we send you." Once they've signed in, the tools appear.
- **Cursor:** add `"parley": { "url": "https://mcp.aikaara.com/parley" }` under `mcpServers` in `.cursor/mcp.json` (create the file if needed), then have them open Cursor Settings → MCP and sign in to parley.
- **Codex and others:** add an MCP server named `parley` with the URL `https://mcp.aikaara.com/parley`, using the tool's usual way, and have the owner sign in when it asks.
- **claude.ai or Claude Desktop:** the owner adds it under Settings → Connectors → Add custom connector, with the URL `https://mcp.aikaara.com/parley`.

The account belongs to whoever signs in. The daily email goes to that address.

## Set up ("set up parley", "add a chat assistant")

### 1. Look before you ask
If you're in a website project, find out on your own:
- **What the business is:** read the home, about, services/products, pricing, FAQ, contact, shipping/returns and policy pages, or their content files.
- **Facts the assistant will need:** opening hours, locations, prices or price ranges, delivery areas, how to book or buy, refund and cancellation rules, and contact details (email, phone, WhatsApp).
- **Framework and deployment:** read `package.json` or the folder layout, the git remote and the host config. Find out whether pushing deploys the site.
- **The base layout** where a `<script>` can go on every page: Next.js `app/layout`, `_document`, Astro/SvelteKit/Remix root layouts, or `index.html` for plain sites.
- **An existing chat widget** (Intercom, Crisp, Tidio, Tawk, WhatsApp button…). If there is one, you'll ask about it in step 2.

If you're **not** in a website project (e.g. claude.ai), ask for the website address and read it if you can browse. Otherwise ask the owner to describe the business in a few sentences.

### 2. Ask once
In a single short message, ask for:
- what the assistant should help with (answering questions, taking enquiries, booking, sales…), if it isn't obvious;
- anything it must never do or promise (discounts, medical/legal advice, delivery dates…);
- who takes over when it can't help, and how (an email, a phone number, a WhatsApp link);
- whether to replace the existing chat widget, if you found one (recommend replacing, so visitors don't get two).

Don't ask for anything you already found.

### 3. Write the assistant's instructions
Write the `instructions` (its system prompt) yourself, in this shape:
- **Who it is:** "You are the assistant for <business>, <one line on what they do>."
- **What it helps with,** as a short list.
- **Facts:** only what the site or the owner said. Hours, prices, areas, policies, contact. Never invent a fact, price or policy. If something isn't here, it doesn't know it.
- **Rules:**
  - be brief and friendly;
  - answer in the visitor's language;
  - when unsure, or for anything it may not do, say so plainly and offer the handover contact;
  - never promise what the owner ruled out;
  - never ask for card numbers or passwords.
- **Handover:** the exact words and contact for reaching a human.

Pick a short `greeting` ("Hi! I can help with orders, delivery and returns. What do you need?").

### 4. Create it and test it
- `create_agent` with the business name, your `instructions` and `greeting`.
- `chat` with it 3–4 times as a real visitor would: two common questions, one it must refuse or hand over, and one in another language if the business has international visitors. If an answer is wrong, fix the instructions with `update_agent` and test again. Show the owner one good exchange in plain words, not the transcript.

### 5. Put it on the website
- `publish_web` returns a `script` line. Add it once to the base layout so the chat button appears on every page:
  - Next.js App Router: use `<Script src="…/embed.js" data-agent="…" strategy="afterInteractive" />` from `next/script` in `app/layout`. Pages Router: put it in `_document`.
  - Other frameworks: put the `<script … defer>` tag before `</body>` in the base layout.
  - If you're replacing an old widget, remove its snippet in the same change.
- Optional attributes: `data-color="#hex"` to match the brand, `data-label="Ask us"`, `data-position="left"`.
- Run the project's build and fix any errors.
- **Ask before pushing,** because pushing usually deploys the live site. Then commit with a clear message and push to the branch that deploys.
- **No website folder?** Give the owner the `chat_url`, which already works as a link they can share anywhere. Also give them the one `script` line to pass to whoever manages their website.

### 6. The daily email
Call `set_digest` with no arguments to confirm who gets it. It goes to the address they signed in with, at 9:00 in the morning, India time. If they want a different time, timezone or an extra address, set it now (`hour`, `timezone`, `email`).

### 7. Leave a note for future sessions
In a website project, add this to `CLAUDE.md` (create it if missing), and to `AGENTS.md` if the project has one:
```md
## parley
parley (chat assistant, agent `<slug>`) is on this site via the embed.js script in the base layout.
To check or change it, use the parley MCP tools (server https://mcp.aikaara.com/parley); the playbook is at https://parley.aikaara.com/install.md.
```

### 8. Tell them what to expect
Close in plain words:
- the chat button is live on every page (or here is your link);
- a short email each morning: who it talked to, what they asked, and anything that needs them;
- to change anything, just ask: "change what the assistant says about delivery", "show me yesterday's conversations".

## Check ("check parley", "is my assistant working?")
- `list_agents`: is it active and published?
- `usage`: conversations today. Also check whether it's on parley's included allowance or their own AI key.
- `conversations`: anything recent that looks stuck. Summarise in plain words: how many people, what they asked, and anything unanswered.
- On a website, fetch the live homepage and confirm the `embed.js` script tag is there.

## Change it
- **"Show me conversations" / "what did people ask?"** Use `conversations`, then `read_conversation` for any that matter. Summarise; don't paste transcripts unless asked.
- **"It got X wrong" / "make it say Y":**
  1. Read the conversation if there is one.
  2. Run `get_agent` and edit the existing `instructions` minimally, keeping every other rule.
  3. Apply it with `update_agent`.
  4. Test the same question with `chat`.

  Every change is kept as a revision, so it can be undone.
- **Pause it:** `update_agent` with `active: false`. To resume, `active: true`.
- **Change the daily email:** `set_digest`.

## Add email, WhatsApp or Telegram (optional)
- **Email:** `connect_email` gives the assistant its own address (for example `acme@mail.parley.aikaara.com`). Customers can email it directly, or the owner can forward their support inbox to it. The assistant replies in the same email thread, and attachments and voice notes reach it too.
- **Telegram:** the owner creates a bot with @BotFather in Telegram and gives you the token. Then call `connect_telegram`.
- **WhatsApp:** needs a WhatsApp Business number on Meta's Cloud API. The owner gets the Phone number ID, a permanent access token and the app secret from their Meta app. Then call `connect_whatsapp`, and walk them through pasting the returned webhook URL and verify token into Meta's WhatsApp → Configuration.
- Pass tokens straight to the tool. Never repeat them back, and never write them into any file.

## Add-on: let other apps or AI agents talk to it
Owners who run their own software can feed it conversations from elsewhere. `message` sends a message into a named thread (an email thread, a form, another agent) and returns the assistant's reply for their app to deliver. Offer this only if they ask; most businesses don't need it.

## Remove
Remove the `embed.js` script tag (and the `CLAUDE.md`/`AGENTS.md` note) from the site, and push with permission. Then pause the assistant with `update_agent` `active: false`. Turn off the email with `set_digest` `enabled: false`.

## If something is wrong with parley itself
Use `report_bug` with what happened and the conversation or agent involved. The parley team sees it within minutes.
