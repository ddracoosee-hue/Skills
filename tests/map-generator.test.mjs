// F13b, F14–F15: the map generator validates before writing and keeps explicit
// "Instead, use" alternatives even when they also pair. Generator cases run in
// disposable repo copies. (The B01 metadata case joins this file with its fix.)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  assert, assertEq, node, makeRepoCopy,
  generatedMapFiles, snapshotFiles, assertSameSnapshot, MAPGEN,
} from './helpers.mjs';

function addInventedSkill(dir) {
  const p = join(dir, 'skills-map.json');
  const map = JSON.parse(readFileSync(p, 'utf8'));
  map.categories[0].skills.push('core-invented-audit');
  writeFileSync(p, `${JSON.stringify(map, null, 2)}\n`);
}

function authoringRow(mapText) {
  const row = mapText.split('\n').find((l) => l.startsWith('| `/core-skill-authoring` |'));
  assert(row, 'authoring row present in the map');
  return row.split('|').map((c) => c.trim());
}

export const cases = [
  {
    id: 'F13b',
    name: 'generator fails on an invalid newest entry instead of showing the older status',
    run: async () => {
      const dir = makeRepoCopy('f13b');
      const p = join(dir, 'skills/01-self-development/core-skill-evals/CHANGELOG.md');
      const text = readFileSync(p, 'utf8');
      writeFileSync(p, text.replace('## 0.2.0 — 2026-10-02 — tested', '## 0.2.0 — 2026-10-02 — BROKEN'));
      const r = await node([join(dir, 'tools', 'skill-map.mjs')], { cwd: dir });
      assertEq(r.exit, 1, `generator must fail on an invalid newest entry (was ${r.exit}): ${(r.stdout + r.stderr).slice(0, 400)}`);
      assert(!r.stdout.includes('v0.1.0'), 'generator must not silently display the older status');
    },
  },
  {
    id: 'F14a',
    name: 'invalid map input fails without changing any generated file',
    run: async () => {
      const dir = makeRepoCopy('f14a');
      addInventedSkill(dir);
      const files = generatedMapFiles(dir);
      assertEq(files.length, 14, 'fourteen generated files under test');
      const before = snapshotFiles(dir, files);
      const r = await node([join(dir, 'tools', 'skill-map.mjs')], { cwd: dir });
      assertEq(r.exit, 1, `invalid input must fail: ${(r.stdout + r.stderr).slice(0, 400)}`);
      assertSameSnapshot(before, snapshotFiles(dir, files), 'failed generation must not rewrite outputs');
    },
  },
  {
    id: 'F14b',
    name: '--check never mutates for valid, invalid, or stale inputs (control)',
    run: async () => {
      // Valid inputs.
      {
        const dir = makeRepoCopy('f14b-valid');
        const files = generatedMapFiles(dir);
        const before = snapshotFiles(dir, files);
        const r = await node([join(dir, 'tools', 'skill-map.mjs'), '--check'], { cwd: dir });
        assertEq(r.exit, 0, `--check on valid inputs must pass: ${(r.stdout + r.stderr).slice(0, 300)}`);
        assertSameSnapshot(before, snapshotFiles(dir, files), 'valid --check must not mutate');
      }
      // Invalid inputs.
      {
        const dir = makeRepoCopy('f14b-invalid');
        addInventedSkill(dir);
        const files = generatedMapFiles(dir);
        const before = snapshotFiles(dir, files);
        const r = await node([join(dir, 'tools', 'skill-map.mjs'), '--check'], { cwd: dir });
        assertEq(r.exit, 1, '--check on invalid inputs must fail');
        assertSameSnapshot(before, snapshotFiles(dir, files), 'invalid --check must not mutate');
      }
      // Stale inputs.
      {
        const dir = makeRepoCopy('f14b-stale');
        const p = join(dir, 'skills/01-self-development/core-skill-authoring/SKILL.md');
        writeFileSync(p, readFileSync(p, 'utf8').replace('restructuring one in the skills repo', 'restructuring one in the skills repository'));
        const files = generatedMapFiles(dir);
        const before = snapshotFiles(dir, files);
        const r = await node([join(dir, 'tools', 'skill-map.mjs'), '--check'], { cwd: dir });
        assertEq(r.exit, 1, '--check on stale inputs must fail');
        assertSameSnapshot(before, snapshotFiles(dir, files), 'stale --check must not mutate');
      }
    },
  },
  {
    id: 'F15',
    name: 'authoring row keeps its three explicit alternatives',
    run: async () => {
      const dir = makeRepoCopy('f15');
      const r = await node([join(dir, 'tools', 'skill-map.mjs')], { cwd: dir });
      assertEq(r.exit, 0, `generation must succeed: ${(r.stdout + r.stderr).slice(0, 400)}`);
      const cells = authoringRow(readFileSync(join(dir, 'SKILLS-MAP.md'), 'utf8'));
      // Columns: Call | Pri | Status | Use it for | Pairs with | Instead, use | In flows.
      assertEq(cells[6], '`/core-skill-evals`, `/core-retro`, `/core-skill-maintenance`', 'Instead, use keeps the three explicit alternatives');
      assertEq(cells[5], '`/core-skill-evals`, `/core-retro`, `/core-skill-maintenance`, `/core-project-profile`', 'Pairs with keeps the four related skills');
      const readmeCells = authoringRow(readFileSync(join(dir, 'skills/01-self-development/README.md'), 'utf8'));
      assertEq(readmeCells[6], cells[6], 'category README matches the map');
    },
  },
  {
    id: 'B01',
    name: 'stored prompt metadata has no unconsumed fields',
    run: async () => {
      const src = readFileSync(MAPGEN, 'utf8');
      const stored = src.match(/prompts\[name\] = \{([^}]+)\}/);
      assert(stored, 'prompt-object literal found');
      const body = stored[1];
      // Candidate keys ever stored on a prompt object; each stored key must be read
      // through a prompt handle (p.<key> / prompts[..].<key>) somewhere else.
      for (const key of ['name', 'pri', 'desc', 'file', 'notFor', 'works']) {
        const isStored = new RegExp(`\\b${key}\\b\\s*[:,}]`).test(body) || new RegExp(`[,{]\\s*${key}\\s*[,}]`).test(body);
        if (!isStored) continue;
        const consumed = new RegExp(`p\\.${key}\\b`).test(src)
          || new RegExp(`prompts\\[[^\\]]+\\]\\??\\.${key}\\b`).test(src)
          || new RegExp(`\\bconst\\s*\\{[^}]*\\b${key}\\b[^}]*\\}\\s*=\\s*p\\b`).test(src);
        assert(consumed, `stored prompt field "${key}" has no consumer (remove it or use it in diagnostics)`);
      }
    },
  },
];
