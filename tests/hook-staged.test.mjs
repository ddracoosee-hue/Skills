// F01–F03: the pre-commit gate judges the staged (index) content, preserves every
// filename end to end, and covers renames, copies, and deletions. Each case builds
// a disposable git repo from the current worktree and drives real `git commit`.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { assert, assertEq, assertMatch, git, makeGitRepo, node, genToken, writeFile, appendFile, CHECKER } from './helpers.mjs';

const AUTHORING = 'skills/01-self-development/core-skill-authoring';

export const cases = [
  {
    id: 'F01a',
    name: 'staged secret hidden by a clean worktree replacement fails the commit',
    run: async () => {
      const { dir, q } = await makeGitRepo('f01a');
      const rel = `${AUTHORING}/references/plain.md`;
      const tok = genToken('github');
      writeFile(dir, rel, `note\n${tok}\n`);
      await q('add', rel);
      writeFile(dir, rel, 'harmless replacement text\n'); // unstaged: must not hide the staged secret
      const indexBefore = await q('diff', '--cached', '--name-only');
      const r = await git(dir, 'commit', '-m', 'staged secret');
      assert(r.exit !== 0, `commit with a staged secret must fail (exit was ${r.exit}); hook judged the worktree, not the index`);
      const show = await q('show', `:${rel}`);
      assert(show.stdout.includes(tok), 'the staged secret must still be in the index (hook must not rewrite it)');
      assertEq(readFileSync(join(dir, rel), 'utf8'), 'harmless replacement text\n', 'the worktree file must be preserved');
      const indexAfter = await q('diff', '--cached', '--name-only');
      assertEq(indexAfter.stdout, indexBefore.stdout, 'the staged set must be unchanged by the hook run');
    },
  },
  {
    id: 'F01b',
    name: 'clean staged file with an unstaged secret is judged by staged content',
    run: async () => {
      const { dir, q } = await makeGitRepo('f01b');
      const rel = `${AUTHORING}/references/plain.md`;
      writeFile(dir, rel, 'clean staged text\n');
      await q('add', rel);
      writeFile(dir, rel, `clean staged text\n${genToken('openai')}\n`); // unstaged: not part of the commit
      const r = await git(dir, 'commit', '-m', 'clean staged');
      assertEq(r.exit, 0, `commit of clean staged content must succeed${r.exit === 0 ? '' : `: ${(r.stdout + r.stderr).slice(0, 600)}`}`);
    },
  },
  {
    id: 'F01c',
    name: 'stale staged map hidden by a current worktree map fails the commit',
    run: async () => {
      const { dir, q } = await makeGitRepo('f01c');
      const skillMd = join(dir, AUTHORING, 'SKILL.md');
      const text = readFileSync(skillMd, 'utf8');
      assert(text.includes('restructuring one in the skills repo'), 'fixture anchor text present');
      writeFileSync(skillMd, text.replace('restructuring one in the skills repo', 'restructuring one in the skills repository'));
      const gen = await node([join(dir, 'tools', 'skill-map.mjs')], { cwd: dir });
      assertEq(gen.exit, 0, `worktree regen must succeed: ${(gen.stdout + gen.stderr).slice(0, 400)}`);
      await q('add', `${AUTHORING}/SKILL.md`);
      // Stage a stale map, then make the worktree map current again (unstaged).
      const headMap = await q('show', 'HEAD:SKILLS-MAP.md');
      writeFile(dir, 'SKILLS-MAP.md', headMap.stdout);
      const headReadme = await q('show', 'HEAD:skills/01-self-development/README.md');
      writeFile(dir, 'skills/01-self-development/README.md', headReadme.stdout);
      await q('add', 'SKILLS-MAP.md', 'skills/01-self-development/README.md');
      const gen2 = await node([join(dir, 'tools', 'skill-map.mjs')], { cwd: dir });
      assertEq(gen2.exit, 0, 'second worktree regen must succeed');
      const chk = await node([join(dir, 'tools', 'skill-map.mjs'), '--check'], { cwd: dir });
      assertEq(chk.exit, 0, 'worktree map must be current for this fixture');
      const r = await git(dir, 'commit', '-m', 'stale staged map');
      assert(r.exit !== 0, `commit with a stale staged map must fail (exit was ${r.exit})`);
    },
  },
  {
    id: 'F01d',
    name: 'clean commit passes (control)',
    run: async () => {
      const { dir, q } = await makeGitRepo('f01d');
      writeFile(dir, `${AUTHORING}/references/note.md`, 'a harmless note\n');
      await q('add', `${AUTHORING}/references/note.md`);
      const r = await git(dir, 'commit', '-m', 'clean note');
      assertEq(r.exit, 0, `clean commit must succeed: ${(r.stdout + r.stderr).slice(0, 600)}`);
    },
  },
  {
    id: 'F02a',
    name: 'secret in a spaced filename fails the commit',
    run: async () => {
      const { dir, q } = await makeGitRepo('f02a');
      const rel = `${AUTHORING}/fixtures/space fixture/prompt.txt`;
      writeFile(dir, rel, `prompt ${genToken('github')}\n`);
      await q('add', rel);
      const r = await git(dir, 'commit', '-m', 'spaced secret');
      assert(r.exit !== 0, `commit with a secret in a spaced path must fail (exit was ${r.exit})`);
    },
  },
  {
    id: 'F02b',
    name: 'secret in unicode and punctuation filenames fails the commit',
    run: async () => {
      for (const rel of [
        `${AUTHORING}/fixtures/ünicode-λ/prompt-ünicode.txt`,
        `${AUTHORING}/fixtures/parens (1)/prompt [a].txt`,
      ]) {
        const { dir, q } = await makeGitRepo('f02b');
        writeFile(dir, rel, `prompt ${genToken('openai')}\n`);
        await q('add', rel);
        const r = await git(dir, 'commit', '-m', 'unusual filename secret');
        assert(r.exit !== 0, `commit with a secret in ${JSON.stringify(rel)} must fail (exit was ${r.exit})`);
      }
    },
  },
  {
    id: 'F02c',
    name: 'unexpectedly missing scan input errors instead of silently passing',
    run: async () => {
      const r = await node([CHECKER, '--scan', join('no-such-dir', 'absent.txt')]);
      assert(r.exit !== 0, `scan of a missing file must fail (exit was ${r.exit})`);
      assertMatch(r.stdout + r.stderr, /absent\.txt/, 'the diagnostic must name the missing input');
    },
  },
  {
    id: 'F02d',
    name: 'staged deletion of an unlinked file commits cleanly (control)',
    run: async () => {
      const { dir, q } = await makeGitRepo('f02d');
      await q('rm', `${AUTHORING}/TRIALS.md`);
      const r = await git(dir, 'commit', '-m', 'drop trials');
      assertEq(r.exit, 0, `deletion must not become a missing-input error: ${(r.stdout + r.stderr).slice(0, 600)}`);
    },
  },
  {
    id: 'F03a',
    name: 'internal rename that adds a secret fails the commit',
    run: async () => {
      const { dir, q } = await makeGitRepo('f03a');
      const src = `${AUTHORING}/fixtures/original.txt`;
      const dst = `${AUTHORING}/fixtures/renamed.txt`;
      mkdirSync(join(dir, dirname(src)), { recursive: true });
      writeFileSync(join(dir, src), Array.from({ length: 20 }, (_, i) => `clean original line ${i + 1}\n`).join(''));
      await q('add', src);
      await q('commit', '--no-verify', '-m', 'add original');
      await q('mv', src, dst);
      appendFile(dir, dst, `${genToken('openai')}\n`);
      await q('add', '-A');
      const st = await q('diff', '--cached', '--name-status');
      assertMatch(st.stdout, /^R\d+\t/m, 'fixture must stage as a rename');
      const r = await git(dir, 'commit', '-m', 'rename with secret');
      assert(r.exit !== 0, `commit with a renamed secret file must fail (exit was ${r.exit})`);
    },
  },
  {
    id: 'F03b',
    name: 'deleting evals.md from a surviving skill fails the commit',
    run: async () => {
      const { dir, q } = await makeGitRepo('f03b');
      await q('rm', 'skills/01-self-development/core-skill-evals/evals.md');
      const r = await git(dir, 'commit', '-m', 'drop evals');
      assert(r.exit !== 0, `commit deleting a required evals.md must fail (exit was ${r.exit})`);
    },
  },
  {
    id: 'F03c',
    name: 'complete skill removal with consistent inputs succeeds (control)',
    run: async () => {
      const { dir, q } = await makeGitRepo('f03c');
      const victim = 'core-skill-evals';
      await q('rm', '-r', `skills/01-self-development/${victim}`);
      // Remove from skills-map.json.
      const mapPath = join(dir, 'skills-map.json');
      const map = JSON.parse(readFileSync(mapPath, 'utf8'));
      for (const c of map.categories) c.skills = c.skills.filter((s) => s !== victim);
      writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
      // Remove the catalog row.
      const catPath = join(dir, 'SKILLS-CATALOG.md');
      const rows = readFileSync(catPath, 'utf8').split('\n');
      assert(rows.some((l) => l.startsWith(`| \`${victim}\``)), 'catalog row present before removal');
      writeFileSync(catPath, rows.filter((l) => !l.startsWith(`| \`${victim}\``)).join('\n'));
      // Remove the build-prompt block.
      const promptPath = join(dir, 'prompts', '10-foundation.md');
      const lines = readFileSync(promptPath, 'utf8').split('\n');
      const start = lines.findIndex((l) => l.startsWith('## ') && l.includes(`\`${victim}\``));
      assert(start >= 0, 'prompt block found');
      let end = start;
      while (end < lines.length && lines[end].trimEnd() !== '```') end++;
      assert(end < lines.length, 'prompt block end found');
      lines.splice(start, end - start + 1);
      writeFileSync(promptPath, lines.join('\n'));
      const gen = await node([join(dir, 'tools', 'skill-map.mjs')], { cwd: dir });
      assertEq(gen.exit, 0, `regen after consistent removal must succeed: ${(gen.stdout + gen.stderr).slice(0, 500)}`);
      await q('add', '-A');
      const r = await git(dir, 'commit', '-m', 'remove skill consistently');
      assertEq(r.exit, 0, `consistent full removal must succeed: ${(r.stdout + r.stderr).slice(0, 600)}`);
    },
  },
  {
    id: 'F03d',
    name: 'rename from outside skills/ into skills/ with secret fails (control)',
    run: async () => {
      const { dir, q } = await makeGitRepo('f03d');
      writeFile(dir, 'staging-source.txt', Array.from({ length: 20 }, (_, i) => `clean line ${i + 1}\n`).join(''));
      await q('add', 'staging-source.txt');
      await q('commit', '--no-verify', '-m', 'stage source');
      const dst = `${AUTHORING}/references/renamed.md`;
      await q('mv', 'staging-source.txt', dst);
      appendFile(dir, dst, `${genToken('github')}\n`);
      await q('add', '-A');
      const r = await git(dir, 'commit', '-m', 'cross-boundary rename');
      assert(r.exit !== 0, `cross-boundary rename with a secret must fail (exit was ${r.exit})`);
    },
  },
];
