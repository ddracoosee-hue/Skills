#!/usr/bin/env node
// Structure check for skills (refinement stage R1). Node 20+, no dependencies.
//   node tools/check-skills.mjs                 check every skill under skills/
//   node tools/check-skills.mjs skills/<category>/<name>   check one skill (plus overlap against the others)
//   node tools/check-skills.mjs --scan <files>  secret / personal-path scan only (pre-commit hook)
//   node tools/check-skills.mjs --staged        pre-commit gate: scan and checks against the Git index snapshot
// Exit 0 = no errors. Warnings never fail the run but must be read.
//
// SKILLS_REPO_ROOT overrides the repo root (used by the --staged snapshot gate
// and by tests); it defaults to the checkout holding this script.
import { readFileSync, readdirSync, existsSync, statSync, realpathSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, basename, resolve, dirname, sep, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.SKILLS_REPO_ROOT ? resolve(process.env.SKILLS_REPO_ROOT) : resolve(HERE, '..');
const SKILLS = join(ROOT, 'skills');
const BUNDLED = new Set(['plan', 'grill', 'grilling', 'grill-with-docs', 'taste', 'threejs', 'migrate']);
const NAME_RE = /^(core|textclone|orion)-[a-z0-9]+(-[a-z0-9]+)*$/;
const SECTIONS = ['Use when', 'Not for', 'Inputs', 'Steps', 'Decision rules', 'Anti-patterns',
  'Evidence to report', 'References'];
const STATUSES = ['draft', 'tested', 'reviewed', 'stable'];
// Privacy rules. Diagnostics name the file, line, and rule id — never the matched
// text, which may itself be the secret.
const SECRET_RULES = [
  { id: 'private-key', re: /BEGIN [A-Z ]*PRIVATE KEY/ },
  { id: 'github-token', re: /\bghp_[A-Za-z0-9]{20,}/ },
  { id: 'api-key', re: /\bsk-[A-Za-z0-9_-]{20,}/ },
  { id: 'aws-key', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: 'db-path', re: /data[\\/]+textclone\.db/i },
  { id: 'email', re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i },
  { id: 'env-assignment', re: /^\s*(META_API_KEY|[A-Z][A-Z0-9_]*_(KEY|TOKEN|SECRET))\s*=\s*\S+/m },
  { id: 'windows-path', re: /[A-Za-z]:(?:\\{1,2}|\/)Users(?:\\{1,2}|\/)[^\/\\\s]+/i },
  { id: 'unix-path', re: /(?<![\w.])\/(home|Users)\/[a-z][\w.-]*/ },
];
// The only exempt address, matched exactly (case-insensitive): a permitted address
// never exempts other matches, and a longer address containing it is still private.
const SECRET_OK = /^noreply@anthropic\.com$/i;

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

function withGlobal(re) {
  return new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
}
function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}
// Every match of every rule is examined. Returns one hit per violated rule (the
// first violating match), each with the rule id and 1-based line number.
function scanText(text) {
  const hits = [];
  for (const { id, re } of SECRET_RULES) {
    for (const m of text.matchAll(withGlobal(re))) {
      if (id === 'email' && SECRET_OK.test(m[0])) continue;
      hits.push({ id, line: lineOf(text, m.index ?? 0) });
      break;
    }
  }
  return hits;
}

// Recursively collect every regular file under a skill folder. Links are resolved
// but never followed outside the skill root; visited targets are remembered so
// loops terminate. Dangling or looping links are skipped.
function collectSkillFiles(skillDir) {
  const out = [];
  let rootReal;
  try { rootReal = realpathSync(skillDir); } catch { return out; }
  const seen = new Set([rootReal]);
  const inside = (real) => real === rootReal || real.startsWith(rootReal + sep);
  const stack = [skillDir];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isSymbolicLink()) {
        let real;
        try { real = realpathSync(full); } catch { continue; }
        if (!inside(real) || seen.has(real)) continue;
        seen.add(real);
        let st;
        try { st = statSync(real); } catch { continue; }
        if (st.isDirectory()) stack.push(full);
        else if (st.isFile()) out.push(full);
        continue;
      }
      if (e.isDirectory()) {
        let real;
        try { real = realpathSync(full); } catch { continue; }
        if (seen.has(real)) continue;
        seen.add(real);
        stack.push(full);
      } else if (e.isFile()) {
        out.push(full);
      }
    }
  }
  return out;
}

