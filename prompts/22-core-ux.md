# Prompts: 3.3 UX, content and look

Batch name: `core-ux`. Paste one block per message.

Shared sources for this group, all in textclone: `docs/ui-redesign/UI-SPEC.md` (regions, anchors,
the one-home table, text-fit rules, L1–L11), `docs/ui-redesign/VISUAL-DESIGN.md` (V1–V8, the rubric,
the signature moments), `docs/ui-redesign/design-tokens.css`, `docs/ui-redesign/guardrails/layout/`
(the audit engine), `web/AGENTS.md`, `textclone/errors.py`. Core skills cite these as worked
examples and stay portable.

---

## `core-information-architecture` · P1

```text
Build the skill core-information-architecture. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when designing or reviewing where things live in a UI: one home per action, one job per page, navigation and grouping. Not for the states of one screen (use `core-states-design`) or wording (use `core-microcopy`).

Purpose: no duplicated controls, no orphan features, and every action findable.

Read first: UI-SPEC.md (the one-home table and the redundancy decisions: Run vs the Rewrite label,
one Copy, one theme toggle, status dot vs issues badge); PLAN-UI.md decisions.

Steps:
1. Inventory every action and piece of information on the screens in scope (from the code, not
   memory): name, where it appears, how often it's used.
2. Find duplicates (same action in 2+ places) and orphans (no route reaches it).
3. Assign each action one home by frequency and context; secondary access only through a
   documented shortcut.
4. Give every page a one-sentence job; move anything that doesn't serve it.
5. Write the one-home table; add the anchors the layout audit checks.
Decision rules: a duplicate needs a written reason (for example a keyboard shortcut) or it goes;
frequent actions are 1 click away, rare ones go in drawers (progressive disclosure); never hide
an action that exists today without the user's approval (functional parity).
Anti-patterns: the same button in the header and the panel; pages that are "misc"; removing
features while "simplifying".
Evidence: the inventory, the one-home table, duplicates resolved and why.
references/: references/one-home-table.md (template + textclone example).

Evals:
T: "there are two copy buttons, which one stays?" | "where should the presets live?" | "reorganise
the settings page" | "is anything duplicated across the console?" | "decide what goes in the
drawer vs the main screen"
N: "what should the empty state say?" → core-microcopy | "design the loading state" →
core-states-design | "check nothing overflows" → core-layout-audit

Trial: inventory textclone's current web/app Studio page and produce its one-home table; flag
every duplicate.

Refine signals: duplicates the layout audit caught that this missed.
```

---

## `core-states-design` · P1

```text
Build the skill core-states-design. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when building or reviewing a screen or component: design every state — empty, loading, partial, success, error, offline/unavailable, cancelled. Not for where controls live (use `core-information-architecture`).

Purpose: no screen looks unfinished or lies about what is happening.

Read first: UI-SPEC.md states sections; VISUAL-DESIGN.md states; textclone SSE events (stage,
draft, check, warning, final, done, error) in textclone/api/sse.py and web/lib/sse.ts; plan.md §2
invariant 4 (unverified ≠ passed).

Steps:
1. List the component's data sources and their possible states.
2. Fill the state matrix (references/state-matrix.md): for each state, what the user sees, what
   they can do, what is announced to screen readers.
3. Map backend events and errors to states (e.g. an error code with a hint → error state showing
   the hint and a retry if retryable).
4. Build or review each state; add a mock scenario that forces it.
5. Check: no state shows a success look for unverified or partial results.
Decision rules: partial results are shown as partial, with what's missing; loading longer than
~1 s shows progress, not just a spinner; cancelled is its own state, not an error.
Anti-patterns: blank screens while loading; generic "Something went wrong"; spinners that never
end after cancel.
Evidence: the state matrix and the mock scenario for each state.

Evals:
T: "what does the panel show while it's loading?" | "design the error state for model unavailable"
| "there's nothing here yet — what should the empty page look like?" | "handle the partial result
case in the UI" | "the spinner keeps going after cancel"
N: "word the error message" → core-microcopy | "add the motion for loading" → core-motion |
"walk the flow" → core-user-journey-walk

Trial: build the state matrix for textclone's job progress component (web/components/JobProgress.tsx)
and list which states the current code is missing.

Refine signals: a state seen in real use that the matrix didn't list.
```

