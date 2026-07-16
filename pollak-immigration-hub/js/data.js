/* =========================================================
   Pollak Immigration Operations Hub — Sample Data
   All data is fictional and for prototype demonstration.
   "Today" in this prototype is Wednesday, July 15, 2026.
   ========================================================= */

const TODAY = new Date(2026, 6, 15); // July 15, 2026

const USERS = [
  { id: 'u1', name: 'Sarah Pollak', initials: 'SP', role: 'Attorney', title: 'Managing Attorney', email: 's.pollak@pollakimmigration.com', color: '#243B53' },
  { id: 'u2', name: 'Daniel Reyes', initials: 'DR', role: 'Attorney', title: 'Senior Associate Attorney', email: 'd.reyes@pollakimmigration.com', color: '#3C5A78' },
  { id: 'u3', name: 'Jessica Tran', initials: 'JT', role: 'Paralegal', title: 'Senior Paralegal', email: 'j.tran@pollakimmigration.com', color: '#5A7896' },
  { id: 'u4', name: 'Marcus Webb', initials: 'MW', role: 'Paralegal', title: 'Paralegal', email: 'm.webb@pollakimmigration.com', color: '#5A7896' },
  { id: 'u5', name: 'Alicia Fuentes', initials: 'AF', role: 'Legal Assistant', title: 'Legal Assistant', email: 'a.fuentes@pollakimmigration.com', color: '#7C93AB' },
  { id: 'u6', name: 'Robert Chen', initials: 'RC', role: 'Firm Administrator', title: 'Firm Administrator', email: 'r.chen@pollakimmigration.com', color: '#374151' },
];

const CLIENTS = [
  { id: 'c1', name: 'Maria Rodriguez', type: 'Individual', email: 'maria.rodriguez@email.com', phone: '(214) 555-0134', country: 'Mexico', language: 'Spanish', aNumber: 'A-215-884-901', address: '4820 Maple Ave, Apt 12B, Dallas, TX 75219', employer: 'Innovatech Solutions LLC', portalStatus: 'Active', since: '2023-04-11' },
  { id: 'c2', name: 'Amit Patel', type: 'Individual', email: 'amit.patel@email.com', phone: '(469) 555-0177', country: 'India', language: 'English', aNumber: 'A-209-330-556', address: '2211 Ross Ave, Unit 804, Dallas, TX 75201', employer: 'Meridian Data Systems', portalStatus: 'Active', since: '2022-09-02' },
  { id: 'c3', name: 'Elena Garcia', type: 'Individual', email: 'elena.garcia@email.com', phone: '(972) 555-0119', country: 'Colombia', language: 'Spanish', aNumber: 'A-201-774-238', address: '901 W Lovers Ln, Dallas, TX 75225', employer: 'Baylor Scott & White Health', portalStatus: 'Active', since: '2021-02-18' },
  { id: 'c4', name: 'David Kim', type: 'Individual', email: 'david.kim@email.com', phone: '(954) 555-0163', country: 'South Korea', language: 'Korean', aNumber: 'A-217-990-412', address: '350 SE 2nd St, Fort Lauderdale, FL 33301', employer: 'Atlantic Robotics Inc.', portalStatus: 'Active', since: '2024-01-25' },
  { id: 'c5', name: 'Chen Wei', type: 'Individual', email: 'chen.wei@email.com', phone: '(214) 555-0102', country: 'China', language: 'Mandarin', aNumber: 'A-206-118-773', address: '5600 SMU Blvd, Dallas, TX 75206', employer: 'University of Texas at Dallas', portalStatus: 'Invited', since: '2025-11-03' },
  { id: 'c6', name: 'Fatima Al-Hassan', type: 'Individual', email: 'fatima.alhassan@email.com', phone: '(469) 555-0148', country: 'Jordan', language: 'Arabic', aNumber: '—', address: '7310 Coit Rd, Plano, TX 75024', employer: 'Self-employed (E-2 enterprise)', portalStatus: 'Active', since: '2025-06-30' },
  { id: 'c7', name: 'Innovatech Solutions LLC', type: 'Corporate', email: 'hr@innovatech.example.com', phone: '(214) 555-0500', country: 'United States', language: 'English', aNumber: '—', address: '1717 Main St, Suite 4200, Dallas, TX 75201', employer: '—', portalStatus: 'Active', since: '2022-05-14' },
  { id: 'c8', name: 'Oksana Kovalenko', type: 'Individual', email: 'oksana.k@email.com', phone: '(754) 555-0129', country: 'Ukraine', language: 'Ukrainian', aNumber: 'A-220-401-887', address: '1200 E Broward Blvd, Fort Lauderdale, FL 33301', employer: 'Sunrise Medical Group', portalStatus: 'Active', since: '2024-08-19' },
  { id: 'c9', name: 'Carlos Mendoza', type: 'Individual', email: 'carlos.mendoza@email.com', phone: '(214) 555-0191', country: 'El Salvador', language: 'Spanish', aNumber: 'A-208-654-320', address: '3416 W Jefferson Blvd, Dallas, TX 75211', employer: 'Lone Star Construction Co.', portalStatus: 'Not invited', since: '2026-03-09' },
  { id: 'c10', name: 'Priya Sharma', type: 'Individual', email: 'priya.sharma@email.com', phone: '(469) 555-0155', country: 'India', language: 'Hindi', aNumber: 'A-212-778-034', address: '8000 Coit Rd, Frisco, TX 75035', employer: 'Meridian Data Systems', portalStatus: 'Active', since: '2023-10-27' },
];

