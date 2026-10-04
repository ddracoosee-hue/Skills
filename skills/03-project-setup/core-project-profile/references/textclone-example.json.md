# Example: textclone .muse/project.json

Every value below was copied from a project file opened on 2026-10-02.
The missing prompt source docs/ui-redesign/GUARDRAILS.md was replaced by
.env.example (declared ports) and tasks.md G8 (live ports); see the report.

```json
{
  "name": "textclone",
  "root": ".",
  "shell": "powershell",
  "lane": "A",
  "python": ".venv\\Scripts\\python.exe",
  "node_pm": "npm.cmd",
  "commands": {
    "lint_py": ".venv\\Scripts\\python.exe -m ruff check textclone tests",
    "test_focused": ".venv\\Scripts\\python.exe -m pytest {tests} -q",
    "test_unit": ".venv\\Scripts\\python.exe -m pytest tests/unit -q",
    "test_faults": ".venv\\Scripts\\python.exe -m pytest tests/fault_injection -q",
    "test_all": ".venv\\Scripts\\python.exe -m pytest -q",
    "lint_web": "npm.cmd run lint",
    "typecheck_web": ".\\node_modules\\.bin\\tsc.cmd --noEmit --incremental false",
    "build_web": "npm.cmd run build",
    "test_web": null
  },
  "web_dir": "web",
  "worktrees": {
    "root": "../textclone-wt/<slug>",
    "branch_pattern": "muse/<NN>-<slug>",
    "setup_ref": "tasks.md#G2"
  },
  "ports": {
    "owned": [8000, 3001],
    "forbidden": [
      {"port": 3000, "label": "ORION web dev"},
      {"port": 8787, "label": "Orion host"},
      {"port": 8791, "label": "Orion music loopback"},
      {"port": 8788, "label": "Orion voice"},
      {"port": 11434, "label": "Ollama (shared)"}
    ]
  },
  "paths": {
    "rules": ["AGENTS.md", "docs/AI_WORKFLOW.md", "web/AGENTS.md"],
    "handoff": "docs/AI_HANDOFF.md",
    "plan": "plan.md",
    "tasks": "tasks.md",
    "roadmap": "docs/roadmap/*/PLAN.md",
    "protected": ["data/", "textclone/llm/prompts.py"],
    "private": ["data/", ".env", "*.log"]
  },
  "recheck": {
    "consecutive_passes": 3,
    "max_fix_cycles": null
  },
  "known_flakes": [
    {
      "id": "B-3",
      "test": "tests/unit/test_api.py::test_jobs_and_settings_endpoints",
      "signature": "table documents already exists|database is locked",
      "until": "P1.1 lands"
    }
  ],
  "checkpoints": {
    "approval_phrase": "UI-CPn approved (n = checkpoint number)"
  },
  "frontend": {
    "framework": "Next.js",
    "version": "16.3.4",
    "docs_dir": "web/node_modules/next/dist/docs/"
  }
}
```

## Sources

| Key | Source file (read 2026-10-02) |
| --- | --- |
| name | AGENTS.md (title "Textclone"). |
| root | Schema rule (always "."). |
| shell | docs/AI_WORKFLOW.md ("PowerShell commands below"). |
| lane | LANES.md, skills repo (per-project LANES.md not yet created). |
| python | docs/AI_WORKFLOW.md command matrix. |
| node_pm | docs/AI_WORKFLOW.md ("npm.cmd run lint"). |
| commands.lint_py, test_unit, test_faults, test_all | docs/AI_WORKFLOW.md command matrix, verbatim. |
| commands.test_focused | docs/AI_WORKFLOW.md ("replace with the relevant test or node ID" becomes {tests}). |
| commands.lint_web, typecheck_web, build_web | docs/AI_WORKFLOW.md ("inside web/"); web/package.json scripts confirm lint/build. |
| commands.test_web | null: "no test script in the current web manifest" (docs/AI_WORKFLOW.md; web/package.json scripts confirm). |
| web_dir | docs/AI_WORKFLOW.md ("inside web/"). |
| worktrees.root | AGENTS.md ("git worktree add ../textclone-wt/<slug>"); tasks.md G2 same dir. |
| worktrees.branch_pattern | tasks.md G2 ("muse/01-core-safety" …); plan.md §5. AGENTS.md gives the general form. |
| worktrees.setup_ref | tasks.md G2 (env setup a–e plus verify). |
| ports.owned | .env.example (API 8000); tasks.md G8 (live UI 3001). The .env default WEB_PORT=3000 is overridden in practice; actual wins. |
| ports.forbidden 3000 | tasks.md G8 ("ORION (3000)"); scripts/dev.ps1 ("3000 may belong to another app"). |
| ports.forbidden 8787, 8791, 8788 | orion .env.example (PORT, ORION_MUSIC_PORT); 8788 is the voice FastAPI in orion CLAUDE.md ("Voice" bullet) with browser /listen on 127.0.0.1:8788. |
| ports.forbidden 11434 | .env.example (TEXTCLONE_OLLAMA_HOST); tasks.md G8 (never stop Ollama). |
| paths.rules | AGENTS.md (read order incl. web/AGENTS.md). |
| paths.handoff, plan, tasks | AGENTS.md; plan.md; tasks.md. |
| paths.roadmap | plan.md §1 and §7; tasks.md G5 (tick docs/roadmap/*/PLAN.md). |
| paths.protected | AGENTS.md (live data rules); plan.md §2 inv 5 and tasks.md G7 (never edit prompt templates in place). |
| paths.private | AGENTS.md ("personal texts, databases, model weights, .env, and logs"). |
| recheck.consecutive_passes | tasks.md G4 ("3 consecutive times with 0 failures"). |
| recheck.max_fix_cycles | null: G4 sets no cap (diagnose, fix, start again). |
| known_flakes[0] | tasks.md G4 known-flake note; plan.md B-3 (signature, test, expiry). |
| checkpoints.approval_phrase | tasks.md G8 (reply "UI-CPn approved"). |
| frontend.framework, version | AGENTS.md ("a Next.js UI"); web/package.json ("next": "16.3.4"); plan.md §1 agrees. |
| frontend.docs_dir | plan.md §2 inv 8 ("web/node_modules/next/dist/docs/"). |
