# Escalation matrix

Name the cell first, then follow its action.

## Reversible + in scope → proceed

1. Rename a variable in a file the task names.
2. Reorder two private helpers with no outside callers.

## Reversible + out of scope → finish the in-scope work, then ask

1. Fix a typo in a file the task does not touch.
2. Refactor a neighboring module the task never mentioned.

Out of scope also covers work the project reserves for a human:
anything needing live data, special hardware, or the personal corpus.

## Irreversible or outward-facing → ask first, always

Push, delete, send, live data, model downloads, paid services.

1. Push the branch to the shared remote.
2. Delete the old backup files.

## Blocked by missing info → do independent work, then ask one precise question

1. The task needs a model file that is not present.
2. The task depends on an API contract nobody wrote down.
