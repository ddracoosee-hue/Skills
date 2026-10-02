#!/usr/bin/env node
// Structure check for skills (refinement stage R1). Node 20+, no dependencies.
//   node tools/check-skills.mjs                 check every skill under skills/
//   node tools/check-skills.mjs skills/<name>   check one skill (plus overlap against the others)
// Exit 0 = no errors. Warnings never fail the run but must be read.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, basename, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS = join(ROOT, 'skills');
const BUNDLED = new Set(['plan', 'grill', 'taste', 'threejs']);
const NAME_RE = /^(core|textclone|orion)-[a-z0-9]+(-[a-z0-9]+)*$/;
const SECTIONS = ['Use when', 'Not for', 'Inputs', 'Steps', 'Decision rules', 'Anti-patterns',
  'Evidence to report', 'References'];
const STATUSES = ['draft', 'tested', 'reviewed', 'stable'];
const SECRET_RES = [/BEGIN [A-Z ]*PRIVATE KEY/, /\bghp_[A-Za-z0-9]{20,}/, /\bsk-[A-Za-z0-9]{20,}/,
  /\bAKIA[0-9A-Z]{16}\b/, /data[\\/]+textclone\.db/i, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i];
const SECRET_OK = /noreply@anthropic\.com/;

const errors = [], warnings = [];
const err = (s, m) => errors.push(`${s}: ${m}`);
const warn = (s, m) => warnings.push(`${s}: ${m}`);

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-z_-]+):\s*(.*)$/i);
    if (kv) out[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim();
  }
  return { fields: out, body: text.slice(m[0].length) };
}

function words(s) {
  return new Set(s.toLowerCase().replace(/`[^`]*`/g, ' ').match(/[a-z]{4,}/g) ?? []);
}

function checkSkill(dir) {
  const name = basename(dir);
  const md = join(dir, 'SKILL.md');
  if (!existsSync(md)) { err(name, 'SKILL.md missing'); return null; }
  const text = readFileSync(md, 'utf8');
  const fm = frontmatter(text);
  if (!fm) { err(name, 'no YAML frontmatter'); return null; }
  const { fields, body } = fm;

  if (!NAME_RE.test(name)) err(name, 'folder name must match (core|textclone|orion)-<kebab-case>');
  if (BUNDLED.has(name.replace(/^(core|textclone|orion)-/, '')) || BUNDLED.has(name)) err(name, 'clashes with a bundled Muse skill');
  if (fields.name !== name) err(name, `frontmatter name "${fields.name ?? ''}" must equal the folder name`);
  const extra = Object.keys(fields).filter((k) => !['name', 'description'].includes(k));
  if (extra.length) err(name, `frontmatter may hold only name and description (found ${extra.join(', ')})`);

  const desc = fields.description ?? '';
  if (!desc) err(name, 'description missing');
  if (desc.length > 250) err(name, `description is ${desc.length} chars (max 250)`);
  if (!/Use when/.test(desc)) err(name, 'description must contain "Use when"');
  if (!/Not for/.test(desc)) err(name, 'description must contain "Not for"');

  const lines = text.split(/\r?\n/).length;
  if (lines > 200) err(name, `SKILL.md is ${lines} lines (max 200; move detail to references/)`);
  else if (lines > 150) warn(name, `SKILL.md is ${lines} lines (target 150)`);

  const heads = [...body.matchAll(/^## (.+?)\s*$/gm)].map((m) => m[1]);
  let at = -1;
  for (const s of SECTIONS) {
    const i = heads.indexOf(s);
    if (i === -1) err(name, `section "## ${s}" missing`);
    else if (i < at) err(name, `section "## ${s}" out of order`);
    else at = i;
  }

  const steps = body.match(/^## Steps\s*$([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1] ?? '';
  const items = steps.split(/^\d+\.\s/m).slice(1);
  if (items.length === 0) err(name, 'Steps has no numbered items');
  items.forEach((it, i) => { if (!/Done when:/.test(it)) err(name, `step ${i + 1} has no "Done when:"`); });

  for (const ref of body.matchAll(/\]\((references\/[^)#\s]+)\)/g)) {
    if (!existsSync(join(dir, ref[1]))) err(name, `linked file ${ref[1]} does not exist`);
  }

  const evals = join(dir, 'evals.md');
  if (!existsSync(evals)) err(name, 'evals.md missing');
  else {
    const e = readFileSync(evals, 'utf8');
    const t = (e.match(/^- T\d+:/gm) ?? []).length;
    const n = (e.match(/^- N\d+:.*→\s*`[a-z0-9-]+`|^- N\d+:.*→\s*none/gm) ?? []).length;
    if (t < 3) err(name, `evals.md has ${t} should-trigger lines (min 3, format "- T1: ...")`);
    if (n < 2) err(name, `evals.md has ${n} near-miss lines (min 2, format "- N1: ... → \`other-skill\`")`);
    if (!/^## Results/m.test(e)) err(name, 'evals.md needs a "## Results" section');
  }

  const log = join(dir, 'CHANGELOG.md');
  if (!existsSync(log)) err(name, 'CHANGELOG.md missing');
  else {
    const first = readFileSync(log, 'utf8').match(/^## (\d+\.\d+\.\d+) — (\d{4}-\d{2}-\d{2}) — ([a-z]+)/m);
    if (!first) err(name, 'CHANGELOG.md needs "## x.y.z — YYYY-MM-DD — <status>" entries');
    else if (!STATUSES.includes(first[3])) err(name, `status "${first[3]}" is not one of ${STATUSES.join(', ')}`);
  }

  const all = [md, ...['evals.md', 'TRIALS.md', 'CHANGELOG.md'].map((f) => join(dir, f))];
  const refs = join(dir, 'references');
  if (existsSync(refs)) for (const f of readdirSync(refs)) all.push(join(refs, f));
  for (const f of all) {
    if (!existsSync(f) || !statSync(f).isFile()) continue;
    const s = readFileSync(f, 'utf8');
    for (const re of SECRET_RES) {
      const m = s.match(re);
      if (m && !SECRET_OK.test(m[0])) err(name, `${basename(f)} may contain private data (${re.source.slice(0, 24)}…)`);
    }
  }
  return { name, desc };
}

const target = process.argv[2];
const all = existsSync(SKILLS)
  ? readdirSync(SKILLS).filter((d) => statSync(join(SKILLS, d)).isDirectory()).map((d) => join(SKILLS, d))
  : [];
const chosen = target ? [resolve(target)] : all;
const results = chosen.map(checkSkill).filter(Boolean);
const others = target ? all.filter((d) => resolve(d) !== resolve(target)).map((d) => {
  const f = join(d, 'SKILL.md');
  const fm = existsSync(f) ? frontmatter(readFileSync(f, 'utf8')) : null;
  return fm ? { name: basename(d), desc: fm.fields.description ?? '' } : null;
}).filter(Boolean) : [];

const pool = [...results, ...others];
for (const a of results) {
  for (const b of pool) {
    if (a.name >= b.name && results.includes(b)) continue;
    if (a.name === b.name) continue;
    const wa = words(a.desc), wb = words(b.desc);
    const inter = [...wa].filter((w) => wb.has(w)).length;
    const j = inter / (wa.size + wb.size - inter || 1);
    if (j >= 0.5) warn(a.name, `description overlaps ${b.name} (Jaccard ${j.toFixed(2)}); sharpen "Use when"/"Not for"`);
  }
}

for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`${chosen.length} skill(s) checked: ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
