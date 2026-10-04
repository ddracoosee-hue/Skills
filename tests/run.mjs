// Regression suite runner. Node 20+, no dependencies.
//
//   node tests/run.mjs                run every case
//   node tests/run.mjs F01 F04       run cases whose file, id, or name matches
//   KEEP_TMP=1 node tests/run.mjs    keep temp fixtures for inspection
//
// Exit 0 only when every executed case passes (skips are reported, never silent).
import { readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanupTmp, Skip } from './helpers.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const filters = process.argv.slice(2).map((s) => s.toLowerCase());
const files = readdirSync(root).filter((f) => f.endsWith('.test.mjs')).sort();

let pass = 0, fail = 0, skipped = 0;
const failures = [];

for (const f of files) {
  const mod = await import(`./${f}`);
  for (const c of mod.cases ?? []) {
    const hay = `${f} ${c.id} ${c.name}`.toLowerCase();
    if (filters.length && !filters.some((fl) => hay.includes(fl))) continue;
    const t0 = Date.now();
    try {
      await c.run();
      pass++;
      console.log(`PASS ${c.id} — ${c.name} (${Date.now() - t0}ms)`);
    } catch (e) {
      if (e instanceof Skip) {
        skipped++;
        console.log(`SKIP ${c.id} — ${c.name} (${e.message})`);
      } else {
        fail++;
        failures.push(c.id);
        console.log(`FAIL ${c.id} — ${c.name}\n  ${String(e?.message ?? e).split('\n').join('\n  ')}`);
      }
    } finally {
      try { cleanupTmp(); } catch { /* best effort */ }
    }
  }
}

console.log(`\n${pass} passed, ${fail} failed, ${skipped} skipped`);
if (failures.length) console.log(`failures: ${failures.join(', ')}`);
process.exit(fail ? 1 : 0);