const CASES = [
  {
    id: 'm1', matter: 'PLK-2024-0182', clientId: 'c1', client: 'Maria Rodriguez',
    type: 'H-1B Extension', visa: 'H-1B', attorney: 'Sarah Pollak', paralegal: 'Jessica Tran',
    stage: 'Attorney Review', stagePct: 72, priorityDate: '—', nextDeadline: '2026-07-18',
    nextDeadlineLabel: 'Review Form I-129', status: 'Active', lastActivity: '2026-07-15',
    risk: 'attention', riskNote: 'I-129 attorney review due in 3 days; current H-1B status expires Oct 1, 2026.',
    receipt: 'IOE0912847563', openedOn: '2024-11-04',
  },
  {
    id: 'm2', matter: 'PLK-2023-0097', clientId: 'c2', client: 'Amit Patel',
    type: 'Employment-Based Green Card (EB-2)', visa: 'EB-2 / I-140 + I-485', attorney: 'Sarah Pollak', paralegal: 'Marcus Webb',
    stage: 'RFE Response', stagePct: 45, priorityDate: '2022-12-01', nextDeadline: '2026-07-22',
    nextDeadlineLabel: 'Respond to RFE (I-485)', status: 'RFE Received', lastActivity: '2026-07-14',
    risk: 'urgent', riskNote: 'RFE response due July 22 — medical examination (I-693) and updated employment letter outstanding.',
    receipt: 'SRC2290145077', openedOn: '2023-02-21',
  },
  {
    id: 'm3', matter: 'PLK-2022-0250', clientId: 'c3', client: 'Elena Garcia',
    type: 'Naturalization', visa: 'N-400', attorney: 'Daniel Reyes', paralegal: 'Jessica Tran',
    stage: 'Document Collection', stagePct: 60, priorityDate: '—', nextDeadline: '2026-07-19',
    nextDeadlineLabel: 'Missing tax transcript', status: 'Waiting on Client', lastActivity: '2026-07-13',
    risk: 'attention', riskNote: '2023 IRS tax transcript still outstanding; requested from client twice.',
    receipt: 'IOE0918253340', openedOn: '2026-01-12',
  },
  {
    id: 'm4', matter: 'PLK-2025-0034', clientId: 'c4', client: 'David Kim',
    type: 'I-485 Adjustment of Status', visa: 'EB-1 / I-485', attorney: 'Sarah Pollak', paralegal: 'Marcus Webb',
    stage: 'Filed — Awaiting USCIS', stagePct: 80, priorityDate: '2024-06-15', nextDeadline: '2026-07-16',
    nextDeadlineLabel: 'Review receipt notice', status: 'Active', lastActivity: '2026-07-15',
    risk: 'normal', riskNote: 'New I-485 receipt notice received July 15 — awaiting attorney confirmation.',
    receipt: 'IOE0927761204', openedOn: '2025-03-05',
  },
  {
    id: 'm5', matter: 'PLK-2025-0201', clientId: 'c5', client: 'Chen Wei',
    type: 'O-1A Extraordinary Ability', visa: 'O-1A', attorney: 'Daniel Reyes', paralegal: 'Jessica Tran',
    stage: 'Evidence Gathering', stagePct: 35, priorityDate: '—', nextDeadline: '2026-08-04',
    nextDeadlineLabel: 'Draft support letters', status: 'Active', lastActivity: '2026-07-10',
    risk: 'normal', riskNote: '', receipt: '—', openedOn: '2025-11-10',
  },
  {
    id: 'm6', matter: 'PLK-2025-0140', clientId: 'c6', client: 'Fatima Al-Hassan',
    type: 'E-2 Treaty Investor', visa: 'E-2', attorney: 'Sarah Pollak', paralegal: 'Alicia Fuentes',
    stage: 'Filing Preparation', stagePct: 88, priorityDate: '—', nextDeadline: '2026-07-24',
    nextDeadlineLabel: 'Assemble filing packet', status: 'Attorney Review', lastActivity: '2026-07-14',
    risk: 'normal', riskNote: '', receipt: '—', openedOn: '2025-07-01',
  },
  {
    id: 'm7', matter: 'PLK-2024-0355', clientId: 'c7', client: 'Innovatech Solutions LLC',
    type: 'PERM Labor Certification (for R. Osei)', visa: 'PERM / EB-2', attorney: 'Daniel Reyes', paralegal: 'Marcus Webb',
    stage: 'Recruitment', stagePct: 50, priorityDate: '—', nextDeadline: '2026-07-30',
    nextDeadlineLabel: 'Recruitment quiet period ends', status: 'Active', lastActivity: '2026-07-08',
    risk: 'normal', riskNote: '', receipt: '—', openedOn: '2024-12-02',
  },
  {
    id: 'm8', matter: 'PLK-2024-0298', clientId: 'c8', client: 'Oksana Kovalenko',
    type: 'I-765 EAD Renewal', visa: 'EAD (c)(9)', attorney: 'Daniel Reyes', paralegal: 'Alicia Fuentes',
    stage: 'Filed — Awaiting USCIS', stagePct: 75, priorityDate: '—', nextDeadline: '2026-09-28',
    nextDeadlineLabel: 'Current EAD expires', status: 'Active', lastActivity: '2026-07-06',
    risk: 'normal', riskNote: '', receipt: 'IOE0925103488', openedOn: '2026-05-12',
  },
  {
    id: 'm9', matter: 'PLK-2026-0021', clientId: 'c9', client: 'Carlos Mendoza',
    type: 'TPS Re-registration', visa: 'TPS (El Salvador)', attorney: 'Sarah Pollak', paralegal: 'Alicia Fuentes',
    stage: 'Intake', stagePct: 15, priorityDate: '—', nextDeadline: '2026-08-15',
    nextDeadlineLabel: 'Re-registration window closes', status: 'Waiting on Client', lastActivity: '2026-06-29',
    risk: 'attention', riskNote: 'No case activity for 16 days. Client has not returned signed G-28.',
    receipt: '—', openedOn: '2026-03-09',
  },
  {
    id: 'm10', matter: 'PLK-2023-0311', clientId: 'c10', client: 'Priya Sharma',
    type: 'H-4 / H-1B Family Package', visa: 'H-1B + H-4', attorney: 'Sarah Pollak', paralegal: 'Jessica Tran',
    stage: 'Approved — Monitoring', stagePct: 100, priorityDate: '2023-08-22', nextDeadline: '2026-10-14',
    nextDeadlineLabel: 'H-1B status expires (spouse)', status: 'Approved', lastActivity: '2026-07-02',
    risk: 'normal', riskNote: '', receipt: 'WAC2318876650', openedOn: '2023-10-27',
  },
];

