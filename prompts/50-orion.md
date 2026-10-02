# Prompts: 6. Orion pack

Batch name: `orion`. Paste one block per message. Facts this section relies on, checked
2026-10-02:
- **Orion's engine** is in `web/components/orion/engine/` (`agents.ts`, `atlas.ts`, `driver.ts`,
  `orb.ts`, `sky.ts`, `types.ts`). The orb states are
  `OrbState = "idle" | "listening" | "thinking" | "speaking"`.
- **Textclone's copy** is in `web/components/orb/engine/`. Five files were copied unchanged from
  Orion commit `fb0be56`; `agents.ts` was left out. Their hashes are in
  `docs/ui-redesign/guardrails/orb-engine.sha256`, and the rules are in
  `web/components/orb/README.md`.
- **Orion's ports:** the web UI runs on 3000 and the host on 8787. The browser never addresses 8787
  directly (Orion CLAUDE.md).

The rest of the Orion pack should be scoped from Orion's own `docs/handbook/`, `AGENTS.md`,
`CLAUDE.md` and `HANDOFF.md` in a later batch, not guessed now.

---

## `orion-orb-integration` · P1

```text
Build the skill orion-orb-integration. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when the Orion orb engine is used in another project or re-synced: vendoring by copy, hash checks, provenance, the public handle only, and re-applying recorded local changes. Not for mapping app states to orb visuals (use `orion-orb-states`).

Read first: textclone (UI branch) web/components/orb/README.md, docs/ui-redesign/guardrails/
orb-engine.sha256, check-ui.mjs G3 (engine hashes, no Orion imports); orion web/components/orion/
engine/*.ts, web/components/orion/CelestialStage.tsx (how Orion mounts it), Orion git log for the
engine folder.

Steps:
1. Vendor: copy the engine files (never import across repos); record source repo, branch, commit,
   files copied/skipped and why in the target's README.
2. Hashes: write SHA-256 per file; the target's checker verifies them.
3. Use only the public handle (setState, pulse, setQuality, setWebEnabled, the amplitude object);
   mount through the target's own stage component.
4. Re-sync: diff Orion's engine since the recorded commit; copy; re-apply recorded local changes;
   update hashes and README; lint and typecheck.
5. Report what changed in Orion's engine between commits.
Decision rules: engine files are never edited for behaviour in the target; a needed change goes
upstream to Orion or is recorded with its reason; agents.ts only where agents exist.
Anti-patterns: importing from the Orion repo path; editing engine files and updating hashes to
match.
Evidence: provenance block, hash file, diff summary on re-sync.

Evals:
T: "update textclone's orb from the latest orion" | "copy the orb engine into a new project" |
"the orb hash check fails" | "what changed in orion's orb since we copied it?" | "can I tweak
orb.ts in textclone?"
N: "make the orb show thinking during runs" → orion-orb-states | "animation timing in the UI" →
core-motion | "orion's tool approvals" → none

Trial: compute SHA-256 of Orion's five engine files at HEAD and compare with textclone's hash file;
report which differ (Orion may have moved on) — read only.

Refine signals: hash failures; re-syncs that broke the target.
```

---

## `orion-orb-states` · P2

```text
Build the skill orion-orb-states. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring. Build after orion-orb-integration.

Description (verbatim; change only if R2 fails):
Use when deciding what the orb shows for an app's activity: mapping app phases to idle, listening, thinking, speaking, pulses and amplitude, with reduced motion and a frame-time budget. Not for vendoring the engine (use `orion-orb-integration`).

Read first: orion web/components/orion/engine/types.ts (OrbState), driver.ts (MAX_DPR 2, reduced
motion: one static frame with a live media-query watch), orb.ts (state behaviours), CelestialStage.tsx;
orion HANDOFF.md "HUD redesign — translucent voice orb" (setAmplitude, gesture-gated audio);
textclone (UI branch) TASKS-UI.md UI-2.2 (web/lib/runState.ts mapping), VISUAL-DESIGN.md (aurora
= the machine working, verdigris = dictation).

Steps:
1. List the app's phases (from its state code, e.g. run stages, dictation states).
2. Map each to one OrbState plus optional pulse/amplitude; write the table.
3. The orb only reflects state: it never drives or reads application data.
4. Reduced motion: confirm the static frame conveys the state (colour or label).
5. Performance: measure frame time at the target DPR on the user's hardware; set setQuality
   fallbacks.
Decision rules: no new states in the engine; every phase maps to exactly one state; error states
use the app's UI, not an orb animation alone.
Anti-patterns: orb as the only indicator of status (inaccessible); per-token pulses that flood.
Evidence: the mapping table, reduced-motion check, frame-time numbers.

Evals:
T: "what should the orb do while the loop is checking?" | "map dictation to orb states" | "the
orb stutters on my laptop" | "should the orb pulse for each draft?" | "reduced motion version of
the orb"
N: "re-sync the engine" → orion-orb-integration | "general animation tokens" → core-motion |
"dictation engine" → textclone-dictation

Trial: write textclone's run-phase → OrbState table from the SSE events (stage, draft, check,
repair, final, done, error) and the dictation states.

Refine signals: user confusion about what the orb means.
```