---

## `core-microcopy` · P1

```text
Build the skill core-microcopy. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when writing or reviewing UI text: button labels, error messages, hints, empty states, tooltips, confirmations. Not for long docs or reading layout (use `core-readability`).

Purpose: every word in the UI tells the user what it does or what to do next.

Read first: textclone/errors.py (code, hint, retryable), web/lib/api.ts (how errors reach the
UI), UI-SPEC.md labels and text-fit rules.

Rules the skill must contain: buttons are verbs naming the result ("Rewrite", not "Submit");
errors say what happened, why if known, and what to do next (the hint), plus the code for support;
the same thing has the same name everywhere (a glossary); no blame, no jokes in errors; labels fit
their container at the narrowest viewport (the layout audit checks this).

Steps:
1. Collect all strings in scope (grep the components).
2. Check each against the rules and the project glossary.
3. Rewrite; keep labels within the length the spec allows.
4. For errors: map each error code to its message and hint, and the next action.
5. Run the layout audit for text fit.
Decision rules: a hint from the backend is shown, not replaced; a destructive confirmation names
the thing being destroyed; never change a label that tests or the parity checker depend on
without updating them.
Anti-patterns: "Error occurred"; "OK/Cancel" on destructive actions; two names for one thing.
Evidence: before/after table of strings, the glossary entries, the audit result.
references/: references/rules.md, references/error-pattern.md.

Evals:
T: "the error message for Ollama being down is useless, fix it" | "what should this button say?" |
"review the wording on the settings page" | "write the empty-state text for samples" | "make the
labels consistent"
N: "make the docs dyslexia-friendly" → core-readability | "design the error state" →
core-states-design | "translate the UI" → none

Trial: rewrite the UI messages for LLM_OLLAMA_DOWN_001 and LLM_TIMEOUT_002 from textclone/errors.py,
keeping the hint and code visible.

Refine signals: users asking "what does this do?" about a label.
```

---

## `core-readability` · P1

```text
Build the skill core-readability. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when text must be easy to read, especially for dyslexic readers: UI reading areas, docs, reports, handoffs. Covers line length, spacing, fonts, plain language, structure. Not for button and error wording (use `core-microcopy`).

Purpose: the user reads with dyslexia; everything we produce should read easily.

Read first: VISUAL-DESIGN.md typography (Atkinson Hyperlegible Next chosen for legibility),
design-tokens.css type scale. Research the British Dyslexia Association Style Guide and WCAG 2.2
text-spacing criterion 1.4.12 with core-research-sources; cite them.

Rules the skill must contain (each with its source): line length about 60–70 characters;
line height at least 1.5; paragraph spacing at least 2× font size; left-aligned, never justified;
sans-serif, at least 16 px body; no italics or underlines for emphasis (use bold); no walls of
text; one idea per paragraph; short sentences; the same term for the same thing; headings that
form an outline; numbered steps for procedures; avoid ALL CAPS.

Steps:
1. Identify the text and its medium (UI, markdown doc, report).
2. Check it against the rules (measure line length and spacing in the UI with the browser).
3. Restructure: headings, lists, short paragraphs, consistent terms.
4. For UI: map the rules to tokens; never hard-code values.
5. Re-check.
Decision rules: when a rule conflicts with the visual design, readability wins in reading areas;
display text (titles) may use the display face; don't simplify meaning, only form.
Anti-patterns: centred body text; long dense paragraphs; changing terms for variety.
Evidence: the before/after checks with measured values.

Evals:
T: "this handoff is hard to read, fix the layout" | "make the reading pane easier on the eyes" |
"is the docs page dyslexia friendly?" | "rewrite this report so it flows" | "check line length and
spacing in the output area"
N: "what should the button say?" → core-microcopy | "check colour contrast" → core-a11y-review |
"make it prettier" → core-visual-design-method

Trial: apply the rules to a copy of textclone docs/AI_WORKFLOW.md "Diagnose and fix" section and
measure before/after (average sentence length, paragraph length).

Refine signals: the user rewriting or asking to reformat outputs.
```