const NOTICES = [
  {
    id: 'n1', client: 'David Kim', caseId: 'm4', matter: 'PLK-2025-0034',
    noticeType: 'Receipt Notice (I-797C)', formType: 'I-485', receiptNumber: 'IOE0927761204',
    noticeDate: '2026-07-11', receivedDate: '2026-07-15', received: 'Today, 8:42 AM',
    source: 'Connected inbox — uscis-mail@pollakimmigration.com', serviceCenter: 'USCIS Lockbox / National Benefits Center',
    priorityDate: 'Jun 15, 2024', classification: 'EB-1 Adjustment of Status', apptDate: null,
    responseDeadline: null, validity: null, aNumber: 'A-217-990-412',
    petitioner: '—', beneficiary: 'David Kim',
    confidence: 97, status: 'Needs review', suggestedFolder: 'Government Notices',
    suggestedDeadlines: ['Biometrics appointment window — monitor (est. 3–6 weeks)', 'Case status check — Aug 15, 2026'],
    fields: [
      { label: 'Receipt number', value: 'IOE0927761204', conf: 99 },
      { label: 'Form type', value: 'I-485, Application to Register Permanent Residence', conf: 99 },
      { label: 'Notice type', value: 'Receipt Notice (I-797C)', conf: 98 },
      { label: 'Beneficiary', value: 'David Kim', conf: 97 },
      { label: 'Notice date', value: 'July 11, 2026', conf: 99 },
      { label: 'Priority date', value: 'June 15, 2024', conf: 95 },
      { label: 'Service center', value: 'National Benefits Center', conf: 96 },
      { label: 'A-Number', value: 'A-217-990-412', conf: 94 },
    ],
  },
  {
    id: 'n2', client: 'Amit Patel', caseId: 'm2', matter: 'PLK-2023-0097',
    noticeType: 'Request for Evidence (RFE)', formType: 'I-485', receiptNumber: 'SRC2290145077',
    noticeDate: '2026-06-20', receivedDate: '2026-06-23', received: 'Jun 23, 10:15 AM',
    source: 'Scanned mail — front desk', serviceCenter: 'Texas Service Center',
    priorityDate: 'Dec 1, 2022', classification: 'EB-2 Adjustment of Status', apptDate: null,
    responseDeadline: '2026-07-22', validity: null, aNumber: 'A-209-330-556',
    petitioner: 'Meridian Data Systems', beneficiary: 'Amit Patel',
    confidence: 93, status: 'Filed', suggestedFolder: 'Government Notices',
    suggestedDeadlines: ['RFE response deadline — Jul 22, 2026 (from notice)', 'Internal review — Jul 18, 2026'],
    fields: [
      { label: 'Receipt number', value: 'SRC2290145077', conf: 98 },
      { label: 'Form type', value: 'I-485', conf: 99 },
      { label: 'Notice type', value: 'Request for Evidence (I-797E)', conf: 97 },
      { label: 'Response deadline', value: 'July 22, 2026', conf: 91 },
      { label: 'Service center', value: 'Texas Service Center', conf: 96 },
    ],
  },
  {
    id: 'n3', client: 'Oksana Kovalenko', caseId: 'm8', matter: 'PLK-2024-0298',
    noticeType: 'Biometrics Appointment (ASC)', formType: 'I-765', receiptNumber: 'IOE0925103488',
    noticeDate: '2026-07-08', receivedDate: '2026-07-13', received: 'Jul 13, 2:30 PM',
    source: 'Client portal upload', serviceCenter: 'Fort Lauderdale ASC',
    priorityDate: '—', classification: 'EAD Renewal (c)(9)', apptDate: '2026-07-29 10:00 AM',
    responseDeadline: null, validity: null, aNumber: 'A-220-401-887',
    petitioner: '—', beneficiary: 'Oksana Kovalenko',
    confidence: 95, status: 'Filed', suggestedFolder: 'Government Notices',
    suggestedDeadlines: ['Biometrics appointment — Jul 29, 2026, 10:00 AM, Fort Lauderdale ASC', 'Client reminder — Jul 27, 2026'],
    fields: [
      { label: 'Receipt number', value: 'IOE0925103488', conf: 98 },
      { label: 'Appointment date', value: 'July 29, 2026, 10:00 AM', conf: 96 },
      { label: 'ASC location', value: 'Fort Lauderdale ASC', conf: 95 },
    ],
  },
  {
    id: 'n4', client: 'Unmatched — “Rodriquez, M.”', caseId: null, matter: '—',
    noticeType: 'Approval Notice (I-797)', formType: 'I-129', receiptNumber: 'WAC2611230981',
    noticeDate: '2026-07-09', receivedDate: '2026-07-14', received: 'Jul 14, 4:47 PM',
    source: 'Connected inbox — uscis-mail@pollakimmigration.com', serviceCenter: 'California Service Center',
    priorityDate: '—', classification: 'H-1B Specialty Occupation', apptDate: null,
    responseDeadline: null, validity: 'Oct 1, 2026 – Sep 30, 2029', aNumber: '—',
    petitioner: 'Innovatech Solutions LLC', beneficiary: 'Maria Rodriquez [sic]',
    confidence: 71, status: 'Needs review', suggestedFolder: 'Government Notices',
    suggestedDeadlines: ['H-1B validity end — Sep 30, 2029', 'Extension preparation reminder — Mar 30, 2029 (180 days prior)'],
    ambiguous: true,
    fields: [
      { label: 'Receipt number', value: 'WAC2611230981', conf: 97 },
      { label: 'Beneficiary', value: 'Maria Rodriquez (name spelling differs from client record “Rodriguez”)', conf: 64 },
      { label: 'Petitioner', value: 'Innovatech Solutions LLC', conf: 92 },
      { label: 'Validity period', value: 'Oct 1, 2026 – Sep 30, 2029', conf: 88 },
      { label: 'Notice type', value: 'Approval Notice (I-797A)', conf: 90 },
    ],
  },
  {
    id: 'n5', client: 'Elena Garcia', caseId: 'm3', matter: 'PLK-2022-0250',
    noticeType: 'Interview Notice', formType: 'N-400', receiptNumber: 'IOE0918253340',
    noticeDate: '2026-07-02', receivedDate: '2026-07-06', received: 'Jul 6, 9:05 AM',
    source: 'Scanned mail — front desk', serviceCenter: 'Dallas Field Office',
    priorityDate: '—', classification: 'Naturalization', apptDate: '2026-08-11 8:30 AM',
    responseDeadline: null, validity: null, aNumber: 'A-201-774-238',
    petitioner: '—', beneficiary: 'Elena Garcia',
    confidence: 96, status: 'Filed', suggestedFolder: 'Government Notices',
    suggestedDeadlines: ['N-400 interview — Aug 11, 2026, 8:30 AM, Dallas Field Office', 'Interview preparation session — Aug 4, 2026'],
    fields: [
      { label: 'Interview date', value: 'August 11, 2026, 8:30 AM', conf: 97 },
      { label: 'Field office', value: 'Dallas Field Office', conf: 96 },
    ],
  },
  {
    id: 'n6', client: 'Priya Sharma', caseId: 'm10', matter: 'PLK-2023-0311',
    noticeType: 'Approval Notice (I-797)', formType: 'I-539 (H-4)', receiptNumber: 'WAC2609981123',
    noticeDate: '2026-06-30', receivedDate: '2026-07-03', received: 'Jul 3, 11:20 AM',
    source: 'Connected inbox — uscis-mail@pollakimmigration.com', serviceCenter: 'California Service Center',
    priorityDate: '—', classification: 'H-4 Dependent', apptDate: null,
    responseDeadline: null, validity: 'Through Oct 14, 2026', aNumber: 'A-212-778-034',
    petitioner: '—', beneficiary: 'Priya Sharma',
    confidence: 94, status: 'Filed', suggestedFolder: 'Government Notices',
    suggestedDeadlines: ['H-4 status expires — Oct 14, 2026'],
    fields: [
      { label: 'Receipt number', value: 'WAC2609981123', conf: 98 },
      { label: 'Validity', value: 'Through October 14, 2026', conf: 93 },
    ],
  },
];

