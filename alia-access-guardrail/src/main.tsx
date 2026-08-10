import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter'; // self-hosted Inter, no external CDN
import App from './App';
import './index.css';

// NOTE: React.StrictMode is intentionally omitted. Its dev-only double-mounting
// re-runs the popup's focus-management effects (move-in / return-to-trigger),
// which makes the live keyboard walkthrough flicker focus. The audit itself is
// idempotent; the app runs the same in dev and production this way.
createRoot(document.getElementById('root')!).render(<App />);
