# Muse Code Skills — Build Plan and Reference

> **Library note (how this document is used here):**
>
> - **Supplemental.** This is a reference that informs our skill structure; it does not replace it.
>   The structure stays as defined in `prompts/00-BUILD-PROTOCOL.md` (eight sections) and
>   `prompts/01-REFINEMENT.md` (R1–R7). Protocol §8 lists which facts from this document apply and
>   where they go.
> - **Adapted for this PC: Muse runs in PowerShell.** Meta has supported Muse natively on Windows
>   since 2026-09-16 ("no WSL required… PowerShell-fluent"). This matches how the projects are
>   developed: PowerShell commands, `npm.cmd`, Windows venvs. WSL is not used. `~` means `$HOME`
>   (`C:\Users\<user>`). Paths below shown in Linux form are noted as such, and their Windows
>   locations are confirmed in `VERIFIED.md`.
> - **Tool names here:**
>   - the structure check is `tools/check-skills.mjs`;
>   - the optional fixture harness is `tools/run_fixture.ps1`;
>   - the optional ledger is `tools/trace_ledger.ps1`.
> - **Privacy and conflicts.** The owner line was removed because the repo is public. Where this
>   file and `VERIFIED.md` disagree, `VERIFIED.md` (observed on the PC) wins.

Date compiled: 2026-10-02
Target platform: Meta Muse Code (terminal coding agent), model family Muse Spark 1.3
Purpose: give Claude Code verified facts, design rules and a phased build plan for a portable,
traceable library of Muse Code skills. The skills live at user scope so they work in every project.
They are authored on the Standard tier and run on the Contributor tier where appropriate.

How to read this file: every factual claim carries a confidence tag.
- [Certain] = stated in Meta's official docs or cookbook (dev.meta.ai), or in Meta's launch posts.
- [Likely] = consistent across multiple third-party sources, or a strong inference from official behavior.
- [Guessing] = single-source, community-reported, or unverified. Verify these on the machine before relying on them.

Do not invent Muse Code features, flags, frontmatter fields or file schemas that are not listed
here. When something is marked unknown, verify it with the CLI (`muse --help`, `muse skills --help`,
`muse skills validate`) and record the result in `VERIFIED.md`.

---

## 1. Correcting three assumptions before building

The plan rests on three ideas that need adjusting. Each one changes how the skills are designed, so
they come first.

### 1.1 Skills do not train anything

A SKILL.md file is a set of instructions loaded into the model's context at runtime. Writing or
running a skill does not fine-tune Muse Spark for you. [Certain]

The only "training" link is the Contributor tier's data grant. Prompts and completions sent to the
Contributor model may be used by Meta to improve Meta's products, which means Meta's future models,
not a private model of yours. [Certain]

Design consequence: skills improve only when the SKILL.md text is edited. Improvement has to come
from an evaluate-and-revise loop (Section 8), not from use.

### 1.2 Building on Standard does not protect a skill that later runs on Contributor

The tier is attached to the model string on each request, not to the skill file. [Likely] The
model strings are `muse-spark-1.3` (Standard) and `muse-spark-1.3-contributor` (Contributor).
[Likely, third-party pricing pages; verify with `/models`]

When a skill is invoked, Muse Code's `read_skill` tool pulls the full SKILL.md into the turn's
context. [Certain] So on a Contributor session, the skill's entire text travels with the request,
along with every file, diff, log and correction in that session.

What the Standard-authoring step protects:
- the drafting conversations, rejected drafts and design reasoning;
- any sensitive files opened during authoring;
- the project material used to design the skill.

What it does not protect:
- the skill's own text, once it runs on Contributor;
- anything the skill reads or writes during a Contributor session.

Design consequence: write every skill as if it will be published. No secrets, private texts,
client names, manuscript passages or internal paths inside SKILL.md (Section 7.1). Run sensitive
repositories, especially the manuscript and anything with credentials, on Standard only.

### 1.3 "Stays in the base platform" means user scope, in PowerShell on this PC

Muse Code loads user skills from `$XDG_CONFIG_HOME/muse/skills` and `~/.agents/skills`, and those
are available in every project. [Certain] That is the correct home for a cross-project library.

