# Skill architecture: large skills, small skills, and where accuracy comes from

This guide answers two questions:
1. Which large-scale skills should we build?
2. Which smaller skills should we go deeper on, so Muse is skilled and accurate?

Every section builds on the one before it.

## 1. Where an agent's accuracy actually comes from

An agent like Muse makes most of its mistakes in small, repeated moments, not in big decisions
[Likely, from this project's own history]:
- claiming a test passed without running it;
- editing a file it hadn't re-read;
- changing one function without checking what calls it;
- guessing a command;
- forgetting a step at the end.

The handoffs and audits in Textclone and Microcoin are full of exactly these.

So accuracy comes from three things, in this order:

1. **Checks done by code, not by the model.** A script that verifies a citation, picks the tests or
   checks a port gives the same answer every time. Prose instructions are followed most of the time.
2. **Small procedures with one job and a checkable result.** These are the micro-skills.
3. **Large skills that compose the small ones in the right order.** These are the flows. They don't
   add accuracy themselves; they make sure the accurate pieces are actually used.

More large skills, on their own, make Muse *less* accurate. Each new description competes for
routing, so the library has to grow downward (small skills and scripts) faster than upward.

## 2. The four tiers

| Tier | What it is | Who calls it | Example | How many |
| --- | --- | --- | --- | --- |
| **Rules** | One-line habits that apply in every task | Always on: they live in `AGENTS.md` and the build protocol, not in skills | "Cite file:line for every claim"; "tag confidence" | ~15 |
| **Tools** | Deterministic scripts in `tools/` | Skills call them | `check-skills.mjs`, `skill-map.mjs`; a citation checker | Grows steadily |
| **Micro-skills** | One judgement procedure, 20–60 lines, one checkable output | Mostly other skills, sometimes you | `core-impact-scan`, `core-verify-done` | Grows the most |
| **Mid-level skills** | A full procedure for one kind of job | You, or a flow | `core-debug-method`, `core-test-first` | The current catalog |
| **Large skills (flows)** | A whole job, end to end, composed of the tiers below | You | `core-flow-feature` | Few: about 10 |

Rules and tools are not skills, but they belong in the plan. For each small capability, the first
question is: **can a script do this?** If yes, it's a tool. If it's a habit needed in every task,
it's a rule. Only if it needs judgement is it a micro-skill.

## 3. Large-scale skills to build

We have five flows (feature, bugfix, UI change, experiment, release). Your existing work shows six
more jobs you repeat across projects:

| Large skill | The job | Composes | Why it is pivotal |
| --- | --- | --- | --- |
| `core-flow-audit` | A full read-only audit of a repo: map, gaps by severity, evidence, and a task list a later agent can execute | `core-context-budget`, `textclone-codebase-map`-style mapping, `core-security-review`, `core-untrusted-content`, `core-stats-sanity`, `core-task-authoring` | You already did this by hand for Textclone (`plan.md` / `tasks.md`) and Microcoin (`MASTER_AUDIT.md`). It is the highest-value job to make repeatable. |
| `core-flow-new-project` | From an idea to a working skeleton with a first tested slice | `core-repo-bootstrap`, `core-project-profile`, `core-product-brief`, `core-scope-slicer`, `core-flow-feature` (first slice) | Four repos are empty today, and new projects keep starting. |
| `core-flow-ai-feature` | Adding anything model-powered safely | `core-ai-decision-boundary`, `core-untrusted-content`, `core-structured-output`, `core-hosted-llm-apis` or `core-ollama-models`, `core-bounded-execution`, `core-llm-eval` | Nearly every project calls a model (Orion, Textclone, Microcoin, MCLA, the published apps). |
| `core-flow-hardening` | Making an existing system safe to run unattended | `core-permissions-approvals`, `core-bounded-execution`, `core-crash-recovery`, `core-audit-trail`, `core-security-review` | Microcoin, Charizard and Orion all needed this, each built from scratch. |
| `core-flow-review-response` | Receiving a review (Codex, a person, an audit), triaging it, fixing and replying | `core-debug-method`, `core-test-first`, `core-recheck-loop`, `core-diff-self-review`, `core-codex-handoff` | The Claude → Codex loop is the core of how you work. |
| `core-flow-skill-cycle` | One pass of the self-development loop | `core-retro` (review), `core-skill-authoring` (revise), `core-skill-evals`, `core-skill-maintenance` | Makes the recursive loop one call instead of four, still started only by you. |

Build `core-flow-audit` first. It is the largest repeated job, and its output (a task list) feeds
every other flow.

## 4. Small skills to go deeper on

These are grouped by the function categories in `SKILLS-MAP.md`. For each:
- **Home** is where it should live: a micro-skill, a tool, or a rule.
- **Value** is how often it happens multiplied by how much a mistake costs. H means both are high.

### 4.1 Grounding and truthfulness (makes answers accurate)

| Small skill | One job | Home | Value |
| --- | --- | --- | --- |
| `core-verify-done` | Before saying "done": re-run every check named in the task, quote the result, list anything not verified | Micro-skill + rule | H |
| `core-cite-check` | Confirm every file:line cited in a report or handoff exists and says what is claimed | Tool (`tools/cite-check.mjs`) | H |
| `core-assumption-log` | List the assumptions behind a plan, mark each verified or not, and check the risky ones first | Micro-skill | H |
| `core-confidence-tags` | Label claims [Certain], [Likely] or [Guessing], and lead with a warning when most are guesses | Rule | M |
| `core-version-truth` | Check the installed version of a library or tool before relying on remembered behaviour (generalises `core-nextjs16`) | Micro-skill + tool | H |

### 4.2 Code changes (makes edits correct)

| Small skill | One job | Home | Value |
| --- | --- | --- | --- |
| `core-locate` | Find a symbol's definition, callers and tests in under a minute (`rg`, `git grep`) | Micro-skill | H |
| `core-impact-scan` | Before an edit: list everything that calls or imports the target, and what could break | Micro-skill | H |
| `core-read-before-edit` | Re-read the exact region right before patching; confirm the anchor is unique | Rule | H |
| `core-minimal-diff` | Keep the change to what the task needs; flag anything else as a separate task | Rule + micro-skill | M |
| `core-test-select` | Pick the smallest set of tests that covers the changed files | Tool | H |
| `core-stack-trace` | Read a traceback down to the first frame in project code, and name the likely cause | Micro-skill | M |
| `core-config-change` | Add a setting: default, validation, `.env.example`, docs, and both old and new configs working | Micro-skill | M |
| `core-contract-sync` | Keep the two sides of a contract in step (Python models ↔ TypeScript types; API ↔ UI) | Micro-skill + tool | M |

### 4.3 Commands and environment (makes actions reliable)

| Small skill | One job | Home | Value |
| --- | --- | --- | --- |
| `core-ps-command` | Write a PowerShell command correctly the first time: quoting, `$env:` per block, `npm.cmd`, exit codes (split from `core-windows-env`) | Micro-skill | H |
| `core-command-check` | After any command, confirm it did what it claimed: exit code, file exists, port open | Rule + tool | H |
| `core-process-cleanup` | Stop exactly the processes this session started, by PID tree, and confirm the ports are free | Tool | M |
| `core-safe-install` | Install from the lockfile only; never upgrade by accident; show the lockfile diff | Micro-skill | M |

### 4.4 Context and coordination (makes long work stay correct)

| Small skill | One job | Home | Value |
| --- | --- | --- | --- |
| `core-context-pack` | Build the minimal context a subtask or another agent needs: files, facts, constraints | Micro-skill | H |
| `core-handoff-delta` | Write only what changed since the last handoff, so handoffs stay short and true | Micro-skill | M |
| `core-scope-check` | Before each edit: is this file in the task's scope? If not, stop or record why | Rule + tool | H |
| `core-stop-check` | Before continuing after a failure: does a stop condition apply? | Rule | H |

### 4.5 AI-specific precision (makes model features accurate)

| Small skill | One job | Home | Value |
| --- | --- | --- | --- |
| `core-prompt-diff` | Compare two prompt versions on the same inputs and show the output differences | Tool | M |
| `core-golden-set` | Build and freeze a small labelled test set for any model feature (20–50 items) | Micro-skill | H |
| `core-output-contract` | Write the JSON schema and the repair-or-fail rule for one model call | Micro-skill | M |
| `core-cost-estimate` | Estimate tokens and cost for a model call or run before it happens | Tool | M |

That is 25 small capabilities:
- 13 micro-skills;
- 7 tools;
- 5 rules, plus 6 more pieces that are a combination of rule, tool and micro-skill.

The rules cost nothing to route. The tools never route at all. Only the micro-skills add
descriptions, and most are called by other skills rather than by you, so their descriptions can
say so ("Usually called by other skills").

## 5. How to choose what to build first

Score each candidate:

**priority = frequency × error cost × checkability**

- **Frequency:** how often it happens across your top projects. Use the local survey ranking from
  `prompts/07-local-portfolio-survey.md`.
- **Error cost:** the damage when it goes wrong (data loss and security are 3; wasted time is 1).
- **Checkability:** how objectively you can tell it worked. Checkable things improve fastest in
  the self-development loop.

[Likely] Applied to what we know today, the first wave would be:

1. **Tools:** `cite-check`, `test-select`, `command-check`.
2. **Rules:** add `verify-done`, `read-before-edit`, `scope-check` and `confidence-tags` to the
   protocol and to each project's `AGENTS.md`.
3. **Micro-skills:** `core-verify-done`, `core-impact-scan`, `core-locate`, `core-context-pack`,
   `core-golden-set`.
4. **Large skills:** `core-flow-audit`, then `core-flow-ai-feature`.

The survey may reorder this. For example, if Microcoin turns out to be your most active project,
`core-flow-hardening` moves up.

## 6. How small skills keep large ones accurate

Large skills stay short because they *call* small ones, and each small one has its own tests. When
`/core-retro review` finds a miss in a flow, the fix usually belongs in a small skill or a tool, not
in the flow. That is the recursive loop working at the right level: improvements go to the smallest
piece that would have prevented the failure, and every flow that uses that piece gets better at once.

## 7. Next steps

1. Run the local survey (`prompts/07-local-portfolio-survey.md`) and share the ranked table.
2. Choose which of §3 and §4 to add. Each one then gets a catalog row, a category in
   `skills-map.json` and a build prompt, the same way as every other skill.
