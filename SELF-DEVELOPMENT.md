# Self-development: how the skills improve themselves

The skills improve **recursively, from their own use**. Every use leaves evidence, and that
evidence improves the skill. The four skills that do the improving are improved by the same loop.

**Nothing runs on its own.** There are no schedules, no background agents and no automatic edits.
Every step below starts only when you call it, and Muse never changes a skill without your
approval.

## 1. The loop

Each step is a skill you call by name. Their prompts are in `prompts/10-foundation.md`.

| Step | You call | What happens | Evidence it leaves |
| --- | --- | --- | --- |
| 1. Use | Any skill | The skill does its job, and its report lists the commands, results and anything not covered. | The skill's report |
| 2. Capture | `/core-retro log` at the end of a task. Every flow calls it as its last step. | Writes a 3-line field entry per skill used. Records misses. Sorts each lesson as skill, project or cross-project. | `TRIALS.md`, `MISSES.md` |
| 3. Review | `/core-retro review` whenever you choose, for example after a phase | Groups the evidence and proposes the smallest edit for each repeated failure, including failures of the self-development skills themselves. | Proposals; `LESSONS.md` entries for you to approve |
| 4. Revise | `/core-skill-authoring revise <skill>` | Applies only the proposals you approved, and cites the evidence behind each change. | `CHANGELOG.md` "Because:" lines |
| 5. Test | `/core-skill-evals <skill>` | Runs the structure check, the trigger tests and the trial (plus fixtures if present). The new version must do at least as well as the old one. | `evals.md` results, `EVALS.csv` |
| 6. Keep current | `/core-skill-maintenance` after you merge | Regenerates the skills map, tags the release, and finds skills a project change has made stale. | `SKILLS-MAP.md`, git tag |

Then the cycle starts again at step 1, with a better skill.

## 2. Why it is recursive

The self-development skills are skills too:
- `core-retro`;
- `core-skill-authoring`;
- `core-skill-evals`;
- `core-skill-maintenance`.

Each logs its own use and goes through the same loop. `core-retro` can propose an edit to
`core-retro`, and `core-skill-authoring` revises `core-skill-authoring`.

So every improvement to these four improves how all the other skills are improved. Over time, the
library gets better at getting better.

## 3. Seven rules that keep recursion safe

Self-improving systems can drift: they grade themselves generously, weaken their own tests, or
overfit to the last task. These rules prevent that, and every self-development skill enforces them.

1. **No self-grading.** A new version of a self-development skill is tested with the **previous
   stable** version of `core-skill-evals` and the checker, taken from its git tag. It is never
   tested by itself.
2. **An evidence threshold.** One failure is logged. The same failure twice proposes an edit. A
   single failure is enough only if it caused harm or leaked private data.
3. **Tests only grow.** Test lines are never edited or removed to make a skill pass. Every miss that
   gets fixed adds a test that would have caught it.
4. **One level at a time.** A batch changes either a self-development skill or the skills it
   governs, never both. Otherwise a broken grader could approve broken work.
5. **Lineage.** Every change records the evidence that caused it, as a `Because:` line in
   `CHANGELOG.md` citing `TRIALS.md` or `MISSES.md` entries. Nothing changes without a recorded reason.
6. **Rollback.** Every released version gets a git tag, `skill/<name>/v<x.y.z>`.
   `/core-skill-maintenance rollback <skill>` restores the last stable version if a revision does
   worse in real use.
7. **A human gate.** You approve every proposed edit, every lesson and every merge.

## 4. Learning across all your projects

When `/core-retro log` captures a lesson, it sorts it into one of three kinds:

| Kind | Example | Where it goes |
| --- | --- | --- |
| Skill-specific | "core-commit missed a generated file" | That skill's `TRIALS.md` |
| Project-specific | "Microcoin's test command is `scripts\validate.py`" | The project's `.muse/project.json` (a fact) or a project skill (a procedure) |
| Cross-project | "Reserve budget before spending; reconcile after" | [`LESSONS.md`](LESSONS.md), once seen in at least two projects |

`LESSONS.md` is the library's understanding of your portfolio as a whole. When you accept a lesson,
`/core-retro review` proposes which core skills should absorb it. For example, a lesson proven in
Microcoin and Charizard becomes a step in `core-bounded-execution` and then helps Orion and every
future project.

[`PROJECTS.md`](PROJECTS.md) lists every project, so a lesson can be checked against all of them, not
just the one where it was found.

## 5. Where the evidence lives

| File | Holds | Written by |
| --- | --- | --- |
| `skills/<category>/<skill>/TRIALS.md` | Trials and field-use entries | `/core-skill-evals`, `/core-retro log` |
| `MISSES.md` (field worktree) | Moments a skill should have been used and wasn't | `/core-retro log` |
| `EVALS.csv` | Scores per skill version | `/core-skill-evals` |
| `skills/<category>/<skill>/CHANGELOG.md` | Versions, status, and the `Because:` lines | `/core-skill-authoring revise` |
| `LESSONS.md` | Cross-project lessons you accepted | `/core-retro review` (after your approval) |
| `skills-map.json`, `SKILLS-MAP.md` | Categories and links between skills | `/core-skill-maintenance` (`node tools/skill-map.mjs`) |

## 6. A typical rhythm (your choice, never automatic)

- At the end of each task, run `/core-retro log`. Flows do this for you.
- After a phase, or about weekly: `/core-retro review`, then approve or reject each proposal.
- For each approved proposal: `/core-skill-authoring revise <skill>`, then `/core-skill-evals <skill>`,
  then merge.
- After a merge: `/core-skill-maintenance`.
