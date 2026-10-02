# VERIFIED: Muse Code facts this library depends on

Skills, prompts and tools may rely only on facts that are verified on the user's machine and listed
here, or tagged [Certain] from Meta's official docs. Phase 0 (`prompts/05-environment-and-tools.md`)
fills in the "Observed" column. Never invent a Muse feature, flag, frontmatter field or file schema.
If something here is unknown, check it with the CLI and record the result.

Tags:
- [Certain]: Meta's official docs or posts.
- [Likely]: several third-party sources agree.
- [Guessing]: one source, or unverified.

Observed: the date, the command, and the output in one line. "unverified" until Phase 0 runs.

## Correction recorded before Phase 0

The 2026-10-02 reference document said Muse Code runs on Windows only through WSL2. That was true at
launch. On **2026-09-16**, Meta for Developers announced that Muse Code is "now available natively
on Windows - no WSL required. It's PowerShell-fluent, sandboxed by default, native x64 and ARM64,
and supports zero-admin install". The installer is `irm https://dev.meta.ai/install.ps1 | iex`.

The user's Muse already runs PowerShell commands in `C:\Users\ddrac\textclone`, which fits native
Windows. So `install.ps1` is the primary installer and `install.sh` is for WSL. Phase 0 item 1
decides which applies on this PC.

## Facts to verify

| # | Fact | Claimed | Tag | How to check | Observed |
| --- | --- | --- | --- | --- | --- |
| 1 | Where Muse runs on this PC | Native Windows (PowerShell) or WSL | [Certain] both exist | `Get-Command muse` in PowerShell; `which muse` in WSL; `muse --version` | unverified |
| 2 | Muse version | n/a | n/a | `muse --version` | unverified |
| 3 | Model strings | `muse-spark-1.3` (Standard), `muse-spark-1.3-contributor` (Contributor) | [Likely] | `/models` in a session | unverified |
| 4 | Default tier on a fresh install | May default to Contributor | [Guessing] | `/models` right after install | unverified |
| 5 | Settings file | `~/.config/muse/settings.json` with `"schema_version": 1` on Linux; Windows location unknown | [Certain] Linux | `muse --help`, error messages, docs | unverified |
| 6 | User skill folders read on this host | `$XDG_CONFIG_HOME/muse/skills`, `~/.agents/skills`; also `~/.claude/skills`, `~/.codex/skills` | [Certain] | `muse skills list` with one test skill in each | unverified |
| 7 | Linked skills load (junction on Windows, symlink in WSL) | n/a | unknown | Install a test skill with install.ps1 or install.sh; `muse skills list` | unverified |
| 8 | Frontmatter fields accepted beyond `name`, `description` | None confirmed | [Certain] no schema published | `muse skills validate` on a dummy skill, adding one field at a time | unverified |
| 9 | Extra files accepted in a skill folder (`references/`, `scripts/`, `fixtures/`, `evals.md`, `CHANGELOG.md`, `TRIALS.md`) | Agent Skills convention | [Likely] | `muse skills validate` on a skill with all of them | unverified |
| 10 | Precedence when a project skill and a user skill share a name | unknown | unknown | Same name in both; `muse skills list`, `muse skills inspect <id>` | unverified |
| 11 | Skills apply to one user turn; `read_skill` loads the full SKILL.md | as stated | [Certain] | Docs; watch a session | unverified |
| 12 | TUI prints `Loaded skill <name> · <source>` for user skills | yes for built-ins | [Likely] | Invoke a user skill | unverified |
| 13 | How a skill load appears in `session.jsonl` / `muse exec --json` | `read_skill` tool call | [Certain] tool exists | Grep a session log after a load; record the event and field names | unverified |
| 14 | A skill can tell the agent to load another skill (flows) | unknown | unknown | A test skill whose step says "invoke /core-b"; check the log | unverified |
| 15 | Session log location on this host | `~/.local/share/muse/sessions/YYYY/MM/DD/<id>/session.jsonl` on Linux | [Certain] Linux | Look after one session | unverified |
| 16 | How a running skill can learn its session id | unknown | unknown | Env vars inside a session (`Get-ChildItem env:` / `env`), docs | unverified |
| 17 | Headless flags `muse exec --model --max-model-steps --json --prompt-file` | as stated | [Certain] basis | `muse exec --help` | unverified |
| 18 | A prompt file can invoke a skill by slash name in `muse exec` | unknown | unknown | prompt.txt starting `/core-x`; check the log | unverified |
| 19 | `--trust-workspace` trusts a folder for one run (skills load only in trusted workspaces) | as stated | [Guessing] third-party | `muse --help`, `muse exec --help` | unverified |
| 20 | `muse export --last --out <file> [--redacted]`; same log + flags = byte-identical file | as stated | [Certain] | Export twice; compare SHA-256 | unverified |
| 21 | `muse skills list / inspect / validate / install --scope / enable / import --from` | as stated | [Certain] | `muse skills --help` | unverified |
| 22 | `.muse/hooks.json` schema | unknown | unknown | `muse --help`, changelog, error messages | unverified |
| 23 | The Skill-recall observer suggests skills (and does not auto-load them) | suggests | [Certain] it exists | Ask an ordinary request; watch for a suggestion | unverified |
| 24 | The agent can read its own model or tier (or only the user can, via `/models`) | user only | [Guessing] | Ask in a session; check env and logs | unverified |
| 25 | Subscription plans change the data terms; per-repo sharing opt-out on Contributor | unknown | [Guessing] | Account and billing settings | unverified |
| 26 | Workflows command is available | docs page exists; one report says disabled | [Guessing] | `muse --help` | unverified |

## How results change the library

| If Phase 0 finds… | Then… |
| --- | --- |
| #1 = WSL | Use `install.sh`. Clone the repo to `~/src/muse-skills` and worktrees to `~/src/muse-skills-wt`; update `00-BUILD-PROTOCOL.md` §1 paths. |
| #7 = links are not followed | Replace links with a copy step (`muse skills install <dir> --scope user` per skill, if #21 confirms it). |
| #8 accepts more fields | Still use only `name` and `description` unless a field adds real value; record the decision here. |
| #10 = user beats project | The fixture harness must use a temporary renamed id for drafts (see `01-REFINEMENT.md` R3). |
| #13 / #18 unknown | R2 falls back to the self-report proxy only; say so in every R2 record. |
| #14 = no | Flows become checklists the user steps through, invoking each skill by name. |
| #16 = unknown | Trace blocks record `session_id: unknown` and the run time; join to logs by timestamp. |
| #19 = no flag | Trust each fixture folder once in the TUI before the headless runs. |
