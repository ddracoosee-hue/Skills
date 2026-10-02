// F08–F10: installer cleanup removes only junctions owned by this repository,
// -WhatIf never mutates, and a failed git configuration fails loudly. All cases
// run install.ps1 against disposable temp targets; the real install location and
// the real repo config are never touched.
import { symlinkSync, existsSync, lstatSync, writeFileSync, mkdirSync, readdirSync, readFileSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import {
  assert, assertEq, assertMatch, assertNotMatch, assertDisposable, tmpdir, copyRepo,
  powershell, git, INSTALLER, REPO_ROOT, skip,
} from './helpers.mjs';

// existsSync follows links, so dangling junctions report false; lstat sees the link itself.
function linkExists(p) {
  try { lstatSync(p); return true; } catch { return false; }
}

// A disposable git repo seeded from the current worktree (installer needs git for
// the hooksPath step). No commit needed: git config works without one.
function makeInstallRepo(prefix) {
  const dir = tmpdir(prefix);
  copyRepo(dir);
  return dir;
}
async function initGit(dir) {
  for (const args of [
    ['init', '-b', 'main'],
    ['config', 'user.email', 'repair-test@example.invalid'],
    ['config', 'user.name', 'repair-test'],
    ['config', 'commit.gpgsign', 'false'],
  ]) {
    const r = await git(dir, ...args);
    assertEq(r.exit, 0, `fixture git ${args.join(' ')} must succeed`);
  }
}
function runInstaller(repoDir, target, extra = []) {
  assertDisposable(target);
  assertDisposable(repoDir);
  return powershell(['-File', join(repoDir, 'install.ps1'), '-Target', target, ...extra], { cwd: repoDir, timeoutMs: 180000 });
}
function listTarget(target) {
  return readdirSync(target, { withFileTypes: true })
    .map((d) => `${d.isDirectory() ? 'd' : d.isSymbolicLink() ? 'l' : 'f'}:${d.name}`)
    .sort().join('\n');
}
function countLinks(target, repoDir) {
  // Junctions in target pointing at this repo's skills.
  let n = 0;
  for (const d of readdirSync(target, { withFileTypes: true })) {
    if (d.isSymbolicLink()) n++;
  }
  return n;
}

export const cases = [
  {
    id: 'F08',
    name: 'cleanup keeps a similarly prefixed sibling junction but removes an owned dangling one',
    run: async () => {
      const repo = makeInstallRepo('f08');
      await initGit(repo);
      const repoSkills = join(repo, 'skills');
      const target = join(tmpdir('f08t'), 'installed');
      mkdirSync(target, { recursive: true });
      // Unrelated dangling junction into a similarly prefixed sibling: must survive.
      const sibling = join(repo, 'skills-other');
      mkdirSync(join(sibling, 'live'), { recursive: true });
      writeFileSync(join(sibling, 'live', 'keep.txt'), 'sibling contents\n');
      try {
        symlinkSync(join(sibling, 'retired'), join(target, 'stale-other'), 'junction'); // dangling
        symlinkSync(join(repoSkills, '01-self-development', 'core-removed'), join(target, 'owned-gone'), 'junction'); // dangling + owned
        symlinkSync(join(sibling, 'live'), join(target, 'sibling-live'), 'junction'); // live, elsewhere
        symlinkSync(join(tmpdir('f08x'), 'gone'), join(target, 'foreign'), 'junction'); // dangling, elsewhere
      } catch (e) {
        if (e?.code === 'EPERM' || e?.code === 'EACCES') skip('junction creation needs privilege on this machine');
        throw e;
      }
      mkdirSync(join(target, 'realdir'), { recursive: true });
      writeFileSync(join(target, 'realdir', 'keep.txt'), 'real contents\n');
      writeFileSync(join(target, 'keep.txt'), 'top contents\n');
      const r = await runInstaller(repo, target);
      const out = r.stdout + r.stderr;
      assertEq(r.exit, 0, `normal install must succeed: ${out.slice(0, 600)}`);
      assert(linkExists(join(target, 'stale-other')), 'unrelated dangling junction into skills-other must survive');
      assert(!linkExists(join(target, 'owned-gone')), 'genuinely owned dangling junction may be removed');
      assert(linkExists(join(target, 'sibling-live')), 'live junction owned elsewhere must survive');
      assert(linkExists(join(target, 'foreign')), 'dangling junction owned elsewhere must survive');
      assertEq(readFileSync(join(target, 'realdir', 'keep.txt'), 'utf8'), 'real contents\n', 'real dir contents untouched');
      assertEq(readFileSync(join(target, 'keep.txt'), 'utf8'), 'top contents\n', 'target file untouched');
      assertEq(readFileSync(join(sibling, 'live', 'keep.txt'), 'utf8'), 'sibling contents\n', 'sibling target contents untouched');
      assertEq(countLinks(target, repo), 3 + 3, 'three skill links plus the three surviving junctions');
    },
  },
  {
    id: 'F09a',
    name: 'WhatIf with an existing target changes nothing and claims nothing',
    run: async () => {
      const repo = makeInstallRepo('f09a');
      await initGit(repo);
      const setHooks = await git(repo, 'config', 'core.hooksPath', 'prior-hooks');
      assertEq(setHooks.exit, 0, 'fixture hooksPath setup');
      const target = join(tmpdir('f09at'), 'installed');
      mkdirSync(target, { recursive: true });
      const before = listTarget(target);
      const r = await runInstaller(repo, target, ['-WhatIf']);
      const out = r.stdout + r.stderr;
      assertEq(r.exit, 0, `WhatIf dry run must succeed: ${out.slice(0, 600)}`);
      const hooks = await git(repo, 'config', 'core.hooksPath');
      assertEq(hooks.stdout.trim(), 'prior-hooks', 'WhatIf must not change git config');
      assertEq(listTarget(target), before, 'WhatIf must not change the target');
      assertNotMatch(out, /Pre-commit scan enabled/, 'WhatIf must not claim the scan is enabled');
      assertMatch(out, /What if/i, 'WhatIf reports proposed operations as proposed');
    },
  },
  {
    id: 'F09b',
    name: 'WhatIf with a nonexistent target succeeds without creating it',
    run: async () => {
      const repo = makeInstallRepo('f09b');
      await initGit(repo);
      const target = join(tmpdir('f09bt'), 'not-created');
      assert(!existsSync(target), 'target starts nonexistent');
      const r = await runInstaller(repo, target, ['-WhatIf']);
      const out = r.stdout + r.stderr;
      assertEq(r.exit, 0, `missing-target WhatIf must succeed: ${out.slice(0, 600)}`);
      assert(!existsSync(target), 'WhatIf must not create the target');
      assertNotMatch(out, /Pre-commit scan enabled/, 'WhatIf must not claim the scan is enabled');
    },
  },
  {
    id: 'F10a',
    name: 'failed git configuration fails loudly with no enabled claim',
    run: async () => {
      const dir = tmpdir('f10a');
      assertDisposable(dir);
      mkdirSync(join(dir, 'skills'), { recursive: true });
      cpSync(join(REPO_ROOT, 'skills'), join(dir, 'skills'), { recursive: true });
      cpSync(INSTALLER, join(dir, 'install.ps1'));
      // Safety: git resolves repos upward, so prove this fixture is in no repo
      // before running an installer that writes git config.
      const where = await git(dir, 'rev-parse', '--show-toplevel');
      assert(where.exit !== 0, 'fixture must be outside any git repo (refusing a config write into a parent repo)');
      const target = join(tmpdir('f10at'), 'installed');
      const r = await powershell(['-File', join(dir, 'install.ps1'), '-Target', target], { cwd: dir, timeoutMs: 180000 });
      const out = r.stdout + r.stderr;
      assert(r.exit !== 0, `install with failing git config must exit nonzero (was ${r.exit})`);
      assertNotMatch(out, /Pre-commit scan enabled/, 'must not claim the scan is enabled after a git failure');
    },
  },
  {
    id: 'F10b',
    name: 'normal and repeat installation link three skills (control)',
    run: async () => {
      const repo = makeInstallRepo('f10b');
      await initGit(repo);
      const target = join(tmpdir('f10bt'), 'installed');
      for (const round of [1, 2]) {
        const r = await runInstaller(repo, target);
        assertEq(r.exit, 0, `install round ${round} must succeed: ${(r.stdout + r.stderr).slice(0, 500)}`);
        assertEq(countLinks(target, repo), 3, `round ${round} must leave exactly three links`);
      }
      const hooks = await git(repo, 'config', 'core.hooksPath');
      assertEq(hooks.stdout.trim(), '.githooks', 'normal install enables the hook path');
    },
  },
];
