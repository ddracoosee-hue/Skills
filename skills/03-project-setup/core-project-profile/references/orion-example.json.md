# Example: orion .muse/project.json

Every value below was copied from a project file opened on 2026-10-02.
Nulls carry their reasons in the source column (the JSON holds bare nulls).

```json
{
  "name": "orion",
  "root": ".",
  "shell": null,
  "lane": "A",
  "python": null,
  "node_pm": "npm.cmd",
  "commands": {
    "lint_py": null,
    "test_focused": null,
    "test_unit": "npm.cmd run build && npm.cmd test",
    "test_faults": null,
    "test_all": null,
    "lint_web": null,
    "typecheck_web": null,
    "build_web": "cd web && npm.cmd run build",
    "test_web": null
  },
  "web_dir": "web",
  "worktrees": {
    "root": null,
    "branch_pattern": null,
    "setup_ref": null
  },
  "ports": {
    "owned": [8787, 3000, 8791],
    "forbidden": [
      {"port": 8000, "label": "Textclone API"},
      {"port": 3001, "label": "Textclone UI"},
      {"port": 11434, "label": "Ollama (shared)"}
    ]
  },
  "paths": {
    "rules": ["AGENTS.md", "CLAUDE.md"],
    "handoff": ".agent/HANDOFF.md",
    "plan": null,
    "tasks": null,
    "roadmap": null,
    "protected": ["src/mcp/server.ts"],
    "private": [".env", "logs/"]
  },
  "recheck": {
    "consecutive_passes": null,
    "max_fix_cycles": null
  },
  "known_flakes": [],
  "checkpoints": {
    "approval_phrase": null
  },
  "frontend": {
    "framework": "Next.js",
    "version": "^16.2.12",
    "docs_dir": null
  }
}
```

## Sources

| Key | Source file (read 2026-10-02) |
| --- | --- |
| name | README.md (title "Orion"). |
| root | Schema rule (always "."). |
| shell | null: sources say "Windows host" (CLAUDE.md Environment) but never name the shell. |
| lane | LANES.md, skills repo (per-project LANES.md not yet created). |
| python | null: no Python interpreter path or command in the listed sources (research/server.py is named in .env.example, but its interpreter is undocumented there). |
| node_pm | AGENTS.md and CLAUDE.md spell "npm ..."; adapted to npm.cmd per the skill's mechanical-adaptation rule (protocol §8: commands are PowerShell, so npm.cmd; it works in cmd alike). |
| commands.lint_py | null: no Python interpreter or command (see python row). |
| commands.test_focused | null: no focused-test command in the listed sources. |
| commands.test_unit | package.json ("test": "vitest run"); AGENTS.md ("npm run build / npm test"). README mandates build first (dist/ resolution); the value folds that step in so it works standalone. Same order in .github/workflows/ci.yml. |
| commands.test_faults | null: no fault-injection suite in the listed sources. |
| commands.test_all | null: the single vitest suite is test_unit; no separate full-suite command. |
| commands.lint_web | null: no lint script in root or web manifests. |
| commands.typecheck_web | null: no web typecheck command in the listed sources. |
| commands.build_web | orion AGENTS.md ("cd web && npm run build"); npm to npm.cmd as above. Also in ci.yml. |
| commands.test_web | null: no test script in web/package.json. Browser coverage is "npm run walkthrough" (manual; needs a running Next instance). |
| web_dir | AGENTS.md ("cd web"); package.json workspaces. |
| worktrees.* | null: no worktree or branch convention in the listed sources (only "current branch" checks in AGENTS.md rituals). |
| ports.owned 8787 | .env.example (PORT); README topology; CLAUDE.md Commands ("run the host on port 8787"). |
| ports.owned 3000 | CLAUDE.md Commands ("dev server on port 3000"); README bring-up step 7. Agrees with textclone tasks.md G8 ("ORION (3000)"). |
| ports.owned 8791 | .env.example (ORION_MUSIC_PORT: music loopback surface). |
| ports.forbidden 8000, 3001 | textclone .env.example (API 8000); textclone tasks.md G8 (live UI 3001). |
| ports.forbidden 11434 | .env.example (OLLAMA_BASE_URL); shared with textclone. |
| paths.rules | AGENTS.md ("read both" AGENTS.md and CLAUDE.md). |
| paths.handoff | AGENTS.md (".agent/HANDOFF.md ... every session, before anything else"). |
| paths.plan | null: several docs/PLAN-*.md exist; none is designated the plan. |
| paths.tasks | null: no tasks file in the listed sources. |
| paths.roadmap | null: none in the listed sources. |
| paths.protected | README failure modes (stdout in src/mcp/server.ts is the JSON-RPC protocol; a log line there hangs the client). |
| paths.private | README (X-Orion-Token, .env); README + .env.example (audit JSONL under logs/). |
| recheck.* | null: no recheck-loop concept in the listed sources. |
| known_flakes | Empty: no flake list in the listed sources. |
| checkpoints.approval_phrase | null: approvals are API-gated (README: POST /approve); no fixed phrase in the sources. |
| frontend.framework, version | README ("Celestial UI (web/, Next.js)"); web/package.json ("next": "^16.2.12"). |
| frontend.docs_dir | null: no installed-docs statement in the listed sources. |
