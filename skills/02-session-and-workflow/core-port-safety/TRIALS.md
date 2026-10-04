# Trials: core-port-safety

## Trials
- 2026-10-04 | foreign-owner trial: dummy held owned 43110 from another shell, skill detected foreign PID and used 43111 | TcpListener dummy PID 38944 on 43110, own TcpListener PID 31992 on explicit 43111, handoff trial/HANDOFF.md | baseline exit 0 (43110/43111/43112/3000 FREE), detect 43110->38944 Listen exit 0, 43111 FREE exit 0, own verify 43111->31992 exit 0, taskkill 31992 exit 0, 43111 FREE exit 0, foreign preserved 43110->38944, teardown 38944 exit 0, 43110 FREE exit 0 | steps 1 yes, 2 yes, 3 yes, 4 yes, 5 yes; improvised 4 (handoff path/format, pick-next heuristic, PID capture, ErrorAction); wrong none | verdict: pass | HEAD d7c278a, PS 5.1.26100.9444, branch muse/skills-core-session-b | CHANGELOG.md untouched | trial folder kept (synthetic only): trials/b-core-port-safety/trial; repo otherwise untouched.

### 2026-10-04 detail — foreign-owner trial
| step | Done-when met? | evidence | clear / wrong / missing |
| --- | --- | --- | --- |
| 1 | yes | trial/.muse/project.json: owned [43110,43111,43112], forbidden [{"label":"synthetic live app","port":3000}]; both lists written down | clear |
| 2 | yes | `Get-NetTCPConnection -LocalPort 43110 -State Listen` exit 0 -> 127.0.0.1 43110 38944 Listen; `Get-Process -Id 38944` -> powershell; 43111 FREE exit 0; baseline 4/4 FREE exit 0 | clear, missing: add `-ErrorAction SilentlyContinue` for free ports to avoid error text |
| 3 | yes | step-4 record empty (no PIDs recorded) so 38944 foreign; picked 43111, verified FREE exit 0; 43110 stayed 38944 through skill steps (foreign preserved) | clear, missing: how to pick (used next-owned heuristic); stop command inline instead of only cross-ref to /core-windows-env |
| 4 | yes | TcpListener explicit 43111, PID 31992; `Get-NetTCPConnection -LocalPort 43111` exit 0 -> 43111 31992 Listen; trial/HANDOFF.md line `- PID 31992 PORT 43111 RUNNING` via Set-Content exit 0 | missing: paths.handoff absent in trial project.json (only name/ports/root), so no fallback path or line format; PID capture method unstated (used $PID + Get-NetTCPConnection verify) |
| 5 | yes | `taskkill /PID 31992 /T /F` exit 0; 43111 FREE exit 0; handoff updated to `PID 31992 PORT 43111 STOPPED` exit 0, no RUNNING line | clear, missing: remove line vs mark STOPPED (marked STOPPED); stop command again only via cross-ref |

(1) Improvised because the skill did not say: handoff path and PID-and-port line format (created trial/HANDOFF.md, `PID <pid> PORT <port> <status>`); owned-port pick heuristic (next free owned in list order); PID capture (server-shell $PID plus Get-NetTCPConnection verify); `-ErrorAction SilentlyContinue` on free-port checks.
(2) Wrong for this project: none. Forbidden 3000 read-only FREE check allowed; launcher port-up N/A (TcpListener takes explicit port); stop-and-ask and pause-state paths not reached (alternate port fit).
(3) Anti-patterns nearly committed: killing whatever held 43110 without ownership check (checked step-4 record first; foreign 38944 preserved); claiming step 4 done without check result (ran Get-NetTCPConnection 43111->31992 before marking done); hard-coding ports before reading project.json (read project.json first).
PIDs started/stopped: started dummy 38944 (foreign fixture, another shell) + own 31992; stopped own 31992 (skill step 5, taskkill exit 0) then dummy 38944 (fixture teardown after trial, taskkill exit 0). Not verified: stop-and-ask branch, pause-state save, launcher port-up move (none triggered by design).
