# Scan patterns

Each pattern below names what it catches. Run them over staged or written
content before any commit, handoff, or report.

## Tokens

- GitHub-style tokens start with `ghp_` followed by twenty or more letters
  and digits. Pattern: `\bghp_[A-Za-z0-9]{20,}`. Catches leaked personal
  access tokens.
- API keys start with `sk-` followed by twenty or more letters, digits,
  `_` or `-`. Pattern: `\bsk-[A-Za-z0-9_-]{20,}`. Catches leaked model
  provider keys.
- AWS access key ids start with `AKIA` followed by sixteen uppercase
  letters or digits. Pattern: `\bAKIA[0-9A-Z]{16}\b`. Catches leaked AWS
  credentials.
- Private key blocks hold a BEGIN line ending in PRIVATE KEY. Catches
  committed key material.

## Emails

- Addresses match `[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}`
  (case-insensitive). Catches personal addresses in text, logs, and
  configs.

## Secret assignments

- Lines that assign a secret match
  `^[A-Z][A-Z0-9_]*_(KEY|TOKEN|SECRET)\s*=\s*\S+` (multiline). Catches
  `.env`-style lines pasted into files or handoffs.

## Private paths

- Anything under a `paths.private` entry from project.json (for example
  the project's data dir, `.env`, or log globs). Catches corpus text,
  databases, weights, secrets, and logs.
- Never quote the live database file. Name the guard instead (textclone:
  tests/conftest.py).

## Long verbatim blocks

- Any block that looks copied word-for-word from personal writing. No
  regex catches this. If the source is the corpus or unknown, treat it as
  personal (see SKILL.md).
