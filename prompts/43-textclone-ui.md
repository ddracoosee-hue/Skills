# Prompts: 5.4 Textclone UI track and orientation

Batch name: `textclone-ui`. Paste one block per message.

The UI-track sources live on branch `claude/textclone-ui-redesign-df0pg1`, or on `muse/ui-redesign`
once Phase UI-0 has run. Read them from that branch with `git show <branch>:<path>`, or from the UI
worktree. Never read them from `master`, where they don't exist yet.

---

## `textclone-ui-guardrails` · P1

```text
Build the skill textclone-ui-guardrails. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when working on Textclone's UI redesign track: rules U1–U8, guardrails G1–G20, scope (web/ only), the phase checker and its gate, checkpoints UI-CPa/b/c. Not for request parity details (use `textclone-ui-parity`).

Read first (UI branch): docs/ui-redesign/MUSE-START-HERE.md, GUARDRAILS.md (G1–G20, operating
limits, 3-cycle retry budget, report contents), TASKS-UI.md (U1–U8, phases UI-0…UI-9),
guardrails/check-ui.mjs (--phase, --gate, --base; checks G1–G10 and D-checks), PLAN-UI.md §2 rule 0.

Steps:
1. Identify the current phase and the last ticked task.
2. Before a task: list its allowed files; confirm none are protected (web/next.config.ts,
   web/app/api/, web/components/orb/engine/, docs/ui-redesign/* except ticking TASKS-UI.md).
3. After the task: check-ui.mjs --phase <last completed phase>; at the gate: --phase <current>
   --gate (runs the full layout audit requirement G10).
4. On failure: the U4 cycle, at most 3, then stop and report.
5. At UI-CPa/b/c: prepare, announce, stop until "UI-CPx approved".
Decision rules: GUARDRAILS.md wins over every other UI doc; never edit the checker or audit
files; one phase per user message; never push or merge to master.
Anti-patterns: "fixing" a checker finding by editing the checker; starting the next phase early.
Evidence: checker output with exit code; checkpoint status.
references/: references/quick-rules.md (U1–U8 and G1–G20 one line each, with source line refs).

Evals:
T: "start UI phase 3" | "what am I allowed to edit in the UI track?" | "run the UI phase gate" |
"the checker says G2 failed" | "prepare UI-CPb"
N: "same requests as before?" → textclone-ui-parity | "boxes overflow" → core-layout-audit |
"start the preview servers" → textclone-checkpoint-preview

Trial: on a UI worktree, run check-ui.mjs --phase UI-0 and explain each check's result.

Refine signals: checker failures that the skill's step 2 should have prevented.
```

---

## `textclone-ui-parity` · P1

```text
Build the skill textclone-ui-parity. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a Textclone UI change might alter what the app does: same backend calls, identical requests for the same input, same defaults, no blocked features, runs not cancelled by navigation. Not for visual rules (use `core-visual-design-method`).

Read first (UI branch): GUARDRAILS.md G14–G16, guardrails/request-parity.json (13 golden cases from
the old Studio), check-ui.mjs G8 (no new API paths except GET /api/compose/registry) and G9
(request parity via TypeScript transpile), web/lib/api.ts, web/lib/sse.ts, web/lib/hooks.ts.

Steps:
1. For the change, list every request it can send (path, method, body builder).
2. Compare bodies with the golden cases for the same inputs (run G9).
3. Defaults: no preset applied by default; target and length defaults unchanged.
4. Navigation: a running generation keeps running when the user changes page.
5. Any difference → revert to the old behaviour, or stop and ask (it's a functional change).
Decision rules: only web/lib/api.ts and web/lib/sse.ts may call fetch( or new EventSource(;
parity failures are never "accepted".
Anti-patterns: building request bodies in components.
Evidence: the request list and G8/G9 results.

Evals:
T: "does the new console send the same request as the old studio?" | "check the defaults didn't
change" | "parity check for the presets drawer" | "navigation cancels my run, is that allowed?" |
"G9 failed"
N: "scope rules for the UI track" → textclone-ui-guardrails | "API schema snapshot" →
textclone-api-contract | "visual score" → core-visual-design-method

Trial: run check-ui.mjs G8/G9 on the UI branch and explain any golden case.

Refine signals: parity bugs found at checkpoints.
```

---

## `textclone-checkpoint-preview` · P1

```text
Build the skill textclone-checkpoint-preview. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring. Build after core-port-safety.

Description (verbatim; change only if R2 fails):
Use when a Textclone checkpoint needs a preview: read-only DB copy, preview on 8010/3010, announce, wait for approval, then stop and delete the copy. Not for general port checks (use `core-port-safety`).

Read first: tasks.md §G8 (the full procedure: read-only sqlite backup copy to
textclone-wt\preview-data, TEXTCLONE_DATA_DIR, dev.ps1 -ApiPort 8010 -WebPort 3010 -NoBrowser,
poll /api/health/live and the UI up to 180 s, supervisor.pid, the exact announcement text,
taskkill /T /F, delete the copy), the UI track's checkpoint section in TASKS-UI.md (UI-CPa/b/c).

Gate: the project's approval phrase ("<id> approved"), not the generic question — project rules
override. Save state to .agents/state/textclone-checkpoint-preview.json and end with
"Re-invoke: /textclone-checkpoint-preview continue" so cleanup runs after approval.
Steps: exactly the G8 steps 1–5, with the checklist for the current checkpoint pasted into the
handoff section titled "UI checkpoint <id> — WAITING FOR USER (date)".
Decision rules: approval only from the exact words "<id> approved"; never touch 8000/3001, 3000,
11434; the preview copy holds personal text → deleted after approval; if the preview fails, the
checkpoint still happens (report the failure and wait).
Anti-patterns: opening the live DB for writing; leaving the preview running after approval.
Evidence: the URL, health poll results, the handoff section, PIDs stopped, copy deleted.

Evals:
T: "prepare the checkpoint for me to review" | "start the preview for UI-CPa" | "I approved it,
clean up the preview" | "the preview won't start" | "show me the phase on a test server"
N: "is 3010 free?" → core-port-safety | "run the gate checker" → textclone-ui-guardrails |
"launcher ports" → textclone-launcher

Trial: run the procedure with an EMPTY preview (no DB copy, as G8 allows), confirm health, then
stop and clean up; record ports free.

Refine signals: preview failures.
```

