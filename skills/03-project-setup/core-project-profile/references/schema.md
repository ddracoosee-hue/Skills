# Schema: .muse/project.json

One small file per project that every core skill reads. No core skill
hard-codes a path, port, or command; it reads it here.

Rules:

- `root` is always `"."`: the repo root the skill runs in. Never an
  absolute path (absolute personal paths must not enter the file).
- Include every listed leaf key and its containing objects; no unlisted keys.
  Unknown or inapplicable values are `null`. Each null's reason goes in the
  report, not in the JSON (the schema has no note keys). `root` is the one
  non-null constant. Null does not mean validated, permitted, or empty.
- Arrays are `[]` only for a verified empty inventory; use null when unknown.
  Keep container objects (commands, worktrees, ports, paths, recheck,
  checkpoints, frontend) even when all their leaves are null.
- Never put secrets, `.env` values, or personal paths in the file.
- `{tests}` in `test_focused` is a placeholder for test files or node IDs.
- `owned[]` holds ports the project's own processes bind in normal use.
- `forbidden[]` holds objects with `port` and `label`: other projects'
  ports and shared-infra ports this project must never occupy.

| Key | Type | Meaning, example |
| --- | --- | --- |
| name | string \| null | Project name from a source, e.g. "textclone". |
| root | string | Always ".". |
| shell | string \| null | Shell project commands assume, e.g. "powershell". Null with a reason when unstated. |
| lane | string \| null | "A" (Standard only) or "B" (Contributor allowed); see LANES.md. Unknown blocks consumers that send project data. |
| python | string \| null | Venv interpreter, relative, e.g. ".venv\\Scripts\\python.exe". Null when the project has no Python. |
| node_pm | string \| null | Package runner on this PC, e.g. "npm.cmd". Null when absent or undocumented. |
| commands.lint_py | string \| null | Python lint, e.g. ".venv\\Scripts\\python.exe -m ruff check textclone tests". |
| commands.test_focused | string \| null | Focused run with a placeholder, e.g. ".venv\\Scripts\\python.exe -m pytest {tests} -q". |
| commands.test_unit | string \| null | Unit suite, e.g. ".venv\\Scripts\\python.exe -m pytest tests/unit -q". Must work standalone (fold in any mandated setup step). |
| commands.test_faults | string \| null | Fault-injection suite, or null. |
| commands.test_all | string \| null | Whole suite, or null when test_unit already runs everything. |
| commands.lint_web | string \| null | Web lint run inside web_dir, e.g. "npm.cmd run lint". Null when the manifest has no lint script. |
| commands.typecheck_web | string \| null | Web type check inside web_dir, or null. |
| commands.build_web | string \| null | Web production build, e.g. "npm.cmd run build" (no cd: web commands always run inside web_dir). |
| commands.test_web | string \| null | Web tests, or null when the manifest has no test script. |
| web_dir | string \| null | Web root, relative, e.g. "web". Null for projects with no web app; web commands and frontend values are then null too. |
| worktrees.root | string \| null | Worktree dir pattern, e.g. "../textclone-wt/<slug>". Null when the project names no convention. |
| worktrees.branch_pattern | string \| null | Branch pattern, e.g. "muse/<NN>-<slug>". |
| worktrees.setup_ref | string \| null | A file#section holding the worktree setup steps, e.g. "tasks.md#G2". |
| ports.owned | integer[] \| null | Unique ports from 1 to 65535 this project binds, e.g. [8000, 3001]. |
| ports.forbidden | {port, label}[] \| null | Unique integer ports from 1 to 65535 and nonempty string labels, e.g. {"port": 3000, "label": "ORION web dev"}. |
| paths.rules | string[] \| null | Rules files in read order, e.g. ["AGENTS.md", "docs/AI_WORKFLOW.md"]. |
| paths.handoff | string \| null | Handoff file, e.g. "docs/AI_HANDOFF.md". Null when none is designated. |
| paths.plan | string \| null | Plan file, e.g. "plan.md". |
| paths.tasks | string \| null | Task file, e.g. "tasks.md". |
| paths.roadmap | string \| null | Roadmap glob, e.g. "docs/roadmap/*/PLAN.md". |
| paths.protected | string[] \| null | Breakage-risk paths needing extra care, e.g. ["data/", "textclone/llm/prompts.py"]. |
| paths.private | string[] \| null | Relative paths/globs that must never leak, e.g. ["data/", ".env", "*.log"]. They need not exist. |
| recheck.consecutive_passes | integer \| null | Positive number of clean passes required in a row, e.g. 3. |
| recheck.max_fix_cycles | integer \| null | Nonnegative fix-cycle cap, or null when the project sets none. |
| known_flakes | object[] \| null | Objects with string id, test, signature (regex), until; unique ids. Empty when the opened sources establish no known flakes; null when not checked. |
| checkpoints.approval_phrase | string \| null | Fixed user approval words, e.g. "UI-CPn approved (n = checkpoint number)". |
| frontend.framework | string \| null | e.g. "Next.js"; null when absent or undocumented. |
| frontend.version | string \| null | e.g. "16.3.4" (as stated; ranges stay ranges); null when absent or undocumented. |
| frontend.docs_dir | string \| null | Installed framework docs, e.g. "web/node_modules/next/dist/docs/". |
