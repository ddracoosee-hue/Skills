---
name: core-example-skill
description: >-
  Produces <artifact> for <situation>. Use when <the user's words for the situation>.
  Not for <near-miss> (use `core-other-skill`). Runs only when invoked by name.
  Writes .agents/runs/core-example-skill/.
---

# core-example-skill — v0.1.0

## Purpose
<One sentence: what this skill produces and for whom.>

## Trigger contract
- Run only when invoked by name: the user types /core-example-skill, or a prompt, task file or
  flow skill names it.
- If the request does not need <X>, say so in one line and stop.
- Explicit instructions in the prompt or the project's AGENTS.md override the defaults in this skill.
- Use when: <3–6 situations, in the words a user would type>.
- Not for: <near-miss> → core-other-skill.

## Inputs
1. Read `.muse/project.json`. If it is missing, ask the user to run /core-project-profile, then stop.
2. Read the project's rules files (`paths.rules` in the profile), starting with AGENTS.md.
3. Read only the files needed for <X>. Cite file:line for every claim.
4. If the task involves <Y>, read `references/<y>.md` first.

## Procedure
1. Run `<exact command from project.json, e.g. commands.test_unit>`. Record the exit code.
   Done when: the exit code is recorded in the run file.
2. <Concrete file action.> If <condition>, then <rule>.
   Done when: <checkable condition>.
3. Write the run file (see Outputs) with the Trace block.
   Done when: the file exists and its Trace block is filled.

## Gates
Before any write outside `.agents/runs/`, show the plan and ask exactly:
"Approve, request changes, or cancel?" Stop until answered. Ask one question at a time.
A project checkpoint uses the project's own `checkpoints.approval_phrase` instead.
When stopping at a gate, save progress to `.agents/state/core-example-skill.json` and end with:
Re-invoke: /core-example-skill continue

## Outputs
- `.agents/runs/core-example-skill/<YYYYMMDD-HHMM>-<slug>.md`: the result, then the Trace block.

## Trace block
Append to the run file:
- skill and version (this file's heading), skills-repo git sha if known
- lane and model, as stated by the user at session start (A Standard / B Contributor)
- session id, if Muse exposes it (see VERIFIED.md); otherwise "unknown"
- inputs read; commands run with exit codes; outputs written
- gate questions and the answers given
- test or check command and its result ("turn finished" is not "work correct")

## Failure handling
- Missing project profile: ask for /core-project-profile; stop.
- Check command fails: record the failure; never claim success.
- Unknown destination or fact: ask; never invent it.

## Do not
- Do not commit, push or amend unless the user asked in this session.
- Do not write secrets, private text or personal absolute paths into any file.
- Do not continue past a gate without an answer.
