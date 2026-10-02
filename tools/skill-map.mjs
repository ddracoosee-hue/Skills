#!/usr/bin/env node
// Builds SKILLS-MAP.md and skills/<category>/README.md from skills-map.json, the build prompts and
// any built SKILL.md files. Node 20+, no dependencies.
//   node tools/skill-map.mjs          write the map and the category READMEs
//   node tools/skill-map.mjs --check  exit 1 if they are out of date or the map is inconsistent
//
// SKILLS_REPO_ROOT overrides the repo root (used by the pre-commit snapshot gate
// and by tests); it defaults to the checkout holding this script.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.SKILLS_REPO_ROOT ? resolve(process.env.SKILLS_REPO_ROOT) : resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Read text with CRLF normalized to LF: Windows checkouts (core.autocrlf) store CRLF on disk,
// while the prompt/section patterns below expect LF. Generated output always uses LF.
const read = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const MAP = JSON.parse(read(join(ROOT, 'skills-map.json')));
const NAME = /\b((?:core|textclone|orion)-[a-z0-9]+(?:-[a-z0-9]+)*)\b/g;
const problems = [];

// 1. Read every build prompt block.
const prompts = {};
for (const f of readdirSync(join(ROOT, 'prompts')).filter((f) => /^[1-9]\d-.*\.md$/.test(f)).sort()) {
  const text = read(join(ROOT, 'prompts', f));
  const re = /^## (?:[\d.]+ )?`([a-z0-9-]+)` · (P\d)[^\n]*\n+```text\n([\s\S]*?)```/gm;
  for (const m of text.matchAll(re)) {
    const [, name, pri, block] = m;
    const desc = (block.match(/Description \(verbatim; change only if R2 fails\):\n(.+)\n/) ?? [])[1]?.trim() ?? '';
    const evalsAt = block.indexOf('\nEvals:');
    const trialAt = block.indexOf('\nTrial', evalsAt);
    const evals = evalsAt >= 0 ? block.slice(evalsAt, trialAt > 0 ? trialAt : undefined) : '';
    const body = block.replace(/Description \(verbatim[^\n]*\n.+\n/, '').replace(evals, '')
      .split('\n').filter((l) => !/^Build the skill|Use \/?core-skill-authoring\.|[Bb]uild after|^prompts\/01-REFINEMENT/.test(l)).join('\n');
    const notFor = new Set([...desc.matchAll(/use `([a-z0-9-]+)`/g)].map((x) => x[1]));
    const nPart = evals.slice(evals.indexOf('\nN:') >= 0 ? evals.indexOf('\nN:') : evals.length);
    for (const x of nPart.matchAll(/→\s*`?([a-z0-9-]+)`?/g)) if (x[1] !== 'none') notFor.add(x[1]);
    const works = [];
    for (const x of body.matchAll(NAME)) if (x[1] !== name && !works.includes(x[1])) works.push(x[1]);
    prompts[name] = { pri, desc, notFor: [...notFor].filter((n) => n !== name), works };
  }
}

// 2. Built skills override prompt data where they say more.
function built(cat, name) {
  const dir = join(ROOT, 'skills', cat, name);
  const md = join(dir, 'SKILL.md');
  if (!existsSync(md)) return null;
  const text = read(md);
  const desc = (text.match(/^description:\s*(.+)$/m) ?? [])[1]?.trim();
  const section = (h) => (text.match(new RegExp(`^## ${h}\\s*$([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm')) ?? [])[1] ?? '';
  const notFor = [...section('Not for').matchAll(NAME)].map((x) => x[1]);
  const related = [...(section('References').match(/^.*Related:.*$/m) ?? [''])[0].matchAll(NAME)].map((x) => x[1]);
  const log = join(dir, 'CHANGELOG.md');
  let status = 'built';
  if (existsSync(log)) {
    const firstHead = read(log).match(/^## .+$/m)?.[0];
    const v = firstHead?.match(/^## (\d+\.\d+\.\d+) — [\d-]+ — ([a-z]+)$/);
    if (!v) problems.push(`${name}: newest CHANGELOG.md entry is not "## x.y.z — YYYY-MM-DD — <status>"`);
    else status = `v${v[1]} ${v[2]}`;
  }
  return { desc, notFor, related, status };
}

// 3. Consistency: every skill in exactly one category, every skill has a prompt, catalog agrees.
const catalog = new Set([...read(join(ROOT, 'SKILLS-CATALOG.md')).matchAll(/^\| `([a-z0-9-]+)`/gm)].map((m) => m[1]));
const seen = new Map();
for (const c of MAP.categories) for (const s of c.skills) {
  if (seen.has(s)) problems.push(`${s} is in both ${seen.get(s)} and ${c.id}`);
  seen.set(s, c.id);
  if (!prompts[s]) problems.push(`${s} (${c.id}) has no build prompt`);
}
for (const s of catalog) if (!seen.has(s)) problems.push(`${s} is in SKILLS-CATALOG.md but in no category`);
for (const s of seen.keys()) if (!catalog.has(s)) problems.push(`${s} is in skills-map.json but not in SKILLS-CATALOG.md`);
for (const s of Object.keys(prompts)) if (!seen.has(s)) problems.push(`${s} has a prompt but no category`);
for (const [, f] of MAP.finder) if (!seen.has(f)) problems.push(`finder points to unknown skill ${f}`);
if (existsSync(join(ROOT, 'skills'))) {
  for (const cat of readdirSync(join(ROOT, 'skills'), { withFileTypes: true }).filter((d) => d.isDirectory())) {
    for (const sk of readdirSync(join(ROOT, 'skills', cat.name), { withFileTypes: true }).filter((d) => d.isDirectory())) {
      if (seen.get(sk.name) !== cat.name) problems.push(`skills/${cat.name}/${sk.name} is not where skills-map.json puts it (${seen.get(sk.name) ?? 'nowhere'})`);
    }
  }
}

// 4. Flows: which flows call each skill.
const inFlows = {};
for (const f of MAP.categories.find((c) => c.id === '13-flows')?.skills ?? []) {
  for (const s of prompts[f]?.works ?? []) if (!s.startsWith('core-flow-')) (inFlows[s] ??= []).push(f.replace('core-flow-', ''));
}

const useFor = (d) => {
  const t = (d.split(/\s+Not for\b/)[0] || d).replace(/^Use (when|whenever|at|after|before|to|for)\s+/, (m, w) => (w === 'when' || w === 'whenever' ? '' : `${w} `)).trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
};
const calls = (list) => (list.length ? list.map((n) => `\`/${n}\``).join(', ') : '—');

function categoryTable(c) {
  const rows = ['| Call | Pri | Status | Use it for | Pairs with | Instead, use | In flows |', '| --- | --- | --- | --- | --- | --- | --- |'];
  for (const s of c.skills) {
    const p = prompts[s] ?? { pri: '?', desc: '', works: [], notFor: [] };
    const b = built(c.id, s);
    const works = [...new Set([...(b?.related ?? []), ...p.works])].filter((n) => seen.has(n) && n !== s).slice(0, 6);
    const notFor = [...new Set([...(b?.notFor ?? []), ...p.notFor])].filter((n) => seen.has(n) && n !== s).slice(0, 3);
    rows.push(`| \`/${s}\` | ${p.pri} | ${b ? b.status : 'planned'} | ${useFor(b?.desc ?? p.desc).replace(/\|/g, '\\|')} | ${calls(works)} | ${calls(notFor)} | ${(inFlows[s] ?? []).join(', ') || '—'} |`);
  }
  return rows.join('\n');
}

const total = [...seen.keys()].length;
let out = `# Skills map

This file is generated by \`node tools/skill-map.mjs\` from \`skills-map.json\`, the build prompts and
any built skills. Edit those, not this file.

- **Calling a skill:** in Muse, type \`/<skill-name>\`, for example \`/core-session-start\`.
- **Finding one:** use the quick finder for a task, or the categories below for a function.
- **Pairs with:** skills that work alongside it. Call them next, or let a flow call them.
- **Instead, use:** the near-misses. If one of those fits better, call it instead.
- **In flows:** the flows that already call this skill for you.
- **Where skills live:** each skill sits in \`skills/<category>/<skill>/\`. \`install.ps1\` links
  every skill into Muse in one flat list, so the category folders never change how a skill is called.

${total} skills in ${MAP.categories.length} categories.

## Quick finder

| I want to… | Call |
| --- | --- |
${MAP.finder.map(([t, s]) => `| ${t} | \`/${s}\` |`).join('\n')}

## Categories

| # | Category | What it's for | Skills | Folder |
| --- | --- | --- | --- | --- |
${MAP.categories.map((c, i) => `| ${i + 1} | [${c.title}](#${(i + 1)}-${c.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/ /g, '-')}) | ${c.purpose} | ${c.skills.length} | [\`skills/${c.id}/\`](skills/${c.id}/) |`).join('\n')}
`;
MAP.categories.forEach((c, i) => {
  out += `\n## ${i + 1}. ${c.title}\n\n${c.purpose}\n\n${categoryTable(c)}\n`;
});

const files = { [join(ROOT, 'SKILLS-MAP.md')]: out };
for (const c of MAP.categories) {
  files[join(ROOT, 'skills', c.id, 'README.md')] = `# ${c.title}\n\n${c.purpose}\n\nEach subfolder here is one skill. In Muse, call it by name, for example \`/${c.skills[0]}\`. The full map,\nwith every category and the quick finder, is [SKILLS-MAP.md](../../SKILLS-MAP.md). This file is generated by\n\`node tools/skill-map.mjs\`.\n\n${categoryTable(c)}\n`;
}

const check = process.argv.includes('--check');
let stale = 0;
// Invalid input fails before any output is written: a failed run must leave the
// previous valid map untouched.
if (problems.length) {
  for (const problem of problems) console.log(`ERROR ${problem}`);
  process.exit(1);
}
for (const [path, text] of Object.entries(files)) {
  const old = existsSync(path) ? read(path) : null;
  if (old === text) continue;
  stale++;
  if (!check) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, text); }
}

if (check) console.log(stale ? `${stale} map file(s) out of date: run node tools/skill-map.mjs` : 'map files up to date');
else console.log(`wrote ${stale} file(s); ${total} skills in ${MAP.categories.length} categories`);
process.exit(check && stale ? 1 : 0);
