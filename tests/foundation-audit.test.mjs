// Foundation audit regressions: malformed skill metadata and incomplete staged
// skill removal must fail before they become the basis for another skill.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  assert, assertEq, assertMatch, checkSkillIn, makeSkillRoot, makeRepoCopy,
  makeGitRepo, git, node, generatedMapFiles, snapshotFiles, assertSameSnapshot,
} from './helpers.mjs';

export const cases = [
  {
    id: 'F24a',
    name: 'unquoted YAML mapping syntax in a description is rejected',
    run: async () => {
      const { root, skillDir } = makeSkillRoot('f24a');
      const p = join(skillDir, 'SKILL.md');
      writeFileSync(p, readFileSync(p, 'utf8').replace('synthetic fixture skill', 'synthetic fixture: skill'));
      const r = await checkSkillIn(root, skillDir);
      assertEq(r.exit, 1, 'invalid YAML cannot pass R1');
    },
  },
  {
    id: 'F24b',
    name: 'duplicate fields and unsupported frontmatter lines are rejected',
    run: async () => {
      for (const extra of ['name: core-probe\n', '  nested: value\n', 'broken line\n']) {
        const { root, skillDir } = makeSkillRoot('f24b');
        const p = join(skillDir, 'SKILL.md');
        writeFileSync(p, readFileSync(p, 'utf8').replace('name: core-probe\n', `name: core-probe\n${extra}`));
        const r = await checkSkillIn(root, skillDir);
        assertEq(r.exit, 1, 'malformed metadata cannot be silently ignored');
      }
    },
  },
  {
    id: 'F24c',
    name: 'quoted YAML descriptions retain punctuation in generated maps',
    run: async () => {
      for (const quote of ['double', 'single']) {
        const dir = makeRepoCopy(`f24c-${quote}`);
        const p = join(dir, 'skills/01-self-development/core-skill-authoring/SKILL.md');
        const desc = 'Use when writing a synthetic skill: preserve "quotes" and the user\'s wording. Not for real work.';
        const scalar = quote === 'double' ? JSON.stringify(desc) : `'${desc.replace(/'/g, "''")}'`;
        writeFileSync(p, readFileSync(p, 'utf8').replace(/^description:.*$/m, `description: ${scalar}`));
        const r = await node([join(dir, 'tools/skill-map.mjs')], { cwd: dir });
        assertEq(r.exit, 0, 'valid quoted description should generate');
        const row = readFileSync(join(dir, 'SKILLS-MAP.md'), 'utf8').split('\n')
          .find((line) => line.startsWith('| `/core-skill-authoring` |'));
        assert(row.includes('Writing a synthetic skill: preserve "quotes" and the user\'s wording.'),
          'render the decoded description without YAML quoting or escapes');
      }
    },
  },
  {
    id: 'F25',
    name: 'staged removal of only SKILL.md fails even with regenerated maps',
    run: async () => {
      const { dir, q } = await makeGitRepo('f25');
      await q('rm', 'skills/01-self-development/core-skill-authoring/SKILL.md');
      const gen = await node([join(dir, 'tools/skill-map.mjs')], { cwd: dir });
      assertEq(gen.exit, 0, 'map generation alone permits a planned skill');
      await q('add', '-A');
      const r = await git(dir, 'commit', '-m', 'accidentally remove skill entrypoint');
      assert(r.exit !== 0, 'surviving skill with no entrypoint must fail the hook');
      assertMatch(r.stdout + r.stderr, /SKILL\.md missing/, 'failure explains the missing entrypoint');
    },
  },
  {
    id: 'F26',
    name: 'unrecognized lowercase status fails map generation without mutation',
    run: async () => {
      const dir = makeRepoCopy('f26');
      const p = join(dir, 'skills/01-self-development/core-skill-evals/CHANGELOG.md');
      writeFileSync(p, readFileSync(p, 'utf8').replace(/^## .+$/m, '## 0.9.9 — 2026-10-03 — approved'));
      const files = generatedMapFiles(dir);
      const before = snapshotFiles(dir, files);
      const r = await node([join(dir, 'tools/skill-map.mjs')], { cwd: dir });
      assertEq(r.exit, 1, 'generator must reject unsupported lifecycle status');
      assertSameSnapshot(before, snapshotFiles(dir, files), 'invalid status cannot rewrite maps');
    },
  },
];