const FORMS_LIBRARY = [
  { form: 'I-129', name: 'Petition for a Nonimmigrant Worker', edition: '01/17/25 edition' },
  { form: 'I-130', name: 'Petition for Alien Relative', edition: '04/01/24 edition' },
  { form: 'I-485', name: 'Application to Register Permanent Residence or Adjust Status', edition: '10/24/24 edition' },
  { form: 'I-765', name: 'Application for Employment Authorization', edition: '01/20/25 edition' },
  { form: 'I-131', name: 'Application for Travel Document', edition: '06/17/24 edition' },
  { form: 'I-140', name: 'Immigrant Petition for Alien Worker', edition: '04/01/24 edition' },
  { form: 'N-400', name: 'Application for Naturalization', edition: '04/01/24 edition' },
  { form: 'G-28', name: 'Notice of Entry of Appearance as Attorney', edition: '05/23/24 edition' },
  { form: 'I-539', name: 'Application to Extend/Change Nonimmigrant Status', edition: '10/24/24 edition' },
  { form: 'I-864', name: 'Affidavit of Support Under Section 213A', edition: '03/10/25 edition' },
  { form: 'I-693', name: 'Report of Immigration Medical Examination', edition: '01/20/25 edition' },
  { form: 'ETA-9089', name: 'Application for Permanent Employment Certification (PERM)', edition: 'DOL current' },
];

const CASE_FORMS = [
  { id: 'f1', caseId: 'm1', form: 'I-129', edition: '01/17/25', pct: 96, preparedBy: 'Jessica Tran', review: 'Awaiting attorney review', filing: 'Not filed', updated: '2026-07-15 9:12 AM', flag: 'Potential inconsistency: employer address differs from the address on the 2023 I-129 filing. Review before continuing.' },
  { id: 'f2', caseId: 'm1', form: 'G-28', edition: '05/23/24', pct: 100, preparedBy: 'Jessica Tran', review: 'Approved', filing: 'Ready for packet', updated: '2026-07-10 3:40 PM', flag: null },
  { id: 'f3', caseId: 'm2', form: 'I-485 (RFE response)', edition: '10/24/24', pct: 45, preparedBy: 'Marcus Webb', review: 'Draft', filing: 'Not filed', updated: '2026-07-14 5:02 PM', flag: 'Missing information: Form I-693 civil surgeon signature date. This item is listed in the RFE.' },
  { id: 'f4', caseId: 'm3', form: 'N-400', edition: '04/01/24', pct: 82, preparedBy: 'Jessica Tran', review: 'Draft', filing: 'Not filed', updated: '2026-07-12 11:30 AM', flag: 'Potential inconsistency: the client’s current address differs from the address entered in their previous I-485 filing. Review before continuing.' },
  { id: 'f5', caseId: 'm4', form: 'I-485', edition: '10/24/24', pct: 100, preparedBy: 'Marcus Webb', review: 'Approved', filing: 'Filed 06/29/2026 · Receipted', updated: '2026-07-15 8:50 AM', flag: null },
  { id: 'f6', caseId: 'm4', form: 'I-765', edition: '01/20/25', pct: 100, preparedBy: 'Marcus Webb', review: 'Approved', filing: 'Filed 06/29/2026', updated: '2026-06-29 2:15 PM', flag: null },
  { id: 'f7', caseId: 'm4', form: 'I-131', edition: '06/17/24', pct: 100, preparedBy: 'Marcus Webb', review: 'Approved', filing: 'Filed 06/29/2026', updated: '2026-06-29 2:15 PM', flag: null },
  { id: 'f8', caseId: 'm6', form: 'DS-160 supplement + E-2 packet', edition: 'Current', pct: 88, preparedBy: 'Alicia Fuentes', review: 'Awaiting attorney review', filing: 'Not filed', updated: '2026-07-14 4:22 PM', flag: null },
  { id: 'f9', caseId: 'm7', form: 'ETA-9089', edition: 'DOL current', pct: 40, preparedBy: 'Marcus Webb', review: 'Draft', filing: 'Not filed', updated: '2026-07-08 10:05 AM', flag: null },
  { id: 'f10', caseId: 'm5', form: 'I-129 (O-1A)', edition: '01/17/25', pct: 30, preparedBy: 'Jessica Tran', review: 'Draft', filing: 'Not filed', updated: '2026-07-10 1:48 PM', flag: null },
];

const DOC_FOLDERS = [
  'Identity documents', 'Immigration history', 'Employment documents', 'Financial evidence',
  'Education records', 'Family documents', 'Supporting evidence', 'Government notices',
  'Filed forms', 'Correspondence',
];

