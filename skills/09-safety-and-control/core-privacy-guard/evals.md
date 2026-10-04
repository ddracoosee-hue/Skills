# Evals: core-privacy-guard

## Should trigger
- T1: "is anything private in this commit?"
- T2: "I need sample text for a test"
- T3: "can I paste the error log into the handoff?"
- T4: "make sure the skill files have no personal data"
- T5: "check the report doesn't leak my writing"

## Should not trigger
- N1: "is the upload route secure?" → `core-security-review`
- N2: "write synthetic fixtures for textclone" → `textclone-synthetic-fixtures`
- N3: "delete my data" → none

## Results
| Date | Round | Should trigger | Should not | Changed |
| --- | --- | --- | --- | --- |
| 2026-10-03 | 1 | 5/5 | 1/1 exercised, 2 deferred (N1 → none, target core-security-review unbuilt; N2 → none, target textclone-synthetic-fixtures unbuilt) | none — provisional; fresh session 01a10497-79f7-7f71-9a7a-9468afb0c529, muse-spark-1.3, HEAD f798095; re-run N1 when core-security-review exists, N2 when textclone-synthetic-fixtures exists |
