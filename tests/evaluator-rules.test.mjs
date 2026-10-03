// F19b–d, F21, F22: the evaluator skill mirrors the one R2 pass policy, derives the
// full R7 regression scope before testing, and selects the trusted evaluator ahead
// of any grading, repair, or promotion. Text pins guard the rules' presence; the
// scope-data cases prove the procedure's sources support them.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { assert, assertEq, assertMatch, assertNotMatch, REPO_ROOT } from './helpers.mjs';

const EVALS = join(REPO_ROOT, 'skills/01-self-development/core-skill-evals');
const norm = (s) => s.replace(/\s+/g, ' ');
const skillText = () => norm(readFileSync(join(EVALS, 'SKILL.md'), 'utf8'));

// Numbered ## Steps items as [number, normalized body].
function steps() {
  const text = readFileSync(join(EVALS, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n');
  const block = text.slice(text.indexOf('## Steps'), text.indexOf('## Decision rules'));
  assert(block.length > 0, 'Steps section found');
  return block.split(/^(?=\d+\.\s)/m).map((p) => p.trim()).filter((p) => /^\d+\.\s/.test(p)).map((p) => {
    const m = p.match(/^(\d+)\.\s([\s\S]*)$/);
    assert(m, 'step parses');
    return [Number(m[1]), norm(m[2])];
  });
}
function stepNum(items, re, what) {
  const found = items.find(([, body]) => re.test(body));
  assert(found, `${what} step found`);
  return found[0];
}

export const cases = [
  {
    id: 'F19b',
    name: 'r2-prompt mirrors the deferred policy without a routed exception',
    run: async () => {
      const text = norm(readFileSync(join(EVALS, 'references', 'r2-prompt.md'), 'utf8'));
      assertMatch(text, /deferred/, 'r2-prompt names the deferred verdict');
      assertMatch(text, /re-run it when its target exists/, 'r2-prompt records the rerun dependency');
      assertMatch(text, /provisional, not a full pass/, 'provisional limits are explicit');
      assertNotMatch(text, /counts as routed/, 'no silent routed exception remains');
    },
  },
  {
    id: 'F19c',
    name: 'results format defines deferred scoring and rerun recording',
    run: async () => {
      const text = norm(readFileSync(join(EVALS, 'references', 'results-format.md'), 'utf8'));
      assertMatch(text, /x\/y exercised, z deferred/, 'Should-not cells name exercised and deferred counts');
      assertMatch(text, /rerun dependency/, 'rerun dependencies are recorded');
    },
  },
  {
    id: 'F19d',
    name: 'evaluator status rule names provisional limits',
    run: async () => {
      const text = skillText();
      assertMatch(text, /provisional/, 'status rule names the provisional outcome');
      assertMatch(text, /recorded reruns/, 'provisional status needs recorded reruns');
      assertMatch(text, /never a fail or a silent provisional/, 'failures and silent provisionals are barred');
    },
  },
  {
    id: 'F21a',
    name: 'any skill change triggers group R2, not only description changes',
    run: async () => {
      assertMatch(skillText(), /any skill change re-runs R1 and R3 for that skill and R2 for every skill in the same catalog group/, 'full R7 scope stated');
      assertMatch(skillText(), /even a single-skill invocation or a non-description edit/, 'single-skill and non-description cases covered');
    },
  },
  {
    id: 'F21b',
    name: 'profile schema changes trigger affected core-skill R3',
    run: async () => {
      assertMatch(skillText(), /profile schema change also re-runs R3 for every core skill that reads the changed keys/, 'schema-dependent expansion stated');
    },
  },
  {
    id: 'F21c',
    name: 'catalog regression group includes foundation skills in different function folders',
    run: async () => {
      const map = JSON.parse(readFileSync(join(REPO_ROOT, 'skills-map.json'), 'utf8'));
      const catalog = readFileSync(join(REPO_ROOT, 'SKILLS-CATALOG.md'), 'utf8');
      const section = catalog.split(/^## 2\. Foundation[^\n]*\n/m)[1]?.split(/^## 3\./m)[0];
      assert(section, 'catalog Foundation group exists');
      const names = [...section.matchAll(/^\| `([^`]+)`/gm)].map((m) => m[1]);
      assert(names.includes('core-skill-evals') && names.includes('core-project-profile'),
        'evaluator and profile share the catalog group despite different folders');
      const members = names.map((name) => {
        const category = map.categories.find((c) => c.skills.includes(name));
        assert(category, `${name} has a function-folder mapping`);
        return { name, category: category.id, built: existsSync(join(REPO_ROOT, 'skills', category.id, name, 'SKILL.md')) };
      });
      assertEq(members.filter((m) => m.built).map((m) => m.name).sort().join(','),
        'core-project-profile,core-skill-authoring,core-skill-evals', 'all built foundation skills enter regression scope');
      assertEq(members.filter((m) => !m.built).length, 4, 'four planned catalog members remain explicitly pending');
    },
  },
  {
    id: 'F21d',
    name: 'schema-key readers are derivable from skill Inputs (control)',
    run: async () => {
      const readers = [];
      for (const [cat, name] of [['01-self-development', 'core-skill-authoring'], ['01-self-development', 'core-skill-evals']]) {
        const text = readFileSync(join(REPO_ROOT, 'skills', cat, name, 'SKILL.md'), 'utf8');
        if (/schema keys/.test(text)) readers.push(name);
      }
      assertEq(readers.join(','), 'core-skill-authoring,core-skill-evals', 'both core readers cite the schema keys');
    },
  },
  {
    id: 'F22a',
    name: 'trusted-evaluator selection precedes grading, repair, and promotion',
    run: async () => {
      const items = steps();
      const sel = stepNum(items, /trusted evaluator|stable tag|No self-grading/i, 'trusted-evaluator selection');
      const round = stepNum(items, /fresh session per round/, 'R2 round');
      const fix2 = stepNum(items, /On an R2 failure/, 'R2 fix');
      const fix3 = stepNum(items, /On an R3 failure/, 'R3 fix');
      const status = stepNum(items, /Update the status/, 'status update');
      for (const [n, what] of [[round, 'R2 round'], [fix2, 'R2 fix'], [fix3, 'R3 fix'], [status, 'status update']]) {
        assert(sel < n, `selection (step ${sel}) must precede ${what} (step ${n})`);
      }
      assertMatch(items.find(([n]) => n === sel)[1], /before any grading/, 'selection states the ordering rule');
    },
  },
  {
    id: 'F22b',
    name: 'missing tag records bootstrap review and never becomes reviewed or stable',
    run: async () => {
      assertMatch(skillText(), /bootstrap review required/, 'missing tag records the bootstrap requirement');
      assertMatch(skillText(), /never becomes reviewed or stable/, 'missing tag is barred from reviewed/stable');
    },
  },
];
