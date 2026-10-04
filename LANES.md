# LANES: which Muse tier may see what

Muse has two tiers. The tier is attached to the model on each request, not to the skill file. When a
skill runs, its whole SKILL.md travels with the request, along with every file, diff and log the
session touches.

| Lane | Model (check with `/models`; see VERIFIED.md #3) | Data use | Use for |
| --- | --- | --- | --- |
| **A: Standard** | `muse-spark-1.3` | Not used to improve Meta products | Authoring and revising skills; every repo with private text, credentials, or client/employer material |
| **B: Contributor** | `muse-spark-1.3-contributor` | May be used to improve Meta products | Fixture runs of skills (invented data only); non-sensitive repos |

Rates per million tokens:

| | Lane A (Standard) | Lane B (Contributor) |
| --- | --- | --- |
| Input | $1.25 | $0.10 |
| Cached input | $0.15 | $0.002 |
| Output | $4.25 | $0.20 |

[Likely] These are third-party figures, as of 2026-10-02.

## Library rules

1. Every skill is written as if it will be published: no secrets, private text, client names,
   manuscript passages or personal absolute paths. The pre-commit scan enforces this, and this
   repo is currently **public** on GitHub.
2. All skill edits happen in Lane A, inside this repo, as commits. Never edit a skill inside a project.
3. Fixture runs (`01-REFINEMENT.md` R3) may use Lane B, because fixtures use invented terms only.
   Run one cross-lane check on Lane A as well.
4. Start every session by running `/models`, then put the lane in your first message, for example
   "Lane A, model muse-spark-1.3". `core-session-start` checks it against the project's lane.
5. Never use `--yolo` or `--no-session-log` in a traced run.

## Project lanes

Each project repo keeps a `LANES.md` at its root, referenced from its `AGENTS.md`. Its `lane` value
also goes in `.muse/project.json`. `core-project-profile` reads a project's existing LANES.md
or this table and writes only `.muse/project.json`. Creating or editing a project's LANES.md
is a separate task; the profile skill does not authorize that extra write.

| Project | Lane | Reason |
| --- | --- | --- |
| Textclone | **A only** | The personal writing corpus. `.env` files. The checkpoint preview copies the live database. |
| Orion | **A only** | Credentials: the host token and model and service keys in `.env`. |
| Manuscript | **A only, permanently** | Private text. |
| Microcoin | **A only** | Future live collectors need credentials; collected content is hostile. |
| Charizard | **A only** | Spending and checkout. |
| MCLA | **A only** | Sends network logs and diagrams to a hosted model. |
| SOC-Analyst-Tool, OmniRoute, Traitor, SotS | **A until profiled** | Purpose not yet recorded. |
| Portfolio site | B allowed | Public content only. |
| This skills repo | A for authoring; B allowed for fixture runs | Fixtures use invented data. |

Per-project template:

```markdown
# LANES
Lane: A (Standard only) | B (Contributor allowed)
Reason: <one line>
Never open in Lane B: <paths, e.g. data/, .env, *.db>
Checked by: core-session-start (compares with .muse/project.json "lane")
```
