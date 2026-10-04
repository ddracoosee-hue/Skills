# Startup checklist

Run from the repo root in Windows PowerShell.

```powershell
git status --short
git branch --show-current
git log -1 --oneline
git worktree list
git branch -vv
git diff --stat
```

What each command tells you:
- `git status --short`: changed, staged, and untracked files. Flag anything you did not make.
- `git branch --show-current`: the branch you are on.
- `git log -1 --oneline`: the newest commit.
- `git worktree list`: every checkout. Another agent's worktree means hands off its branch.
- `git branch -vv`: tracking state and ahead/behind counts.
- `git diff --stat`: the size of the uncommitted change.

Scope statement (send before any edit):
1. Task: one line.
2. Files: the paths you expect to touch.
3. First check: the command you will run first.
Lane: the confirmed lane letter.

Lane check (lane letters from `.muse/project.json`; models from `/models`):
- Lane A uses model `muse-spark-1.3`. Use it for any repo with private material.
- Lane B uses model `muse-spark-1.3-contributor`. Use it only when the profile lane is B and the project `LANES.md` allows it.
