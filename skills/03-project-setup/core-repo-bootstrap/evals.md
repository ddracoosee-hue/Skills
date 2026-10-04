# Evals: core-repo-bootstrap

## Should trigger
- T1: "set up the OmniRoute repo properly"
- T2: "this project is empty, give it a structure"
- T3: "start a new project for the SOC tool"
- T4: "add AGENTS.md and docs to Traitor"
- T5: "bootstrap SotS so agents can work in it"

## Should not trigger
- N1: "fill in the .muse profile" → `core-project-profile`
- N2: "write the feature brief" → `core-product-brief`
- N3: "set up CI only" → `core-ci-setup`

## Results
| Date | Round | Should trigger | Should not | Changed |
| --- | --- | --- | --- | --- |
| 2026-10-03 | 1 | 5/5 | 1/1 exercised, 2 deferred (N2 → none, target core-product-brief unbuilt; N3 → none, target core-ci-setup unbuilt) | none — provisional; fresh session 01a104a0-e7cb-7d41-abc0-7fddf6a4021b, muse-spark-1.3, HEAD e28862a; re-run N2 when core-product-brief exists, N3 when core-ci-setup exists |
| 2026-10-04 | 2 | 5/5 | 1/1 exercised, 2 deferred | none — provisional; batch close, fresh session 01a1052c-1c8d-78a2-b250-eaf7dc4202c6, Lane A, HEAD c4aabfa (skill text unchanged since); reruns: N2→core-product-brief, N3→core-ci-setup (both observed none) |