// Character span of a `## <heading>` section body, or null when absent.
function sectionSpan(text, heading) {
  const m = text.match(new RegExp(`^## ${heading}\\s*$`, 'm'));
  if (!m) return null;
  const start = m.index + m[0].length;
  const rest = text.slice(start);
  const next = rest.match(/^## /m);
  return [start, next ? start + next.index : text.length];
}

function checkSkill(dir) {
  const name = basename(dir);
  const md = join(dir, 'SKILL.md');
  if (!existsSync(md)) { err(name, 'SKILL.md missing'); return null; }
  const text = readFileSync(md, 'utf8');
  const fm = frontmatter(text);
  if (!fm) { err(name, 'no YAML frontmatter'); return null; }
  const { fields, body } = fm;

  if (!NAME_RE.test(name) || name.length > 64) err(name, 'folder name must match (core|textclone|orion)-<kebab-case>, max 64 chars');
  if (BUNDLED.has(name.replace(/^(core|textclone|orion)-/, '')) || BUNDLED.has(name)) err(name, 'clashes with a bundled Muse skill');
  if (fields.name !== name) err(name, `frontmatter name "${fields.name ?? ''}" must equal the folder name`);
  const extra = Object.keys(fields).filter((k) => !['name', 'description'].includes(k));
  if (extra.length) err(name, `frontmatter may hold only name and description (found ${extra.join(', ')})`);

  const desc = fields.description ?? '';
  if (!desc) err(name, 'description missing');
  if (desc.length > 250) err(name, `description is ${desc.length} chars (max 250)`);
  if (!/\bUse (when|whenever|at|after|before|to|for)\b/.test(desc)) err(name, 'description must say when to use it ("Use when / at / before / after / to / for …")');
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

  // A fragment (#section) or query never exempts the underlying reference file,
  // which must exist. Anchors themselves are not validated.
  for (const ref of body.matchAll(/\]\((references\/[^)\s]+)\)/g)) {
    const target = ref[1].split('#')[0].split('?')[0];
    const p = join(dir, target);
    if (!target || !existsSync(p) || !statSync(p).isFile()) err(name, `linked file ${ref[1]} does not exist`);
  }

  const evals = join(dir, 'evals.md');
  if (!existsSync(evals)) err(name, 'evals.md missing');
  else {
    const e = readFileSync(evals, 'utf8');
    const tSpan = sectionSpan(e, 'Should trigger');
    const nSpan = sectionSpan(e, 'Should not trigger');
    if (!tSpan) err(name, 'evals.md needs a "## Should trigger" section');
    if (!nSpan) err(name, 'evals.md needs a "## Should not trigger" section');
    const inSpan = (span, i) => span && i >= span[0] && i < span[1];
    const tIds = new Set();
    let t = 0;
    for (const m of e.matchAll(/^- T(\d+):\s*(\S.*)?$/gm)) {
      if (!inSpan(tSpan, m.index)) { err(name, `evals.md test T${m[1]} is outside "## Should trigger"`); continue; }
      if (!m[2]) { err(name, `evals.md test T${m[1]} has no request text`); continue; }
      if (tIds.has(m[1])) { err(name, `evals.md repeats test id T${m[1]}`); continue; }
      tIds.add(m[1]);
      t++;
    }
    const nIds = new Set();
    let n = 0;
    for (const m of e.matchAll(/^- N(\d+):(.*)$/gm)) {
      if (!inSpan(nSpan, m.index)) { err(name, `evals.md test N${m[1]} is outside "## Should not trigger"`); continue; }
      if (!/^\s*\S/.test(m[2] ?? '')) { err(name, `evals.md test N${m[1]} has no request text`); continue; }
      if (!/→\s*(`[a-z0-9-]+`|none)/.test(m[2])) { err(name, `evals.md test N${m[1]} needs "→ \`other-skill\`" or "→ none"`); continue; }
      if (nIds.has(m[1])) { err(name, `evals.md repeats test id N${m[1]}`); continue; }
      nIds.add(m[1]);
      n++;
    }
    if (t < 3) err(name, `evals.md has ${t} should-trigger lines (min 3, format "- T1: ...")`);
    if (n < 2) err(name, `evals.md has ${n} near-miss lines (min 2, format "- N1: ... → \`other-skill\`")`);
    const results = sectionSpan(e, 'Results');
    if (!results) err(name, 'evals.md needs a "## Results" section');
    else {
      const table = e.slice(results[0], results[1]);
      if (!/^\|.*Date.*\|/m.test(table) || !/^\|[\s:|-]+\|/m.test(table)) {
        err(name, 'evals.md "## Results" needs a table with a header row (an empty table is fine for a draft)');
      }
    }
  }

  const log = join(dir, 'CHANGELOG.md');
  if (!existsSync(log)) err(name, 'CHANGELOG.md missing');
  else {
    // Current status is the newest heading: the FIRST `## ` heading must be a
    // valid version entry. Older entries never rescue a malformed newest one.
    const firstHead = readFileSync(log, 'utf8').match(/^## .+$/m)?.[0];
    if (!firstHead) err(name, 'CHANGELOG.md needs "## x.y.z — YYYY-MM-DD — <status>" entries');
    else {
      const v = firstHead.match(/^## (\d+\.\d+\.\d+) — (\d{4}-\d{2}-\d{2}) — ([a-z]+)$/);
      if (!v) err(name, `newest CHANGELOG.md entry is not "## x.y.z — YYYY-MM-DD — <status>": ${JSON.stringify(firstHead)}`);
      else if (!STATUSES.includes(v[3])) err(name, `status "${v[3]}" is not one of ${STATUSES.join(', ')}`);
    }
  }

  for (const f of collectSkillFiles(dir)) {
    const s = readFileSync(f, 'utf8');
    for (const hit of scanText(s)) {
      err(name, `${relative(dir, f)}:${hit.line} may contain private data (rule ${hit.id})`);
    }
  }
  return { name, desc };
}

function listSkills(skillsRoot) {
  // Skills live one level down, in function-category folders: skills/<category>/<skill>/.
  if (!existsSync(skillsRoot)) return [];
  return readdirSync(skillsRoot).filter((c) => statSync(join(skillsRoot, c)).isDirectory())
    .flatMap((c) => readdirSync(join(skillsRoot, c)).filter((d) => statSync(join(skillsRoot, c, d)).isDirectory()).map((d) => join(skillsRoot, c, d)));
}

function readDesc(skillDir) {
  const f = join(skillDir, 'SKILL.md');
  const fm = existsSync(f) ? frontmatter(readFileSync(f, 'utf8')) : null;
  return fm ? { name: basename(skillDir), desc: fm.fields.description ?? '' } : null;
}

function reportOverlap(results, pool) {
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
}

// Pre-commit gate. Exports the Git index to a temp snapshot and runs every gate —
// privacy scan, changed-skill structure checks, map freshness — against staged
// content only. Filenames come from NUL-delimited git output, so spaces, Unicode,
// and quoting never corrupt them. Reads the index and worktree but changes neither.
function stagedMain() {
  let top;
  try {
    top = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  } catch {
    console.log('ERROR pre-commit: not a git repository or git is unavailable');
    return 1;
  }
  let status;
  try {
    status = execFileSync('git', ['diff', '--cached', '--name-status', '-z', '--', 'skills', 'templates'], { cwd: top, encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    console.log(`ERROR pre-commit: cannot read staged changes (${String(e?.message ?? e).split('\n')[0]})`);
    return 1;
  }
  const tokens = status.length ? status.toString('utf8').split('\0') : [];
  if (tokens.length && tokens[tokens.length - 1] === '') tokens.pop();
  const scanPaths = [];
  const skillDirs = new Set();
  for (let i = 0; i < tokens.length;) {
    const code = (tokens[i++] ?? '')[0] ?? '';
    let rel = tokens[i++] ?? '';
    if ((code === 'R' || code === 'C') && i < tokens.length) rel = tokens[i++];
    if (!rel) continue;
    if (rel.startsWith('skills/')) {
      const parts = rel.split('/');
      if (parts.length >= 3) skillDirs.add(parts.slice(0, 3).join('/'));
    }
    // Added, copied, modified, renamed, and type-changed blobs are scanned at
    // their destinations. Deletions have no blob to scan; they still trigger
    // structure validation of a surviving skill folder below.
    if (code !== 'D' && code !== 'U') scanPaths.push(rel);
  }
  const snap = mkdtempSync(join(tmpdir(), 'staged-index-'));
  try {
    try {
      const prefix = `${snap.replace(/\\/g, '/')}/`;
      execFileSync('git', ['checkout-index', '-a', `--prefix=${prefix}`], { cwd: top, stdio: ['ignore', 'ignore', 'pipe'] });
    } catch {
      console.log('ERROR pre-commit: cannot snapshot the staged content');
      return 1;
    }
    let failed = false;
    for (const rel of scanPaths) {
      const p = join(snap, rel);
      if (!existsSync(p) || !statSync(p).isFile()) {
        console.log(`ERROR ${rel}: staged file is missing from the index snapshot`);
        failed = true;
        continue;
      }
      for (const hit of scanText(readFileSync(p, 'utf8'))) {
        console.log(`ERROR ${rel}:${hit.line}: may contain private data (rule ${hit.id})`);
        failed = true;
      }
    }
    if (failed) console.error('pre-commit: remove the flagged content (see above)');
    const results = [];
    for (const skillRel of [...skillDirs].sort()) {
      if (!existsSync(join(snap, skillRel, 'SKILL.md'))) continue;
      const r = checkSkill(join(snap, skillRel));
      if (r) results.push(r);
    }
    const pool = listSkills(join(snap, 'skills')).map(readDesc).filter(Boolean);
    reportOverlap(results, pool);
    let mapFailed = false;
    const map = spawnSync(process.execPath, [join(HERE, 'skill-map.mjs'), '--check'], {
      cwd: top, encoding: 'utf8', env: { ...process.env, SKILLS_REPO_ROOT: snap },
    });
    if (map.error || map.status !== 0) {
      mapFailed = true;
      const mapOut = `${map.stdout ?? ''}${map.stderr ?? ''}`.trimEnd();
      if (mapOut) console.log(mapOut);
      console.error('pre-commit: run node tools/skill-map.mjs and stage the result');
    }
    for (const w of warnings) console.log(`WARN  ${w}`);
    for (const e of errors) console.log(`ERROR ${e}`);
    return (failed || errors.length || mapFailed) ? 1 : 0;
  } finally {
    try { rmSync(snap, { recursive: true, force: true }); } catch { /* best effort */ }
  }
}

if (process.argv[2] === '--scan') {
  for (const f of process.argv.slice(3)) {
    if (!existsSync(f) || !statSync(f).isFile()) {
      errors.push(`${f}: scan input does not exist`);
      continue;
    }
    const s = readFileSync(f, 'utf8');
    for (const hit of scanText(s)) {
      errors.push(`${f}:${hit.line}: may contain private data (rule ${hit.id})`);
    }
  }
  for (const e of errors) console.log(`ERROR ${e}`);
  process.exit(errors.length ? 1 : 0);
}

if (process.argv[2] === '--staged') {
  process.exit(stagedMain());
}

const target = process.argv[2];
const all = listSkills(SKILLS);
const chosen = target ? [resolve(target)] : all;
const results = chosen.map(checkSkill).filter(Boolean);
const others = target ? all.filter((d) => resolve(d) !== resolve(target)).map(readDesc).filter(Boolean) : [];

const pool = [...results, ...others];
reportOverlap(results, pool);

for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`${chosen.length} skill(s) checked: ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