const DOCUMENTS = [
  { id: 'd1', name: 'Passport — Maria Rodriguez (2024 renewal).pdf', client: 'Maria Rodriguez', caseId: 'm1', folder: 'Identity documents', status: 'Approved', uploaded: '2026-05-02', by: 'Client portal', expires: '2034-03-18', tags: ['passport', 'identity'], confidential: false },
  { id: 'd2', name: 'I-94 record — M. Rodriguez.pdf', client: 'Maria Rodriguez', caseId: 'm1', folder: 'Immigration history', status: 'Approved', uploaded: '2026-05-02', by: 'Jessica Tran', expires: '2026-10-01', tags: ['I-94'], confidential: false },
  { id: 'd3', name: 'Employment verification letter — Innovatech.pdf', client: 'Maria Rodriguez', caseId: 'm1', folder: 'Employment documents', status: 'Under review', uploaded: '2026-07-09', by: 'Client portal', expires: null, tags: ['employment'], confidential: false },
  { id: 'd4', name: 'RFE notice — SRC2290145077.pdf', client: 'Amit Patel', caseId: 'm2', folder: 'Government notices', status: 'Filed with USCIS', uploaded: '2026-06-23', by: 'Alicia Fuentes (scan)', expires: null, tags: ['RFE', 'I-797E'], confidential: false },
  { id: 'd5', name: 'I-693 medical exam (sealed) — A. Patel.pdf', client: 'Amit Patel', caseId: 'm2', folder: 'Supporting evidence', status: 'Replacement requested', uploaded: '2026-07-01', by: 'Client portal', expires: null, tags: ['I-693', 'medical'], confidential: true },
  { id: 'd6', name: 'Pay statements Q2 2026 — A. Patel.pdf', client: 'Amit Patel', caseId: 'm2', folder: 'Employment documents', status: 'Approved', uploaded: '2026-07-05', by: 'Client portal', expires: null, tags: ['payroll'], confidential: false },
  { id: 'd7', name: 'IRS tax transcript 2023 — E. Garcia.pdf', client: 'Elena Garcia', caseId: 'm3', folder: 'Financial evidence', status: 'Requested — not received', uploaded: null, by: '—', expires: null, tags: ['tax', 'missing'], confidential: false },
  { id: 'd8', name: 'Green card (front/back) — E. Garcia.pdf', client: 'Elena Garcia', caseId: 'm3', folder: 'Identity documents', status: 'Approved', uploaded: '2026-02-01', by: 'Client portal', expires: '2027-09-12', tags: ['LPR card'], confidential: false },
  { id: 'd9', name: 'Receipt notice I-485 — IOE0927761204.pdf', client: 'David Kim', caseId: 'm4', folder: 'Government notices', status: 'Under review', uploaded: '2026-07-15', by: 'Auto-filed from inbox (pending review)', expires: null, tags: ['I-797C', 'receipt'], confidential: false },
  { id: 'd10', name: 'EAD card — O. Kovalenko.pdf', client: 'Oksana Kovalenko', caseId: 'm8', folder: 'Identity documents', status: 'Expiring soon', uploaded: '2024-10-02', by: 'Alicia Fuentes', expires: '2026-09-28', tags: ['EAD'], confidential: false },
  { id: 'd11', name: 'Business plan — Al-Hassan Trading LLC.pdf', client: 'Fatima Al-Hassan', caseId: 'm6', folder: 'Supporting evidence', status: 'Approved', uploaded: '2026-06-18', by: 'Client portal', expires: null, tags: ['E-2', 'business plan'], confidential: true },
  { id: 'd12', name: 'Wire transfer evidence — investment funds.pdf', client: 'Fatima Al-Hassan', caseId: 'm6', folder: 'Financial evidence', status: 'Approved', uploaded: '2026-06-20', by: 'Client portal', expires: null, tags: ['E-2', 'investment'], confidential: true },
  { id: 'd13', name: 'Diploma + transcripts — Chen Wei.pdf', client: 'Chen Wei', caseId: 'm5', folder: 'Education records', status: 'Received', uploaded: '2026-07-02', by: 'Client portal', expires: null, tags: ['education'], confidential: false },
  { id: 'd14', name: 'Interview notice N-400 — E. Garcia.pdf', client: 'Elena Garcia', caseId: 'm3', folder: 'Government notices', status: 'Filed with USCIS', uploaded: '2026-07-06', by: 'Notice inbox (approved by D. Reyes)', expires: null, tags: ['interview'], confidential: false },
  { id: 'd15', name: 'Signed G-28 — C. Mendoza.pdf', client: 'Carlos Mendoza', caseId: 'm9', folder: 'Filed forms', status: 'Requested — not received', uploaded: null, by: '—', expires: null, tags: ['G-28', 'missing'], confidential: false },
];

const DEADLINES = [
  { id: 'dl1', date: '2026-07-16', title: 'Review I-485 receipt notice — David Kim', type: 'Internal review', caseId: 'm4', owner: 'Sarah Pollak', urgency: 'attention', source: 'Notice IOE0927761204 (auto-extracted, 97% confidence)', approvedBy: 'Pending review', reminders: ['Same day'] },
  { id: 'dl2', date: '2026-07-18', title: 'Attorney review — Form I-129 (H-1B ext.) — Maria Rodriguez', type: 'Internal review', caseId: 'm1', owner: 'Sarah Pollak', urgency: 'attention', source: 'Manually created by J. Tran', approvedBy: 'J. Tran', reminders: ['7 days before', 'Same day'] },
  { id: 'dl3', date: '2026-07-19', title: 'Tax transcript due from client — Elena Garcia', type: 'Client follow-up', caseId: 'm3', owner: 'Jessica Tran', urgency: 'attention', source: 'Document request #DR-2214', approvedBy: 'D. Reyes', reminders: ['7 days before', 'Same day'] },
  { id: 'dl4', date: '2026-07-22', title: 'RFE response deadline — I-485 — Amit Patel', type: 'RFE response', caseId: 'm2', owner: 'Sarah Pollak', urgency: 'urgent', source: 'RFE notice SRC2290145077 (auto-extracted, 91% confidence)', approvedBy: 'S. Pollak, Jun 24', reminders: ['30 days before', '7 days before', 'Same day'] },
  { id: 'dl5', date: '2026-07-24', title: 'Assemble E-2 filing packet — Fatima Al-Hassan', type: 'Filing deadline', caseId: 'm6', owner: 'Alicia Fuentes', urgency: 'normal', source: 'Manually created', approvedBy: 'S. Pollak', reminders: ['7 days before'] },
  { id: 'dl6', date: '2026-07-29', title: 'Biometrics appointment — Oksana Kovalenko — Fort Lauderdale ASC, 10:00 AM', type: 'Biometrics appointment', caseId: 'm8', owner: 'Alicia Fuentes', urgency: 'normal', source: 'ASC notice IOE0925103488 (auto-extracted, 96% confidence)', approvedBy: 'D. Reyes, Jul 13', reminders: ['7 days before', 'Same day'] },
  { id: 'dl7', date: '2026-07-30', title: 'PERM recruitment quiet period ends — Innovatech / R. Osei', type: 'PERM deadline', caseId: 'm7', owner: 'Marcus Webb', urgency: 'normal', source: 'Recruitment tracker', approvedBy: 'D. Reyes', reminders: ['7 days before'] },
  { id: 'dl8', date: '2026-08-04', title: 'O-1A support letter drafts due — Chen Wei', type: 'Internal review', caseId: 'm5', owner: 'Jessica Tran', urgency: 'normal', source: 'Manually created', approvedBy: 'D. Reyes', reminders: ['7 days before'] },
  { id: 'dl9', date: '2026-08-11', title: 'N-400 interview — Elena Garcia — Dallas Field Office, 8:30 AM', type: 'Interview', caseId: 'm3', owner: 'Daniel Reyes', urgency: 'attention', source: 'Interview notice (auto-extracted, 97% confidence)', approvedBy: 'D. Reyes, Jul 6', reminders: ['30 days before', '7 days before', 'Same day'] },
  { id: 'dl10', date: '2026-08-15', title: 'TPS re-registration window closes — Carlos Mendoza', type: 'Filing deadline', caseId: 'm9', owner: 'Sarah Pollak', urgency: 'urgent', source: 'Federal Register notice', approvedBy: 'S. Pollak', reminders: ['60 days before', '30 days before', '7 days before'] },
  { id: 'dl11', date: '2026-09-28', title: 'EAD expires — Oksana Kovalenko', type: 'EAD expiration', caseId: 'm8', owner: 'Daniel Reyes', urgency: 'normal', source: 'EAD card (expiration auto-detected)', approvedBy: 'A. Fuentes, Oct 2024', reminders: ['180 days before', '90 days before', '30 days before'] },
  { id: 'dl12', date: '2026-10-01', title: 'H-1B status expires — Maria Rodriguez', type: 'Visa expiration', caseId: 'm1', owner: 'Sarah Pollak', urgency: 'attention', source: 'I-94 record', approvedBy: 'J. Tran', reminders: ['180 days before', '90 days before', '30 days before'] },
  { id: 'dl13', date: '2026-10-14', title: 'H-1B / H-4 status expires — Sharma family', type: 'Visa expiration', caseId: 'm10', owner: 'Sarah Pollak', urgency: 'normal', source: 'Approval notice WAC2609981123', approvedBy: 'S. Pollak, Jul 3', reminders: ['180 days before', '90 days before'] },
  { id: 'dl14', date: '2026-07-27', title: 'Send biometrics reminder to client — O. Kovalenko', type: 'Client follow-up', caseId: 'm8', owner: 'Alicia Fuentes', urgency: 'normal', source: 'Created with ASC notice', approvedBy: 'D. Reyes', reminders: ['Same day'] },
  { id: 'dl15', date: '2026-08-01', title: 'Priority-date check — EB-2 India — Amit Patel', type: 'Priority-date monitoring', caseId: 'm2', owner: 'Marcus Webb', urgency: 'normal', source: 'Visa Bulletin monitor (Aug 2026 bulletin)', approvedBy: 'System schedule (monthly)', reminders: ['Same day'] },
];

