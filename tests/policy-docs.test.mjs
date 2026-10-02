// F19a, F23: the authoritative R2 pass policy lives in prompts/01-REFINEMENT.md with
// deferred/unavailable targets never counted as exercised, and every document path
// the build protocol names must exist.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { assert, assertMatch, REPO_ROOT } from './helpers.mjs';

const norm = (s) => s.replace(/\s+/g, ' ');

export const cases = [
  {
    id: 'F19a',
    name: 'refinement defines one R2 policy with deferred targets uncounted',
    run: async () => {
      const text = norm(readFileSync(join(REPO_ROOT, 'prompts', '01-REFINEMENT.md'), 'utf8'));
      const start = text.indexOf('## R2. Trigger check');
      const end = text.indexOf('## R3. Trial run');
      assert(start >= 0 && end > start, 'R2 section found');
      const r2 = text.slice(start, end);
      assertMatch(r2, /deferred/, 'R2 policy names the deferred verdict');
      assertMatch(r2, /do not count the line as exercised/, 'deferred lines are not counted as exercised');
      assertMatch(r2, /[Pp]rovisional/, 'R2 policy names the provisional outcome');
      assertMatch(r2, /not a full pass/, 'provisional limits are explicit');
      assertMatch(r2, /rerun dependency/, 'deferred lines record a rerun dependency');
      assertMatch(r2, /N x\/y exercised, z deferred/, 'scores name exercised and deferred counts');
    },
  },
  {
    id: 'F23',
    name: 'every document path the build protocol names exists',
    run: async () => {
      const text = readFileSync(join(REPO_ROOT, 'prompts', '00-BUILD-PROTOCOL.md'), 'utf8');
      // Only slash-bearing references are paths; bare names (SKILL.md, AGENTS.md)
      // are generic, not resolvable references, and placeholders are skipped.
      const candidates = [...text.matchAll(/`([^`\n]*?\.md)`/g)].map((m) => m[1])
        .filter((p) => p.includes('/') && !p.includes('<') && !p.includes('*'));
      assert(candidates.length > 0, 'protocol names at least one document path');
      const missing = [];
      for (const p of candidates) {
        if (!existsSync(join(REPO_ROOT, p))) missing.push(p);
      }
      assert(missing.length === 0, `protocol paths must exist (missing: ${missing.join(', ')})`);
    },
  },
];