---

## `textclone-dictation` · P2

```text
Build the skill textclone-dictation. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when working on Textclone voice-to-text: local Whisper in a web worker, the browser engine fallback, microphone permissions, dictation states, and the orb's listening state. Not for orb visuals (use `orion-orb-states`).

Read first (UI branch): TASKS-UI.md Phase UI-4 (VoiceEngineId "local-whisper" | "browser",
useDictation with useStored("tc.voice.engine", "local-whisper"), @huggingface/transformers exact
version, Xenova/whisper-base.en q8 on WASM served from web/public/models, env.allowRemoteModels =
false, whisper.worker.ts as a module worker), PLAN-UI.md decision UD-3, VISUAL-DESIGN.md (verdigris
= dictation).

Steps:
1. States: idle, requesting permission, listening, transcribing, inserted, error (denied, no
   device, model missing) — each with UI and orb mapping.
2. Local-only: models served from web/public; no remote model fetch at runtime.
3. Insert text at the cursor in the active pane; never auto-run.
4. Tests: engine selection, permission denied, worker failure → browser fallback or clear error.
Decision rules: audio never leaves the machine; the browser engine may use a cloud service in
some browsers → label it and keep local the default.
Anti-patterns: loading models from the hub at runtime; dictation that triggers a run.
Evidence: state table, tests, network log showing no remote model calls.

Evals:
T: "add dictation to the reply box" | "whisper is slow to start" | "microphone permission denied
handling" | "the orb should show listening while I talk" | "switch between local and browser
speech engines"
N: "orb animation details" → orion-orb-states | "UI track gate" → textclone-ui-guardrails | "voice
profile" → textclone-registers

Trial: write the state table from Phase UI-4's spec and check each state has an error path.

Refine signals: dictation failures in use.
```

---

## `textclone-codebase-map` · P1

```text
Build the skill textclone-codebase-map. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when you need to know where something lives in Textclone or what calls what: packages, routes, jobs, UI pages, tests, scripts, and which doc owns which rule. Not for reading strategy on huge files (use `core-context-budget`).

Read first: docs/AI_WORKFLOW.md source map; README layout; `git ls-files` of textclone/, web/,
tests/, scripts/; textclone/api/routes/; web/app/.

Steps:
1. references/map.md: one row per package/folder: purpose, entry points, tests, owning doc.
2. references/flows.md: 5 traced flows with file:line (paste → sample stored; profile build job;
   rewrite request → SSE → report; analyze; settings save).
3. references/rules-owners.md: which doc owns which rule (AGENTS.md, tasks.md G-rules, plan.md
   invariants, GUARDRAILS.md, web/AGENTS.md).
4. A "last verified" commit hash on each file; refresh with core-skill-maintenance.
Decision rules: map from the code, not docs alone; mark anything unverified.
Anti-patterns: copying AI_WORKFLOW.md without verifying.
Evidence: the three references and the commit hash.

Evals:
T: "where is the scoring code?" | "what calls the profile builder?" | "which test covers SSE?" |
"trace a rewrite from the UI to the database" | "which file defines the error codes?"
N: "the tasks file is huge, read efficiently" → core-context-budget | "glossary of terms" →
textclone-voice-glossary | "explain the loop" → textclone-generation-loop

Trial: trace "rewrite request → SSE → report" with file:line and verify each line exists.

Refine signals: wrong map entries.
```

---

## `textclone-voice-glossary` · P2

```text
Build the skill textclone-voice-glossary. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when a Textclone term needs a precise meaning (register, target, band, stage, best-so-far, tell, exemplar, neutral paraphrase, unverified, partial): definitions tied to code. Not for code locations (use `textclone-codebase-map`).

Read first: README.md, plan.md §2, textclone/profile/targets.py, generate/types.py, generate/report.py,
detect/tells.py, docs/ui-redesign/UI-SPEC.md labels.

Steps:
1. references/glossary.md: term | one-sentence definition | where defined in code (file:line) |
   UI label | not to be confused with.
2. Flag terms with two meanings in code or UI; propose one.
3. Use the glossary in microcopy and docs.
Decision rules: code is the source of truth; UI labels map to glossary terms one to one.
Anti-patterns: definitions from general NLP usage that differ from Textclone's.
Evidence: the glossary and the conflicts list.

Evals:
T: "what exactly is a register here?" | "define best-so-far" | "is 'partial' the same as
'unverified'?" | "make a glossary for textclone" | "the UI calls it target but the code says band"
N: "where is the band code?" → textclone-codebase-map | "button wording" → core-microcopy |
"explain the loop" → textclone-generation-loop

Trial: define 10 terms with file:line and find at least one naming conflict.

Refine signals: terminology confusion in reports.
```