const TASKS = [
  { id: 't1', title: 'Review Form I-129 and supporting letter', client: 'Maria Rodriguez', caseId: 'm1', assignee: 'Sarah Pollak', due: '2026-07-18', priority: 'High', status: 'In progress', dependency: 'Blocked by: employer letter finalization (done)', checklist: [['Specialty occupation support letter', true], ['LCA posting evidence', true], ['Wage level confirmation', false]], waitingOn: null },
  { id: 't2', title: 'Draft RFE response — assemble medical + employment evidence', client: 'Amit Patel', caseId: 'm2', assignee: 'Marcus Webb', due: '2026-07-17', priority: 'Urgent', status: 'In progress', dependency: 'Blocks: attorney review (S. Pollak)', checklist: [['New I-693 from civil surgeon', false], ['Updated employment verification letter', true], ['Response brief draft', false]], waitingOn: 'Client — medical appointment Jul 16' },
  { id: 't3', title: 'Follow up: 2023 tax transcript', client: 'Elena Garcia', caseId: 'm3', assignee: 'Jessica Tran', due: '2026-07-16', priority: 'High', status: 'Waiting on client', dependency: null, checklist: [['First request sent Jul 1', true], ['Second request sent Jul 9', true], ['Escalate by phone', false]], waitingOn: 'Client' },
  { id: 't4', title: 'Confirm receipt notice details against I-485 filing', client: 'David Kim', caseId: 'm4', assignee: 'Sarah Pollak', due: '2026-07-16', priority: 'Medium', status: 'Open', dependency: null, checklist: [['Verify receipt number recorded', false], ['Verify priority date matches I-140', false]], waitingOn: null },
  { id: 't5', title: 'Assemble E-2 filing packet and exhibit index', client: 'Fatima Al-Hassan', caseId: 'm6', assignee: 'Alicia Fuentes', due: '2026-07-23', priority: 'Medium', status: 'Open', dependency: 'Blocked by: attorney approval of cover letter', checklist: [['Exhibit index', false], ['Tab and paginate evidence', false]], waitingOn: 'Attorney' },
  { id: 't6', title: 'Prepare N-400 interview prep binder', client: 'Elena Garcia', caseId: 'm3', assignee: 'Jessica Tran', due: '2026-08-04', priority: 'Medium', status: 'Open', dependency: null, checklist: [['Civics practice materials', false], ['Travel history summary', false]], waitingOn: null },
  { id: 't7', title: 'Call client re: signed G-28 (third attempt)', client: 'Carlos Mendoza', caseId: 'm9', assignee: 'Alicia Fuentes', due: '2026-07-14', priority: 'High', status: 'Overdue', dependency: 'Blocks: TPS re-registration filing', checklist: [['Attempt 1 — Jun 30', true], ['Attempt 2 — Jul 8', true], ['Attempt 3', false]], waitingOn: 'Client' },
  { id: 't8', title: 'Place second Sunday newspaper ad (PERM recruitment)', client: 'Innovatech Solutions LLC', caseId: 'm7', assignee: 'Marcus Webb', due: '2026-07-19', priority: 'Medium', status: 'In progress', dependency: null, checklist: [['First ad ran Jul 5', true], ['Second ad booked for Jul 19', true]], waitingOn: null },
  { id: 't9', title: 'Collect two additional expert opinion letters', client: 'Chen Wei', caseId: 'm5', assignee: 'Jessica Tran', due: '2026-07-31', priority: 'Low', status: 'Open', dependency: null, checklist: [['Identify recommenders', true], ['Send letter templates', false]], waitingOn: null },
  { id: 't10', title: 'Verify H-4 approval recorded; close monitoring task', client: 'Priya Sharma', caseId: 'm10', assignee: 'Jessica Tran', due: '2026-07-10', priority: 'Low', status: 'Completed', dependency: null, checklist: [['Approval notice filed', true], ['Status dates updated', true]], waitingOn: null },
];

