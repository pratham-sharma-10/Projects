import type { FixtureContent, FixtureId } from '../types';

// ---------------------------------------------------------------------------
// Canned popup configurations. These stand in for the popups a merchant would
// build in Alia's editor. Each renders as a real <dialog>-style modal via
// <AliaPopup>; the SAME content is rendered in both the "broken" (Before) and
// "remediated" (After) builds, only the accessibility scaffolding differs,
// which is exactly what the audit measures.
//
// Slightly different markup per fixture (an image here, a quiz radio group
// there) means the audit surfaces different findings on each, so the demo
// never looks like one hard-coded result.
// ---------------------------------------------------------------------------

// Tiny inline SVG so the app stays fully self-contained (no network image).
const giftSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="140" viewBox="0 0 320 140" role="img">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4f46e5"/><stop offset="1" stop-color="#7c3aed"/>
    </linearGradient></defs>
    <rect width="320" height="140" rx="10" fill="url(#g)"/>
    <rect x="132" y="52" width="56" height="52" rx="4" fill="#fff" opacity="0.95"/>
    <rect x="132" y="52" width="56" height="16" rx="4" fill="#fde68a"/>
    <rect x="156" y="40" width="8" height="64" fill="#fca5a5"/>
    <path d="M160 40c-10-14-30-6-20 6 4 4 14 4 20 0z" fill="#fca5a5"/>
    <path d="M160 40c10-14 30-6 20 6-4 4-14 4-20 0z" fill="#fca5a5"/>
  </svg>`,
)}`;

export const FIXTURES: Record<FixtureId, FixtureContent> = {
  welcome: {
    id: 'welcome',
    name: '10% Off Welcome',
    blurb: 'First-visit email capture, the highest-traffic popup on the store.',
    heading: 'Get 10% off your first order',
    body: 'Join the list for early access to drops and a welcome code, straight to your inbox.',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@example.com',
    ctaLabel: 'Claim my 10% off',
    declineLabel: 'No thanks, I’ll pay full price',
  },
  'exit-intent': {
    id: 'exit-intent',
    name: 'Exit-Intent Discount',
    blurb: 'Fires when the cursor leaves the viewport, includes a hero image.',
    heading: 'Wait, here’s 15% to stay',
    body: 'Leaving so soon? Take an extra 15% off your cart if you check out in the next 10 minutes.',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@example.com',
    ctaLabel: 'Send my 15% code',
    declineLabel: 'No thanks',
    image: {
      src: giftSvg,
      alt: 'Illustration of a wrapped gift box with a bow, a 15% discount offer.',
    },
  },
  quiz: {
    id: 'quiz',
    name: 'Quiz Popup',
    blurb: 'Zero-party data capture with a single-select question (radio group).',
    heading: 'Find your perfect match',
    body: 'Answer one question and we’ll tailor your first recommendation.',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@example.com',
    ctaLabel: 'Show my match',
    declineLabel: 'Skip the quiz',
    quiz: {
      question: 'What are you shopping for today?',
      options: [
        { id: 'skincare', label: 'Skincare' },
        { id: 'makeup', label: 'Makeup' },
        { id: 'haircare', label: 'Haircare' },
        { id: 'gifting', label: 'A gift for someone' },
      ],
    },
  },
};

export const FIXTURE_ORDER: FixtureId[] = ['welcome', 'exit-intent', 'quiz'];