Muse runs natively on Windows in PowerShell. [Certain, Meta for Developers, 2026-09-16] So `~` is
`$HOME` (`C:\Users\<user>`), and the user skills folder is `$HOME\.agents\skills`. [Likely;
confirm with `muse skills list`, VERIFIED.md #4]

Design consequence: keep the source-of-truth git repo at `$HOME\muse-skills`. Link each skill into
`$HOME\.agents\skills\<skill-id>` with `install.ps1`, which uses directory junctions and needs no
admin rights.

(Historical: at launch, Muse ran on Windows only through WSL2, where `~` was the Linux home. That
route is not used here.)

---

## 2. Platform facts

### 2.1 Versions and access

- Muse Code launched in beta on 5 August 2026 with Muse Spark 1.2. [Certain]
- Muse Spark 1.3 began rolling out on 2 September 2026 and is now in Muse Code, the Meta Model API,
  OpenRouter and Cursor. [Likely]
- The configuration docs still list `muse-spark-1.2` as the default model. [Certain] Docs and builds
  are drifting, so always pin the model explicitly.
- Muse Spark was trained with emphasis on zero-shot tool calling through command-line interfaces
  and skills, long-context processing, long-trajectory instruction following with prompt-injection
  awareness, and multi-agent coordination. [Certain, Meta research post as reported] This favors
  skills that drive concrete CLI commands over skills that describe abstract behavior.

### 2.2 Tier pricing (per million tokens)

| Item | Standard | Contributor | Contributor discount |
|---|---|---|---|
| Input | $1.25 | $0.10 | about 12.5x cheaper |
| Cached input | $0.15 | $0.002 | about 75x cheaper |
| Output | $4.25 | $0.20 | about 21x cheaper |
| Data use | Not used to improve Meta products | May be used to improve Meta products | — |

[Likely, consistent across at least five third-party sources; 1.3 Contributor is reported to keep
1.2 rates]

Two statistics matter for skill design:
- On Contributor, cached input costs 2% of uncached input ($0.002 vs $0.10), a 50x ratio. On
  Standard the ratio is about 8.3x. Stable prompt prefixes therefore pay off much more on
  Contributor (Technique 5.12).
- Subscription plans from $5 to $50 per month were added at general availability. [Likely] Their
  per-tier data terms were not documented in what was reviewed. [Guessing] Verify in account
  settings.

Early user reports say a fresh install can default to Contributor. [Guessing] Check `/models` at the
start of every session that touches private material.

### 2.3 Paths and files

Paths are shown as documented (Linux form). On this PC `~` is `$HOME`. The Windows locations of
the settings file and the session logs are confirmed in `VERIFIED.md` (#6, #12).

| What | Where | Confidence |
|---|---|---|
| User settings | `~/.config/muse/settings.json`, must contain `"schema_version": 1` or every command fails | [Certain] |
| User skills | `$XDG_CONFIG_HOME/muse/skills`, `~/.agents/skills` | [Certain] |
| Also auto-discovered | `~/.claude/skills`, `$CODEX_HOME/skills` (fallback `~/.codex/skills`) | [Certain] |
| Project skills | `<repo>/.agents/skills/<skill-id>/SKILL.md` (also repo `.claude/skills`, `.codex/skills`) | [Certain] |
| Project instructions | `AGENTS.md`, `CLAUDE.md`, `.agents/AGENTS.md`, `.claude/CLAUDE.md` (first found per directory level wins; deeper wins; project beats user) | [Certain] |
| Project memory | `<repo>/.agents/memory/MEMORY.md` index plus one file per topic; index lists up to 48 files | [Certain] |
| Project hooks | `<project-root>/.muse/hooks.json` | [Certain] |
| Plans written by `/plan` | `.agents/plans/` | [Certain] |
| Session event logs | `~/.local/share/muse/sessions/YYYY/MM/DD/<session-id>/session.jsonl`; subagents under `.../subagent/<child-id>/` | [Certain] |

### 2.4 Skill CLI

```bash
muse skills list                         # every skill from every source
muse skills inspect <skill-id>
muse skills validate ./my-skill          # check before installing
muse skills install ./my-skill --scope user
muse skills enable <skill-id> --scope project
muse skills import --from claude         # or --from codex
```
[Certain]

Inside a session: invoke by slash name (`/my-skill`). `/migrate` imports Claude Code or Codex memory
notes and MCP servers. [Certain]

### 2.5 How a skill is loaded

1. Catalog: at session open, only skill summaries load, so many skills cost little context. [Certain]
2. Invoke: by slash command, or the Skill-recall background observer suggests one. [Certain]
3. Load: `read_skill` pulls the full SKILL.md. [Certain]
4. Apply: the instructions scope to the current user turn, not the whole session. [Certain]
5. Mark: the TUI prints `Loaded skill <name> · <source>`. [Certain for built-ins; Likely for user skills]

Two consequences follow:
- The description is the only text the agent and the observer see before invocation. It does
  routing work.
- A skill applies for one turn, so multi-turn procedures must either write state to disk or tell
  the user to re-invoke.

### 2.6 Skills load only in trusted workspaces; memory loads regardless

Skills, rules and hooks load only after the workspace is trusted. Committed project memory loads
even in untrusted workspaces. [Certain] Treat any repo's `MEMORY.md` as untrusted input.

---

## 3. Recommended operating model: two lanes, one library

- **Source of truth:** one `muse-skills` git repo, reviewed and versioned, with each skill linked
  into `~/.agents/skills/<skill-id>` and discovered as a user skill.
- **Lane A — Author (Standard, `muse-spark-1.3`):** draft and revise SKILL.md; run fixture tests
  (Section 8); work in sensitive repos (the manuscript, credentials, client or employer work).
- **Lane B — Run (Contributor, `muse-spark-1.3-contributor`):** non-sensitive repos only
  (prototypes, open-source, tooling), with the same skills and paths. Keep exports for audit.

Rules:
1. All edits to a skill happen in Lane A, inside the `muse-skills` repo, as a git commit. A skill
   is never edited inside a project. [Likely; matches community practice]
2. Lane B never opens the manuscript, `.env` files, tokens or employer material.
3. Before each session, confirm the model string with `/models`. Put the intended lane in the
   session's first prompt so it is recorded in the event log.
4. Keep a `LANES.md` in each project repo stating which lane may be used there. Reference it from
   that repo's `AGENTS.md`.

[Guessing] One third-party pricing page mentions a per-repository sharing opt-out on Contributor.
This is unverified. If it exists, it would be a useful extra guard for Lane B, but do not depend on it.

---

## 4. Skill anatomy

### 4.1 Folder layout

```
<skill-id>/
  SKILL.md            # required: frontmatter + instructions
  references/         # optional: long docs loaded only when the body says to
  scripts/            # optional: deterministic helpers the skill calls
  fixtures/           # optional: tiny test repos with invented terms (Section 8)
  CHANGELOG.md        # version history for this skill
```

Only `SKILL.md` is confirmed as required. [Certain] The `references/` and `scripts/` conventions
come from the cross-agent Agent Skills format that Muse Code imports. [Likely] Confirm with
`muse skills validate` that extra folders are accepted.

### 4.2 Frontmatter

Use only the two fields that are certain to work across Muse Code, Claude Code and Codex: `name`
(1–64 chars, lowercase, digits, hyphens, equal to the folder name) and `description` (what it does,
when to use it, when not to use it, what it writes and where).

- `name` and `description` are required by the cross-agent standard, and the name must match the
  folder. [Likely]
- Meta's docs do not publish a full frontmatter schema. [Certain that it is absent from the pages
  reviewed]
- Do not add `allowed-tools`, `model`, `version` or other fields unless `muse skills validate`
  accepts them on this build. Record the result in `VERIFIED.md`.
- Put the version in `CHANGELOG.md` and in the body's header line, not in the frontmatter.

### 4.3 Body sections (fixed order)

1. Purpose: one sentence.
2. Trigger contract: the explicit-invocation statement, plus the conditions where the skill must
   not run.
3. Inputs: what to read first. Project facts come from `.muse/project.json` or `AGENTS.md`, never
   hard-coded paths.
4. Procedure: numbered steps, each naming a concrete command or file action.
5. Gates: where to stop and ask for approval, and the exact question to ask.
6. Outputs: files written, with exact paths and the format of each.
7. Trace block: what to record for traceability (Section 6).
8. Failure handling: named failure cases, each with a recovery.
9. Do not: a short list of forbidden actions.

---

## 5. Prompt-engineering techniques for Muse Code skills

The techniques build on each other in this order: routing, then scope, then grounding, then
control, then cost, then output, then maintenance.

**Routing — getting the skill invoked at the right time**

- **5.1 Make the description a routing contract, not a summary.** [Certain basis] Write four
  clauses: what it does, when to use it, when not to use it, what it writes. The description is the
  only text visible before invocation. The Skill-recall observer and community routers choose
  skills by scoring descriptions, and Meta's own bundled skills put their invocation boundary inside
  the description.
- **5.2 Default to explicit invocation.** [Certain basis] All of Meta's bundled skills (`/plan`,
  `/grilling`, `/grill-with-docs`, `/taste`) run only when invoked by name. Task complexity alone is
  not a trigger. Auto-triggering skills fire on ordinary requests and pollute traces.