const ACTIVITY = [
  { ts: 'Jul 15, 2026 · 8:42 AM', who: 'System (notice intake)', what: 'Receipt notice IOE0927761204 received from connected inbox and queued for review — matched to David Kim / PLK-2025-0034 at 97% confidence.', auto: true, caseId: 'm4' },
  { ts: 'Jul 15, 2026 · 9:12 AM', who: 'Jessica Tran', what: 'Updated Form I-129 (Part 5, wage information) and sent for attorney review.', auto: false, caseId: 'm1' },
  { ts: 'Jul 14, 2026 · 5:02 PM', who: 'Marcus Webb', what: 'Saved RFE response draft; flagged missing I-693 signature date.', auto: false, caseId: 'm2' },
  { ts: 'Jul 14, 2026 · 4:47 PM', who: 'System (notice intake)', what: 'Approval notice WAC2611230981 received — beneficiary name “Rodriquez” did not exactly match any client; held for human review (71% confidence).', auto: true, caseId: null },
  { ts: 'Jul 14, 2026 · 4:22 PM', who: 'Alicia Fuentes', what: 'Uploaded revised E-2 cover letter draft for attorney review.', auto: false, caseId: 'm6' },
  { ts: 'Jul 13, 2026 · 2:34 PM', who: 'Daniel Reyes', what: 'Approved biometrics notice extraction; appointment deadline created for Jul 29, 2026 with a 7-day reminder.', auto: false, caseId: 'm8' },
  { ts: 'Jul 13, 2026 · 11:08 AM', who: 'Jessica Tran', what: 'Sent second document request to client for 2023 IRS tax transcript.', auto: false, caseId: 'm3' },
  { ts: 'Jul 10, 2026 · 3:40 PM', who: 'Sarah Pollak', what: 'Approved Form G-28 for filing packet.', auto: false, caseId: 'm1' },
  { ts: 'Jul 6, 2026 · 9:31 AM', who: 'Daniel Reyes', what: 'Approved interview notice extraction; N-400 interview calendared for Aug 11, 2026 (reminders: 30 days, 7 days, same day).', auto: false, caseId: 'm3' },
  { ts: 'Jul 3, 2026 · 11:26 AM', who: 'System (notice intake)', what: 'Approval notice WAC2609981123 filed under Priya Sharma → H-4/H-1B Family Package → Government Notices after approval by S. Pollak. Status dates updated; renewal reminder created for Apr 14, 2026 → superseded to Oct 14, 2026 validity.', auto: true, caseId: 'm10' },
];

const CASE_ACTIVITY = {
  m1: [
    { ts: 'Jul 15, 2026 · 9:12 AM', who: 'Jessica Tran', field: 'Form I-129 · Part 5', change: 'Wage level updated from “Level II” to “Level III” per LCA', auto: false },
    { ts: 'Jul 15, 2026 · 9:13 AM', who: 'Jessica Tran', field: 'Review status', change: '“Draft” → “Awaiting attorney review”', auto: false },
    { ts: 'Jul 10, 2026 · 3:40 PM', who: 'Sarah Pollak', field: 'Form G-28', change: '“Awaiting attorney review” → “Approved”', auto: false },
    { ts: 'Jul 9, 2026 · 2:04 PM', who: 'System (document intake)', field: 'Documents', change: 'Employment verification letter received via client portal; suggested folder “Employment documents” (accepted by J. Tran)', auto: true },
    { ts: 'Jun 30, 2026 · 10:15 AM', who: 'System (deadline engine)', field: 'Deadlines', change: 'Reminder fired: “H-1B status expires Oct 1, 2026 — 90 days remaining” → notification sent to S. Pollak, J. Tran', auto: true },
  ],
  m2: [
    { ts: 'Jul 14, 2026 · 5:02 PM', who: 'Marcus Webb', field: 'RFE response draft', change: 'Sections 1–3 drafted; evidence checklist updated (2 of 3 items outstanding → 1 of 3)', auto: false },
    { ts: 'Jun 24, 2026 · 9:00 AM', who: 'Sarah Pollak', field: 'Deadline', change: 'Approved auto-extracted RFE deadline of Jul 22, 2026 (91% confidence) and set reminders: 30 days, 7 days, same day', auto: false },
    { ts: 'Jun 23, 2026 · 10:15 AM', who: 'System (notice intake)', field: 'USCIS Notices', change: 'RFE SRC2290145077 scanned, extracted, and matched to PLK-2023-0097 (93% confidence); assigned to S. Pollak for review', auto: true },
  ],
  m4: [
    { ts: 'Jul 15, 2026 · 8:42 AM', who: 'System (notice intake)', field: 'USCIS Notices', change: 'Receipt notice IOE0927761204 queued for review; suggested match David Kim / PLK-2025-0034 (97% confidence)', auto: true },
    { ts: 'Jun 29, 2026 · 2:15 PM', who: 'Marcus Webb', field: 'Filing status', change: 'I-485/I-765/I-131 concurrent filing marked as filed; USCIS submission recorded (courier tracking added)', auto: false },
    { ts: 'Jun 27, 2026 · 4:30 PM', who: 'Sarah Pollak', field: 'Form I-485', change: '“Awaiting attorney review” → “Approved”', auto: false },
  ],
};

const COMMUNICATIONS = {
  m1: [
    { ts: 'Jul 9, 2026', kind: 'Client upload', text: 'Maria Rodriguez uploaded “Employment verification letter — Innovatech.pdf” in response to request #DR-2231.' },
    { ts: 'Jul 7, 2026', kind: 'Secure message', text: 'To client: “We are on track for your H-1B extension. Your attorney will review the petition this week.”' },
    { ts: 'Jul 2, 2026', kind: 'Internal note', text: 'S. Pollak: Confirm Level III wage with employer HR before review. (Internal only — not visible to client.)', internal: true },
  ],
  m2: [
    { ts: 'Jul 12, 2026', kind: 'Secure message', text: 'To client: “Reminder: your medical exam appointment is July 16. We need the sealed envelope by July 18 to meet the USCIS deadline of July 22.”' },
    { ts: 'Jul 1, 2026', kind: 'Client upload', text: 'Amit Patel uploaded I-693 (unsealed copy) — replacement requested; sealed original required.' },
    { ts: 'Jun 24, 2026', kind: 'Internal note', text: 'S. Pollak: RFE is limited to medicals + ability to pay. Draft response for my review by Jul 17.', internal: true },
  ],
  m3: [
    { ts: 'Jul 13, 2026', kind: 'Document request', text: 'Second request sent: 2023 IRS tax transcript. Due from client Jul 19.' },
    { ts: 'Jul 6, 2026', kind: 'Secure message', text: 'To client: “Good news — your naturalization interview is scheduled for August 11 at 8:30 AM at the Dallas Field Office. We will prepare with you in early August.”' },
  ],
  m4: [
    { ts: 'Jul 15, 2026', kind: 'Status update', text: 'Receipt notice received for your green card application (I-485). Pending attorney confirmation.' },
    { ts: 'Jun 29, 2026', kind: 'Secure message', text: 'To client: “Your adjustment of status package was filed with USCIS today. We will notify you when receipt notices arrive.”' },
  ],
};

