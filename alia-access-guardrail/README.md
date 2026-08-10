# Alia Access Guardrail

A merchant-facing accessibility (WCAG / ADA) auditor for Alia's Shopify popups.

Alia's popup is a shared surface that Alia controls on every merchant's
storefront. This prototype is a companion assurance layer that sits alongside
the existing popup editor and answers one question live:

> Is this popup accessible to every shopper?

It renders a real Alia-style popup on a simulated storefront, runs a genuine
audit against the live DOM (axe-core for static WCAG rules, plus custom
behavioral probes for keyboard interaction), and rolls the result into a single
0 to 100 score, a screen-reader transcript, a keyboard walkthrough, and an
auto-generated conformance statement.

Everything runs client-side. No backend, no database, no Alia API, and no
customer data.

## Quick start

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5175).

Other scripts:

```bash
npm run build      # type-check (tsc -b) and produce a production build in dist/
npm run preview    # serve the production build
```

Requires Node 18 or newer (developed on Node 22).

## 60-second demo script

Run these in order. The Before/After toggle is the core moment; everything else
is supporting evidence.

1. Land on the page. It opens on the "10% Off Welcome" popup in the Before
   build. The score reads 13 / 100, "Non-conformant", with six checks in red.
2. Select the green "After" toggle (top right, under Build). The score ring
   sweeps from 13 to 100, "Conformant", and every row flips to Pass. This is the
   whole case in one click.
3. Point at the screen-reader panel (dark panel, right column). In the After
   build it announces "Dialog. Get 10% off your first order. Email address, edit
   text, required." Toggle back to Before and it collapses to "No dialog
   boundary announced. Edit text, blank." Same popup, very different experience.
4. Select "Keyboard walkthrough", click into the popup, and press Tab,
   Shift+Tab, and Escape. In the After build the status reads "Focus contained";
   in the Before build it reads "Focus escaped the dialog".
5. Switch the popup tabs (Exit-Intent, Quiz) to show the audit adapts.
   Exit-Intent's Before build also fails image alt text (score 11); the Quiz
   After build exposes a properly labeled radio group.
6. Scroll to the auto-generated statement. It is honestly worded and clearly
   labeled a self-assessment illustration, not a certified audit.

The business-case caption on screen carries the stakes: ecommerce accounts for
77% of U.S. digital-accessibility lawsuits, the EU Accessibility Act is now in
force, and every direct Alia competitor already publishes popup accessibility
documentation.

## What is being measured

The audit runs against the live popup DOM. The Before and After builds render
the same copy; only the accessibility scaffolding differs, and every difference
below is measured for real.

### Static checks (axe-core by Deque)

| Check | Standard | What it verifies |
| --- | --- | --- |
| Color contrast | [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | 4.5:1 for normal text, 3:1 for large text, against the background |
| Form fields have labels | [WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | Inputs are programmatically associated with a `<label>` |
| Images have text alternatives | [WCAG 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html) | Meaningful images expose `alt`; decorative images are hidden |
| Controls have accessible names | [WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) | Every button exposes a discernible name |

### Interactive checks (custom live DOM probes)

These cover the behavioral criteria a static engine cannot verify. Each probe
drives the real popup (dispatches real key events, moves real focus, reads real
computed styles) and restores state so the visible demo is undisturbed.

| Check | Standard | How it is probed |
| --- | --- | --- |
| Announced as a modal dialog | [APG Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) | Reads `role="dialog"`, `aria-modal`, and the computed accessible name |
| Keyboard focus stays in the dialog | [WCAG 2.1.2](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html), [APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Simulates Tab at the last control and Shift+Tab at the first; asserts focus wraps inside |
| Escape key closes the popup | [WCAG 2.1.2](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html), [APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Dispatches an Escape keydown and checks the handler consumes it |
| Focus moves in, then returns to the trigger | [APG Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Verifies focus is moved into the dialog and the trigger is captured for return on close |
| Visible focus indicator | [WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) | Focuses each control and reads `outline` and `box-shadow` from computed style |

Scoring is deliberately transparent (`src/lib/score.ts`): each check contributes
equally (pass = 1, warn = 0.5, fail = 0) and the score is the percentage earned.
Warns count as half. A genuine failure always reads FAIL, never a softened
"needs improvement".

## Brand and theming

Every color, shadow, and radius resolves to a CSS custom property defined in one
place: the token block at the top of `src/index.css` (`--alia-bg`,
`--alia-ink`, `--alia-accent`, and so on), wired into Tailwind in
`tailwind.config.js`. To match Alia's exact brand, correct the hex values there
and nowhere else.

The current values are a safe starting direction (clean off-white surfaces,
near-black ink, one indigo accent) derived from Alia's marketing site. The live
aliapopups.com site and the Shopify listing were unreachable from the build
environment's network egress proxy, so exact hex values could not be sampled.
The token model mirrors Alia's own editor slots (Text, Background, Accent,
Accent-Foreground), so a correction is a four-line edit.

## The tool is itself accessible

Full keyboard operability, visible focus rings on every interactive element,
semantic HTML and ARIA throughout its own interface, a `prefers-reduced-motion`
guard, and screen-reader summaries on the scorecard. That consistency is part of
the pitch.

## Tech

React 18, TypeScript, and Vite; Tailwind driven by CSS variables; axe-core for
static checks; self-hosted Inter (no external CDN, so the app runs fully
offline).

## Project layout

```
src/
  App.tsx                     orchestration and audit scheduling
  fixtures/popups.ts          the three canned popups (Welcome, Exit-Intent, Quiz)
  components/
    AliaPopup.tsx             the audited artifact (broken vs remediated build)
    StorefrontPreview.tsx     simulated Shopify page and popup launcher
    Scorecard.tsx, CheckRow   live score ring and per-check findings
    ScreenReaderPreview.tsx   generated screen-reader transcript
    KeyboardWalkthrough.tsx   live focus status panel
    AccessibilityStatement.tsx  auto-generated conformance statement
    BusinessCase.tsx          the ADA-lawsuit and competitor-gap caption
    Controls.tsx, Header.tsx  fixture picker, Before/After toggle, framing
  lib/
    audit.ts                  runs interactive and axe checks, computes the report
    axeRunner.ts              axe-core integration and rule-to-citation mapping
    interactiveChecks.ts      the five behavioral probes
    screenReader.ts           builds the transcript from the live DOM
    score.ts, citations.ts, a11yName.ts, dom.ts
  index.css                   brand tokens (single source of truth) and fixtures
```

## Note

This is a prototype for demonstration. The generated accessibility statement is
a self-assessment illustration, not a certified third-party audit or a legal
determination of ADA or EAA compliance.
