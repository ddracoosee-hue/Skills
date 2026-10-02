// F16–F18: profile example commands parse in Windows PowerShell 5.1 with failure
// short-circuit intact, web commands run inside web_dir with no cd prefix, and the
// port inventory reconciles Orion's documented voice listener with no overlaps.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, delimiter } from 'node:path';
import {
  assert, assertEq, tmpdir, powershell, writeFile, REPO_ROOT,
} from './helpers.mjs';

const PROFILE = join(REPO_ROOT, 'skills/03-project-setup/core-project-profile/references');

function example(name) {
  const text = readFileSync(join(PROFILE, `${name}-example.json.md`), 'utf8');
  const m = text.match(/```json\r?\n([\s\S]*?)```/);
  assert(m, `${name} example holds a json block`);
  return JSON.parse(m[1]);
}
function nonNullCommands(ex) {
  return Object.entries(ex.commands).filter(([, v]) => v !== null);
}
const firstToken = (cmd) => cmd.split(/\s+/)[0];

export const cases = [
  {
    id: 'F16a',
    name: 'every example command parses in Windows PowerShell 5.1',
    run: async () => {
      const all = [...nonNullCommands(example('textclone')), ...nonNullCommands(example('orion'))];
      assertEq(all.length, 10, 'example command count changed; review coverage');
      const dir = tmpdir('f16a');
      const listFile = writeFile(dir, 'commands.txt', `${all.map(([, v]) => v).join('\n')}\n`);
      const quoted = `'${listFile.replace(/'/g, "''")}'`;
      const script = [
        '$errs = $null',
        '$i = 0',
        `foreach ($line in [IO.File]::ReadAllLines(${quoted})) {`,
        '  if ($line -eq $null -or $line -eq \'\') { continue }',
        '  [void][System.Management.Automation.PSParser]::Tokenize($line, [ref]$errs)',
        '  $msg = if ($errs.Count -gt 0) { $errs[0].Message } else { \'ok\' }',
        '  Write-Output \"$i|$($errs.Count)|$msg\"',
        '  $i++',
        '}',
      ].join('\n');
      const r = await powershell(['-Command', script], { timeoutMs: 120000 });
      assertEq(r.exit, 0, `parser probe must run: ${(r.stdout + r.stderr).slice(0, 400)}`);
      const rows = r.stdout.split('\n').map((l) => l.trim()).filter((l) => /^\d+\|/.test(l));
      assertEq(rows.length, all.length, 'every command got a parse verdict');
      for (const row of rows) {
        const [i, count, msg] = row.split('|');
        assertEq(Number(count), 0, `command ${all[Number(i)][0]} must parse: ${all[Number(i)][1]} (${msg})`);
      }
    },
  },
  {
    id: 'F16b',
    name: 'a failed orion build prevents the tests; success runs both in order',
    run: async () => {
      const testUnit = example('orion').commands.test_unit;
      assert(testUnit && !testUnit.includes('&&'), 'orion test_unit uses no PS7-only separator');
      const dir = tmpdir('f16b');
      writeFile(dir, 'npm.cmd', '@echo off\r\necho %*>>calls.log\r\nif "%2"=="build" exit /b %STUB_BUILD_EXIT%\r\nexit /b 0\r\n');
      const pathEnv = `${dir}${delimiter}${process.env.PATH}`;
      const callsLog = join(dir, 'calls.log');
      const readCalls = () => (existsSync(callsLog)
        ? readFileSync(callsLog, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean)
        : []);
      // Failing build: tests must not run.
      {
        if (existsSync(callsLog)) writeFileSync(callsLog, '');
        const r = await powershell(['-Command', `${testUnit}; exit $LASTEXITCODE`],
          { cwd: dir, env: { PATH: pathEnv, STUB_BUILD_EXIT: '1' }, timeoutMs: 120000 });
        assert(r.exit !== 0, `failing build must propagate failure (exit was ${r.exit})`);
        assertEq(readCalls().join(','), 'run build', 'tests must not run after a failed build');
      }
      // Passing build: build then test, in order.
      {
        writeFileSync(callsLog, '');
        const r = await powershell(['-Command', `${testUnit}; exit $LASTEXITCODE`],
          { cwd: dir, env: { PATH: pathEnv, STUB_BUILD_EXIT: '0' }, timeoutMs: 120000 });
        assertEq(r.exit, 0, `passing build must succeed: ${(r.stdout + r.stderr).slice(0, 400)}`);
        assertEq(readCalls().join(','), 'run build,test', 'build runs before test on success');
      }
    },
  },
  {
    id: 'F17a',
    name: 'web commands carry no cd prefix and resolve inside web_dir',
    run: async () => {
      const orion = example('orion');
      assertEq(orion.commands.build_web, 'npm.cmd run build', 'orion build runs inside web_dir with no cd');
      for (const [profile, ex] of [['textclone', example('textclone')], ['orion', orion]]) {
        for (const key of ['lint_web', 'typecheck_web', 'build_web', 'test_web']) {
          const cmd = ex.commands[key];
          if (cmd === null) continue;
          assert(!/^\s*cd\s/i.test(cmd), `${profile} ${key} must not carry a cd prefix`);
        }
      }
      // Synthetic project: a relative web executable resolves under web_dir only.
      const dir = tmpdir('f17a');
      const web = join(dir, 'web');
      mkdirSync(join(web, 'node_modules', '.bin'), { recursive: true });
      writeFile(dir, 'web/node_modules/.bin/tsc.cmd', '@echo off\r\nexit /b 0\r\n');
      const rel = example('textclone').commands.typecheck_web.split(/\s+/)[0].replace(/^\.[\\/]/, '');
      assert(existsSync(join(web, rel)), 'relative web executable resolves from web_dir');
      assert(!existsSync(join(dir, rel)), 'relative web executable does not resolve from the root');
    },
  },
  {
    id: 'F17b',
    name: 'root commands resolve from the project root (control)',
    run: async () => {
      const dir = tmpdir('f17b');
      mkdirSync(join(dir, 'web'), { recursive: true });
      const rel = example('textclone').commands.lint_py.split(/\s+/)[0].replace(/^\.[\\/]/, '');
      writeFile(dir, rel.replace(/\\/g, '/'), 'stub');
      assert(existsSync(join(dir, rel)), 'relative root executable resolves from the root');
      assert(!existsSync(join(dir, 'web', rel)), 'relative root executable does not resolve from web_dir');
    },
  },
  {
    id: 'F18',
    name: 'voice port reconciled with no owned/forbidden overlap',
    run: async () => {
      const orion = example('orion');
      const textclone = example('textclone');
      assert(orion.ports.owned.includes(8788), 'orion owns its documented voice port 8788');
      assert(textclone.ports.forbidden.some((f) => f.port === 8788), 'textclone forbids orion voice port 8788');
      for (const [name, ex] of [['orion', orion], ['textclone', textclone]]) {
        const owned = new Set(ex.ports.owned);
        const overlap = ex.ports.forbidden.filter((f) => owned.has(f.port)).map((f) => f.port);
        assertEq(overlap.join(','), '', `${name} owned/forbidden must not overlap`);
      }
      const cross = orion.ports.owned.filter((p) => textclone.ports.owned.includes(p));
      assertEq(cross.join(','), '', 'the two projects must not own the same port');
    },
  },
];
