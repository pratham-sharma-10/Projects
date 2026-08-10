import type { FixtureId, Mode } from '../types';
import { FIXTURES, FIXTURE_ORDER } from '../fixtures/popups';

interface Props {
  fixtureId: FixtureId;
  mode: Mode;
  walkthrough: boolean;
  onFixtureChange: (id: FixtureId) => void;
  onModeChange: (mode: Mode) => void;
  onWalkthroughToggle: () => void;
}

export default function Controls({
  fixtureId,
  mode,
  walkthrough,
  onFixtureChange,
  onModeChange,
  onWalkthroughToggle,
}: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-alia border border-alia-border bg-alia-surface p-4 shadow-alia-card md:flex-row md:items-end md:justify-between">
      {/* Fixture picker */}
      <div>
        <label
          id="fixture-label"
          className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-alia-ink-muted"
        >
          Popup
        </label>
        <div role="tablist" aria-labelledby="fixture-label" className="inline-flex rounded-alia-sm bg-alia-surface-2 p-1">
          {FIXTURE_ORDER.map((id) => {
            const selected = id === fixtureId;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={selected}
                type="button"
                onClick={() => onFixtureChange(id)}
                className={`rounded-[6px] px-3 py-1.5 text-[13px] font-semibold transition ${
                  selected
                    ? 'bg-alia-surface text-alia-ink shadow-sm'
                    : 'text-alia-ink-muted hover:text-alia-ink'
                }`}
              >
                {FIXTURES[id].name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        {/* Before / After, the hero toggle */}
        <div>
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-alia-ink-muted">
            Build
          </span>
          <div
            role="group"
            aria-label="Popup build: before or after remediation"
            className="inline-flex rounded-alia-sm border border-alia-border-strong p-1"
          >
            <button
              type="button"
              aria-pressed={mode === 'broken'}
              onClick={() => onModeChange('broken')}
              className={`rounded-[6px] px-3.5 py-1.5 text-[13px] font-semibold transition ${
                mode === 'broken'
                  ? 'bg-alia-fail text-white shadow-sm'
                  : 'text-alia-ink-muted hover:text-alia-ink'
              }`}
            >
              Before
            </button>
            <button
              type="button"
              aria-pressed={mode === 'remediated'}
              onClick={() => onModeChange('remediated')}
              className={`rounded-[6px] px-3.5 py-1.5 text-[13px] font-semibold transition ${
                mode === 'remediated'
                  ? 'bg-alia-pass text-white shadow-sm'
                  : 'text-alia-ink-muted hover:text-alia-ink'
              }`}
            >
              After
            </button>
          </div>
        </div>

        {/* Walkthrough toggle */}
        <button
          type="button"
          onClick={onWalkthroughToggle}
          aria-pressed={walkthrough}
          className={`h-[38px] rounded-alia-sm border px-3.5 text-[13px] font-semibold transition ${
            walkthrough
              ? 'border-alia-accent bg-alia-accent text-alia-accent-fg'
              : 'border-alia-border-strong bg-alia-surface text-alia-ink hover:bg-alia-surface-2'
          }`}
        >
          {walkthrough ? 'Walkthrough on' : 'Keyboard walkthrough'}
        </button>
      </div>
    </div>
  );
}