---

## `core-ux-heuristics` · P2

```text
Build the skill core-ux-heuristics. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when reviewing a screen's usability against the 10 usability heuristics, with scored evidence and fixes. Not for a hands-on flow walk (use `core-user-journey-walk`) or accessibility (use `core-a11y-review`).

Purpose: structured, evidence-based UX review instead of opinions.

Read first: research Nielsen's 10 usability heuristics with core-research-sources (cite NN/g).

Steps:
1. Screenshot the screen in its main states.
2. For each heuristic: score 0–4 severity of violations, with a screenshot reference and the
   element.
3. Propose a fix per violation, with the skill that should implement it.
4. Sort by severity.
Decision rules: every finding has an element and evidence; severity 3–4 become tasks.
Anti-patterns: findings without evidence; style preferences presented as heuristics.
Evidence: the scored table.
references/: references/heuristics.md (the 10, each with 2 examples relevant to a writing tool).

Evals:
T: "do a heuristic review of the console" | "evaluate the analyze page's usability" | "score the
UI against usability principles" | "what usability rules does this page break?" | "audit the
settings page UX"
N: "click through the flow" → core-user-journey-walk | "check screen reader support" →
core-a11y-review | "what's our visual score?" → core-visual-design-method

Trial: review textclone's Analyze page against the mock API.

Refine signals: issues users hit that scored low.
```

---

## `core-motion` · P2

```text
Build the skill core-motion. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when adding or reviewing animation and transitions: purpose, duration and easing tokens, reduced-motion alternatives, never blocking input. Not for the orb engine itself (use `orion-orb-states`).

Purpose: motion that explains change and never gets in the way.

Read first: design-tokens.css duration/easing tokens; VISUAL-DESIGN.md motion section and
signature moments; WCAG 2.3.3 (via core-research-sources).

Steps:
1. For each animation, state its purpose (feedback, orientation, continuity, or delight).
2. Use token durations and easings only.
3. Provide the prefers-reduced-motion version (fade or none).
4. Check input is never blocked while animating, and nothing flashes more than 3 times per second.
5. Check performance: transform/opacity only for frequent animations.
Decision rules: no purpose → remove it; delight only in signature moments; long durations only
for one-off moments.
Anti-patterns: animating layout properties; motion on every hover; ignoring reduced motion.
Evidence: the motion inventory with tokens and the reduced-motion behaviour.

Evals:
T: "add a transition when the drawer opens" | "the panel animation feels sluggish" | "does the UI
respect reduced motion?" | "animate the score ring filling" | "review all the animations"
N: "change the orb's states" → orion-orb-states | "design the loading state" →
core-states-design | "make it prettier" → core-visual-design-method

Trial: inventory motion in textclone's visual target (docs/ui-redesign/visual-target/index.html)
and check each has a reduced-motion path.

Refine signals: motion complaints; jank found in profiling.
```

---

## `core-onboarding` · P3

```text
Build the skill core-onboarding. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when designing the first-run experience: what a new user sees, setup checks, sample data, and a first success within two minutes. Not for general flow walks (use `core-user-journey-walk`).

Purpose: new users (or a fresh install) reach value fast.

Read first: textclone README.md setup and run, scripts/setup.ps1, textclone doctor command,
textclone/health.py.

Steps:
1. Map first run: install → launch → first screen → first useful result.
2. Find blockers: missing models, empty corpus, unclear next step.
3. Design: health checks surfaced in the UI, a clear first action, optional synthetic sample data.
4. Time it on a clean profile; target under 2 minutes after install.
Decision rules: never auto-download large models without consent; sample data is clearly marked
and removable.
Anti-patterns: tours that block the UI; empty screens with no next step.
Evidence: the first-run map and the timing.

Evals:
T: "what does a brand-new user see?" | "make first launch less confusing" | "design the setup
experience" | "add sample data for new users" | "how long until a new user gets value?"
N: "walk the dictation flow" → core-user-journey-walk | "package the installer" →
core-windows-packaging | "add a doctor check" → textclone-doctor-check

Trial: map textclone first run from README and scripts (no install); list the blockers.

Refine signals: first-run confusion reported.
```

