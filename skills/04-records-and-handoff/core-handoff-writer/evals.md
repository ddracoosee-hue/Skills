# Evals: core-handoff-writer

## Should trigger
- T1: "update the handoff before you stop"
- T2: "record today's work in AI_HANDOFF"
- T3: "leave notes so the next session can pick up"
- T4: "write the dated status for this phase in the handoff"
- T5: "log what you changed and what's left"

## Should not trigger
- N1: "tell me what you did" → `core-report-writer`
- N2: "ask Codex to review this" → `core-codex-handoff`
- N3: "tick the roadmap steps" → `core-roadmap-sync`

## Results
| Date | Round | Should trigger | Should not | Changed |
| --- | --- | --- | --- | --- |
| 2026-10-03 | 1 | 5/5 | 0/0 exercised, 3 deferred | none — provisional; reruns: N1→core-report-writer, N2→core-codex-handoff, N3→core-roadmap-sync |
| 2026-10-03 | 2 | 5/5 | 0/0 exercised, 3 deferred | R4 null rule — provisional; fresh session 01a104eb-2323-72c0-854b-cb47c0a5b723, Lane A, HEAD a6dec9e + uncommitted R4 text; output trials/core-handoff-writer/r2-output-r4group.md; reruns: N1→core-report-writer, N2→core-codex-handoff, N3→core-roadmap-sync |
| 2026-10-04 | 3 | 5/5 | 0/0 exercised, 3 deferred | none — provisional; batch close, fresh session 01a1052c-1c8d-78a2-b250-eaf7dc4202c6, Lane A, HEAD c4aabfa (skill text unchanged since); reruns: N1→core-report-writer, N2→core-codex-handoff, N3→core-roadmap-sync (all observed none) |
