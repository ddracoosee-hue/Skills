// F11–F13: reference links with fragments resolve to their file, evals.md gets
// real section/id/format/table validation, and changelog status comes from the
// actual newest heading. Fixture skills live in disposable temp repo roots.
// (The generator half of F13 lives in map-generator.test.mjs as F13b.)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  assert, assertEq, node, checkSkillIn, makeSkillRoot, writeFile, CHECKER, REPO_ROOT,
} from './helpers.mjs';

function addReferenceLink(skillDir, target) {
  const p = join(skillDir, 'SKILL.md');
  writeFileSync(p, `${readFileSync(p, 'utf8')}- [extra](${target}): an extra reference.\n`);
}

export const cases = [
  {
    id: 'F11a',
    name: 'plain broken reference link fails (control)',
    run: async () => {
      const { root, skillDir } = makeSkillRoot('f11a');
      addReferenceLink(skillDir, 'references/absent.md');
      const r = await checkSkillIn(root, skillDir);
      assertEq(r.exit, 1, 'missing reference file must fail');
    },
  },
  {
    id: 'F11b',
    name: 'broken reference link with a fragment fails',
    run: async () => {
      const { root, skillDir } = makeSkillRoot('f11b');
      addReferenceLink(skillDir, 'references/absent.md#section');
      const r = await checkSkillIn(root, skillDir);
      assertEq(r.exit, 1, 'missing reference file with a fragment must fail');
    },
  },
  {
    id: 'F11c',
    name: 'existing reference file with a fragment passes (control)',
    run: async () => {
      const { root, skillDir } = makeSkillRoot('f11c');
      writeFile(skillDir, 'references/present.md', '# Present\n');
      addReferenceLink(skillDir, 'references/present.md#section');
      const r = await checkSkillIn(root, skillDir);
      assertEq(r.exit, 0, `existing reference with a fragment must pass: ${(r.stdout + r.stderr).slice(0, 400)}`);
    },
  },
  {
    id: 'F12a',
    name: 'evals without sections, with duplicate ids and no table fails',
    run: async () => {
      const { root, skillDir } = makeSkillRoot('f12a');
      writeFile(skillDir, 'evals.md',
        '# Evals: core-probe\n\n'
        + '- T1: "probe one"\n- T1: "probe two"\n- T1: "probe three"\n'
        + '- N1: "write a skill" → `core-skill-authoring`\n- N1: "do nothing" → none\n\n'
        + '## Results\n');
      const r = await checkSkillIn(root, skillDir);
      assertEq(r.exit, 1, 'section-less evals with duplicate ids and no table must fail');
    },
  },
  {
    id: 'F12b',
    name: 'valid draft evals with an empty results table passes (control)',
    run: async () => {
      const { root, skillDir } = makeSkillRoot('f12b');
      const r = await checkSkillIn(root, skillDir);
      assertEq(r.exit, 0, `valid draft evals must pass: ${(r.stdout + r.stderr).slice(0, 400)}`);
    },
  },
  {
    id: 'F12c',
    name: 'test lines outside their sections fail',
    run: async () => {
      const { root, skillDir } = makeSkillRoot('f12c');
      const p = join(skillDir, 'evals.md');
      writeFileSync(p, `${readFileSync(p, 'utf8')}- T9: "stray line after the table"\n`);
      const r = await checkSkillIn(root, skillDir);
      assertEq(r.exit, 1, 'a test line outside its section must fail');
    },
  },
  {
    id: 'F12d',
    name: 'duplicate test ids fail',
    run: async () => {
      const { root, skillDir } = makeSkillRoot('f12d');
      const p = join(skillDir, 'evals.md');
      writeFileSync(p, readFileSync(p, 'utf8').replace('- T3: "probe three"', '- T3: "probe three"\n- T1: "repeated id"'));
      const r = await checkSkillIn(root, skillDir);
      assertEq(r.exit, 1, 'a duplicate test id must fail');
    },
  },
  {
    id: 'F12e',
    name: 'the three real skills still pass evals validation (control)',
    run: async () => {
      for (const skill of [
        'skills/01-self-development/core-skill-authoring',
        'skills/01-self-development/core-skill-evals',
        'skills/03-project-setup/core-project-profile',
      ]) {
        const r = await node([CHECKER, join(REPO_ROOT, skill)]);
        assertEq(r.exit, 0, `${skill} must pass: ${(r.stdout + r.stderr).slice(0, 400)}`);
      }
    },
  },
  {
    id: 'F13a',
    name: 'invalid newest changelog entry fails even with a valid older entry',
    run: async () => {
      const { root, skillDir } = makeSkillRoot('f13a');
      writeFile(skillDir, 'CHANGELOG.md',
        '# Changelog: core-probe\n\n## 0.2.0 — 2026-10-02 — BROKEN\nBad status line.\n\n## 0.1.0 — 2026-10-02 — draft\nFirst version.\n');
      const r = await checkSkillIn(root, skillDir);
      assertEq(r.exit, 1, 'an invalid newest changelog entry must fail');
    },
  },
  {
    id: 'F13c',
    name: 'valid draft/tested/reviewed/stable histories pass (control)',
    run: async () => {
      for (const status of ['draft', 'tested', 'reviewed', 'stable']) {
        const { root, skillDir } = makeSkillRoot(`f13c-${status}`);
        writeFile(skillDir, 'CHANGELOG.md',
          `# Changelog: core-probe\n\n## 0.2.0 — 2026-10-02 — ${status}\nCurrent.\n\n## 0.1.0 — 2026-10-02 — draft\nFirst version.\n`);
        const r = await checkSkillIn(root, skillDir);
        assertEq(r.exit, 0, `${status} history must pass: ${(r.stdout + r.stderr).slice(0, 400)}`);
      }
    },
  },
];
