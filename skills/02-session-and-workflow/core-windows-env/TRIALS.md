# Trials: core-windows-env

## Trials
- 2026-10-03 | R3 fresh trial of 0.1.0 | PowerShell dummy (Start-Sleep 60s) started with Start-Process -PassThru, PID to dummy_server.pid, stopped with taskkill /PID /T /F | HEAD a6583f6, PS 5.1.26100.9444, branch muse/skills-core-session-b | runner exit 0 (STARTED_PID=26324, TASKKILL_EXIT=0, VERIFY_GONE=OK, PIDFILE_MATCH=OK); independent CONFIRM_GONE=OK, name-kill scan 0 matches | steps 1 yes, 2 yes (via $PSHOME fallback; project.json absent), 3 yes, 4 yes (vacuous, zero errors); improvised 3, none outcome-changing; wrong instructions none | verdict: pass | no stable evaluator tag: bootstrap review required; CHANGELOG.md untouched | trial folder kept (synthetic only): trials/b-core-windows-env/trial; repo otherwise untouched.
