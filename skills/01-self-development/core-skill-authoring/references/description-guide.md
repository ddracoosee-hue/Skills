# Description guide: weak lines and their rewrites

A description is at most 250 characters. It has two parts: "Use when …"
in the user's words, and "Not for … (use `other-skill`)". Six repairs:

## 1. Lists topics instead of situations

Weak: "Commits, messages, and git hygiene for the project."
Fixed: "Use when committing finished work, to write logical commits with clear messages. Not for reviewing the diff first (use `core-diff-self-review`)."

## 2. No Not-for part

Weak: "Use when tests fail sometimes and you need to find out why."
Fixed: "Use when a test fails sometimes, to separate real failures from flakes with evidence. Not for debugging a steady failure (use `core-debug-method`)."

## 3. Vague verb, no result

Weak: "Use when you need help with ports and processes."
Fixed: "Use when starting or stopping local servers, to use only the ports the project owns. Not for killing a stuck tree (use `core-windows-env`)."

## 4. Copies the skill name instead of the trigger words

Weak: "Use core-layout-audit when a layout audit is required."
Fixed: "Use when a screen looks wrong or crowded, to audit spacing and alignment against the contract. Not for accessibility (use `core-a11y-review`)."

## 5. Too long (over 250 characters)

Weak: "Use when you want to run any kind of experiment with model prompts or model settings or voice checks and compare the before and after results with tables and charts and confidence intervals and keep a log of it."
Fixed: "Use when trying an idea to improve model output, to run a baseline, a change, and a paired comparison. Not for voice A/B tests (use `textclone-blind-voice-test`)."

## 6. Promises what the skill cannot check

Weak: "Use when releasing, to guarantee a perfect version every time."
Fixed: "Use when shipping a version, to cut the version, changelog, tag, and release notes with a smoke test. Not for store publishing (use `core-windows-packaging`)."
