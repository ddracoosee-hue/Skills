# VERIFIED: Muse facts checked on this PC

This is a supplement to the build protocol. Some skills lean on Muse features described in
[`docs/MUSE-REFERENCE.md`](docs/MUSE-REFERENCE.md). Before a skill relies on one of these features,
check it here on the user's PC and record the result. Prompt E0 in
`prompts/05-environment-and-tools.md` does the checks.

**Setup:** Muse runs natively in Windows PowerShell on this PC. That fits how the projects are
already developed: PowerShell commands in `tasks.md`, `npm.cmd`, `.venv\Scripts\python.exe`. Meta
announced native Windows support on 2026-09-16.

Tags:
- [Certain]: Meta's docs or posts.
- [Likely]: several third-party sources agree.
- [Guessing]: one source, or unverified.

Observed: the date, the command, and the one-line result. "unverified" until checked.
(Cells use ";" separators so the table stays valid.)

| # | Fact | Claimed | Tag | How to check (PowerShell) | Observed |
| --- | --- | --- | --- | --- | --- |
| 1 | Muse runs in PowerShell; version | Native Windows | [Certain] | `Get-Command muse; muse --version` | 2026-10-02; Get-Command muse + muse --version; Muse Code 1.4.2 (1.4.2-R4684.1) at AppData\Local\Programs\muse\muse.cmd |
| 2 | Model strings | `muse-spark-1.3` (Standard), `muse-spark-1.3-contributor` (Contributor) | [Likely] | `/models` in a session | 2026-10-02; muse model-profile show; both muse-spark-1.3 and muse-spark-1.3-contributor resolve as catalog ids |
| 3 | Default tier on a fresh install | May be Contributor | [Guessing] | `/models` right after install | could not check: needs interactive /models right after install |
| 4 | User skill folders read on Windows | `$HOME\.agents\skills` (also `.claude\skills`, `.codex\skills`) | [Certain] on Linux; Windows path unconfirmed | One test skill, then `muse skills list` | could not check: needs probe skill in user folder; sandbox blocks writes outside workspace (muse skills list works; shows built-in + plugin only) |
| 5 | Junction-linked skills load (install.ps1) | n/a | unknown | `install.ps1`, then `muse skills list` | could not check: same block as #4 (no junction test possible in sandbox) |
| 6 | Settings file location on Windows and `"schema_version": 1` | `~/.config/muse/settings.json` on Linux | [Certain] on Linux | `muse --help`, error messages | could not check: no settings-path surface in muse --help; config cmd covers enterprise docs only |
| 7 | Frontmatter fields beyond `name`, `description` | None confirmed | [Certain] no schema published | `muse skills validate` with one extra field at a time | 2026-10-02; muse skills validate on probe with version: 1.0.0; valid:true — extra fields accepted (repo keeps name+description only by convention) |
| 8 | `muse skills list / inspect / validate / install --scope` exist | as stated | [Certain] | `muse skills --help` | 2026-10-02; muse skills --help; list, inspect, validate, install all exist; install --scope takes user only |
| 9 | A skill's instructions last only for the turn in which it is loaded | as stated | [Certain] | Watch a session | could not check: needs live session observation |
| 10 | How a skill load appears in the session log (for the optional R2 log check) | `read_skill` tool call | [Certain] the tool exists | Search one session log after loading a skill | 2026-10-02; Select-String session.jsonl; read_skill roster plus read-skill-result records naming the skill — grep works |
| 11 | A skill can tell Muse to load another skill (flows) | unknown | unknown | A test skill whose step says "invoke /core-b" | could not check: needs installed test skills (same block as #4) |
| 12 | Session log location on Windows, and how to find the session id | `~/.local/share/muse/sessions/...` on Linux | [Certain] on Linux | Look after one session | 2026-10-02; observed own session; C:\Users\ddrac\.local\share\muse\sessions\YYYY\MM\DD\<uuid>\session.jsonl |
| 13 | `muse export --last --redacted --out <file>`; the same log gives the same file (SHA-256) | as stated | [Certain] | Export twice; `Get-FileHash` | 2026-10-02; muse export --session + --redacted --out twice + Get-FileHash; identical SHA-256 on closed session; --last found no retained session for the live workspace |
| 14 | Headless runs: `muse exec --model --max-model-steps --json --prompt-file` | as stated | [Certain] basis | `muse exec --help` | 2026-10-02; muse exec --help; --model, --max-model-steps, --json, --prompt-file all present |
| 15 | `--trust-workspace` trusts a folder for one run | as stated | [Guessing] | `muse --help` | 2026-10-02; muse --help; --trust-workspace exists (trusts workspace for one run, does not save trust) |
| 16 | `.muse\hooks.json` schema | unknown | unknown | `muse --help`, changelog | could not check: no hooks surface in muse --help output |
| 17 | Subscription data terms; per-repo opt-out on Contributor | unknown | [Guessing] | Account settings | could not check: account settings, not CLI-visible |

Until a row is verified, skills that would use that feature skip it and say so in their report.
For example, `core-trace-report` writes "no export: unverified" instead of guessing flags.