---

## `core-visual-design-method` · P1

```text
Build the skill core-visual-design-method. Follow prompts/00-BUILD-PROTOCOL.md and
prompts/01-REFINEMENT.md (R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when making a UI beautiful in a controlled way: define tokens, measurable visual rules, a reference target page and a scored rubric, then build to them. Not for layout overflow checks (use `core-layout-audit`).

Purpose: "pretty" that is defined, measured and repeatable, not taste.

Read first: VISUAL-DESIGN.md (concept, colour story, typography, rhythm, signature moments, V1–V8,
the 100-point rubric: ≥85 total, no category below 60%), design-tokens.css (start/end markers),
docs/ui-redesign/visual-target/ (index.html, audit-target.mjs).

Steps:
1. Concept: one sentence and three adjectives tied to the product's purpose.
2. Colour story: each colour has a meaning and a budget (e.g. gilt ≤10% of the screen).
3. Tokens: colours (both themes), type scale, spacing, radii, shadows, durations, in one block.
4. Measurable rules (V-rules) the audit can check: no raw hex, token-only values, contrast.
5. A static visual target page that passes the layout audit at all widths and themes.
6. A rubric with categories and weights; score honestly with evidence.
7. Build the real UI to the target; score at each checkpoint.
Decision rules: tokens are pasted verbatim, never retyped; a rubric score without screenshots
doesn't count; readability rules win in reading areas.
Anti-patterns: colours added outside tokens; "make it pop" changes without a rule; scoring your
own work generously.
Evidence: the tokens block, V-rule results, target screenshots, rubric table with evidence.
references/: references/method.md (the 7 steps with the Night Scriptorium example),
references/rubric-template.md.

Evals:
T: "make the app look beautiful but consistent" | "define a visual style for orion" | "score the
UI's visual design" | "create design tokens and a target page" | "the colours are all over the
place, systematise them"
N: "text overflows its button" → core-layout-audit | "add an animation" → core-motion | "is the
contrast accessible?" → core-a11y-review

Trial: write the concept, colour story and rubric (no code) for a fictional second project from
the method alone; check every rule is measurable.

Refine signals: rubric scores that disagree with the user's reaction.
```

---

## `core-layout-audit` · P1

```text
Build the skill core-layout-audit. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when checking a web UI for layout defects across viewports and themes: off-screen boxes, clipped or overflowing text, overlaps, duplicate controls, misplaced anchors. Not for visual taste scoring (use `core-visual-design-method`).

Purpose: automated proof that every element is where the spec says and fits.

Read first: textclone docs/ui-redesign/guardrails/layout/ — audit-dom.js (L1–L11, V1–V8),
run-audit.mjs (its flags), contract.json (anchors), scenarios.json, mock-api.mjs, audit-ui.mjs
(--quick, --skip-build), selftest.mjs; UI-SPEC.md §2.3 and §9.

Steps:
1. Locate the project's audit (textclone: the folder above). For a new project, propose copying
   the engine and writing its own contract.json and scenarios.json; ask before adding files.
2. Build production assets and serve them against the mock API on owned ports (never dev mode).
3. Run quick after each task, full at gates; read the JSON report.
4. For each finding: the rule, element, viewport, theme, screenshot; fix the UI, never the audit.
5. Re-run until clean.
6. If a finding looks wrong, run selftest.mjs and stop and ask; never edit the audit files.
Decision rules: a finding inside a scroll container is checked with its scroll ancestor; the
contract is changed only through the spec's owner; zero findings is the only pass.
Anti-patterns: editing contract.json to make a finding go away; running against next dev; leaving
Chromium processes running (kill the process tree).
Evidence: the command, the summary line, the findings fixed, screenshots.
references/: references/rules.md (L1–L11 and V1–V8 in one line each), references/new-project.md.

Evals:
T: "check nothing overflows on phone width" | "run the layout audit" | "are any buttons
truncated?" | "make sure the panels are where the spec puts them" | "does the console fit at
tablet size in light theme?"
N: "how does it look overall?" → core-visual-design-method | "keyboard navigation check" →
core-a11y-review | "write a playwright test for cancel" → core-web-test

Trial: in a textclone worktree, run audit-ui.mjs --quick against the mock and report the summary;
then run selftest.mjs.

Refine signals: defects users saw that the audit passed.
```

