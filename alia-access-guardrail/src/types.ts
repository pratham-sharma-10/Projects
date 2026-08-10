// ---------------------------------------------------------------------------
// Shared domain types for the Alia Access Guardrail prototype.
// ---------------------------------------------------------------------------

/** Which build of a popup is rendered: the pre-remediation ("Before") popup or
 *  the remediated ("After") popup. This is the axis the Before→After toggle
 *  flips, and the axis the audit measures. */
export type Mode = 'broken' | 'remediated';

/** The three canned popup configurations shipped as fixtures. */
export type FixtureId = 'welcome' | 'exit-intent' | 'quiz';

/** The verdict for a single audit check. Deliberately three-state so we can be
 *  honest: a genuine failure reads FAIL, never a softened "needs improvement". */
export type CheckStatus = 'pass' | 'warn' | 'fail';

/** Where a check came from, a real static engine or our interactive probes. */
export type CheckSource = 'axe-core' | 'interactive';

export interface Citation {
  /** e.g. "WCAG 1.4.3" or "APG Dialog (Modal) Pattern". */
  label: string;
  /** Canonical spec URL. */
  url: string;
}

export interface CheckResult {
  id: string;
  /** Short human title, e.g. "Color contrast". */
  title: string;
  /** WCAG success criterion / APG pattern this check maps to. */
  citation: Citation;
  status: CheckStatus;
  source: CheckSource;
  /** One-sentence, plain-language explanation of what was measured + found. */
  detail: string;
  /** Optional concrete evidence (e.g. measured ratio, element selector). */
  evidence?: string;
}

export interface AuditReport {
  mode: Mode;
  fixtureId: FixtureId;
  checks: CheckResult[];
  /** 0–100, computed from the checks (see lib/score.ts). */
  score: number;
  passCount: number;
  warnCount: number;
  failCount: number;
  /** ms since epoch when the report was produced. */
  ranAt: number;
}

// --- Fixture content model -------------------------------------------------

export interface QuizOption {
  id: string;
  label: string;
}

export interface FixtureContent {
  id: FixtureId;
  /** Menu label, e.g. "10% Off Welcome". */
  name: string;
  /** One-line description of the popup's job (shown in the fixture picker). */
  blurb: string;
  /** Dialog heading. */
  heading: string;
  /** Supporting copy under the heading. */
  body: string;
  /** Placeholder + label text for the email field. */
  emailLabel: string;
  emailPlaceholder: string;
  /** Primary CTA text. */
  ctaLabel: string;
  /** Dismiss/no-thanks text. */
  declineLabel: string;
  /** Optional decorative/marketing image (exit-intent uses one). */
  image?: {
    /** data-URI or path; kept tiny + inline so the app is self-contained. */
    src: string;
    /** The alt text used in the REMEDIATED build. Broken build omits alt. */
    alt: string;
  };
  /** Optional single-select quiz (quiz fixture uses one). */
  quiz?: {
    /** Question text, becomes the group's accessible name when remediated. */
    question: string;
    options: QuizOption[];
  };
}
