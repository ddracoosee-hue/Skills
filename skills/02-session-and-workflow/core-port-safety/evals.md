# Evals: core-port-safety

## Should trigger
- T1: "start the preview server for the checkpoint"
- T2: "port 3010 is already in use"
- T3: "can I run the mock api now?"
- T4: "make sure we don't break the live app while testing"
- T5: "clean up the servers you started"

## Should not trigger
- N1: "kill chromium processes" → `core-windows-env`
- N2: "start the checkpoint preview for textclone" → `textclone-checkpoint-preview`
- N3: "configure ports for orion" → `core-project-profile`

## Results
| Date | Round | Should trigger | Should not | Changed |
| --- | --- | --- | --- | --- |
| 2026-10-03 | 1 | 5/5 | 2/2 exercised, 1 deferred (N2 → core-port-safety observed, target textclone-checkpoint-preview unbuilt) | none — provisional; fresh session 01a1048d-69af-70c3-842f-2c5a9a498104, muse-spark-1.3, HEAD d7c278a; re-run N2 when textclone-checkpoint-preview exists |
| 2026-10-04 | 2 | 5/5 | 2/2 exercised, 1 deferred | none — provisional; batch close, fresh session 01a1052c-1c8d-78a2-b250-eaf7dc4202c6, Lane A, HEAD c4aabfa (skill text unchanged since); rerun: N2→textclone-checkpoint-preview (observed core-port-safety) |
