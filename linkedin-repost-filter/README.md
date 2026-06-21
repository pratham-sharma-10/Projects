# LinkedIn Reposted Job Filter

A tiny Chrome extension that cleans up your LinkedIn job search by getting rid
of the **"Reposted"** jobs that clutter the results. Pick how you want them
handled: **blur** them out, **hide** them completely, or **grey** them out.

![mode: blur / hide / grey](icons/icon128.png)

## What it does

When you're on LinkedIn job search results, the extension scans every job card
and finds the ones LinkedIn labels "Reposted …". Depending on your setting it:

- **Blur** (default) — covers the card with a blur so you can ignore it, but the
  slot stays so the layout doesn't jump.
- **Hide completely** — removes reposted jobs from the list entirely.
- **Grey out** — fades them; hover to reveal if you want a peek.

It keeps working as you scroll (LinkedIn loads jobs lazily) and as you move
between searches.

## Install (load unpacked)

1. Download / clone this folder (`linkedin-repost-filter`).
2. Open Chrome and go to `chrome://extensions`.
3. Turn on **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the `linkedin-repost-filter` folder.
5. Open [LinkedIn Jobs](https://www.linkedin.com/jobs/), and reposted jobs will
   be filtered. Click the extension icon to switch modes or toggle it off.

> If LinkedIn was already open, refresh the tab after installing.

Works in Chrome, Edge, Brave, and other Chromium browsers (Manifest V3).

## Settings

Click the toolbar icon to:

- Toggle the filter on/off.
- Choose **Blur**, **Hide completely**, or **Grey out**.

Settings sync via your Chrome profile and apply instantly to open job tabs.

## How it works (under the hood)

- `content.js` runs on `linkedin.com/jobs/*`, collects job cards via several
  resilient selectors, and tests each card's text for the word "Reposted".
- A `MutationObserver` re-applies the filter as new cards stream in during
  infinite scroll.
- `content.css` holds the three visual treatments.
- `popup.html` / `popup.js` are the settings UI, backed by `chrome.storage.sync`.

## Notes / limitations

- LinkedIn changes its markup often. The matching is based on the visible
  "Reposted" text, which is the most stable signal — but if LinkedIn relabels
  it, matching may need an update.
- No data leaves your browser. The extension only needs `storage` and access to
  `linkedin.com`.