---

## `core-a11y-review` · P1

```text
Build the skill core-a11y-review. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use when checking accessibility: keyboard paths, focus order and visibility, contrast, labels and accessible names, live regions, reduced motion. Not for layout overflow (use `core-layout-audit`).

Purpose: the app works without a mouse and with assistive technology.

Read first: WCAG 2.2 AA (via core-research-sources); design-tokens.css (contrast pairs);
VISUAL-DESIGN.md contrast notes; textclone web/components/ui/.

Steps:
1. Keyboard: tab through every page; every action reachable; focus visible; no traps; Escape
   closes drawers.
2. Names: every control has an accessible name; icons have labels.
3. Contrast: text ≥4.5:1, large text and UI parts ≥3:1, in both themes (compute from tokens).
4. Live regions: progress and results are announced (not every token streamed).
5. Reduced motion respected.
6. Run an automated scan (axe via Playwright, if already installed; never add dependencies
   without asking).
Decision rules: automated scans are necessary but not sufficient; streaming text must not flood
screen readers.
Anti-patterns: aria attributes added without testing; focus outlines removed for looks.
Evidence: the keyboard walk log, contrast table, scan output.

Evals:
T: "can you use the console with only a keyboard?" | "check contrast in light theme" | "is this
screen reader friendly?" | "do an accessibility pass on the drawers" | "the focus ring disappears,
check a11y"
N: "text is cut off" → core-layout-audit | "make reading easier for dyslexia" →
core-readability | "usability review" → core-ux-heuristics

Trial: compute the contrast table for every text/background token pair in design-tokens.css, both
themes; list pairs under threshold.

Refine signals: a11y bugs found later.
```

---

## `core-nextjs16` · P1

```text
Build the skill core-nextjs16. Follow prompts/00-BUILD-PROTOCOL.md and prompts/01-REFINEMENT.md
(R1–R3). Use core-skill-authoring.

Description (verbatim; change only if R2 fails):
Use before writing or changing Next.js code: check the installed Next.js docs (version from project.json), not memory — routing, server/client components, config, build. Not for styling (use `core-visual-design-method`).

Purpose: Next.js 16 has breaking changes from what models remember; read the installed docs.

Read first: textclone web/AGENTS.md and web/CLAUDE.md; web/package.json (next 16.3.4);
web/node_modules/next/dist/docs/ (list its structure); orion web/ package.json.

Steps:
1. Read frontend.version and frontend.docs_dir from project.json.
2. Find the docs pages for the API you will use (grep the docs dir); read them.
3. Write down the 3–5 facts you will rely on, with the doc path.
4. Write the code; run lint, typecheck and production build (commands.*).
5. If behaviour differs from memory, note it in references/gotchas.md through core-retro.
Decision rules: docs in node_modules win over memory and blog posts; never edit next.config.ts
or app/api when the project's rules protect them; no new dependencies.
Anti-patterns: using APIs from older versions; testing only in dev mode.
Evidence: doc paths read, the facts used, build output.
references/: references/doc-map.md (where common topics live in the docs folder),
references/gotchas.md (starts empty; filled from real cases).

Evals:
T: "add a new route to the web app" | "make this a client component" | "change how the page
fetches data in next" | "the build fails after my layout change" | "how does routing work in this
version?"
N: "style the panel" → core-visual-design-method | "write a playwright test" → core-web-test |
"upgrade next to the latest" → core-dependency-audit

Trial: from the installed docs only, answer: how are route segment configs and client components
declared in 16.3.4? Cite the doc paths.

Refine signals: build failures caused by outdated assumptions.
```