- **5.3 Use distinctive, prefixed names; never reuse built-in names.** [Likely] Prefix by scope:
  `core-*` for project-neutral skills, `<project>-*` for one project. Avoid `plan`, `grill`,
  `grilling`, `grill-with-docs`, `taste`, `threejs`, `migrate`.
- **5.4 Keep descriptions short and keyword-dense.** [Likely] Many skills share the summary budget
  at session open. Aim for 2–4 sentences with concrete nouns the user will actually type.

**Scope — keeping the skill portable across projects**

- **5.5 Read project facts; never hard-code them.** [Likely] Step 1 of every procedure reads
  `.muse/project.json` and `AGENTS.md`, and stops with a clear message if required facts are missing.
- **5.6 Design for one-turn scope.** [Certain basis] For multi-turn work, write progress to a state
  file (for example `.agents/state/<skill-id>.json`) and end the turn by telling the user the exact
  re-invoke command.

**Grounding — making output come from the repo, not general knowledge**

- **5.7 Require evidence before claims.** [Certain basis] Read the files that define X and cite
  file:line for each claim. Meta's `/plan` reads code and git log first. That is how it caught a
  missing amount check that would have let a negative transfer bypass overdraft protection.
- **5.8 Point at commands, not concepts.** [Likely] Write "Run `git log --oneline -20`", not "review
  the history".
