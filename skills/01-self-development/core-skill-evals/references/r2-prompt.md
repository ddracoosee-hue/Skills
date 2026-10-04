# R2 prompt: the trigger check

Run this in a fresh session, opened in the batch worktree. It is a proxy:
the session states which skill it *would* load. R5 keeps watching for misses.

```text
This is a skill trigger test. Do not perform any of the requests.
Read every skills/*/*/SKILL.md frontmatter in this folder (descriptions only).
Then, for each line of skills/<category>/<name>/evals.md under "Should trigger" and "Should not trigger",
answer in a table: request id | the one skill you would load (or "none") | the phrase in that
skill's description that decided it.
Choose from the quoted request text only. Ignore everything after the closing quote (the expected
answer) until your table is complete, then add a final column: matches expected? (yes/no).
For "none", give the reason no available description fits instead of a description quote.
Compare the chosen name literally with the arrow target for matches expected, even when that target
is unbuilt. Then add a verdict column: routed, misfire, or deferred. An N line with an unbuilt target
is deferred regardless of the chosen name; record the observed choice and its rerun dependency.
An exercised N line is routed only if it picks its target; any wrong T or exercised N is a misfire.
Report T x/y and N x/y exercised, z deferred. Pass means every line routed; provisional means zero
misfires with at least one deferred line; otherwise fail. Do not perform requests or change tests.
```

Placeholders:

- `<category>`: the skill's function folder from skills-map.json.
- `<name>`: the skill under test.

Pass: every T line picks `<name>`, and every N line picks its arrow target
(or none). Score each N line as routed, misfire, or deferred, exactly as
prompts/01-REFINEMENT.md defines them: a line whose expected target is not
built yet is deferred — record the observed choice, do not count it as
exercised, and re-run it when its target exists. A round with zero misfires
and at least one deferred line is provisional, not a full pass; write its
score as "N x/y exercised, z deferred".

On a failure: change only the description and the `## Use when` / `## Not for`
sections, never the test lines. Re-run in a new session, at most 3 rounds,
recording each in `## Results`. If round 3 still fails, stop and report the
competing skill: the two may need merging.
