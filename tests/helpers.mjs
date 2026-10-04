// Shared helpers for the audit-repair regression suite. Node 20+, no dependencies.
//
// Every test builds disposable fixtures under the OS temp dir: synthetic git repos
// copied from the current worktree, synthetic skill folders, or plain temp files.
// Nothing touches the real checkout, the user's installed skills, or live projects.
// Synthetic credential-looking strings are generated at runtime (see genToken) so the
// test sources themselves never resemble committed credentials.
import { execFile } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir as osTmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const CHECKER = join(REPO_ROOT, 'tools', 'check-skills.mjs');
export const MAPGEN = join(REPO_ROOT, 'tools', 'skill-map.mjs');
export const INSTALLER = join(REPO_ROOT, 'install.ps1');
export const ALLOWED_EMAIL = 'noreply@anthropic.com';

export class Skip extends Error {
  constructor(reason) { super(reason); this.name = 'Skip'; }
}
export function skip(reason) { throw new Skip(reason); }

export function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
export function assertEq(a, b, msg) {
  if (a !== b) throw new Error(`${msg} (expected ${JSON.stringify(b)}, got ${JSON.stringify(a)})`);
}
export function assertMatch(s, re, msg) {
  if (!re.test(String(s))) throw new Error(`${msg} (no match for ${re} in ${JSON.stringify(String(s).slice(0, 600))})`);
}
export function assertNotMatch(s, re, msg) {
  if (re.test(String(s))) throw new Error(`${msg} (unexpected match for ${re} in ${JSON.stringify(String(s).slice(0, 600))})`);
}
// Neither a synthetic secret nor its identifying prefix may appear in program output.
export function assertNoLeak(output, secrets, msg) {
  const out = String(output);
  for (const s of secrets) {
    if (s && out.includes(s)) throw new Error(`${msg} (output leaks ${JSON.stringify(s.slice(0, 16))}...)`);
  }
}

// Run a command without a shell. Never rejects: timeouts, spawn errors and nonzero
// exits are all reported in the result object.
export function runCmd(cmd, args, { cwd = REPO_ROOT, env = {}, timeoutMs = 120000 } = {}) {
  return new Promise((resolveP) => {
    execFile(cmd, args, {
      cwd, timeout: timeoutMs, maxBuffer: 8 * 1024 * 1024, windowsHide: true,
      env: { ...process.env, ...env },
    }, (error, stdout, stderr) => {
      const out = { exit: 0, stdout: String(stdout ?? ''), stderr: String(stderr ?? ''), timedOut: false, spawnError: null };
      if (error) {
        if (error.killed) { out.timedOut = true; out.exit = null; }
        else if (typeof error.code === 'number') out.exit = error.code;
        else if (error.code) { out.exit = null; out.spawnError = String(error.code); }
      }
      resolveP(out);
    });
  });
}

export function node(args, opts) {
  return runCmd(process.execPath, args, opts);
}

// Windows PowerShell 5.1, the shell this repo's installer and profile commands target.
export function powershell(args, opts) {
  return runCmd('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', ...args], opts);
}

// --- Disposable fixtures -----------------------------------------------------

