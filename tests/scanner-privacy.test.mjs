// F04–F07: the privacy scanner examines every match per rule, exempts only the exact
// allowlisted address, never prints matched secrets, covers the whole skill tree,
// and catches every personal-path shape without rejecting ordinary paths.
import { symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  assert, assertEq, assertMatch, assertNoLeak, tmpdir, node, checkSkillIn,
  makeSkillRoot, genToken, tokenPrefix, writeFile, writeSkill, CHECKER, ALLOWED_EMAIL, skip,
} from './helpers.mjs';

async function scanFile(content, name = 'scan.txt') {
  const dir = tmpdir('scan');
  const file = writeFile(dir, name, content);
  const r = await node([CHECKER, '--scan', file]);
  return { r, file };
}

export const cases = [
  {
    id: 'F04a',
    name: 'a private address alone fails (control, either order)',
    run: async () => {
      for (const content of [
        `contact ${genToken('email')} for details\n`,
        `${genToken('email')} then ${ALLOWED_EMAIL}\n`,
      ]) {
        const { r } = await scanFile(content);
        assertEq(r.exit, 1, `private address must fail: ${JSON.stringify(content.slice(0, 60))}`);
      }
    },
  },
  {
    id: 'F04b',
    name: 'permitted address before a private address still fails',
    run: async () => {
      const { r } = await scanFile(`${ALLOWED_EMAIL} then ${genToken('email')}\n`);
      assertEq(r.exit, 1, 'a private address after the permitted one must fail');
    },
  },
  {
    id: 'F04c',
    name: 'longer address containing the permitted substring fails',
    run: async () => {
      const { r } = await scanFile(`contact noreply@anthropic.com.evil.example\n`);
      assertEq(r.exit, 1, 'a longer address containing the allowlisted substring must fail');
    },
  },
  {
    id: 'F04d',
    name: 'allowed-only address passes (control)',
    run: async () => {
      const { r } = await scanFile(`contact ${ALLOWED_EMAIL} for automation\n`);
      assertEq(r.exit, 0, `allowed-only address must pass: ${(r.stdout + r.stderr).slice(0, 300)}`);
    },
  },
  {
    id: 'F05a',
    name: 'token diagnostics never print the token or its prefix (github, openai)',
    run: async () => {
      for (const kind of ['github', 'openai']) {
        const tok = genToken(kind);
        const { r } = await scanFile(`value: ${tok}\n`);
        assertEq(r.exit, 1, `${kind} token must fail`);
        const out = r.stdout + r.stderr;
        assertNoLeak(out, [tok, tokenPrefix(kind)], `${kind} diagnostic`);
        assertMatch(out, /scan\.txt/, `${kind} diagnostic keeps the filename`);
        assertMatch(out, /rule [a-z][a-z0-9-]*/, `${kind} diagnostic names the rule`);
        assertMatch(out, /:\d+/, `${kind} diagnostic names the line`);
      }
    },
  },
  {
    id: 'F05b',
    name: 'token diagnostics never print the token or its prefix (aws, env, key, email)',
    run: async () => {
      for (const kind of ['aws', 'envkey', 'privatekey', 'email']) {
        const tok = genToken(kind);
        // The env-assignment rule is line-anchored, so its token starts a line.
        const content = kind === 'envkey' ? `first line\n${tok}\n` : `first line\nvalue: ${tok}\n`;
        const { r } = await scanFile(content);
        assertEq(r.exit, 1, `${kind} match must fail`);
        const out = r.stdout + r.stderr;
        assertNoLeak(out, [tok, tokenPrefix(kind)], `${kind} diagnostic`);
        assertMatch(out, /rule [a-z][a-z0-9-]*/, `${kind} diagnostic names the rule`);
      }
    },
  },
  {
    id: 'F06a',
    name: 'top-level reference secret fails (control)',
    run: async () => {
      const { root, skillDir } = makeSkillRoot('f06a');
      writeFile(skillDir, 'references/sample.md', `note ${genToken('github')}\n`);
      const r = await checkSkillIn(root, skillDir);
      assertEq(r.exit, 1, 'top-level reference secret must fail');
    },
  },
  {
    id: 'F06b',
    name: 'nested reference secret fails',
    run: async () => {
      const { root, skillDir } = makeSkillRoot('f06b');
      writeFile(skillDir, 'references/nested/sample.md', `note ${genToken('github')}\n`);
      const r = await checkSkillIn(root, skillDir);
      assertEq(r.exit, 1, 'nested reference secret must fail');
    },
  },
  {
    id: 'F06c',
    name: 'fixture-directory secret fails',
    run: async () => {
      const { root, skillDir } = makeSkillRoot('f06c');
      writeFile(skillDir, 'fixtures/sample/prompt.txt', `prompt ${genToken('openai')}\n`);
      const r = await checkSkillIn(root, skillDir);
      assertEq(r.exit, 1, 'fixture secret must fail');
    },
  },
  {
    id: 'F06d',
    name: 'deeply nested script secret fails',
    run: async () => {
      const { root, skillDir } = makeSkillRoot('f06d');
      writeFile(skillDir, 'scripts/deep/deeper/run.mjs', `// key ${genToken('aws')}\n`);
      const r = await checkSkillIn(root, skillDir);
      assertEq(r.exit, 1, 'deeply nested script secret must fail');
    },
  },
  {
    id: 'F06e',
    name: 'directory link loops terminate inside the scan scope',
    run: async () => {
      const { root, skillDir } = makeSkillRoot('f06e');
      try {
        writeFile(skillDir, 'loop-a/marker.txt', 'a\n');
        writeFile(skillDir, 'loop-b/marker.txt', 'b\n');
        symlinkSync(join(skillDir, 'loop-b'), join(skillDir, 'loop-a', 'to-b'), 'junction');
        symlinkSync(join(skillDir, 'loop-a'), join(skillDir, 'loop-b', 'to-a'), 'junction');
        symlinkSync(skillDir, join(skillDir, 'to-self'), 'junction');
      } catch (e) {
        if (e?.code === 'EPERM' || e?.code === 'EACCES') skip('junction creation needs privilege on this machine');
        throw e;
      }
      const r = await checkSkillIn(root, skillDir);
      assert(r.timedOut !== true, 'scan must terminate on link loops');
      assertEq(r.exit, 0, `clean skill with link loops must pass: ${(r.stdout + r.stderr).slice(0, 400)}`);
    },
  },
  {
    id: 'F06f',
    name: 'links escaping the skill scope are not followed',
    run: async () => {
      const { root, skillDir } = makeSkillRoot('f06f');
      const outside = join(root, 'outside');
      writeFile(root, 'outside/secret.txt', `value ${genToken('github')}\n`);
      try {
        symlinkSync(outside, join(skillDir, 'escape'), 'junction');
      } catch (e) {
        if (e?.code === 'EPERM' || e?.code === 'EACCES') skip('junction creation needs privilege on this machine');
        throw e;
      }
      const r = await checkSkillIn(root, skillDir);
      assertEq(r.exit, 0, `out-of-scope secret behind a link must not fail the skill: ${(r.stdout + r.stderr).slice(0, 400)}`);
    },
  },
  {
    id: 'F07a',
    name: 'forward-slash Windows personal path fails',
    run: async () => {
      const { r } = await scanFile('open C:/Users/SyntheticUser/private/file.txt\n');
      assertEq(r.exit, 1, 'forward-slash Windows personal path must fail');
    },
  },
  {
    id: 'F07b',
    name: 'backslash and serialized Windows personal paths fail (control)',
    run: async () => {
      for (const content of [
        'open C:\\Users\\SyntheticUser\\private\\file.txt\n',
        '{"path": "C:\\\\Users\\\\SyntheticUser\\\\file.txt"}\n',
      ]) {
        const { r } = await scanFile(content);
        assertEq(r.exit, 1, `Windows personal path must fail: ${JSON.stringify(content.slice(0, 50))}`);
      }
    },
  },
  {
    id: 'F07c',
    name: 'mixed-separator Windows personal path fails',
    run: async () => {
      const { r } = await scanFile('open C:\\Users/SyntheticUser/file.txt\n');
      assertEq(r.exit, 1, 'mixed-separator Windows personal path must fail');
    },
  },
  {
    id: 'F07d',
    name: 'supported Unix personal paths fail (control)',
    run: async () => {
      for (const content of ['open /home/alice/private/file.txt\n', 'open /Users/alice/private/file.txt\n']) {
        const { r } = await scanFile(content);
        assertEq(r.exit, 1, `Unix personal path must fail: ${JSON.stringify(content.slice(0, 40))}`);
      }
    },
  },
  {
    id: 'F07e',
    name: 'harmless relative and non-personal paths pass (control)',
    run: async () => {
      for (const content of [
        'see docs/file.md and web/node_modules/next/dist/docs/x.md\n',
        'open ../shared/x.md or ./local/y.md\n',
        'open C:\\project\\file.txt and C:/project/file.txt\n',
        'the /home directory and C:/Users folder are described above\n',
      ]) {
        const { r } = await scanFile(content);
        assertEq(r.exit, 0, `harmless path must pass: ${JSON.stringify(content.slice(0, 60))} got ${(r.stdout + r.stderr).slice(0, 200)}`);
      }
    },
  },
];