- **5.9 Write only settled or verified facts.** [Certain basis] If a destination or fact is
  unknown, ask; do not invent it.

**Control — keeping the agent from running ahead**

- **5.10 Build explicit approval gates with exact wording.** [Certain basis] End planning phases
  with the fixed question "Approve, request changes, or cancel?".
- **5.11 One question at a time, with structured choices only when they fit.** [Certain basis]
  Give the recommended option first. Use `request_user_input` only for 2–3 short, mutually
  exclusive options.

**Cost — keeping Contributor runs cheap and cache-friendly**

- **5.12 Keep the top of every SKILL.md stable.** [Likely] Put fixed content first. Never put
  dates, counters or run-specific text in the skill body.
- **5.13 Move long material into `references/` and load it conditionally.** [Likely]

**Output — making results traceable and checkable**

- **5.14 Every skill writes a dated artifact to a fixed path.** [Certain basis] The path is
  `.agents/runs/<skill-id>/<YYYYMMDD-HHMM>-<slug>.md`, with the trace block. (Here, each skill's
  "Evidence to report" plus `core-trace-report` serve this. Per-skill run files are optional.)
- **5.15 Separate "turn finished" from "work correct."** [Certain basis] `muse exec` exit code 0
  means the turn completed. Run the project's real check and record pass or fail.
- **5.16 Let explicit user instructions override skill defaults.** [Certain basis]

**Maintenance — improving skills over time**

- **5.17 Name failures and recoveries inside the skill.** [Certain basis]
- **5.18 Never put secrets or private text in a skill.** [Certain basis for the risk; Likely for the
  rule]

---

## 6. Traceability design

### 6.1 Harness layer [Certain]

- Every model call, tool run and approval is written to an append-only `session.jsonl` before it
  happens.
- Each line is an envelope with these fields: `sequence`, `recorded_at`, `record_type`,
  `durability`, `payload_type`, `payload`.
- Side effects carry a `side_effect_intent` record with `policy_decision` (for example
  `allow:policy` or `allow:llm_judge`) and an `idempotency_key`. Reviewer decisions record
  `decision_source`, including a `context_digest`.
- `muse export` writes a self-contained JSON (`export_schema_version: 1`). The same log plus the
  same flags gives byte-identical output, so a SHA-256 of the export pins a run. `--redacted` strips
  tokens and secrets for sharing.
- `muse exec --json` streams JSONL events for headless runs. `muse replay` steps through a session.
- `--yolo` disables approvals and the sandbox, which removes the approval records. Never use it in
  traced runs.
- `--no-session-log` disables the log entirely. Never use it in traced runs.

### 6.2 Skill layer (design)

Each skill run writes an artifact with a trace block recording:
- the skill and version, plus the git sha of `muse-skills`;
- the lane and model, as reported by `/models`;
- the session id (the join key to `session.jsonl`);
- the start time;
- the inputs read;
- the commands run, with exit codes;
- the outputs written;
- the gate questions and answers;
- the export path and its SHA-256.

The join keys are `session_id`, which links the artifact to the event log, and the skills-repo git
SHA, which links it to the exact skill text that ran.

### 6.3 Optional hook layer

