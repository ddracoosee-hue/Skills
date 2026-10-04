# Evals: core-escalation

## Should trigger
- T1: "should I just delete the old backups?"
- T2: "this fix needs a schema change the task didn't mention"
- T3: "I'm not sure the user wants the API changed for this"
- T4: "the task is blocked on a missing model"
- T5: "can I go ahead and push?"

## Should not trigger
- N1: "rename this variable" → none
- N2: "the tests failed three times, stop and report" → `core-recheck-loop`
- N3: "write up the blocker for Codex" → `core-codex-handoff`

## Results
| Date | Round | Should trigger | Should not | Changed |
| --- | --- | --- | --- | --- |
| 2026-10-04 | 1 | 5/5 | 2/2 exercised, 1 deferred | none — provisional; rerun: N3→core-codex-handoff |
| 2026-10-03 | 2 | 5/5 | 2/2 exercised, 1 deferred | R4 null rules — provisional; fresh session 01a104ea-ae3f-7c03-9a24-7653af9ad0db, Lane A, HEAD a6dec9e + uncommitted R4 text; output trials/core-escalation/r2-output-r4group.md; rerun: N3→core-codex-handoff (observed none) |
