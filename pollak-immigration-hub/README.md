# Pollak Immigration Operations Hub

One connected workspace for cases, forms, documents, notices, and immigration deadlines — a practice-management prototype for **Pollak PLLC** (Dallas & Fort Lauderdale immigration law).

## Run it

No build step, no dependencies. Open `index.html` in a browser, or serve the folder:

```bash
cd pollak-immigration-hub
python3 -m http.server 8080
# open http://localhost:8080
```

## What's inside

A hash-routed single-page prototype with realistic (fictional) immigration-law sample data, dated around **July 15, 2026**.

| Screen | Highlights |
| --- | --- |
| Dashboard | Personalized greeting, priority actions table, deadline timeline, notice feed, team workload |
| Cases | Sortable/filterable case list with 8 saved views (RFE cases, expiring in 90 days, stale, …) |
| Case workspace | 8 tabs: Overview, Forms, Documents, USCIS Notices, Calendar, Tasks, Communications, tamper-resistant Activity Log |
| Clients | Individuals + corporate petitioners, portal status, linked matters |
| Forms | Library with current editions, data reuse with source labels, contradiction flags, attorney review checkpoints, "Generate Filing Packet" (never claims direct USCIS e-filing) |
| Documents | Folder organization, smart search, expiration detection, confidential labels, drag-and-drop |
| USCIS Notice Inbox | Split-screen review: original notice on the left, extracted fields with per-field confidence on the right; approve-and-file flow that updates the case, creates deadlines, and writes the audit log. Low-confidence matches are blocked from auto-filing |
| Calendar & Deadlines | Month / list / timeline views; every auto-created deadline shows source document, extraction confidence, approver, and reminder schedule |
| Tasks | Checklists, dependencies, waiting-on states, 7 views |
| Reports | Cases by type, prep time, notice-processing metrics, team capacity, risk flags |
| Integrations | Honest connection cards: what each imports/exports, last sync, error + reconnect states |
| Firm Administration | Users, role-based access matrix, security posture, workflow settings (auto-filing off by default) |
| Client Portal | Plain-language preview of what clients see — internal notes never exposed |

## Design system

- Navy `#243B53` (navigation, headings), Pollak orange `#F99A4B` (primary actions, used sparingly), warm cream `#F7F1E3` background, green `#238B57` / red `#C44545` status colors
- Inter typeface, WCAG-minded contrast, keyboard shortcuts (`/` to search, `g`+letter to navigate), responsive down to tablet

## Product principles demonstrated

- **The connected workflow**: receive notice → read → identify client → identify case → extract → file → update status → create deadlines → assign review → audit log. Visualized live at the top of the Notice Inbox.
- **Attorneys stay in control**: every extracted field shows a confidence score; nothing files or calendars without human approval; ambiguous matches disable the approve button.
- **Specific language**: no "seamless integration," no "revolutionary AI" — every feature says exactly what it does.

All names, case numbers, and receipt numbers are fictional sample data.
