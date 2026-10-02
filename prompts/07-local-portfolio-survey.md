# Prompt: survey the projects on this PC (read-only)

This finds which projects you actually use and develop most, from the folders on your computer
rather than GitHub. The ranking decides where the skills should go deeper first. Run it in Muse,
Lane A, in one message.

It reads only metadata: commit counts, dates, file counts and the names of agent files. It never
opens source contents, documents, data or `.env` files, and it never changes anything.

```text
Lane A. Read-only task: survey my projects on this PC and rank them by use and development.
Do not open, print or copy file contents; collect metadata only. Do not modify any folder.

1. Ask me which folders to search (recommended: C:\Users\ddrac, depth 3, skipping AppData,
   node_modules, .venv, .git internals, OneDrive caches). Wait for my answer.
2. Find project folders: any folder containing .git, package.json, pyproject.toml,
   requirements.txt, *.sln, Cargo.toml or go.mod. Skip folders inside another project.
3. For each project collect, using PowerShell and git only:
   - name (folder name), and whether it has a git remote (yes/no only, no URL)
   - commits total: git -C <dir> rev-list --count HEAD
   - commits in the last 30 and 90 days: git -C <dir> rev-list --count --since="90 days ago" HEAD
   - first and last commit dates; number of branches and worktrees
   - tracked files and lines by language (git ls-files, counting lines per extension)
   - last modified time of any tracked file (for folders without git: newest file time)
   - agent signals: presence of AGENTS.md, CLAUDE.md, a handoff file, .muse/, .agents/, tasks or
     plan files (names only)
   - test signal: presence of a tests folder or test files, and of a CI workflow
4. Score each project (show the formula with the table):
   usage = 3 × commits in 30 days + 1 × commits in 90 days
   development = log2(1 + total commits) × 10 + log2(1 + tracked lines) × 5
   priority = usage + development, plus 20 if it has agent files (agents already work there)
5. Write the table, sorted by priority, to
   C:\Users\ddrac\muse-skills-wt\survey\portfolio-survey.md (outside the git repo; it holds local
   paths). Columns: rank, project, stack, commits 30/90/total, last commit, lines, tests, CI,
   agent files, priority.
6. Then, for the top 5 projects only, list the 5 most changed files over 90 days
   (git log --since="90 days ago" --name-only --format= | group by count), as paths relative to
   the project, never contents.
7. Show me the table and stop. Propose (do not make) an update to PROJECTS.md in the Skills repo
   that adds any project missing from it, with names, stacks and the counts only, no local paths,
   and ask "Approve, request changes, or cancel?".
```

Afterwards, `SKILL-ARCHITECTURE.md` §5 explains how the ranking decides which large skills and
small skills to build first.