Hooks can append a line to a project-local `trace/hooks.jsonl` on these events: `SessionStart`,
`UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `SubagentStart`,
`SubagentStop`, `Stop`, `SessionEnd`. [Certain that the events exist]

Constraints:
- The exact `hooks.json` schema was not in the pages reviewed. [Unknown]
- Hooks run outside the sandbox. [Certain]
- There is no `muse hooks` command. Fix the config and start a new session to reload. [Certain]

### 6.4 Audit tool

`tools/trace_ledger.ps1` (optional, prompt E3) reads `muse export` JSON plus the reports from
`core-trace-report`, and prints one row per traced task: skills, lane, session, approvals and
test result. It is modeled on Meta's cookbook
`build_ledger.py`.

---

## 7. Security checklist

1. No secrets, tokens, `.env` values, private text, manuscript passages, employer or client data,
   or absolute personal paths in any SKILL.md, reference file or fixture.
2. Confirm the model string with `/models` before any session touching private material.
3. The manuscript repo and anything with credentials are Lane A (Standard) only, permanently.
4. Hooks and MCP servers run outside the sandbox. [Certain] Only add ones whose code has been
   read. Prefer `"mode": "optional"` for non-critical MCP servers.
5. Review `MEMORY.md` on any repo you did not write, because it loads even when untrusted. [Certain]
6. Use `muse export --redacted` for anything leaving the machine. [Certain]
7. Never use `--yolo` outside a disposable container. [Certain]
8. A pre-commit check in `muse-skills` scans for secret patterns and personal paths
   (`.githooks/pre-commit`).

---

## 8. Validation and test loop

This loop replaces the idea of "training" a skill. Here, steps 2–6 are the optional fixture
supplement to R3 in `prompts/01-REFINEMENT.md`. The standard R3 trial remains the default.

1. **Structure check:** `node tools/check-skills.mjs`, then `muse skills validate` (once verified).
2. **Grounding fixture:** a tiny git repo with invented domain terms ("Glimber", "Quokkascale",
   "Frobnitz-9"). [Certain technique]
3. **Headless run** (PowerShell, through `tools\run_fixture.ps1`): `muse exec --model muse-spark-1.3
   --max-model-steps 60 --json --prompt-file fixtures\<case>\prompt.txt > trace\<case>.jsonl`. Gate on the fixture's own `verify` script,
   not on the exit code.
4. **Scorecard:** pass rate over N = 5 runs, mean model steps, approvals requested and artifacts
   written correctly, recorded in `EVALS.csv`. A revision ships only if its pass rate is at least
   the previous version's.
5. **Regression pin:** `sha256(muse export)` for the passing reference run.
6. **Cross-lane check:** the same fixture once on Standard and once on Contributor.

---

## 9. Build phases (as applied here)

The skill batches in `prompts/README.md` are the build plan. This document's phases map onto them
as follows:

- **Phase 0, verify the environment:** prompt E0. Recommended before batch 1.
- **Phase 1, repo scaffold:** done (`skills/`, `tools/`, `templates/`, `install.ps1`, `VERIFIED.md`,
  `EVALS.csv`, `LANES.md`, the pre-commit scan).
- **Phase 2, traceability skills:** `core-trace-report` and `core-session-audit` are P2 supplements,
  built in the `foundation-2` batch. `core-project-profile` is already P1.
- **Phase 3, workflow skills:** the catalog's batches.
- **Phase 4, ledger and hooks:** prompts E3 and E4 (optional).
- **Phase 5, ongoing loop:** refinement stages R5–R7.

---

## 10. Open questions

See `VERIFIED.md`. It holds every open question as a numbered row with its check.

---

## 11. Sources

Official (Meta):
- https://dev.meta.ai/docs/muse-code/extending
- https://dev.meta.ai/docs/muse-code/configuration
- https://dev.meta.ai/docs/cookbook/bundled-skills
- https://dev.meta.ai/docs/cookbook/audit-agent-sessions
- https://dev.meta.ai/docs/cookbook/muse-code
- https://research.meta.ai/blog/introducing-muse-code-and-muse-spark-1-2
- https://x.com/MetaforDevs/status/2100268678583566691 (native Windows support, 2026-09-16)

Third-party (pricing, tiers, community conventions — treat as Likely or Guessing):
- https://thenewstack.io/muse-code-sdk-pricing/
- https://www.layer3labs.io/guides/muse-spark-1-2-pricing
- https://wavect.io/blog/meta-muse-code-pricing-contributor-tier/
- https://musecodes.io/pricing/
- https://www.verdent.ai/guides/agents/what-is-muse-code
- https://github.com/hypery11/oh-my-musecode (description-based skill routing)
- https://www.aiagentslibrary.com/blog/meta-muse-skills/ (consumer Muse vs Muse Code skills)

The original list also cited this repository (`ddracoosee-hue/Skills`) as a source of community
conventions. That source is circular: those conventions were written here, so it is not
independent evidence.
