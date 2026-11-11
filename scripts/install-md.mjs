// Builds public/install.md (served at https://parley.aikaara.com/install.md)
// from the plugin's skill, so the one-line install and the plugin always
// follow the same playbook. Run after editing the skill: `node scripts/install-md.mjs`.
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const skill = await readFile(new URL('../plugins/parley/skills/parley/SKILL.md', import.meta.url), 'utf8');
const body = skill.replace(/^---\n[\s\S]*?\n---\n+/, '');

const preamble = `<!-- parley install playbook for coding agents (Claude Code, Cursor, Codex…) and Claude. Generated from plugins/parley/skills/parley/SKILL.md. -->

> **For the agent reading this:** the user asked you to set up, check or change their parley chat assistant. Follow this playbook. The service is https://parley.aikaara.com and its MCP server is https://mcp.aikaara.com/parley.

`;

await mkdir(new URL('../public/', import.meta.url), { recursive: true });
await writeFile(new URL('../public/install.md', import.meta.url), preamble + body);
console.log('wrote public/install.md');
