# Schema: .muse/project.json

One small file per project that every core skill reads. No core skill
hard-codes a path, port, or command; it reads it here.

Rules:

- `root` is always `"."`: the repo root the skill runs in. Never an
  absolute path (absolute personal paths must not enter the file).
- Unknown keys are `null`. Each null's reason goes in the skill report,
  not in the JSON (the schema has no note keys).
- Never put secrets, `.env` values, or personal paths in the file.
- `{tests}` in `test_focused` is a placeholder for test files or node IDs.
- `owned[]` holds ports the project's own processes bind in normal use.
- `forbidden[]` holds objects with `port` and `label`: other projects'
  ports and shared-infra ports this project must never occupy.

| Key | Type | Meaning, example |
| --- | --- | --- |
| name | string | Project name, e.g. "textclone". |
| root | string | Always ".". |
| shell | string \| null | Shell project commands assume, e.g. "powershell". Null with a reason when unstated. |
| lane | string | "A" (Standard only) or "B" (Contributor allowed); see LANES.md. |
| python | string \| null | Venv interpreter, relative, e.g. ".venv\\Scripts\\python.exe". Null when the project has no Python. |
| node_pm | string | Package runner on this PC, e.g. "npm.cmd". |
| commands.lint_py | string \| null | Python lint, e.g. ".venv\\Scripts\\python.exe -m ruff check textclone tests". |
| commands.test_focused | string \| null | Focused run with a placeholder, e.g. ".venv\\Scripts\\python.exe -m pytest {tests} -q". |
| commands.test_unit | string \| null | Unit suite, e.g. ".venv\\Scripts\\python.exe -m pytest tests/unit -q". Must work standalone (fold in any mandated setup step). |
| commands.test_faults | string \| null | Fault-injection suite, or null. |
| commands.test_all | string \| null | Whole suite, or null when test_unit already runs everything. |
| commands.lint_web | string \| null | Web lint run inside web_dir, e.g. "npm.cmd run lint". Null when the manifest has no lint script. |
| commands.typecheck_web | string \| null | Web type check inside web_dir, or null. |
| commands.build_web | string \| null | Web production build, e.g. "npm.cmd run build" (no cd: web commands always run inside web_dir). |
| commands.test_web | string \| null | Web tests, or null when the manifest has no test script. |
| web_dir | string | Web root, relative, e.g. "web". |
| worktrees.root | string \| null | Worktree dir pattern, e.g. "../textclone-wt/<slug>". Null when the project names no convention. |
| worktrees.branch_pattern | string \| null | Branch pattern, e.g. "muse/<NN>-<slug>". |
| worktrees.setup_ref | string \| null | A file#section holding the worktree setup steps, e.g. "tasks.md#G2". |
| ports.owned | number[] | Ports this project binds, e.g. [8000, 3001]. |
| ports.forbidden | {port, label}[] | Ports never to occupy, each with whose they are, e.g. {"port": 3000, "label": "ORION web dev"}. |
| paths.rules | string[] | Rules files in read order, e.g. ["AGENTS.md", "docs/AI_WORKFLOW.md"]. |
| paths.handoff | string | Handoff file, e.g. "docs/AI_HANDOFF.md". |
| paths.plan | string \| null | Plan file, e.g. "plan.md". |
| paths.tasks | string \| null | Task file, e.g. "tasks.md". |
| paths.roadmap | string \| null | Roadmap glob, e.g. "docs/roadmap/*/PLAN.md". |
| paths.protected | string[] | Breakage-risk paths needing extra care, e.g. ["data/", "textclone/llm/prompts.py"]. |
| paths.private | string[] | Paths that must never leak (bases, registries, logs), e.g. ["data/", ".env", "*.log"]. |
| recheck.consecutive_passes | number \| null | Clean passes required in a row, e.g. 3. |
| recheck.max_fix_cycles | number \| null | Fix-cycle cap, or null when the project sets none. |
| known_flakes | object[] | [{id, test, signature (regex), until}], e.g. id "B-3". Empty array when none are known. |
| checkpoints.approval_phrase | string \| null | Fixed user approval words, e.g. "UI-CPn approved (n = checkpoint number)". |
| frontend.framework | string | e.g. "Next.js". |
| frontend.version | string | e.g. "16.3.4" (as stated; ranges stay ranges). |
| frontend.docs_dir | string \| null | Installed framework docs, e.g. "web/node_modules/next/dist/docs/". |