const INTEGRATIONS = [
  { name: 'Microsoft Outlook', group: 'Email', status: 'Connected', account: 'uscis-mail@pollakimmigration.com', lastSync: 'Today, 8:40 AM', syncs: 'Imports inbound USCIS mail and client emails into the Notice Inbox and case Communications. Exports nothing.', error: null },
  { name: 'Microsoft 365 / SharePoint', group: 'Documents', status: 'Connected', account: 'Pollak PLLC tenant', lastSync: 'Today, 7:00 AM', syncs: 'Imports firm document library folders. Exports filed packets to the “Filed Matters” library nightly.', error: null },
  { name: 'Gmail', group: 'Email', status: 'Not connected', account: '—', lastSync: '—', syncs: 'Would import inbound mail from a connected Google Workspace inbox into the Notice Inbox.', error: null },
  { name: 'Google Drive', group: 'Documents', status: 'Not connected', account: '—', lastSync: '—', syncs: 'Would import selected shared-drive folders for document intake.', error: null },
  { name: 'OneDrive', group: 'Documents', status: 'Connected', account: 'r.chen@pollakimmigration.com', lastSync: 'Today, 6:55 AM', syncs: 'Imports scanned mail from the front-desk scanner folder every 15 minutes.', error: null },
  { name: 'DocuSign', group: 'Signatures', status: 'Connected', account: 'Pollak PLLC (5 seats)', lastSync: 'Jul 14, 4:10 PM', syncs: 'Sends engagement letters and G-28s for signature. Imports completed envelopes into case Correspondence.', error: null },
  { name: 'Adobe Sign', group: 'Signatures', status: 'Not connected', account: '—', lastSync: '—', syncs: 'Alternative e-signature provider. Same scope as DocuSign.', error: null },
  { name: 'QuickBooks', group: 'Billing', status: 'Error', account: 'Pollak PLLC', lastSync: 'Jul 11, 9:00 PM — failed', syncs: 'Exports matter billing entries as invoices. Imports payment status.', error: 'Authentication token expired Jul 11. Reconnect required; 3 invoices pending export.' },
  { name: 'LawPay', group: 'Billing', status: 'Connected', account: 'pollak-pllc', lastSync: 'Today, 8:00 AM', syncs: 'Imports client trust and operating payments; links payments to matters.', error: null },
  { name: 'Clio', group: 'Practice management', status: 'Not connected', account: '—', lastSync: '—', syncs: 'Would import legacy matter list and contacts (one-time migration import).', error: null },
  { name: 'USCIS Case Status Tracking', group: 'Government data', status: 'Connected', account: '38 receipt numbers monitored', lastSync: 'Today, 6:00 AM', syncs: 'Checks public USCIS case status daily for each monitored receipt number. Imports status changes and posts them to the case activity log. This is status tracking only — it does not file anything with USCIS.', error: null },
  { name: 'Google Calendar / Outlook Calendar', group: 'Calendar', status: 'Connected', account: 'All timekeepers', lastSync: 'Today, 8:30 AM', syncs: 'Exports firm deadlines and appointments to each user’s work calendar. Imports busy/free time for scheduling.', error: null },
];

/* Client portal data (Maria Rodriguez view) */
const PORTAL = {
  client: 'Maria Rodriguez',
  matterLabel: 'Your H-1B Extension',
  progress: [
    { step: 'We collected your information', done: true },
    { step: 'We prepared your petition forms', done: true },
    { step: 'Your attorney is reviewing everything', done: false, current: true },
    { step: 'We file with the government (USCIS)', done: false },
    { step: 'USCIS reviews and decides', done: false },
  ],
  actions: [
    { text: 'We need one additional document from you: your most recent employment verification letter. Please upload it by July 20.', due: 'Jul 20', kind: 'upload', status: 'Received — thank you! We are reviewing it.' },
    { text: 'Please review and confirm your current home address.', due: 'Jul 18', kind: 'confirm', status: 'Waiting for you' },
  ],
  appointments: [
    { date: 'None scheduled', note: 'We will let you know as soon as the government schedules any appointment for you.' },
  ],
  messages: [
    { ts: 'Jul 7', from: 'Pollak PLLC', text: 'We are on track for your H-1B extension. Your attorney will review the petition this week.' },
    { ts: 'Jun 28', from: 'You', text: 'Thank you! Should I keep traveling plans on hold?' },
    { ts: 'Jun 28', from: 'Pollak PLLC', text: 'Yes — please check with us before booking any international travel while your extension is in progress.' },
  ],
};

const REPORTS = {
  casesByType: [
    ['H-1B / extensions', 14], ['Employment green cards (EB-1/2/3)', 11], ['Family-based', 9],
    ['Naturalization (N-400)', 8], ['EAD / travel documents', 6], ['E-2 / investor', 4],
    ['PERM', 5], ['Humanitarian / TPS / asylum', 7],
  ],
  casesByAttorney: [ ['Sarah Pollak', 36], ['Daniel Reyes', 28] ],
  prepTimeDays: [ ['H-1B extension', 18], ['I-485 package', 34], ['N-400', 12], ['E-2', 41], ['PERM', 62] ],
  noticeProcessing: { autoMatched: 82, humanReviewed: 100, avgMinutes: 11, count30d: 47 },
  teamCapacity: [
    ['Sarah Pollak', 36, 3, 9], ['Daniel Reyes', 28, 1, 7],
    ['Jessica Tran', 24, 0, 8], ['Marcus Webb', 19, 1, 6], ['Alicia Fuentes', 15, 1, 5],
  ],
  referrals: [ ['Existing client referral', 34], ['Corporate client (HR)', 26], ['Website inquiry', 22], ['Attorney referral', 12], ['Community organization', 6] ],
};

/* Workflow demo — the connected pipeline for notice n1 */
const WORKFLOW_STEPS = [
  { label: 'Notice received', detail: 'PDF arrived in connected inbox uscis-mail@ at 8:42 AM', state: 'done', icon: 'inbox' },
  { label: 'Notice read', detail: 'Document classified as I-797C Receipt Notice; text extracted', state: 'done', icon: 'doc' },
  { label: 'Client identified', detail: 'Matched to David Kim (A-217-990-412) — 97% confidence', state: 'done', icon: 'person' },
  { label: 'Case identified', detail: 'Matched to PLK-2025-0034 · I-485 Adjustment of Status', state: 'done', icon: 'case' },
  { label: 'Receipt data extracted', detail: 'Receipt no., priority date, service center, notice date', state: 'done', icon: 'extract' },
  { label: 'Awaiting attorney review', detail: 'S. Pollak must approve before filing and deadline creation', state: 'current', icon: 'review' },
  { label: 'File to case', detail: 'Will file under Government Notices in PLK-2025-0034', state: 'pending', icon: 'file' },
  { label: 'Update case status', detail: 'Will record receipt number and set stage to “Receipted”', state: 'pending', icon: 'update' },
  { label: 'Create deadlines', detail: 'Biometrics monitoring + status check reminders', state: 'pending', icon: 'calendar' },
  { label: 'Audit log entry', detail: 'Every step above is recorded with actor, time, and source', state: 'pending', icon: 'audit' },
];