const tmpRoots = [];
export function tmpdir(prefix) {
  const d = mkdtempSync(join(osTmpdir(), `muse-repair-${prefix}-`));
  tmpRoots.push(d);
  return d;
}
export function cleanupTmp() {
  if (process.env.KEEP_TMP === '1') { tmpRoots.length = 0; return; }
  for (const d of tmpRoots.splice(0)) {
    assertDisposable(d);
    for (let i = 0; i < 6; i++) {
      try { rmSync(d, { recursive: true, force: true }); break; }
      catch { sleepMs(250); }
    }
  }
}
function sleepMs(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
// Destructive fixture work only happens inside verified disposable paths.
export function assertDisposable(p) {
  const t = resolve(osTmpdir());
  const r = resolve(p);
  if (r !== t && !r.startsWith(t + sep)) throw new Error(`refusing to touch non-temp path: ${p}`);
}

// Copy the current worktree (minus its git metadata) into a fresh temp dir.
export function copyRepo(dest) {
  assertDisposable(dest);
  const gitDir = join(REPO_ROOT, '.git');
  cpSync(REPO_ROOT, dest, {
    recursive: true,
    filter: (src) => { const r = resolve(src); return r !== gitDir && !r.startsWith(gitDir + sep); },
  });
  return dest;
}

export function git(repo, ...args) {
  return runCmd('git', args, { cwd: repo, env: { GIT_PAGER: 'cat', GIT_EDITOR: 'true' } });
}

// A disposable git repo seeded from the current worktree, with the repo's own
// pre-commit hook enabled. Baseline commit uses --no-verify; every later commit
// exercises the hook under test.
export async function makeGitRepo(prefix = 'repo') {
  const dir = tmpdir(prefix);
  copyRepo(dir);
  const q = async (...a) => {
    const r = await git(dir, ...a);
    if (r.exit !== 0) throw new Error(`fixture git ${a.join(' ')} failed (exit ${r.exit}): ${(r.stdout + r.stderr).slice(0, 600)}`);
    return r;
  };
  await q('init', '-b', 'main');
  await q('config', 'user.email', 'repair-test@example.invalid');
  await q('config', 'user.name', 'repair-test');
  await q('config', 'commit.gpgsign', 'false');
  await q('config', 'core.hooksPath', '.githooks');
  await q('add', '-A');
  await q('commit', '--no-verify', '-qm', 'baseline');
  return { dir, q };
}

// A disposable plain copy (no git) for generator tests.
export function makeRepoCopy(prefix = 'copy') {
  const dir = tmpdir(prefix);
  return copyRepo(dir);
}

export function writeFile(root, rel, content) {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
  return p;
}
export function appendFile(root, rel, content) {
  const p = join(root, rel);
  appendFileSync(p, content);
  return p;
}

// --- Synthetic secrets (generated at runtime; never literals in test sources) --

const ALNUM = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function rand(n, alphabet = ALNUM) {
  const bytes = randomBytes(n);
  let s = '';
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return s;
}
export function genToken(kind) {
  switch (kind) {
    case 'github': return 'ghp_' + rand(24); // matches the github-token rule
    case 'openai': return 'sk-' + rand(24, ALNUM + '-_'); // matches the api-key rule
    case 'aws': return 'AKIA' + rand(16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    case 'email': return 'probe-' + rand(8, 'abcdef0123456789') + '@example.invalid';
    case 'envkey': return 'SYNTHETIC_' + 'PROBE_KEY' + '=' + rand(12); // matches the env-assignment rule
    case 'privatekey': return 'BEGIN ' + 'TEST ' + 'PRIVATE KEY'; // matches the private-key rule
    default: throw new Error(`unknown token kind: ${kind}`);
  }
}
export function tokenPrefix(kind) {
  switch (kind) {
    case 'github': return 'ghp_';
    case 'openai': return 'sk-';
    case 'aws': return 'AKIA';
    case 'email': return '@example.invalid';
    case 'envkey': return 'SYNTHETIC_PROBE_KEY';
    case 'privatekey': return 'PRIVATE KEY';
    default: throw new Error(`unknown token kind: ${kind}`);
  }
}

// --- Fixture skills ----------------------------------------------------------

// Write a minimal skill that passes the structure checker. dir's basename must
// equal name. Callers mutate the result to build invalid fixtures.
export function writeSkill(dir, name = 'core-probe') {
  const desc = 'Use when probing the checker with a synthetic fixture skill in a temp repo. Not for real work (use `core-skill-authoring`).';
  const skill = `---\nname: ${name}\ndescription: ${desc}\n---\n# ${name}\n\n`
    + `## Use when\n- Probing the checker.\n- Invoke as /${name}.\n\n`
    + `## Not for\n- Real work → core-skill-authoring\n\n`
    + `## Inputs\n- A temp folder.\n\n`
    + `## Steps\n1. Do the thing. Done when: it is done.\n2. Check the thing. Done when: the check exits 0.\n\n`
    + `## Decision rules\n- If stuck, then stop.\n\n`
    + `## Anti-patterns\n- Guessing.\n\n`
    + `## Evidence to report\n- The exit code.\n\n`
    + `## References\n- Related: core-skill-authoring.\n`;
  const evals = `# Evals: ${name}\n\n## Should trigger\n- T1: "probe one"\n- T2: "probe two"\n- T3: "probe three"\n\n`
    + `## Should not trigger\n- N1: "write a skill" → \`core-skill-authoring\`\n- N2: "do nothing" → none\n\n`
    + `## Results\n| Date | Round | Should trigger | Should not | Changed |\n| --- | --- | --- | --- | --- |\n`;
  mkdirSync(join(dir, 'references'), { recursive: true });
  writeFileSync(join(dir, 'SKILL.md'), skill);
  writeFileSync(join(dir, 'evals.md'), evals);
  writeFileSync(join(dir, 'CHANGELOG.md'), `# Changelog: ${name}\n\n## 0.1.0 — 2026-10-02 — draft\nFirst version: synthetic fixture.\n`);
  writeFileSync(join(dir, 'TRIALS.md'), `# Trials: ${name}\n\n## Trials\n`);
  return dir;
}

// A temp SKILLS_REPO_ROOT holding one fixture skill; the checker runs against it.
export function makeSkillRoot(prefix = 'skill') {
  const root = tmpdir(prefix);
  const skillDir = join(root, 'skills', '99-test', 'core-probe');
  writeSkill(skillDir);
  return { root, skillDir };
}
export function checkSkillIn(root, skillDir, extraEnv = {}) {
  return node([CHECKER, skillDir], { cwd: root, env: { SKILLS_REPO_ROOT: root, ...extraEnv } });
}

// --- Generated-map helpers ---------------------------------------------------

export function generatedMapFiles(root = REPO_ROOT) {
  const map = JSON.parse(readFileSync(join(root, 'skills-map.json'), 'utf8'));
  return ['SKILLS-MAP.md', ...map.categories.map((c) => `skills/${c.id}/README.md`)];
}
export function sha256Of(p) {
  return createHash('sha256').update(readFileSync(p)).digest('hex');
}
export function snapshotFiles(root, rels) {
  return new Map(rels.map((r) => {
    const p = join(root, r);
    return [r, existsSync(p) ? sha256Of(p) : null];
  }));
}
export function assertSameSnapshot(before, after, msg) {
  assertEq(after.size, before.size, `${msg} (file count changed)`);
  for (const [k, v] of before) assertEq(after.get(k), v, `${msg} (changed: ${k})`);
}
