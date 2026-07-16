/* =========================================================
   Pollak Immigration Operations Hub — Application
   Hash-routed single-page prototype. No build step required.
   ========================================================= */

'use strict';

/* ---------------- State ---------------- */
const state = {
  userId: 'u1',
  casesView: 'all',
  casesFilters: { attorney: '', paralegal: '', type: '', status: '', q: '' },
  casesSort: { key: 'nextDeadline', dir: 1 },
  selectedNotice: 'n1',
  docFolder: null,
  docQuery: '',
  calMode: 'month',
  taskView: 'my',
  caseTab: {},
  noticeApproved: {}, // id -> true after approve-and-file in this session
};

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function currentUser() { return USERS.find(u => u.id === state.userId) || USERS[0]; }
function caseById(id) { return CASES.find(c => c.id === id); }

function fmtDate(iso) {
  if (!iso || iso === '—') return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtShort(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function daysUntil(iso) {
  if (!iso || iso === '—') return null;
  return Math.round((new Date(iso + 'T00:00:00') - TODAY) / 86400000);
}
function dueBadge(iso) {
  const d = daysUntil(iso);
  if (d === null) return '<span class="pill pill-gray">—</span>';
  if (d < 0) return `<span class="pill pill-red"><span class="dot dot-red"></span>Overdue ${-d}d</span>`;
  if (d === 0) return '<span class="pill pill-red"><span class="dot dot-red"></span>Due today</span>';
  if (d <= 7) return `<span class="pill pill-amber"><span class="dot dot-amber"></span>${fmtShort(iso)} · in ${d}d</span>`;
  return `<span class="pill pill-navy">${fmtShort(iso)}</span>`;
}
function confClass(n) { return n >= 90 ? 'conf-high' : n >= 75 ? 'conf-mid' : 'conf-low'; }
function confLabel(n) { return `<span class="conf ${confClass(n)}" title="Extraction confidence — must be reviewed before relying on it">${n}%</span>`; }

function statusPill(s) {
  const map = {
    'Active': 'pill-navy', 'Approved': 'pill-green', 'RFE Received': 'pill-red',
    'Waiting on Client': 'pill-amber', 'Attorney Review': 'pill-orange',
    'Filed': 'pill-green', 'Needs review': 'pill-amber',
    'Under review': 'pill-amber', 'Received': 'pill-navy', 'Rejected': 'pill-red',
    'Replacement requested': 'pill-red', 'Expiring soon': 'pill-red',
    'Filed with USCIS': 'pill-green', 'Requested — not received': 'pill-red',
    'In progress': 'pill-navy', 'Open': 'pill-gray', 'Overdue': 'pill-red',
    'Completed': 'pill-green', 'Waiting on client': 'pill-amber',
    'Connected': 'pill-green', 'Not connected': 'pill-gray', 'Error': 'pill-red',
    'Draft': 'pill-gray', 'Awaiting attorney review': 'pill-orange',
  };
  return `<span class="pill ${map[s] || 'pill-gray'}">${esc(s)}</span>`;
}

/* ---------------- Icons ---------------- */
const ICONS = {
  dashboard: '<path d="M3 3h8v10H3zM13 3h8v6h-8zM13 11h8v10h-8zM3 15h8v6H3z"/>',
  cases: '<path d="M4 7h16v13H4z"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 12h16"/>',
  clients: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.7-3.5 3.3-5.5 6.5-5.5s5.8 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M17.5 14.7c2.1.7 3.6 2.4 4 5.3"/>',
  forms: '<path d="M6 2h9l4 4v16H6z"/><path d="M15 2v4h4M9 11h6M9 15h6M9 19h4"/>',
  documents: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  notices: '<path d="M3 6h18v13H3z"/><path d="m3 7 9 6 9-6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  tasks: '<path d="m4 6 2 2 3.5-4M4 13l2 2 3.5-4M4 20l2 2 3.5-4" transform="translate(0,-1.5)"/><path d="M12 6h9M12 13h9M12 19h9"/>',
  reports: '<path d="M4 20V10M10 20V4M16 20v-8M21 20H3"/>',
  integrations: '<path d="M9 3v4M15 3v4M8 7h8v5a4 4 0 0 1-8 0zM12 16v5"/>',
  admin: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.4 5.4l1.9 1.9M16.7 16.7l1.9 1.9M18.6 5.4l-1.9 1.9M7.3 16.7l-1.9 1.9"/>',
  portal: '<path d="M12 3 3 9v12h6v-7h6v7h6V9z"/>',
  security: '<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
};
function ico(name, cls = 'nav-ico') {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.cases}</svg>`;
}

/* ---------------- Navigation ---------------- */
const NAV = [
  { hash: '#/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { hash: '#/cases', label: 'Cases', icon: 'cases' },
  { hash: '#/clients', label: 'Clients', icon: 'clients' },
  { hash: '#/forms', label: 'Forms', icon: 'forms' },
  { hash: '#/documents', label: 'Documents', icon: 'documents' },
  { hash: '#/notices', label: 'USCIS Notices', icon: 'notices', badge: () => NOTICES.filter(n => n.status === 'Needs review' && !state.noticeApproved[n.id]).length },
  { hash: '#/calendar', label: 'Calendar & Deadlines', icon: 'calendar' },
  { hash: '#/tasks', label: 'Tasks', icon: 'tasks' },
  { hash: '#/reports', label: 'Reports', icon: 'reports' },
  { hash: '#/integrations', label: 'Integrations', icon: 'integrations' },
  { hash: '#/admin', label: 'Firm Administration', icon: 'admin' },
  { hash: '#/portal', label: 'Client Portal (preview)', icon: 'portal' },
];

function renderNav() {
  const route = location.hash || '#/dashboard';
  $('#nav-list').innerHTML = NAV.map(n => {
    const active = route === n.hash || (n.hash !== '#/dashboard' && route.startsWith(n.hash));
    const badge = n.badge ? n.badge() : 0;
    return `<li><a class="nav-link ${active ? 'active' : ''}" href="${n.hash}" ${active ? 'aria-current="page"' : ''}>
      ${ico(n.icon)}<span class="nav-text">${n.label}</span>
      ${badge ? `<span class="nav-badge">${badge}</span>` : ''}
    </a></li>`;
  }).join('');
}

/* ---------------- Toasts & modal ---------------- */
function toast(msg, kind = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.innerHTML = `<span>${kind === 'success' ? '✓' : 'ℹ'}</span><span>${msg}</span>`;
  $('#toast-stack').appendChild(el);
  setTimeout(() => el.remove(), 6500);
}

function openModal(title, bodyHtml, footHtml) {
  closeModal();
  const root = $('#modal-root');
  root.innerHTML = `
    <div class="modal-backdrop" data-close="1">
      <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="modal-head"><h3>${esc(title)}</h3><button class="close-x" data-close="1" aria-label="Close">×</button></div>
        <div class="modal-body">${bodyHtml}</div>
        ${footHtml ? `<div class="modal-foot">${footHtml}</div>` : ''}
      </div>
    </div>`;
  root.querySelector('.modal-backdrop').addEventListener('click', e => {
    if (e.target.dataset.close) closeModal();
  });
  document.addEventListener('keydown', escClose);
}
function escClose(e) { if (e.key === 'Escape') closeModal(); }
function closeModal() { $('#modal-root').innerHTML = ''; document.removeEventListener('keydown', escClose); }

function confirmAction(title, message, onConfirm, confirmLabel = 'Confirm') {
  openModal(title, `<p>${message}</p>`,
    `<button class="btn btn-secondary" data-close="1" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" id="modal-confirm">${esc(confirmLabel)}</button>`);
  $('#modal-confirm').addEventListener('click', () => { closeModal(); onConfirm(); });
}

function demoAction(label) {
  toast(`${label} — this action is simulated in the prototype and recorded in the audit log.`, 'info');
}

/* =========================================================
   VIEW: Dashboard
   ========================================================= */
function viewDashboard() {
  const u = currentUser();
  const firstName = u.name.split(' ')[0];
  const pendingNotices = NOTICES.filter(n => n.status === 'Needs review' && !state.noticeApproved[n.id]).length;
  const next7 = DEADLINES.filter(d => { const n = daysUntil(d.date); return n !== null && n >= 0 && n <= 7; });
  const formsForReview = CASE_FORMS.filter(f => f.review === 'Awaiting attorney review').length;
  const missingDocs = DOCUMENTS.filter(d => d.status === 'Requested — not received').length;
  const staleCases = CASES.filter(c => daysUntil(c.lastActivity) <= -14).length;

  const roleIntro = {
    'Attorney': 'Here is what needs your attention today.',
    'Paralegal': 'Here is what your cases need from you today.',
    'Legal Assistant': 'Here are today’s intake, scheduling, and document items.',
    'Firm Administrator': 'Here is today’s firm operations overview.',
  }[u.role];

  const priority = [
    { client: 'Maria Rodriguez', caseId: 'm1', type: 'H-1B Extension', action: 'Review Form I-129', due: '2026-07-18', who: 'Sarah Pollak', pr: 'High', status: 'Awaiting attorney review', btn: 'Open form review' },
    { client: 'Amit Patel', caseId: 'm2', type: 'Employment-Based Green Card', action: 'Respond to RFE', due: '2026-07-22', who: 'Sarah Pollak', pr: 'Urgent', status: 'In progress', btn: 'Open RFE workspace' },
    { client: 'Elena Garcia', caseId: 'm3', type: 'Naturalization', action: 'Missing tax transcript', due: '2026-07-19', who: 'Jessica Tran', pr: 'High', status: 'Waiting on client', btn: 'Send reminder' },
    { client: 'David Kim', caseId: 'm4', type: 'I-485 Adjustment of Status', action: 'Review receipt notice', due: '2026-07-16', who: 'Sarah Pollak', pr: 'New', status: 'Needs review', btn: 'Review notice' },
    { client: 'Carlos Mendoza', caseId: 'm9', type: 'TPS Re-registration', action: 'Obtain signed G-28 (3rd attempt)', due: '2026-07-14', who: 'Alicia Fuentes', pr: 'High', status: 'Overdue', btn: 'Open task' },
  ];

  const prPill = p => p === 'Urgent' ? '<span class="pill pill-red">Urgent</span>'
    : p === 'High' ? '<span class="pill pill-amber">High</span>'
    : p === 'New' ? '<span class="pill pill-orange">New</span>' : '<span class="pill pill-gray">Normal</span>';

  return `
  <div class="page-head">
    <div>
      <h1>Good morning, ${esc(firstName)}.</h1>
      <p class="lede">${roleIntro} <strong>${next7.length} deadlines</strong> fall in the next 7 days and <strong>${pendingNotices} USCIS notice${pendingNotices === 1 ? '' : 's'}</strong> await review.</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-secondary" onclick="location.hash='#/calendar'">${ico('calendar', '')} View calendar</button>
      <button class="btn btn-primary" onclick="location.hash='#/cases?new=1'">+ Create New Case</button>
    </div>
  </div>

  <div class="stat-grid" role="list">
    <button class="stat-card" role="listitem" onclick="location.hash='#/cases'"><span class="num">${CASES.filter(c => c.status !== 'Approved').length + 55}</span><span class="lbl">Active cases</span><span class="delta" style="color:var(--green)">▲ 3 this week</span></button>
    <button class="stat-card ${next7.some(d => d.urgency === 'urgent') ? 'warn' : 'accent'}" role="listitem" onclick="location.hash='#/calendar'"><span class="num">${next7.length}</span><span class="lbl">Deadlines in next 7 days</span><span class="delta" style="color:var(--red)">1 urgent (RFE)</span></button>
    <button class="stat-card accent" role="listitem" onclick="location.hash='#/notices'"><span class="num">${pendingNotices}</span><span class="lbl">Unreviewed USCIS notices</span><span class="delta" style="color:var(--muted)">Newest: today 8:42 AM</span></button>
    <button class="stat-card" role="listitem" onclick="location.hash='#/forms'"><span class="num">${formsForReview}</span><span class="lbl">Forms awaiting attorney review</span></button>
    <button class="stat-card" role="listitem" onclick="location.hash='#/documents'"><span class="num">${missingDocs}</span><span class="lbl">Missing client documents</span></button>
    <button class="stat-card" role="listitem" onclick="location.hash='#/cases?view=stale'"><span class="num">${staleCases}</span><span class="lbl">Cases with no recent activity</span><span class="delta" style="color:var(--amber)">14+ days quiet</span></button>
  </div>

  <div class="card mb">
    <div class="card-head">
      <h2>Priority Actions</h2>
      <span class="sub">Ranked by deadline and legal risk · ${u.role === 'Attorney' ? 'showing items requiring attorney action first' : 'showing your assigned items first'}</span>
    </div>
    <div class="table-wrap">
      <table class="data">
        <thead><tr><th>Client</th><th>Case type</th><th>Required action</th><th>Due date</th><th>Assigned</th><th>Priority</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${priority.map(p => `
          <tr class="row-click" onclick="location.hash='#/case/${p.caseId}'">
            <td class="cell-main">${esc(p.client)}</td>
            <td>${esc(p.type)}</td>
            <td>${esc(p.action)}</td>
            <td>${dueBadge(p.due)}</td>
            <td>${esc(p.who)}</td>
            <td>${prPill(p.pr)}</td>
            <td>${statusPill(p.status)}</td>
            <td><button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();${p.btn === 'Review notice' ? "location.hash='#/notices'" : p.btn === 'Send reminder' ? `demoAction('Reminder sent to ${p.client}')` : `location.hash='#/case/${p.caseId}'`}">${p.btn}</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <div class="grid-2-1 mb">
    <div class="card">
      <div class="card-head"><h2>Recently Received Notices</h2><a class="btn btn-sm btn-ghost" href="#/notices">Open Notice Inbox →</a></div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Notice</th><th>Client</th><th>Receipt no.</th><th>Received</th><th>Confidence</th><th>Review</th></tr></thead>
          <tbody>
            ${NOTICES.slice(0, 5).map(n => `
            <tr class="row-click" onclick="state.selectedNotice='${n.id}';location.hash='#/notices'">
              <td class="cell-main">${esc(n.noticeType)}<div class="cell-sub">${esc(n.formType)}</div></td>
              <td>${esc(n.client)}</td>
              <td style="font-variant-numeric:tabular-nums">${esc(n.receiptNumber)}</td>
              <td>${esc(n.received)}</td>
              <td>${confLabel(n.confidence)}</td>
              <td>${statusPill(state.noticeApproved[n.id] ? 'Filed' : n.status)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <p class="legal-note" style="padding:8px 20px 12px">Automatically extracted information must be reviewed by authorized firm personnel before filing or relying on it for a legal deadline.</p>
    </div>

    <div class="card">
      <div class="card-head"><h2>Upcoming Deadlines</h2><a class="btn btn-sm btn-ghost" href="#/calendar">Full calendar →</a></div>
      <div class="card-pad">
        <ul class="vtl">
          ${DEADLINES.filter(d => daysUntil(d.date) >= 0).slice(0, 7).map(d => `
          <li class="${d.urgency}">
            <div class="vtl-date">${fmtShort(d.date)} · ${esc(d.type)}</div>
            <div class="vtl-title"><a href="#/case/${d.caseId}" style="text-decoration:none;color:inherit">${esc(d.title)}</a></div>
            <div class="vtl-sub">${esc(d.owner)}</div>
          </li>`).join('')}
        </ul>
      </div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-head"><h2>Team Workload</h2><span class="sub">Active cases · overdue tasks · deadlines in 30 days</span></div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Team member</th><th>Role</th><th>Active cases</th><th>Overdue tasks</th><th>Deadlines (30d)</th></tr></thead>
          <tbody>
            ${REPORTS.teamCapacity.map(([name, cases, overdue, dls]) => {
              const usr = USERS.find(x => x.name === name);
              return `<tr>
                <td class="cell-main"><span class="avatar" style="width:26px;height:26px;font-size:.66rem;display:inline-flex;margin-right:8px;background:${usr?.color || 'var(--navy)'};color:#fff">${usr?.initials || '—'}</span>${esc(name)}</td>
                <td>${esc(usr?.role || '')}</td><td>${cases}</td>
                <td>${overdue ? `<span class="pill pill-red">${overdue}</span>` : '<span class="pill pill-green">0</span>'}</td>
                <td>${dls}</td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h2>Recent Case Activity</h2><span class="sub">Firm-wide audit trail (latest)</span></div>
      <div class="card-pad">
        <ul class="vtl">
          ${ACTIVITY.slice(0, 6).map(a => `
          <li>
            <div class="vtl-date">${esc(a.ts)} ${a.auto ? '<span class="pill pill-navy" style="margin-left:6px">Automated</span>' : ''}</div>
            <div class="vtl-title">${esc(a.who)}</div>
            <div class="vtl-sub">${esc(a.what)}</div>
          </li>`).join('')}
        </ul>
      </div>
    </div>
  </div>`;
}

/* =========================================================
   VIEW: Cases
   ========================================================= */
const SAVED_VIEWS = [
  ['all', 'All cases'], ['mine', 'My active cases'], ['filing', 'Filing this month'],
  ['waiting', 'Waiting on client'], ['review', 'Attorney review required'],
  ['rfe', 'RFE cases'], ['expiring', 'Expiring within 90 days'], ['stale', 'No activity for 14 days'],
];

function filteredCases() {
  const f = state.casesFilters;
  const u = currentUser();
  let rows = CASES.slice();
  switch (state.casesView) {
    case 'mine': rows = rows.filter(c => (c.attorney === u.name || c.paralegal === u.name) && c.status !== 'Approved'); break;
    case 'filing': rows = rows.filter(c => c.nextDeadline.startsWith('2026-07') && /fil|packet|review/i.test(c.nextDeadlineLabel)); break;
    case 'waiting': rows = rows.filter(c => c.status === 'Waiting on Client'); break;
    case 'review': rows = rows.filter(c => c.status === 'Attorney Review' || c.stage === 'Attorney Review'); break;
    case 'rfe': rows = rows.filter(c => c.status === 'RFE Received'); break;
    case 'expiring': rows = rows.filter(c => { const n = daysUntil(c.nextDeadline); return n !== null && n <= 90 && /expir/i.test(c.nextDeadlineLabel); }); break;
    case 'stale': rows = rows.filter(c => daysUntil(c.lastActivity) <= -14); break;
  }
  if (f.attorney) rows = rows.filter(c => c.attorney === f.attorney);
  if (f.paralegal) rows = rows.filter(c => c.paralegal === f.paralegal);
  if (f.status) rows = rows.filter(c => c.status === f.status);
  if (f.type) rows = rows.filter(c => c.type.toLowerCase().includes(f.type.toLowerCase()) || c.visa.toLowerCase().includes(f.type.toLowerCase()));
  if (f.q) {
    const q = f.q.toLowerCase();
    rows = rows.filter(c => [c.client, c.matter, c.type, c.visa, c.receipt].join(' ').toLowerCase().includes(q));
  }
  const { key, dir } = state.casesSort;
  rows.sort((a, b) => String(a[key]).localeCompare(String(b[key])) * dir);
  return rows;
}

function viewCases(params) {
  if (params.get('view')) state.casesView = params.get('view');
  const rows = filteredCases();
  const f = state.casesFilters;

  setTimeout(() => { if (params.get('new')) { modalNewCase(); history.replaceState(null, '', '#/cases'); } });

  return `
  <div class="page-head">
    <div>
      <h1>Cases</h1>
      <p class="lede">All immigration matters for the firm. Search, filter, and save views your team uses daily.</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-secondary" onclick="demoAction('Case list exported to CSV')">Export CSV</button>
      <button class="btn btn-primary" onclick="modalNewCase()">+ Create New Case</button>
    </div>
  </div>

  <div class="saved-views" role="tablist" aria-label="Saved views">
    ${SAVED_VIEWS.map(([id, label]) => `<button role="tab" aria-selected="${state.casesView === id}" class="${state.casesView === id ? 'active' : ''}" onclick="state.casesView='${id}';render()">${label}</button>`).join('')}
  </div>

  <div class="filter-bar" role="search">
    <input type="search" placeholder="Search client, matter no., receipt no…" value="${esc(f.q)}" style="min-width:230px"
      oninput="state.casesFilters.q=this.value;renderKeepFocus(this)">
    <label>Attorney
      <select onchange="state.casesFilters.attorney=this.value;render()">
        <option value="">All</option>
        ${USERS.filter(u => u.role === 'Attorney').map(u => `<option ${f.attorney === u.name ? 'selected' : ''}>${u.name}</option>`).join('')}
      </select></label>
    <label>Paralegal
      <select onchange="state.casesFilters.paralegal=this.value;render()">
        <option value="">All</option>
        ${USERS.filter(u => u.role === 'Paralegal' || u.role === 'Legal Assistant').map(u => `<option ${f.paralegal === u.name ? 'selected' : ''}>${u.name}</option>`).join('')}
      </select></label>
    <label>Case type
      <select onchange="state.casesFilters.type=this.value;render()">
        <option value="">All</option>
        ${['H-1B', 'EB-2', 'EB-1', 'N-400', 'E-2', 'PERM', 'EAD', 'TPS', 'O-1'].map(t => `<option ${f.type === t ? 'selected' : ''}>${t}</option>`).join('')}
      </select></label>
    <label>Status
      <select onchange="state.casesFilters.status=this.value;render()">
        <option value="">All</option>
        ${['Active', 'RFE Received', 'Waiting on Client', 'Attorney Review', 'Approved'].map(s => `<option ${f.status === s ? 'selected' : ''}>${s}</option>`).join('')}
      </select></label>
    <button class="btn btn-sm btn-ghost" onclick="state.casesFilters={attorney:'',paralegal:'',type:'',status:'',q:''};state.casesView='all';render()">Clear filters</button>
    <span style="margin-left:auto;font-size:.78rem;color:var(--muted)">${rows.length} of ${CASES.length} matters</span>
  </div>

  <div class="card">
    <div class="table-wrap">
      <table class="data">
        <thead><tr>
          ${[['client', 'Client'], ['matter', 'Matter no.'], ['type', 'Case type'], ['attorney', 'Attorney'], ['paralegal', 'Paralegal'], ['stage', 'Stage'], ['priorityDate', 'Priority date'], ['nextDeadline', 'Next deadline'], ['status', 'Status'], ['lastActivity', 'Last activity']]
            .map(([k, l]) => `<th onclick="sortCases('${k}')">${l}${state.casesSort.key === k ? `<span class="sort-arrow">${state.casesSort.dir > 0 ? '▲' : '▼'}</span>` : ''}</th>`).join('')}
        </tr></thead>
        <tbody>
          ${rows.length === 0 ? `<tr><td colspan="10"><div class="empty"><div class="e-ico">🗂</div><h3>No matters match this view</h3><p>Try clearing filters, or create a new case to get started.</p><button class="btn btn-primary" onclick="modalNewCase()">+ Create New Case</button></div></td></tr>` : ''}
          ${rows.map(c => `
          <tr class="row-click" onclick="location.hash='#/case/${c.id}'">
            <td class="cell-main">${esc(c.client)}<div class="cell-sub">${esc(c.visa)}</div></td>
            <td style="font-variant-numeric:tabular-nums">${esc(c.matter)}</td>
            <td>${esc(c.type)}</td>
            <td>${esc(c.attorney)}</td>
            <td>${esc(c.paralegal)}</td>
            <td><div class="progress" style="margin-bottom:3px"><span style="width:${c.stagePct}%"></span></div><span class="cell-sub">${esc(c.stage)}</span></td>
            <td>${esc(c.priorityDate === '—' ? '—' : fmtDate(c.priorityDate))}</td>
            <td>${dueBadge(c.nextDeadline)}<div class="cell-sub">${esc(c.nextDeadlineLabel)}</div></td>
            <td>${statusPill(c.status)}</td>
            <td class="cell-sub">${fmtShort(c.lastActivity)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}
function sortCases(k) {
  if (state.casesSort.key === k) state.casesSort.dir *= -1;
  else state.casesSort = { key: k, dir: 1 };
  render();
}
function modalNewCase() {
  openModal('Create New Case', `
    <div class="field"><label>Client</label>
      <select>${CLIENTS.map(c => `<option>${esc(c.name)}</option>`).join('')}<option>+ New client…</option></select></div>
    <div class="field"><label>Case type</label>
      <select><option>H-1B (new or extension)</option><option>Employment-based green card (EB-1/2/3)</option><option>Family-based petition</option><option>Naturalization (N-400)</option><option>E-2 Treaty Investor</option><option>PERM</option><option>Humanitarian / TPS / Asylum</option></select></div>
    <div class="field"><label>Responsible attorney</label>
      <select>${USERS.filter(u => u.role === 'Attorney').map(u => `<option>${u.name}</option>`).join('')}</select></div>
    <div class="field"><label>Assigned paralegal</label>
      <select>${USERS.filter(u => u.role === 'Paralegal').map(u => `<option>${u.name}</option>`).join('')}</select></div>
    <div class="field"><label>Opening notes</label><textarea rows="3" placeholder="Referral source, urgency, initial strategy…"></textarea></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="closeModal();toast('New matter PLK-2026-0058 created and intake checklist generated. Audit log entry recorded.')">Create case</button>`);
}

/* =========================================================
   VIEW: Case workspace
   ========================================================= */
const CASE_TABS = ['Overview', 'Forms', 'Documents', 'USCIS Notices', 'Calendar', 'Tasks', 'Communications', 'Activity Log'];

function viewCase(id) {
  const c = caseById(id);
  if (!c) return `<div class="empty"><h3>Case not found</h3><p><a href="#/cases">Back to cases</a></p></div>`;
  const tab = state.caseTab[id] || 'Overview';
  const client = CLIENTS.find(x => x.id === c.clientId);

  return `
  <div class="page-head" style="margin-bottom:10px">
    <div><div class="crumb"><a href="#/cases">Cases</a> / ${esc(c.matter)}</div></div>
  </div>

  <div class="case-hero">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px">
      <div>
        <h1>${esc(c.client)}</h1>
        <span style="color:#9DB0C2;font-size:.86rem">${esc(c.matter)} · ${esc(c.type)}</span>
      </div>
      ${statusPill(c.status)}
    </div>
    <div class="meta-row">
      <div class="meta"><div class="k">Responsible attorney</div><div class="v">${esc(c.attorney)}</div></div>
      <div class="meta"><div class="k">Assigned paralegal</div><div class="v">${esc(c.paralegal)}</div></div>
      <div class="meta"><div class="k">Priority date</div><div class="v">${esc(c.priorityDate === '—' ? '—' : fmtDate(c.priorityDate))}</div></div>
      <div class="meta"><div class="k">Next deadline</div><div class="v">${fmtDate(c.nextDeadline)} — ${esc(c.nextDeadlineLabel)}</div></div>
      <div class="meta"><div class="k">Receipt no.</div><div class="v" style="font-variant-numeric:tabular-nums">${esc(c.receipt)}</div></div>
      <div class="meta"><div class="k">Stage</div><div class="v">${esc(c.stage)} (${c.stagePct}%)</div></div>
    </div>
    ${c.riskNote ? `<div class="risk-flag ${c.risk === 'urgent' ? 'urgent' : ''}" role="status">⚠ ${esc(c.riskNote)}</div>` : ''}
    <div class="actions">
      <button class="btn btn-primary btn-sm" onclick="demoAction('Task creation dialog')">+ Add task</button>
      <button class="btn btn-secondary btn-sm" onclick="demoAction('Document upload')">Upload document</button>
      <button class="btn btn-secondary btn-sm" onclick="demoAction('Notice added for extraction')">Add notice</button>
      <button class="btn btn-secondary btn-sm" onclick="demoAction('Form started from library')">Start form</button>
      <button class="btn btn-secondary btn-sm" onclick="demoAction('Client document request sent via portal')">Send client request</button>
      <button class="btn btn-secondary btn-sm" onclick="demoAction('Deadline dialog')">Add deadline</button>
      <button class="btn btn-secondary btn-sm" onclick="demoAction('Case note saved')">Add case note</button>
    </div>
  </div>

  <div class="tabs" role="tablist">
    ${CASE_TABS.map(t => {
      const counts = {
        'Forms': CASE_FORMS.filter(f => f.caseId === id).length,
        'Documents': DOCUMENTS.filter(d => d.caseId === id).length,
        'USCIS Notices': NOTICES.filter(n => n.caseId === id).length,
        'Tasks': TASKS.filter(t2 => t2.caseId === id && t2.status !== 'Completed').length,
      };
      return `<button role="tab" aria-selected="${tab === t}" class="${tab === t ? 'active' : ''}"
        onclick="state.caseTab['${id}']='${t}';render()">${t}${counts[t] ? `<span class="tab-count">${counts[t]}</span>` : ''}</button>`;
    }).join('')}
  </div>

  ${caseTabContent(c, client, tab)}`;
}

function caseTabContent(c, client, tab) {
  const id = c.id;
  switch (tab) {
    case 'Overview': {
      const caseDls = DEADLINES.filter(d => d.caseId === id);
      const missing = DOCUMENTS.filter(d => d.caseId === id && d.status === 'Requested — not received');
      return `
      <div class="grid-2-1">
        <div class="stack">
          <div class="card card-pad">
            <h3 style="margin-bottom:10px">Case progress — ${esc(c.stage)}</h3>
            <div class="progress ${c.stagePct === 100 ? 'p-done' : ''}" style="height:10px"><span style="width:${c.stagePct}%"></span></div>
            <p style="font-size:.82rem;color:var(--muted);margin-top:8px">Opened ${fmtDate(c.openedOn)} · Last activity ${fmtDate(c.lastActivity)}</p>
            ${missing.length ? `<div class="ai-note warn" role="status">⚠ <span><strong>Missing information:</strong> ${missing.map(m => esc(m.name.split(' — ')[0])).join(', ')}. A client request is outstanding.</span></div>` : ''}
          </div>
          <div class="card">
            <div class="card-head"><h2>Upcoming actions</h2></div>
            <div class="card-pad"><ul class="vtl">
              ${caseDls.filter(d => daysUntil(d.date) >= -3).slice(0, 5).map(d => `
                <li class="${d.urgency}"><div class="vtl-date">${fmtShort(d.date)} · ${esc(d.type)}</div>
                <div class="vtl-title">${esc(d.title)}</div>
                <div class="vtl-sub">Owner: ${esc(d.owner)} · Source: ${esc(d.source)}</div></li>`).join('') || '<li><div class="vtl-title">No upcoming deadlines</div></li>'}
            </ul></div>
          </div>
          <div class="card">
            <div class="card-head"><h2>Recent activity</h2><span class="sub">From the audit log</span></div>
            <div class="card-pad"><ul class="vtl">
              ${(CASE_ACTIVITY[id] || []).slice(0, 4).map(a => `
                <li><div class="vtl-date">${esc(a.ts)} ${a.auto ? '<span class="pill pill-navy" style="margin-left:5px">Automated</span>' : ''}</div>
                <div class="vtl-title">${esc(a.who)} — ${esc(a.field)}</div>
                <div class="vtl-sub">${esc(a.change)}</div></li>`).join('') || '<li><div class="vtl-sub">No activity recorded yet.</div></li>'}
            </ul></div>
          </div>
        </div>
        <div class="stack">
          <div class="card card-pad">
            <h3 style="margin-bottom:10px">Client details</h3>
            ${['Email:' + (client?.email || ''), 'Phone:' + (client?.phone || ''), 'Country of birth:' + (client?.country || ''), 'Preferred language:' + (client?.language || ''), 'A-Number:' + (client?.aNumber || ''), 'Address:' + (client?.address || ''), 'Employer:' + (client?.employer || '')]
              .map(row => { const [k, ...v] = row.split(':'); return `<div class="extract-row"><span class="k">${k}</span><span class="v" style="font-weight:500;max-width:60%">${esc(v.join(':'))}</span></div>`; }).join('')}
            <div style="margin-top:12px;display:flex;gap:8px">
              <button class="btn btn-sm btn-secondary" onclick="location.hash='#/clients'">Client profile</button>
              <button class="btn btn-sm btn-secondary" onclick="location.hash='#/portal'">Portal view</button>
            </div>
          </div>
          <div class="card card-pad">
            <h3 style="margin-bottom:8px">Matter permissions</h3>
            <p style="font-size:.8rem;color:var(--muted)">Visible to: ${esc(c.attorney)}, ${esc(c.paralegal)}, firm administrators. Confidential documents restricted to attorney + assigned staff.</p>
            <span class="pill pill-navy" style="margin-top:8px">🔒 Matter-level access control</span>
          </div>
        </div>
      </div>`;
    }
    case 'Forms': {
      const forms = CASE_FORMS.filter(f => f.caseId === id);
      return `
      <div class="card">
        <div class="card-head"><h2>Immigration forms in this matter</h2>
          <button class="btn btn-sm btn-primary" onclick="demoAction('Form library opened')">+ Start form</button></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Form</th><th>Edition</th><th>Completion</th><th>Prepared by</th><th>Review status</th><th>Filing status</th><th>Last updated</th><th></th></tr></thead>
          <tbody>${forms.map(f => `
            <tr>
              <td class="cell-main">${esc(f.form)}</td><td>${esc(f.edition)}</td>
              <td><div class="progress ${f.pct === 100 ? 'p-done' : ''}"><span style="width:${f.pct}%"></span></div><span class="cell-sub">${f.pct}%</span></td>
              <td>${esc(f.preparedBy)}</td><td>${statusPill(f.review)}</td><td>${esc(f.filing)}</td>
              <td class="cell-sub">${esc(f.updated)}</td>
              <td><button class="btn btn-sm btn-secondary" onclick="location.hash='#/forms'">Open</button></td>
            </tr>
            ${f.flag ? `<tr><td colspan="8" style="padding-top:0"><div class="ai-note warn">⚠ <span>${esc(f.flag)}</span></div></td></tr>` : ''}`).join('') || `<tr><td colspan="8"><div class="empty"><h3>No forms started</h3><p>Start a form to reuse client and case data already on file.</p></div></td></tr>`}
          </tbody></table></div>
      </div>`;
    }
    case 'Documents': {
      const docs = DOCUMENTS.filter(d => d.caseId === id);
      const folders = [...new Set(docs.map(d => d.folder))];
      return `
      <div class="dropzone">Drag files here to upload to <strong>${esc(c.matter)}</strong> — suggested folders are applied automatically and confirmed by you.</div>
      ${DOC_FOLDERS.map(folder => {
        const inFolder = docs.filter(d => d.folder === folder);
        if (!inFolder.length) return '';
        return `<div class="card mb">
          <div class="card-head"><h2>📁 ${folder}</h2><span class="sub">${inFolder.length} document${inFolder.length > 1 ? 's' : ''}</span></div>
          <div class="table-wrap"><table class="data">
            <tbody>${inFolder.map(d => `
              <tr><td class="cell-main">${esc(d.name)} ${d.confidential ? '<span class="pill pill-red" title="Restricted to attorney + assigned staff">Confidential</span>' : ''}
                <div class="cell-sub">Uploaded ${d.uploaded ? fmtDate(d.uploaded) : '—'} · ${esc(d.by)}${d.expires ? ` · Expires ${fmtDate(d.expires)}` : ''}</div></td>
              <td>${statusPill(d.status)}</td>
              <td style="text-align:right"><button class="btn btn-sm btn-ghost" onclick="demoAction('Preview opened')">Preview</button>
                <button class="btn btn-sm btn-ghost" onclick="demoAction('Version history shown')">Versions</button></td></tr>`).join('')}
            </tbody></table></div></div>`;
      }).join('') || `<div class="card"><div class="empty"><div class="e-ico">📂</div><h3>No documents yet</h3><p>Upload documents or send the client a request — everything files into organized folders.</p><button class="btn btn-primary" onclick="demoAction('Client request sent')">Send client request</button></div></div>`}
      ${folders.length ? '' : ''}`;
    }
    case 'USCIS Notices': {
      const ns = NOTICES.filter(n => n.caseId === id);
      return `<div class="card">
        <div class="card-head"><h2>Government notices on this matter</h2><a class="btn btn-sm btn-ghost" href="#/notices">Open Notice Inbox →</a></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Notice type</th><th>Form</th><th>Receipt no.</th><th>Notice date</th><th>Key dates</th><th>Status</th></tr></thead>
          <tbody>${ns.map(n => `
            <tr class="row-click" onclick="state.selectedNotice='${n.id}';location.hash='#/notices'">
              <td class="cell-main">${esc(n.noticeType)}</td><td>${esc(n.formType)}</td>
              <td style="font-variant-numeric:tabular-nums">${esc(n.receiptNumber)}</td>
              <td>${fmtDate(n.noticeDate)}</td>
              <td class="cell-sub">${esc(n.responseDeadline ? 'Respond by ' + fmtDate(n.responseDeadline) : n.apptDate ? 'Appointment ' + n.apptDate : n.validity || '—')}</td>
              <td>${statusPill(state.noticeApproved[n.id] ? 'Filed' : n.status)}</td></tr>`).join('') || `<tr><td colspan="6"><div class="empty"><h3>No notices yet</h3><p>Notices received by mail, email, or portal upload will be matched to this case automatically and held for review.</p></div></td></tr>`}
          </tbody></table></div></div>`;
    }
    case 'Calendar': {
      const dls = DEADLINES.filter(d => d.caseId === id);
      return `<div class="card">
        <div class="card-head"><h2>Case deadlines & appointments</h2>
          <button class="btn btn-sm btn-primary" onclick="demoAction('Deadline dialog')">+ Add deadline</button></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Date</th><th>Deadline</th><th>Type</th><th>Owner</th><th>Source</th><th>Approved by</th><th>Reminders</th></tr></thead>
          <tbody>${dls.map(d => `
            <tr><td>${dueBadge(d.date)}</td><td class="cell-main">${esc(d.title)}</td><td>${esc(d.type)}</td>
              <td>${esc(d.owner)}</td><td class="cell-sub">${esc(d.source)}</td><td class="cell-sub">${esc(d.approvedBy)}</td>
              <td class="cell-sub">${d.reminders.join(' · ')}</td></tr>`).join('')}
          </tbody></table></div>
        <p class="legal-note" style="padding:8px 20px 12px">Every automatically created deadline shows its source document, extraction confidence, and the person who approved it.</p></div>`;
    }
    case 'Tasks': {
      const ts = TASKS.filter(t => t.caseId === id);
      return `<div class="card">
        <div class="card-head"><h2>Tasks</h2><button class="btn btn-sm btn-primary" onclick="demoAction('Task dialog')">+ Add task</button></div>
        <div class="card-pad stack">
          ${ts.map(t => taskCard(t)).join('') || '<div class="empty"><h3>No tasks</h3><p>Create tasks with checklists, dependencies, and due dates.</p></div>'}
        </div></div>`;
    }
    case 'Communications': {
      const comms = COMMUNICATIONS[id] || [];
      return `<div class="card">
        <div class="card-head"><h2>Communications</h2>
          <span class="sub">Client-visible messages and internal notes (internal notes are never shown in the portal)</span></div>
        <div class="card-pad"><ul class="vtl">
          ${comms.map(m => `<li>
            <div class="vtl-date">${esc(m.ts)} · ${esc(m.kind)} ${m.internal ? '<span class="pill pill-red" style="margin-left:5px">Internal only</span>' : '<span class="pill pill-green" style="margin-left:5px">Client-visible</span>'}</div>
            <div class="vtl-sub" style="font-size:.86rem;color:var(--body)">${esc(m.text)}</div></li>`).join('') || '<li><div class="vtl-sub">No communications yet.</div></li>'}
        </ul>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button class="btn btn-sm btn-primary" onclick="demoAction('Secure message sent to client portal')">Send secure message</button>
          <button class="btn btn-sm btn-secondary" onclick="demoAction('Internal note saved (not client-visible)')">Add internal note</button>
        </div></div></div>`;
    }
    case 'Activity Log': {
      const acts = CASE_ACTIVITY[id] || [];
      return `<div class="card">
        <div class="card-head"><h2>Activity Log</h2>
          <span class="sub">Tamper-resistant audit history · entries cannot be edited or deleted</span></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Timestamp</th><th>Actor</th><th>Field / area</th><th>Change</th><th>Method</th></tr></thead>
          <tbody>${acts.map(a => `
            <tr><td class="cell-sub" style="white-space:nowrap">${esc(a.ts)}</td><td class="cell-main">${esc(a.who)}</td>
              <td>${esc(a.field)}</td><td>${esc(a.change)}</td>
              <td>${a.auto ? '<span class="pill pill-navy">Automated</span>' : '<span class="pill pill-gray">Manual</span>'}</td></tr>`).join('') || '<tr><td colspan="5" class="cell-sub">No entries.</td></tr>'}
          </tbody></table></div>
        <p class="legal-note" style="padding:8px 20px 12px">🔒 Audit entries are write-once and retained per the firm’s data retention policy (Firm Administration → Security).</p></div>`;
    }
  }
  return '';
}

function taskCard(t) {
  return `<div class="card card-pad" style="box-shadow:none">
    <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
      <div>
        <strong style="color:var(--navy)">${esc(t.title)}</strong>
        <div class="cell-sub">${esc(t.client)} · ${esc(caseById(t.caseId)?.matter || '')} · Assigned to ${esc(t.assignee)}</div>
      </div>
      <div style="display:flex;gap:7px;align-items:center">${t.priority === 'Urgent' ? '<span class="pill pill-red">Urgent</span>' : t.priority === 'High' ? '<span class="pill pill-amber">High</span>' : `<span class="pill pill-gray">${t.priority}</span>`}
        ${statusPill(t.status)} ${dueBadge(t.due)}</div>
    </div>
    ${t.dependency ? `<div class="cell-sub" style="margin-top:6px">🔗 ${esc(t.dependency)}</div>` : ''}
    ${t.waitingOn ? `<div class="cell-sub">⏳ Waiting on: ${esc(t.waitingOn)}</div>` : ''}
    <div style="margin-top:8px">${t.checklist.map(([item, done]) => `
      <div class="check-item ${done ? 'done' : ''}"><span class="box">${done ? '✓' : ''}</span>${esc(item)}</div>`).join('')}</div>
  </div>`;
}

/* =========================================================
   VIEW: Clients
   ========================================================= */
function viewClients() {
  return `
  <div class="page-head">
    <div><h1>Clients</h1><p class="lede">Individuals and corporate petitioners. Client records feed forms automatically to reduce duplicate data entry.</p></div>
    <div class="page-actions"><button class="btn btn-primary" onclick="demoAction('New client intake started')">+ Add client</button></div>
  </div>
  <div class="card"><div class="table-wrap"><table class="data">
    <thead><tr><th>Client</th><th>Type</th><th>Contact</th><th>Country</th><th>A-Number</th><th>Active matters</th><th>Portal</th><th>Client since</th></tr></thead>
    <tbody>${CLIENTS.map(cl => {
      const matters = CASES.filter(c => c.clientId === cl.id);
      return `<tr class="row-click" onclick="${matters[0] ? `location.hash='#/case/${matters[0].id}'` : ''}">
        <td class="cell-main">${esc(cl.name)}<div class="cell-sub">${esc(cl.employer !== '—' ? cl.employer : '')}</div></td>
        <td>${cl.type === 'Corporate' ? '<span class="pill pill-navy">Corporate</span>' : '<span class="pill pill-gray">Individual</span>'}</td>
        <td class="cell-sub">${esc(cl.email)}<br>${esc(cl.phone)}</td>
        <td>${esc(cl.country)}</td>
        <td style="font-variant-numeric:tabular-nums">${esc(cl.aNumber)}</td>
        <td>${matters.map(m => `<a href="#/case/${m.id}" onclick="event.stopPropagation()" style="font-size:.8rem">${esc(m.matter)}</a>`).join('<br>') || '<span class="cell-sub">—</span>'}</td>
        <td>${cl.portalStatus === 'Active' ? '<span class="pill pill-green">Portal active</span>' : cl.portalStatus === 'Invited' ? '<span class="pill pill-amber">Invited</span>' : '<span class="pill pill-gray">Not invited</span>'}</td>
        <td class="cell-sub">${fmtDate(cl.since)}</td></tr>`;
    }).join('')}</tbody></table></div></div>`;
}

/* =========================================================
   VIEW: Forms workspace
   ========================================================= */
function viewForms() {
  return `
  <div class="page-head">
    <div><h1>Forms</h1><p class="lede">Guided preparation with data reuse, field validation, contradiction detection, and attorney review checkpoints. Filing packets are generated for submission — this system does not file directly with USCIS.</p></div>
    <div class="page-actions"><button class="btn btn-primary" onclick="demoAction('Form started — client data pre-filled from records')">+ Start new form</button></div>
  </div>

  <div class="grid-2-1">
    <div class="stack">
      <div class="card">
        <div class="card-head"><h2>Forms in progress</h2><span class="sub">Across all matters</span></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Form</th><th>Matter</th><th>Completion</th><th>Prepared by</th><th>Review</th><th>Filing</th><th></th></tr></thead>
          <tbody>${CASE_FORMS.map(f => {
            const c = caseById(f.caseId);
            return `<tr>
              <td class="cell-main">${esc(f.form)}<div class="cell-sub">Edition ${esc(f.edition)}</div></td>
              <td><a href="#/case/${f.caseId}" style="font-size:.82rem">${esc(c.client)}<br><span class="cell-sub">${esc(c.matter)}</span></a></td>
              <td><div class="progress ${f.pct === 100 ? 'p-done' : ''}"><span style="width:${f.pct}%"></span></div><span class="cell-sub">${f.pct}%</span></td>
              <td>${esc(f.preparedBy)}</td><td>${statusPill(f.review)}</td><td class="cell-sub">${esc(f.filing)}</td>
              <td><button class="btn btn-sm btn-secondary" onclick="openFormDetail('${f.id}')">Open</button></td></tr>`;
          }).join('')}</tbody></table></div>
      </div>

      <div class="card card-pad" id="form-detail">
        ${formDetailHtml(CASE_FORMS[0])}
      </div>
    </div>

    <div class="stack">
      <div class="card">
        <div class="card-head"><h2>Form library</h2><span class="sub">Current USCIS editions</span></div>
        <div class="card-pad" style="max-height:420px;overflow:auto">
          ${FORMS_LIBRARY.map(f => `
            <div class="extract-row"><span><strong style="color:var(--navy)">${esc(f.form)}</strong><div class="cell-sub">${esc(f.name)}</div></span>
            <span style="text-align:right"><span class="cell-sub">${esc(f.edition)}</span><br><button class="btn btn-sm btn-ghost" onclick="demoAction('${f.form} draft created with client data pre-filled')">Start</button></span></div>`).join('')}
        </div>
      </div>
      <div class="card card-pad">
        <h3 style="margin-bottom:8px">Review checkpoints</h3>
        <ul class="sec-list">
          <li><span class="sec-ok">✓</span><span>Field-level validation runs as data is entered.</span></li>
          <li><span class="sec-ok">✓</span><span>Data reused from client and case records is marked with its source.</span></li>
          <li><span class="sec-ok">✓</span><span>Contradictions against prior filings are flagged beside the field.</span></li>
          <li><span class="sec-ok">✓</span><span>Attorney approval is required before any packet is generated.</span></li>
        </ul>
      </div>
    </div>
  </div>`;
}

function formDetailHtml(f) {
  const c = caseById(f.caseId);
  return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
      <div><h2 style="font-size:1.05rem">Form ${esc(f.form)} — ${esc(c.client)}</h2>
      <span class="cell-sub">${esc(c.matter)} · Edition ${esc(f.edition)} · Last saved ${esc(f.updated)} by ${esc(f.preparedBy)} · Version 7 <button class="btn btn-sm btn-ghost" onclick="demoAction('Version history: v1–v7 with diffs')">history</button></span></div>
      ${statusPill(f.review)}
    </div>

    <div class="mt" style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div class="field"><label style="display:block;font-size:.78rem;font-weight:700;color:var(--navy);margin-bottom:4px">Part 1 — Petitioner name</label>
        <input style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:6px" value="Innovatech Solutions LLC" aria-describedby="src1">
        <span class="cell-sub" id="src1">↳ Reused from client record (confirmed May 2026)</span></div>
      <div class="field"><label style="display:block;font-size:.78rem;font-weight:700;color:var(--navy);margin-bottom:4px">Part 3 — Beneficiary current address</label>
        <input style="width:100%;padding:8px 10px;border:1px solid var(--amber);border-radius:6px;background:var(--amber-soft)" value="4820 Maple Ave, Apt 12B, Dallas, TX 75219">
        <span class="cell-sub">↳ Reused from client record (updated Jul 2026)</span></div>
    </div>
    <div class="ai-note warn">⚠ <span><strong>Potential inconsistency:</strong> The client’s current address differs from the address entered in their previous I-129 filing (2023). Review before continuing. <button class="btn btn-sm btn-ghost" onclick="demoAction('Prior filing shown side-by-side')">Compare filings</button></span></div>
    ${f.flag ? `<div class="ai-note warn">⚠ <span>${esc(f.flag)}</span></div>` : ''}
    <div class="ai-note">ℹ <span><strong>Filing checklist:</strong> 9 of 11 items complete. Outstanding — LCA posting evidence confirmation, check for filing fee amount effective Jul 2026.</span></div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
      <button class="btn btn-secondary btn-sm" onclick="toast('Draft saved. Audit log updated.')">Save draft</button>
      <button class="btn btn-secondary btn-sm" onclick="demoAction('Client information request sent via portal')">Request client information</button>
      <button class="btn btn-secondary btn-sm" onclick="toast('Sent to Sarah Pollak for attorney review.')">Send for review</button>
      <button class="btn btn-primary btn-sm" onclick="confirmAction('Generate filing packet','This assembles the signed form, exhibits, and cover letter into a filing-ready PDF packet. It does not submit anything to USCIS. Continue?',()=>toast('Filing packet generated (48 pages). Ready for print/courier or online submission by authorized staff.'))">Generate filing packet</button>
      <button class="btn btn-navy btn-sm" onclick="demoAction('Marked as filed; USCIS submission details recorded')">Record USCIS submission</button>
      <button class="btn btn-ghost btn-sm" onclick="demoAction('PDF preview rendered')">PDF preview</button>
    </div>
    <p class="legal-note">Direct electronic filing with USCIS is not available for this form type. “Generate filing packet” prepares documents for filing by authorized firm personnel.</p>`;
}
function openFormDetail(fid) {
  const f = CASE_FORMS.find(x => x.id === fid);
  if (f) { $('#form-detail').innerHTML = formDetailHtml(f); $('#form-detail').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}

/* =========================================================
   VIEW: Documents
   ========================================================= */
function viewDocuments() {
  const q = state.docQuery.toLowerCase();
  let docs = DOCUMENTS.slice();
  if (state.docFolder) docs = docs.filter(d => d.folder === state.docFolder);
  if (q) docs = docs.filter(d => [d.name, d.client, d.folder, d.tags.join(' ')].join(' ').toLowerCase().includes(q));

  return `
  <div class="page-head">
    <div><h1>Documents</h1><p class="lede">Centralized, searchable document management with suggested categories you confirm, version history, duplicate detection, and expiration tracking.</p></div>
    <div class="page-actions">
      <button class="btn btn-secondary" onclick="demoAction('Bulk upload dialog')">Bulk upload</button>
      <button class="btn btn-primary" onclick="demoAction('Upload dialog')">+ Upload documents</button>
    </div>
  </div>

  <div class="filter-bar">
    <input type="search" style="flex:1;min-width:280px" placeholder='Smart search — try “Amit Patel latest passport”, “EADs expiring in 90 days”, “I-797 approvals this month”'
      value="${esc(state.docQuery)}" oninput="state.docQuery=this.value;renderKeepFocus(this)">
    ${['Amit Patel passport', 'expiring', 'I-797'].map(s => `<button class="btn btn-sm btn-ghost" onclick="state.docQuery='${s}';render()">“${s}”</button>`).join('')}
  </div>

  <div class="dropzone" ondragover="event.preventDefault();this.classList.add('drag')" ondragleave="this.classList.remove('drag')" ondrop="event.preventDefault();this.classList.remove('drag');toast('3 files received. Suggested categories are ready for your confirmation.','info')">
    Drag and drop files here — the system suggests a client, case, and folder for each file, and <strong>you confirm before anything is filed</strong>.
  </div>

  <div class="folder-grid mb">
    <button class="folder-card ${!state.docFolder ? 'active' : ''}" onclick="state.docFolder=null;render()">📚<div class="f-name">All documents</div><div class="f-count">${DOCUMENTS.length} files</div></button>
    ${DOC_FOLDERS.map(f => {
      const n = DOCUMENTS.filter(d => d.folder === f).length;
      return `<button class="folder-card ${state.docFolder === f ? 'active' : ''}" onclick="state.docFolder='${f}';render()">📁<div class="f-name">${f}</div><div class="f-count">${n} file${n === 1 ? '' : 's'}</div></button>`;
    }).join('')}
  </div>

  <div class="card">
    <div class="card-head"><h2>${state.docFolder ? esc(state.docFolder) : 'All documents'}</h2><span class="sub">${docs.length} result${docs.length === 1 ? '' : 's'}</span></div>
    <div class="table-wrap"><table class="data">
      <thead><tr><th>Document</th><th>Client / matter</th><th>Folder</th><th>Status</th><th>Expires</th><th></th></tr></thead>
      <tbody>
      ${docs.length === 0 ? `<tr><td colspan="6"><div class="empty"><div class="e-ico">🔍</div><h3>No documents found</h3><p>Try a different search, or clear the folder filter.</p><button class="btn btn-secondary" onclick="state.docQuery='';state.docFolder=null;render()">Clear search</button></div></td></tr>` : ''}
      ${docs.map(d => {
        const c = caseById(d.caseId);
        const exp = d.expires ? daysUntil(d.expires) : null;
        return `<tr>
          <td class="cell-main">${esc(d.name)} ${d.confidential ? '<span class="pill pill-red">Confidential</span>' : ''}
            <div class="cell-sub">${d.uploaded ? 'Uploaded ' + fmtDate(d.uploaded) + ' · ' + esc(d.by) : 'Requested — awaiting client'} · Tags: ${d.tags.join(', ')}</div></td>
          <td><a href="#/case/${d.caseId}" style="font-size:.84rem">${esc(d.client)}<br><span class="cell-sub">${esc(c?.matter || '')}</span></a></td>
          <td class="cell-sub">${esc(d.folder)}</td>
          <td>${statusPill(d.status)}</td>
          <td>${d.expires ? (exp <= 90 ? `<span class="pill pill-red">${fmtDate(d.expires)}</span>` : fmtDate(d.expires)) : '—'}</td>
          <td style="white-space:nowrap"><button class="btn btn-sm btn-ghost" onclick="demoAction('Preview opened')">Preview</button><button class="btn btn-sm btn-ghost" onclick="demoAction('Secure share link created (expires in 7 days, download disabled)')">Share</button></td></tr>`;
      }).join('')}
      </tbody></table></div>
  </div>`;
}

/* =========================================================
   VIEW: USCIS Notice Inbox
   ========================================================= */
function viewNotices() {
  const sel = NOTICES.find(n => n.id === state.selectedNotice) || NOTICES[0];
  return `
  <div class="page-head">
    <div><h1>USCIS Notice Inbox</h1>
      <p class="lede">Notices arrive from connected email inboxes, client portal uploads, staff uploads, scanned mail, and manual entry. Each is read, matched, and held for human review before it is filed.</p></div>
    <div class="page-actions">
      <button class="btn btn-secondary" onclick="demoAction('Manual notice entry opened')">+ Manual entry</button>
      <button class="btn btn-primary" onclick="demoAction('Upload dialog for scanned notices')">Upload notice</button>
    </div>
  </div>

  <div class="card mb">
    <div class="card-head"><h2>The connected workflow</h2><span class="sub">Live status for notice ${esc(NOTICES[0].receiptNumber)} — every step is recorded in the audit log</span></div>
    <div class="card-pad">
      <div class="workflow">
        ${WORKFLOW_STEPS.map((s, i) => `
          <div class="wf-step ${state.noticeApproved['n1'] ? 'done' : s.state}">
            <div class="wf-node">${state.noticeApproved['n1'] || s.state === 'done' ? '✓' : i + 1}</div>
            <div class="wf-label">${esc(s.label)}</div>
            <div class="wf-detail">${esc(s.detail)}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <div class="grid-2-1" style="grid-template-columns:minmax(300px,2fr) 5fr">
    <div class="card inbox-list" style="align-self:start">
      <div class="card-head"><h2>Inbox</h2><span class="sub">${NOTICES.filter(n => n.status === 'Needs review' && !state.noticeApproved[n.id]).length} need review</span></div>
      ${NOTICES.map(n => {
        const filed = state.noticeApproved[n.id] || n.status === 'Filed';
        return `<button class="inbox-item ${sel.id === n.id ? 'selected' : ''} ${!filed ? 'unread' : ''}" onclick="state.selectedNotice='${n.id}';render()">
          <span class="dot ${filed ? 'dot-green' : n.ambiguous ? 'dot-red' : 'dot-orange'}"></span>
          <span><span class="ii-type" style="font-size:.85rem;color:var(--navy)">${esc(n.noticeType)}</span><br>
          <span class="cell-sub">${esc(n.client)} · ${esc(n.formType)}</span></span>
          <span class="cell-sub" style="text-align:right">${esc(n.received)}<br>${confLabel(n.confidence)}</span>
        </button>`;
      }).join('')}
    </div>

    <div>${noticeReviewHtml(sel)}</div>
  </div>`;
}

function noticeReviewHtml(n) {
  const filed = state.noticeApproved[n.id] || n.status === 'Filed';
  const c = n.caseId ? caseById(n.caseId) : null;
  return `
  ${n.ambiguous && !filed ? `<div class="review-banner">⚠ <span><strong>Human review required.</strong> The beneficiary name on this notice (“Rodriquez”) does not exactly match any client record. Low-confidence matches are never filed automatically.</span></div>`
    : !filed ? `<div class="review-banner">👁 <span><strong>Awaiting review.</strong> Automatically extracted information must be reviewed by authorized firm personnel before filing or relying on it for a legal deadline.</span></div>`
    : `<div class="success-banner">✓ <span><strong>Filed.</strong> ${n.id === 'n1' ? 'Receipt notice filed under David Kim → I-485 Adjustment of Status → Government Notices. Receipt number and case status were updated. Review and status-check reminders were created.' : `This notice was reviewed, approved, and filed under ${esc(n.client)} → Government Notices.`}</span></div>`}

  <div class="notice-split">
    <div class="pdf-mock" aria-label="Original notice document">
      <div class="pdf-page">
        <div class="pdf-head"><span>U.S. Department of Homeland Security</span><span>Form I-797C</span></div>
        <div style="text-align:center;font-weight:700;margin-bottom:8px">THIS NOTICE DOES NOT GRANT ANY IMMIGRATION STATUS OR BENEFIT.</div>
        <table>
          <tr><td>RECEIPT NUMBER<br><strong class="hl">${esc(n.receiptNumber)}</strong></td><td>CASE TYPE<br><strong class="hl">${esc(n.formType)}</strong></td></tr>
          <tr><td>RECEIVED DATE<br><strong>${fmtDate(n.noticeDate)}</strong></td><td>PRIORITY DATE<br><strong class="hl">${esc(n.priorityDate)}</strong></td></tr>
          <tr><td>PETITIONER/APPLICANT<br><strong class="hl">${esc(n.petitioner !== '—' ? n.petitioner : n.beneficiary)}</strong></td><td>BENEFICIARY<br><strong class="hl">${esc(n.beneficiary)}</strong></td></tr>
          <tr><td colspan="2">NOTICE TYPE: <strong class="hl">${esc(n.noticeType)}</strong>${n.responseDeadline ? ` — RESPONSE DUE <strong class="hl">${fmtDate(n.responseDeadline)}</strong>` : ''}${n.apptDate ? ` — APPOINTMENT <strong class="hl">${esc(n.apptDate)}</strong>` : ''}</td></tr>
        </table>
        <p style="margin-top:6px">${esc(n.serviceCenter)} · A# ${esc(n.aNumber)}${n.validity ? ' · VALID ' + esc(n.validity) : ''}</p>
        <p style="margin-top:10px;font-size:.62rem;color:#666">Source: ${esc(n.source)} · Received ${esc(n.received)} · SAMPLE DOCUMENT — prototype rendering of the original PDF. Highlighted regions show where each field was read.</p>
      </div>
    </div>

    <div class="stack">
      <div class="card card-pad">
        <h3 style="margin-bottom:4px">Extracted information</h3>
        <p class="cell-sub" style="margin-bottom:8px">Overall confidence ${confLabel(n.confidence)} · each field shows its own score</p>
        ${n.fields.map(f => `
          <div class="extract-row"><span class="k">${esc(f.label)}</span>
            <span style="display:flex;gap:10px;align-items:center"><span class="v">${esc(f.value)}</span>${confLabel(f.conf)}</span></div>`).join('')}
      </div>

      <div class="card card-pad">
        <h3 style="margin-bottom:8px">Suggested filing</h3>
        <div class="extract-row"><span class="k">Client match</span><span class="v">${n.caseId ? esc(c.client) : '<span class="conf conf-low">No confident match</span> — Maria Rodriguez (64%)?'}</span></div>
        <div class="extract-row"><span class="k">Case match</span><span class="v">${n.caseId ? `${esc(c.matter)} · ${esc(c.type)}` : 'PLK-2024-0182 · H-1B Extension (suggested)'}</span></div>
        <div class="extract-row"><span class="k">Document folder</span><span class="v">${esc(n.suggestedFolder)}</span></div>
        <div class="extract-row" style="border-bottom:0"><span class="k">Deadlines to create</span>
          <span class="v" style="font-weight:500">${n.suggestedDeadlines.map(esc).join('<br>')}</span></div>
      </div>

      ${!filed ? `
      <div class="card card-pad">
        <h3 style="margin-bottom:10px">Review actions</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-primary" ${n.ambiguous ? 'disabled title="Resolve the client match before filing"' : ''} onclick="approveNotice('${n.id}')">✓ Approve and file</button>
          <button class="btn btn-secondary" onclick="demoAction('Field correction mode enabled — corrected values are logged with your name')">Correct extracted information</button>
          <button class="btn btn-secondary" onclick="demoAction('Case picker opened')">Select another case</button>
          <button class="btn btn-secondary" onclick="demoAction('New matter dialog pre-filled from this notice')">Create a new matter</button>
          <button class="btn btn-secondary" onclick="demoAction('Assigned to Daniel Reyes for review')">Assign for review</button>
          <button class="btn btn-danger-ghost" onclick="confirmAction('Reject as duplicate','This marks the notice as a duplicate of an existing filed notice. It stays in the audit trail but is not filed to the case. Continue?',()=>toast('Notice rejected as duplicate. Audit entry recorded.'))">Reject as duplicate</button>
        </div>
        ${n.ambiguous ? `<div class="ai-note warn" style="margin-top:12px">⚠ <span>“Approve and file” is disabled until a reviewer confirms the correct client. Choose <strong>Select another case</strong> or <strong>Correct extracted information</strong> first.</span></div>` : ''}
        <p class="legal-note">Approving files the original PDF to the case, updates the receipt number and case status, creates the listed deadlines with reminder schedules, and records every step in the audit log under your name.</p>
      </div>` : `
      <div class="card card-pad">
        <h3 style="margin-bottom:8px">Audit trail for this notice</h3>
        <ul class="vtl">
          <li><div class="vtl-date">Received</div><div class="vtl-sub">${esc(n.source)} · ${esc(n.received)}</div></li>
          <li><div class="vtl-date">Extracted</div><div class="vtl-sub">Automated read at ${n.confidence}% overall confidence</div></li>
          <li><div class="vtl-date">Reviewed & filed</div><div class="vtl-sub">Approved by ${esc(currentUser().name)} · deadlines created with reminder schedules</div></li>
        </ul>
      </div>`}
    </div>
  </div>`;
}

function approveNotice(id) {
  const n = NOTICES.find(x => x.id === id);
  confirmAction('Approve and file this notice?',
    `This will file the notice under <strong>${esc(n.client)} → ${esc(caseById(n.caseId)?.type || '')} → Government Notices</strong>, update the receipt number and case status, and create ${n.suggestedDeadlines.length} deadline(s) with reminders. Every step is recorded in the audit log under your name.`,
    () => {
      state.noticeApproved[id] = true;
      render();
      toast(`Receipt notice filed under ${n.client} → ${caseById(n.caseId)?.type || 'case'} → Government Notices. Receipt number and case status were updated. ${n.suggestedDeadlines.length} reminder(s) were created.`);
    }, 'Approve and file');
}

/* =========================================================
   VIEW: Calendar & Deadlines
   ========================================================= */
function viewCalendar() {
  const mode = state.calMode;
  return `
  <div class="page-head">
    <div><h1>Calendar & Deadlines</h1>
      <p class="lede">One consolidated immigration calendar: RFEs, NOIDs, expirations, priority-date monitoring, PERM dates, biometrics, interviews, and filings. Automatically created deadlines always show their source and who approved them.</p></div>
    <div class="page-actions">
      ${['month', 'list', 'timeline'].map(m => `<button class="btn btn-sm ${mode === m ? 'btn-navy' : 'btn-secondary'}" onclick="state.calMode='${m}';render()">${m[0].toUpperCase() + m.slice(1)} view</button>`).join('')}
      <button class="btn btn-primary btn-sm" onclick="demoAction('Deadline dialog')">+ Add deadline</button>
    </div>
  </div>

  <div class="filter-bar">
    <label>Scope <select onchange="demoAction('Calendar scope changed')"><option>Firm-wide</option><option>My deadlines</option><option>Sarah Pollak</option><option>Daniel Reyes</option><option>By case…</option></select></label>
    <label>Type <select onchange="demoAction('Type filter applied')"><option>All types</option><option>RFE response</option><option>NOID response</option><option>Visa expiration</option><option>Passport expiration</option><option>EAD expiration</option><option>I-94 expiration</option><option>Priority-date monitoring</option><option>PERM deadlines</option><option>Biometrics appointment</option><option>Interview</option><option>Filing deadline</option><option>Renewal preparation</option><option>Client follow-up</option><option>Internal review</option></select></label>
    <span style="margin-left:auto;font-size:.76rem;color:var(--muted)"><span class="dot dot-red"></span> Urgent/overdue · <span class="dot dot-amber"></span> Needs attention · <span class="dot dot-gray"></span> Scheduled</span>
  </div>

  ${mode === 'month' ? calMonth() : mode === 'list' ? calList() : calTimeline()}

  <div class="card mt card-pad">
    <h3 style="margin-bottom:8px">Reminder schedules</h3>
    <p style="font-size:.85rem;color:var(--muted)">Configurable per deadline type. Current firm defaults:</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
      ${['180 days before', '120 days before', '90 days before', '60 days before', '30 days before', '7 days before', 'Same day'].map(r => `<span class="pill pill-navy">${r}</span>`).join('')}
      <button class="btn btn-sm btn-ghost" onclick="demoAction('Reminder schedule editor opened')">Edit defaults</button>
    </div>
  </div>`;
}

function calMonth() {
  const first = new Date(2026, 6, 1);
  const startDow = first.getDay();
  const daysInMonth = 31;
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(`<div class="cal-cell other"><span class="d">${28 + i} Jun</span></div>`);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `2026-07-${String(d).padStart(2, '0')}`;
    const evts = DEADLINES.filter(x => x.date === iso);
    cells.push(`<div class="cal-cell ${d === 15 ? 'today' : ''}">
      <span class="d">${d}${d === 15 ? ' · Today' : ''}</span>
      ${evts.map(e => `<button class="cal-evt ${e.urgency}" title="${esc(e.title)} — source: ${esc(e.source)}" onclick="location.hash='#/case/${e.caseId}'">${esc(e.title)}</button>`).join('')}
    </div>`);
  }
  const rem = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= rem; i++) cells.push(`<div class="cal-cell other"><span class="d">${i} Aug</span></div>`);
  return `<div class="card card-pad">
    <h2 style="margin-bottom:12px">July 2026</h2>
    <div class="cal-grid">
      ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="cal-dow">${d}</div>`).join('')}
      ${cells.join('')}
    </div></div>`;
}

function calList() {
  return `<div class="card"><div class="table-wrap"><table class="data">
    <thead><tr><th>Date</th><th>Deadline</th><th>Type</th><th>Case</th><th>Owner</th><th>Source & confidence</th><th>Approved by</th><th>Reminders</th></tr></thead>
    <tbody>${DEADLINES.slice().sort((a, b) => a.date.localeCompare(b.date)).map(d => {
      const c = caseById(d.caseId);
      return `<tr class="row-click" onclick="location.hash='#/case/${d.caseId}'">
        <td>${dueBadge(d.date)}</td><td class="cell-main">${esc(d.title)}</td><td>${esc(d.type)}</td>
        <td class="cell-sub">${esc(c?.matter || '')}</td><td>${esc(d.owner)}</td>
        <td class="cell-sub">${esc(d.source)}</td><td class="cell-sub">${esc(d.approvedBy)}</td>
        <td class="cell-sub">${d.reminders.join(' · ')}</td></tr>`;
    }).join('')}</tbody></table></div></div>`;
}

function calTimeline() {
  return `<div class="card card-pad"><ul class="vtl">
    ${DEADLINES.slice().sort((a, b) => a.date.localeCompare(b.date)).map(d => `
      <li class="${d.urgency}">
        <div class="vtl-date">${fmtDate(d.date)} · ${esc(d.type)}</div>
        <div class="vtl-title"><a href="#/case/${d.caseId}" style="text-decoration:none;color:inherit">${esc(d.title)}</a></div>
        <div class="vtl-sub">Owner ${esc(d.owner)} · Source: ${esc(d.source)} · Approved by ${esc(d.approvedBy)}</div>
      </li>`).join('')}
  </ul></div>`;
}

/* =========================================================
   VIEW: Tasks
   ========================================================= */
const TASK_VIEWS = [['my', 'My tasks'], ['team', 'Team tasks'], ['today', 'Due today'], ['overdue', 'Overdue'], ['client', 'Waiting on client'], ['attorney', 'Waiting on attorney'], ['done', 'Completed']];

function viewTasks() {
  const u = currentUser();
  let rows = TASKS.slice();
  switch (state.taskView) {
    case 'my': rows = rows.filter(t => t.assignee === u.name && t.status !== 'Completed'); break;
    case 'team': rows = rows.filter(t => t.status !== 'Completed'); break;
    case 'today': rows = rows.filter(t => daysUntil(t.due) === 0 || (daysUntil(t.due) === 1 && t.status !== 'Completed')); break;
    case 'overdue': rows = rows.filter(t => daysUntil(t.due) < 0 && t.status !== 'Completed'); break;
    case 'client': rows = rows.filter(t => t.waitingOn === 'Client'); break;
    case 'attorney': rows = rows.filter(t => t.waitingOn === 'Attorney'); break;
    case 'done': rows = rows.filter(t => t.status === 'Completed'); break;
  }
  return `
  <div class="page-head">
    <div><h1>Tasks</h1><p class="lede">Legal task management with checklists, dependencies, and clear ownership. Attorneys can assign work to paralegals and legal assistants; internal notes are never exposed to clients.</p></div>
    <div class="page-actions"><button class="btn btn-primary" onclick="demoAction('Task dialog')">+ New task</button></div>
  </div>
  <div class="saved-views">
    ${TASK_VIEWS.map(([id, label]) => `<button class="${state.taskView === id ? 'active' : ''}" onclick="state.taskView='${id}';render()">${label}</button>`).join('')}
  </div>
  <div class="stack">
    ${rows.map(t => `<div class="card">${taskCard(t)}
      <div style="display:flex;gap:8px;padding:0 18px 14px">
        <button class="btn btn-sm btn-secondary" onclick="location.hash='#/case/${t.caseId}'">Open case</button>
        ${t.status !== 'Completed' ? `<button class="btn btn-sm btn-primary" onclick="toast('Task “${esc(t.title)}” marked complete. Audit log updated.')">Mark complete</button>` : ''}
        <button class="btn btn-sm btn-ghost" onclick="demoAction('Reassignment dialog')">Reassign</button>
      </div></div>`).join('') || `<div class="card"><div class="empty"><div class="e-ico">✅</div><h3>Nothing here</h3><p>No tasks match this view. Enjoy the quiet moment — they’re rare in immigration practice.</p></div></div>`}
  </div>`;
}

/* =========================================================
   VIEW: Reports
   ========================================================= */
function barChart(rows, colorAlt) {
  const max = Math.max(...rows.map(r => r[1]));
  return rows.map(([label, val], i) => `
    <div class="bar-row"><span>${esc(label)}</span>
      <div class="bar-track"><div class="bar-fill ${colorAlt && i % 2 ? 'orange' : ''}" style="width:${(val / max) * 100}%"></div></div>
      <span class="bar-val">${val}</span></div>`).join('');
}

function viewReports() {
  const R = REPORTS;
  return `
  <div class="page-head">
    <div><h1>Reports</h1><p class="lede">Operational reporting for firm leadership. Every report is exportable to PDF and CSV.</p></div>
    <div class="page-actions">
      <button class="btn btn-secondary" onclick="demoAction('Report exported to CSV')">Export CSV</button>
      <button class="btn btn-secondary" onclick="demoAction('Report exported to PDF')">Export PDF</button>
    </div>
  </div>

  <div class="stat-grid">
    <div class="stat-card"><span class="num">64</span><span class="lbl">Active cases firm-wide</span></div>
    <div class="stat-card"><span class="num">${R.noticeProcessing.count30d}</span><span class="lbl">Notices processed (30 days)</span></div>
    <div class="stat-card"><span class="num">${R.noticeProcessing.avgMinutes} min</span><span class="lbl">Median notice → filed time</span></div>
    <div class="stat-card warn"><span class="num">2</span><span class="lbl">Overdue deadlines</span></div>
    <div class="stat-card"><span class="num">92%</span><span class="lbl">Document requests completed ≤ 14 days</span></div>
  </div>

  <div class="grid-2 mb">
    <div class="card"><div class="card-head"><h2>Active cases by type</h2></div><div class="card-pad">${barChart(R.casesByType)}</div></div>
    <div class="card"><div class="card-head"><h2>Average case preparation time (days)</h2></div><div class="card-pad">${barChart(R.prepTimeDays, true)}</div></div>
  </div>

  <div class="grid-2 mb">
    <div class="card">
      <div class="card-head"><h2>Notice processing (last 30 days)</h2></div>
      <div class="card-pad">
        <div class="extract-row"><span class="k">Notices received</span><span class="v">${R.noticeProcessing.count30d}</span></div>
        <div class="extract-row"><span class="k">Matched to a case automatically</span><span class="v">${R.noticeProcessing.autoMatched}%</span></div>
        <div class="extract-row"><span class="k">Reviewed by a person before filing</span><span class="v">${R.noticeProcessing.humanReviewed}% — always</span></div>
        <div class="extract-row" style="border:0"><span class="k">Median time from receipt to filed</span><span class="v">${R.noticeProcessing.avgMinutes} minutes</span></div>
        <p class="legal-note">Every notice, including high-confidence matches, requires human approval before filing. The metric above measures how quickly reviewers can act, not unattended automation.</p>
      </div>
    </div>
    <div class="card"><div class="card-head"><h2>Case source / referral source</h2></div><div class="card-pad">${barChart(R.referrals, true)}</div></div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-head"><h2>Team capacity</h2></div>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Member</th><th>Active cases</th><th>Overdue tasks</th><th>Deadlines (30d)</th></tr></thead>
        <tbody>${R.teamCapacity.map(([n, c, o, d]) => `<tr><td class="cell-main">${n}</td><td>${c}</td><td>${o ? `<span class="pill pill-red">${o}</span>` : '0'}</td><td>${d}</td></tr>`).join('')}</tbody>
      </table></div>
    </div>
    <div class="card">
      <div class="card-head"><h2>Operational risk flags</h2><span class="sub">Cases needing leadership attention</span></div>
      <div class="card-pad"><ul class="vtl">
        <li class="urgent"><div class="vtl-date">RFE due Jul 22</div><div class="vtl-title">Amit Patel — I-485 RFE — evidence still outstanding</div><div class="vtl-sub">Owner: S. Pollak</div></li>
        <li class="attention"><div class="vtl-date">No activity 16 days</div><div class="vtl-title">Carlos Mendoza — TPS re-registration — G-28 unsigned</div><div class="vtl-sub">Re-registration window closes Aug 15</div></li>
        <li class="attention"><div class="vtl-date">Unmatched notice</div><div class="vtl-title">Approval notice WAC2611230981 — name mismatch, held for review</div><div class="vtl-sub">In Notice Inbox since Jul 14</div></li>
      </ul></div>
    </div>
  </div>`;
}

/* =========================================================
   VIEW: Integrations
   ========================================================= */
function viewIntegrations() {
  const groups = [...new Set(INTEGRATIONS.map(i => i.group))];
  return `
  <div class="page-head">
    <div><h1>Integrations</h1>
      <p class="lede">Each connection states exactly what it imports, exports, or synchronizes — and shows its last sync and error state. Nothing here is described as more than it is.</p></div>
    <div class="page-actions"><button class="btn btn-secondary" onclick="demoAction('Integration audit log opened')">Audit details</button></div>
  </div>
  ${groups.map(g => `
    <h2 style="margin:18px 0 10px">${g}</h2>
    <div class="grid-2">
      ${INTEGRATIONS.filter(i => i.group === g).map(i => `
      <div class="card integration-card">
        <div class="i-head"><span class="i-name">${esc(i.name)}</span>${statusPill(i.status)}</div>
        ${i.error ? `<div class="error-banner">⚠ ${esc(i.error)}</div>` : ''}
        <dl class="i-meta">
          <dt>Account</dt><dd>${esc(i.account)}</dd>
          <dt>Last sync</dt><dd>${esc(i.lastSync)}</dd>
        </dl>
        <p class="i-desc">${esc(i.syncs)}</p>
        <div style="display:flex;gap:8px">
          ${i.status === 'Connected' ? `<button class="btn btn-sm btn-secondary" onclick="demoAction('Sync run for ${esc(i.name)}')">Sync now</button><button class="btn btn-sm btn-ghost" onclick="demoAction('Connection settings for ${esc(i.name)}')">Settings</button>`
          : i.status === 'Error' ? `<button class="btn btn-sm btn-primary" onclick="toast('${esc(i.name)} reconnected. Pending items will export on the next sync.')">Reconnect</button>`
          : `<button class="btn btn-sm btn-secondary" onclick="demoAction('Connection wizard for ${esc(i.name)}')">Connect</button>`}
          <button class="btn btn-sm btn-ghost" onclick="demoAction('Audit trail for ${esc(i.name)}')">Audit</button>
        </div>
      </div>`).join('')}
    </div>`).join('')}`;
}

/* =========================================================
   VIEW: Firm Administration
   ========================================================= */
function viewAdmin() {
  return `
  <div class="page-head">
    <div><h1>Firm Administration</h1><p class="lede">Users, permissions, templates, workflow settings, and the firm’s security posture.</p></div>
  </div>

  <div class="grid-2 mb">
    <div class="card">
      <div class="card-head"><h2>Users & roles</h2><button class="btn btn-sm btn-primary" onclick="demoAction('User invitation sent')">+ Invite user</button></div>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>User</th><th>Role</th><th>MFA</th><th>Last active</th><th></th></tr></thead>
        <tbody>${USERS.map(u => `<tr>
          <td class="cell-main"><span class="avatar" style="width:26px;height:26px;font-size:.66rem;display:inline-flex;margin-right:8px;background:${u.color};color:#fff">${u.initials}</span>${u.name}<div class="cell-sub">${u.email}</div></td>
          <td>${u.title}</td><td><span class="pill pill-green">Enabled</span></td>
          <td class="cell-sub">${u.id === 'u1' ? 'Now' : 'Today'}</td>
          <td><button class="btn btn-sm btn-ghost" onclick="demoAction('Permission editor for ${u.name}')">Permissions</button></td></tr>`).join('')}</tbody>
      </table></div>
    </div>

    <div class="card">
      <div class="card-head"><h2>Role-based access</h2><span class="sub">What each role can see and do</span></div>
      <div class="card-pad">
        ${[['Attorney', 'Review & approve forms and notices · file matters · see all matter data including risk notes · approve deadlines'],
           ['Paralegal', 'Prepare forms · process notices (submit for attorney approval) · manage documents & client follow-up'],
           ['Legal assistant', 'Intake · scheduling · uploads & organization · no access to confidential attorney notes'],
           ['Firm administrator', 'User management · templates · workflow settings · integrations · reports · no matter-level legal edits by default'],
           ['Client (portal)', 'Own case progress, requests, uploads, appointments, and secure messages only — never internal notes or risk assessments']]
          .map(([r, d]) => `<div class="extract-row"><span class="k" style="min-width:120px">${r}</span><span style="font-size:.82rem;text-align:right">${d}</span></div>`).join('')}
      </div>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-head"><h2>Security & legal safeguards</h2></div>
      <div class="card-pad"><ul class="sec-list">
        <li><span class="sec-ok">✓</span><span><strong>Role-based access control</strong> with matter-level permissions and confidential-document labels.</span></li>
        <li><span class="sec-ok">✓</span><span><strong>Multi-factor authentication</strong> enforced for all firm users; clients use email verification codes.</span></li>
        <li><span class="sec-ok">✓</span><span><strong>Encryption</strong> in transit (TLS 1.3) and at rest (AES-256). Indicator shown in the top bar of every session.</span></li>
        <li><span class="sec-ok">✓</span><span><strong>Write-once audit logs</strong> for every field change, filing, and automated action — with actor, time, and method.</span></li>
        <li><span class="sec-ok">✓</span><span><strong>Session management</strong>: automatic logout after 20 minutes idle; active sessions listed and revocable.</span></li>
        <li><span class="sec-ok">✓</span><span><strong>Download controls</strong>: shared links can disable download and expire automatically.</span></li>
        <li><span class="sec-ok">✓</span><span><strong>Data retention settings</strong> per document class; closed-matter archives per firm policy.</span></li>
        <li><span class="sec-ok">✓</span><span><strong>Backups</strong>: nightly, encrypted, last verified restore test Jul 1, 2026.</span></li>
        <li><span class="sec-ok">✓</span><span><strong>Consent & authorization records</strong> stored with each client (engagement letter, G-28, communications consent).</span></li>
      </ul>
      <div class="ai-note warn" style="margin-top:12px">⚠ <span><strong>Extraction policy:</strong> Automatically extracted information must be reviewed by authorized firm personnel before filing or relying on it for a legal deadline. Confidence scores are shown on every extracted field, and low-confidence or ambiguous matches are always held for human review.</span></div>
      </div>
    </div>

    <div class="stack">
      <div class="card">
        <div class="card-head"><h2>Workflow settings</h2></div>
        <div class="card-pad">
          ${[['Notice auto-filing', 'Off — every notice requires human approval (recommended)'],
             ['Minimum confidence to suggest a match', '75% (below this, no suggestion is shown)'],
             ['Deadline reminder defaults', '180/90/30/7 days + same day, by deadline type'],
             ['Attorney review checkpoint', 'Required before packet generation on all form types'],
             ['Client portal document requests', 'Templates managed by firm administrator']]
            .map(([k, v]) => `<div class="extract-row"><span class="k">${k}</span><span class="v" style="font-weight:500;text-align:right;max-width:55%">${v}</span></div>`).join('')}
          <button class="btn btn-sm btn-secondary" style="margin-top:10px" onclick="demoAction('Workflow settings editor')">Edit workflow settings</button>
        </div>
      </div>
      <div class="card card-pad">
        <h3 style="margin-bottom:8px">Templates</h3>
        <p style="font-size:.84rem;color:var(--muted)">Engagement letters, document request lists by case type, client questionnaires, RFE response shells, and cover letters.</p>
        <button class="btn btn-sm btn-secondary" style="margin-top:10px" onclick="demoAction('Template manager opened')">Manage templates</button>
      </div>
    </div>
  </div>`;
}

/* =========================================================
   VIEW: Client Portal (preview)
   ========================================================= */
function viewPortal() {
  return `
  <div class="portal-wrap">
    <div class="review-banner" style="margin-bottom:16px">👁 <span><strong>Staff preview.</strong> You are viewing the client portal as ${esc(PORTAL.client)} sees it. Internal notes, risk assessments, and task assignments are never shown here.</span></div>

    <div class="portal-hero">
      <span class="wordmark" style="display:flex;align-items:baseline;gap:3px">
        <span style="font-size:1.5rem;font-weight:800;color:var(--orange);letter-spacing:-0.03em">pollak</span>
        <span style="font-size:.6rem;color:var(--orange);font-weight:600">pllc</span>
      </span>
      <h1 style="margin-top:10px">Welcome back, Maria</h1>
      <p style="color:#C4D1DE;font-size:.92rem;margin-top:4px">${esc(PORTAL.matterLabel)} — here’s where things stand and what we need from you.</p>
    </div>

    <div class="card mb">
      <div class="card-head"><h2>Your case progress</h2></div>
      <div class="card-pad">
        <ol class="portal-steps">
          ${PORTAL.progress.map((s, i) => `<li class="${s.done ? 'done' : ''} ${s.current ? 'current' : ''}">
            <span class="ps-node">${s.done ? '✓' : i + 1}</span><span>${esc(s.step)}${s.current ? ' — happening now' : ''}</span></li>`).join('')}
        </ol>
      </div>
    </div>

    <div class="card mb">
      <div class="card-head"><h2>What we need from you</h2><span class="sub">2 items</span></div>
      <div class="card-pad stack" style="gap:12px">
        ${PORTAL.actions.map(a => `
        <div style="border:1px solid var(--border);border-radius:8px;padding:14px 16px">
          <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
            <span style="font-size:.92rem;max-width:60ch">${esc(a.text)}</span>
            <span class="pill ${a.status.startsWith('Received') ? 'pill-green' : 'pill-amber'}">${esc(a.status)}</span>
          </div>
          <div style="display:flex;gap:8px;margin-top:10px">
            ${a.kind === 'upload' ? `<button class="btn btn-sm btn-primary" onclick="toast('Thank you! Your document was uploaded securely. Our team will review it.')">Upload document</button>` :
              `<button class="btn btn-sm btn-primary" onclick="toast('Thank you! Your address was confirmed.')">Confirm address</button>
               <button class="btn btn-sm btn-secondary" onclick="demoAction('Address update form')">Something changed</button>`}
          </div>
        </div>`).join('')}
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-head"><h2>Upcoming appointments</h2></div>
        <div class="card-pad">${PORTAL.appointments.map(a => `<p style="font-size:.9rem"><strong style="color:var(--navy)">${esc(a.date)}</strong><br><span style="color:var(--muted);font-size:.84rem">${esc(a.note)}</span></p>`).join('')}</div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Messages</h2><button class="btn btn-sm btn-primary" onclick="toast('Your message was sent securely to your legal team.')">New message</button></div>
        <div class="card-pad">
          ${PORTAL.messages.map(m => `
          <div style="margin-bottom:12px;${m.from === 'You' ? 'text-align:right' : ''}">
            <div class="cell-sub">${esc(m.from)} · ${esc(m.ts)}</div>
            <div style="display:inline-block;background:${m.from === 'You' ? 'var(--orange-soft)' : 'var(--navy-soft)'};border-radius:10px;padding:8px 13px;font-size:.87rem;max-width:85%;text-align:left">${esc(m.text)}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="card mt card-pad" style="text-align:center">
      <p style="font-size:.8rem;color:var(--muted)">🔒 Your information is encrypted and only visible to you and your legal team at Pollak PLLC.<br>
      Questions? Call <strong>214-305-2266</strong> or email <strong>info@pollakimmigration.com</strong>.</p>
      <button class="btn btn-sm btn-ghost" style="margin-top:8px" onclick="demoAction('Contact information update form')">Update my contact information</button>
    </div>
  </div>`;
}

/* =========================================================
   Global search
   ========================================================= */
function runSearch(q) {
  const box = $('#search-results');
  if (!q || q.length < 2) { box.hidden = true; return; }
  const ql = q.toLowerCase();
  const cases = CASES.filter(c => [c.client, c.matter, c.type, c.receipt].join(' ').toLowerCase().includes(ql)).slice(0, 4);
  const docs = DOCUMENTS.filter(d => (d.name + ' ' + d.client).toLowerCase().includes(ql)).slice(0, 3);
  const notices = NOTICES.filter(n => (n.receiptNumber + ' ' + n.client + ' ' + n.noticeType).toLowerCase().includes(ql)).slice(0, 3);
  const dls = DEADLINES.filter(d => d.title.toLowerCase().includes(ql)).slice(0, 3);
  let html = '';
  if (cases.length) html += `<div class="sr-group">Cases & clients</div>` + cases.map(c => `<button onclick="location.hash='#/case/${c.id}';$('#search-results').hidden=true"><strong>${esc(c.client)}</strong> — ${esc(c.type)}<div class="sr-sub">${esc(c.matter)} · ${esc(c.receipt)}</div></button>`).join('');
  if (notices.length) html += `<div class="sr-group">USCIS notices</div>` + notices.map(n => `<button onclick="state.selectedNotice='${n.id}';location.hash='#/notices';$('#search-results').hidden=true"><strong>${esc(n.receiptNumber)}</strong> — ${esc(n.noticeType)}<div class="sr-sub">${esc(n.client)}</div></button>`).join('');
  if (docs.length) html += `<div class="sr-group">Documents</div>` + docs.map(d => `<button onclick="state.docQuery='${esc(d.name.split(' — ')[0])}';location.hash='#/documents';$('#search-results').hidden=true"><strong>${esc(d.name)}</strong><div class="sr-sub">${esc(d.client)} · ${esc(d.folder)}</div></button>`).join('');
  if (dls.length) html += `<div class="sr-group">Deadlines</div>` + dls.map(d => `<button onclick="location.hash='#/calendar';state.calMode='list';$('#search-results').hidden=true"><strong>${fmtShort(d.date)}</strong> — ${esc(d.title)}<div class="sr-sub">${esc(d.type)}</div></button>`).join('');
  box.innerHTML = html || `<div class="sr-group">No results</div><button disabled>Nothing matched “${esc(q)}” across clients, cases, receipt numbers, forms, documents, or deadlines.</button>`;
  box.hidden = false;
}

/* =========================================================
   Router
   ========================================================= */
const ROUTES = {
  dashboard: viewDashboard, cases: viewCases, clients: viewClients, forms: viewForms,
  documents: viewDocuments, notices: viewNotices, calendar: viewCalendar, tasks: viewTasks,
  reports: viewReports, integrations: viewIntegrations, admin: viewAdmin, portal: viewPortal,
};

function render() {
  const hash = location.hash || '#/dashboard';
  const [path, query] = hash.slice(2).split('?');
  const params = new URLSearchParams(query || '');
  const [route, arg] = path.split('/');
  const view = $('#view');
  if (route === 'case' && arg) view.innerHTML = viewCase(arg);
  else view.innerHTML = (ROUTES[route] || viewDashboard)(params);
  renderNav();
  window.scrollTo(0, 0);
}

/* Re-render while keeping focus in a live-filter input */
function renderKeepFocus(input) {
  const id = input.id, val = input.value, pos = input.selectionStart;
  const marker = input.getAttribute('data-focus-marker') || (input.setAttribute('data-focus-marker', '1'), '1');
  clearTimeout(renderKeepFocus._t);
  renderKeepFocus._t = setTimeout(() => {
    render();
    const again = $(`[data-focus-marker]`) || $('input[type="search"]', $('#view'));
    if (again) { again.setAttribute('data-focus-marker', '1'); again.focus(); try { again.setSelectionRange(pos, pos); } catch (e) {} }
  }, 250);
}

/* =========================================================
   Boot
   ========================================================= */
window.addEventListener('hashchange', render);

document.addEventListener('DOMContentLoaded', () => {
  render();

  // Role switcher
  $('#role-switch').addEventListener('change', e => {
    const v = e.target.value;
    if (v === 'portal') { location.hash = '#/portal'; e.target.value = state.userId; return; }
    state.userId = v;
    const u = currentUser();
    $('#user-avatar').textContent = u.initials;
    $('#user-name').textContent = u.name;
    $('#user-role').textContent = `${u.role} · ${u.title}`;
    toast(`Now viewing as ${u.name} (${u.role}). Dashboards, task views, and permissions adjust to this role.`, 'info');
    render();
  });

  // Global search
  const gs = $('#global-search');
  gs.addEventListener('input', () => runSearch(gs.value));
  gs.addEventListener('focus', () => runSearch(gs.value));
  document.addEventListener('click', e => {
    if (!e.target.closest('.global-search')) $('#search-results').hidden = true;
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      e.preventDefault(); gs.focus();
    }
    if (e.key === 'g' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      document._gPressed = true; setTimeout(() => document._gPressed = false, 800); return;
    }
    if (document._gPressed) {
      const map = { d: '#/dashboard', c: '#/cases', n: '#/notices', t: '#/tasks', l: '#/calendar', f: '#/forms' };
      if (map[e.key]) { location.hash = map[e.key]; document._gPressed = false; }
    }
  });

  // Sidebar footer buttons
  $('#btn-notifications').addEventListener('click', () => openModal('Notifications', `
    <ul class="vtl">
      <li class="urgent"><div class="vtl-date">Today 8:42 AM</div><div class="vtl-title">New receipt notice needs review — David Kim (I-485)</div><div class="vtl-sub"><a href="#/notices" onclick="closeModal()">Open Notice Inbox</a></div></li>
      <li class="attention"><div class="vtl-date">Yesterday 4:47 PM</div><div class="vtl-title">Unmatched approval notice held for review (name mismatch)</div><div class="vtl-sub"><a href="#/notices" onclick="closeModal()">Review match</a></div></li>
      <li><div class="vtl-date">Yesterday 9:00 AM</div><div class="vtl-title">QuickBooks connection error — 3 invoices pending export</div><div class="vtl-sub"><a href="#/integrations" onclick="closeModal()">Reconnect</a></div></li>
      <li><div class="vtl-date">Jul 13</div><div class="vtl-title">Reminder: RFE response due Jul 22 — Amit Patel</div><div class="vtl-sub"><a href="#/case/m2" onclick="closeModal()">Open case</a></div></li>
    </ul>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`));

  $('#btn-help').addEventListener('click', () => openModal('Help & keyboard shortcuts', `
    <p style="margin-bottom:10px">Quick navigation: press <kbd>/</kbd> to search. Press <kbd>g</kbd> then a letter to jump:</p>
    <div class="extract-row"><span class="k"><kbd>g</kbd> <kbd>d</kbd></span><span class="v">Dashboard</span></div>
    <div class="extract-row"><span class="k"><kbd>g</kbd> <kbd>c</kbd></span><span class="v">Cases</span></div>
    <div class="extract-row"><span class="k"><kbd>g</kbd> <kbd>n</kbd></span><span class="v">USCIS Notices</span></div>
    <div class="extract-row"><span class="k"><kbd>g</kbd> <kbd>l</kbd></span><span class="v">Calendar & Deadlines</span></div>
    <div class="extract-row"><span class="k"><kbd>g</kbd> <kbd>t</kbd></span><span class="v">Tasks</span></div>
    <div class="extract-row" style="border:0"><span class="k"><kbd>g</kbd> <kbd>f</kbd></span><span class="v">Forms</span></div>
    <p style="margin-top:12px;font-size:.82rem;color:var(--muted)">Support: helpdesk@pollakimmigration.com · 214-305-2266</p>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`));

  $('#btn-logout').addEventListener('click', () => confirmAction('Log out', 'End your session? Unsaved drafts are kept. You will be logged out automatically after 20 minutes of inactivity in any case.', () => toast('You have been logged out. (Prototype: session simulated.)', 'info'), 'Log out'));
});
