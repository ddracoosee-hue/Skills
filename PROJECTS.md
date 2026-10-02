# PROJECTS: the portfolio the skills serve

Skills are written for all of these projects, not just one. `/core-retro review` checks each lesson
against this list, and `core-project-profile` gives each project its `.muse/project.json`.

This list comes from a read-only survey on 2026-10-02 of the GitHub repositories and the portfolio
site (`ddracoosee-hue.github.io`). It holds only facts that are public on the site or visible in the
repos. Update it with `/core-portfolio-sync` or by hand when a project changes.

## Projects

| Project | What it is | Stack | State (2026-10-02) | Lane | Categories that matter most |
| --- | --- | --- | --- | --- | --- |
| **Textclone** | Private, local AI writing engine that learns your voice | Python, FastAPI, SQLite, Ollama, Next.js | Active; UI redesign in progress | A | 11 AI, 06 Interface, 10 Data; the `textclone-*` pack |
| **Orion** | Personal AI command center: idea → approved build plan, stage gates | TypeScript, Node, Next.js, MCP, Gemini/DeepSeek/Ollama | Active | A (credentials) | 09 Safety, 11 AI, 06 Interface; the `orion-*` pack |
| **Microcoin (MemeScout)** | Local, read-only crypto-chatter research with evidence lineage and bounded runs | Python 3.12 CLI, control plane, CI | Milestones M0–M6 done; live collectors not yet enabled | A (future collector credentials; hostile content) | 09 Safety, 10 Data, 02 Workflow |
| **Charizard** | Browser agent that checks out within limits you set | Python, Playwright | Repository not on GitHub (site: code on request) | A (spending) | 09 Safety, 07 Build (browser automation) |
| **MCLA** | Network security analysis: diagram → topology, logs → events, model finds contradictions | Python, OpenAI (vision and synthesis), pydantic | Early scaffold (10 files) | A (logs and diagrams leave the machine) | 09 Safety (log analysis, untrusted content), 11 AI (hosted APIs) |
| **SOC-Analyst-Tool** | Security monitoring and vulnerability analysis (site description) | Python (site) | Empty repository | A until profiled | 03 Setup (`core-repo-bootstrap`), 09 Safety |
| **OmniRoute** | Not described yet | — | README title only | A until profiled | 03 Setup (`core-repo-bootstrap`) |
| **Traitor** | Not described yet | — | README title only | A until profiled | 03 Setup (`core-repo-bootstrap`) |
| **SotS** | Not described yet | — | Empty repository | A until profiled | 03 Setup (`core-repo-bootstrap`) |
| **Portfolio site** | Résumé and project showcase | One HTML file (GitHub Pages) | Live | B allowed (public content) | 06 Interface (`core-static-site`), 12 Operations (`core-portfolio-sync`) |
| **Ella's Closet**, **Wholesale Market Analysis** | Published web apps (personal AI stylist; market insight) | Firebase, Gemini | Published; repositories not on this GitHub account | A until profiled | 11 AI (`core-hosted-llm-apis`), 09 Safety |
| **Skills** (this repo) | The skill library | Markdown, Node tools, PowerShell | Active; public | A to author; B for invented-data fixtures | 01 Self-development |

The user's manuscript is not a code project here. It is Lane A permanently (see `LANES.md`).

## Patterns shared across projects

These patterns are why the cross-project skills exist (`prompts/60-cross-project.md`). The proven
ones are tracked in `LESSONS.md`.

| Pattern | Projects | Skill |
| --- | --- | --- |
| Bounded, recoverable runs (budgets, checkpoints, no-progress stops) | Microcoin, Textclone, Orion, Charizard | `core-bounded-execution`, `core-crash-recovery` |
| Human approval tiers and capabilities | Orion, Microcoin, Charizard | `core-permissions-approvals` |
| Models propose, code decides | Orion, Microcoin, Textclone | `core-ai-decision-boundary` |
| Outside content fed to models | Microcoin, MCLA, Orion, Textclone | `core-untrusted-content` |
| Hosted model APIs (keys, limits, cost, data leaving) | Orion, MCLA, Ella's Closet, Wholesale Market Analysis | `core-hosted-llm-apis` |
| Append-only records and evidence lineage | Orion, Microcoin, Charizard, Textclone | `core-audit-trail` |
| Empty or new repositories | OmniRoute, Traitor, SotS, SOC-Analyst-Tool | `core-repo-bootstrap` |
| Public descriptions that must match the code | Portfolio site and every project | `core-portfolio-sync` |

## Next steps per project

1. Run `/core-project-profile` in each project, so core skills know its commands, ports and lane.
2. For the four empty repos, run `/core-repo-bootstrap` first, once you know what each is for.
3. A project pack (`<project>-*` skills, like `textclone-*`) is created only when
   `/core-retro review` finds project-specific procedures repeating. Facts alone go in
   `.muse/project.json`.
