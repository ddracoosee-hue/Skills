# Validate a project profile without running its commands

Use this checklist for create, check, and update. Validate the candidate before
writing. Report checks as passed, failed, or unverified, naming the key and
source; never treat null as a passed executable or path check.

1. Parse JSON with `Get-Content -Raw <profile> | ConvertFrom-Json`. Compare
   every key and value type with schema.md, including nested objects. Require
   root to equal "."; reject missing keys, extra keys, wrong types, and empty
   strings. List extra keys for resolution instead of silently discarding them.
2. Check each non-null command with
   `[System.Management.Automation.PSParser]::Tokenize($command, [ref]$errors)`
   in Windows PowerShell 5.1. Record zero errors. Do not execute the command
   to validate it. `{tests}` is a declared argument placeholder; a consumer
   supplies and safely quotes the chosen test paths, never arbitrary code.
3. Inspect every executable in each compound command. Use `Test-Path -LiteralPath`
   for relative executable paths and `Get-Command` for literal names on PATH.
   Web commands resolve inside web_dir; other commands resolve at the root.
   For package-runner commands, check the referenced script exists in the
   manifest at that working directory. Dynamic executable expressions that
   cannot be resolved statically are unverified, not passed.
4. Check non-null python and node_pm with the same resolution rules. Check
   paths.rules/handoff/plan/tasks/protected, web_dir, and frontend.docs_dir
   with `Test-Path -LiteralPath`, relative to the project root. For
   paths.roadmap, use `Get-ChildItem -Path` and require a match. Check the
   file portion of worktrees.setup_ref and confirm the named section exists.
   Worktree root/branch patterns describe future worktrees, so they need not
   exist. Private path/glob entries need not exist either; do not read them.
5. Require project paths to be relative and stay within the project after
   resolution. The worktrees.root pattern may name a sibling directory.
   Reject absolute personal paths everywhere. Do not inspect private content
   to establish a path's existence.
6. Validate integer ranges and duplicate ids/ports per schema.md. Compare
   owned and forbidden ports for overlap when both inventories are known.
   If either is null, report the overlap check as unverified. Do not probe
   sockets or start services; this is a configuration check.

A project without a web app keeps web_dir, all four web commands, and all
frontend leaves null, each with a reason. Other nulls skip only their own
checks. A failed structural check or invalid non-null value blocks a write;
explicit nulls may be saved so consumers can resolve them before use.
