// CrimeSphere AI — Mock Data
// All data mirrors the HTML prototype and is shaped for future FastAPI integration

import type { Case, Alert, TickerItem, StatCard, ChatMessage, NetworkNode, NetworkEdge, MapPin, PatrolUnit, Layer } from '../types';

// ─── Officer ───────────────────────────────────────────────────────────────────
export const MOCK_OFFICER = {
  id: 'OFF-001',
  name: 'Insp. R. Kumaraswamy',
  initials: 'RK',
  rank: 'Duty Officer',
  station: 'Whitefield Sub-Division',
  force: 'Karnataka State Police',
  shift: '08 JUL 2026 · 14:20 IST',
  badgeNumber: 'KSP-WF-4421',
  email: 'r.kumaraswamy@ksp.gov.in',
  phone: '+91-80-2845-0001',
  joiningDate: '15 Mar 2012',
  currentAssignment: 'Duty Officer — Whitefield PS',
  photoUrl: null,
};

// ─── Stat Cards ────────────────────────────────────────────────────────────────
export const MOCK_STATS: StatCard[] = [
  {
    id: 'stat-1',
    value: 27,
    label: 'Open cases',
    delta: '▲ 3 since yesterday',
    trend: 'up',
    color: 'red',
  },
  {
    id: 'stat-2',
    value: 6,
    label: 'FIRs filed today',
    delta: '▲ 1 pending review',
    trend: 'up',
    color: 'amber',
  },
  {
    id: 'stat-3',
    value: 18,
    label: 'Patrol units on duty',
    delta: 'All sectors covered',
    trend: 'down',
    color: 'green',
  },
  {
    id: 'stat-4',
    value: 4,
    label: 'Active alerts',
    delta: '2 require attention',
    trend: 'up',
    color: 'navy',
  },
];

// ─── Incident Bar Chart ─────────────────────────────────────────────────────────
export const MOCK_CHART_DATA = [
  { day: 'Tue', count: 52 / 9 * 7, isToday: false },
  { day: 'Wed', count: 70 / 9 * 7, isToday: false },
  { day: 'Thu', count: 44 / 9 * 7, isToday: false },
  { day: 'Fri', count: 80 / 9 * 7, isToday: false },
  { day: 'Sat', count: 63 / 9 * 7, isToday: false },
  { day: 'Sun', count: 90 / 9 * 7, isToday: false },
  { day: 'Mon', count: 57 / 9 * 7, isToday: true },
];

// Normalised 0-10
export const MOCK_BAR_DATA = [
  { x: 'Tue', y: 4 },
  { x: 'Wed', y: 6 },
  { x: 'Thu', y: 3 },
  { x: 'Fri', y: 7 },
  { x: 'Sat', y: 5 },
  { x: 'Sun', y: 8 },
  { x: 'Mon', y: 5 },
];

// ─── Live Feed / Ticker ─────────────────────────────────────────────────────────
export const MOCK_LIVE_FEED: TickerItem[] = [
  {
    id: 'feed-1',
    severity: 'red',
    title: 'Repeat MO flagged',
    detail: 'New FIR at Hoodi matches pattern from case KA-CR-1142.',
    time: '2 min ago',
  },
  {
    id: 'feed-2',
    severity: 'amber',
    title: 'Patrol deviation',
    detail: 'Unit PCR-14 off assigned route near ITPL Main Road.',
    time: '11 min ago',
  },
  {
    id: 'feed-3',
    severity: 'green',
    title: 'Case linked',
    detail: 'Vehicle KA-05-AB-4471 connected to 2 prior complaints.',
    time: '27 min ago',
  },
  {
    id: 'feed-4',
    severity: 'red',
    title: 'Cyber fraud spike',
    detail: '9 UPI fraud complaints from Whitefield in past 48 hrs.',
    time: '1 hr ago',
  },
];

// ─── Priority Cases (Overview) ──────────────────────────────────────────────────
export const MOCK_PRIORITY_CASES: TickerItem[] = [
  {
    id: 'pcase-1',
    severity: 'red',
    title: 'KA-CR-1142 — Chain snatching, Hoodi Circle',
    detail: 'Third similar incident in the area this month; suspect sketch on file.',
    time: 'Assigned: SI Manjunath',
  },
  {
    id: 'pcase-2',
    severity: 'amber',
    title: 'KA-CR-1156 — Online loan app harassment',
    detail: 'Victim statement recorded, bank account trace pending.',
    time: 'Assigned: SI Deepa R.',
  },
  {
    id: 'pcase-3',
    severity: 'amber',
    title: 'KA-CR-1149 — Vehicle theft, ITPL parking',
    detail: 'CCTV footage from 3 cameras awaiting review.',
    time: 'Assigned: HC Prakash',
  },
];

// ─── Cases ─────────────────────────────────────────────────────────────────────
export const MOCK_CASES: Case[] = [
  {
    id: 'KA-CR-1142',
    firNumber: 'FIR KA-CR-1142',
    title: 'Chain snatching — Hoodi Circle',
    priority: 'urgent',
    filedDate: '07 Jul 2026',
    complainant: 'Lakshmi N.',
    investigatingOfficer: 'SI Manjunath',
    description: 'Two-wheeler-borne suspects, gold chain, near bus stop, evening hours.',
    entities: ['veh: KA-05-EF-2091', 'phone: withheld', 'MO: 2-wheeler snatch', '3 linked FIRs'],
    footerNote: 'Matches historical pattern in Sector 6',
    category: 'property',
    status: 'open',
    linkedCases: ['KA-CR-1098', 'KA-CR-1076'],
    sector: 'Sector 6',
    location: 'Hoodi Circle, Whitefield',
    latitude: 12.9882,
    longitude: 77.6601,
    evidence: [
      { id: 'ev-1', type: 'sketch', title: 'Suspect sketch', description: 'Composite from 2 witnesses', date: '07 Jul 2026' },
      { id: 'ev-2', type: 'document', title: 'Complainant statement', description: 'Recorded by SI Manjunath', date: '07 Jul 2026' },
    ],
    timeline: [
      { id: 'tl-1', date: '07 Jul 2026', time: '18:45', event: 'FIR filed by Lakshmi N.', officer: 'HC Shalini' },
      { id: 'tl-2', date: '07 Jul 2026', time: '19:10', event: 'Case assigned to SI Manjunath', officer: 'Insp. R. Kumaraswamy' },
      { id: 'tl-3', date: '08 Jul 2026', time: '09:30', event: 'Pattern match flagged by system — linked to KA-CR-1098, 1076', officer: 'System' },
    ],
  },
  {
    id: 'KA-CR-1156',
    firNumber: 'FIR KA-CR-1156',
    title: 'Loan app harassment complaint',
    priority: 'review',
    filedDate: '06 Jul 2026',
    complainant: 'S. Venkatesh',
    investigatingOfficer: 'SI Deepa R.',
    description: 'Recurring threats via calls after digital loan default; app unregistered.',
    entities: ['acct: HDFC ****3321', 'app: "QuickCash Pro"', 'cyber-physical'],
    footerNote: 'Bank trace pending',
    category: 'cyber',
    status: 'open',
    linkedCases: [],
    sector: 'Whitefield',
    location: 'Whitefield Main Road',
    latitude: 12.9698,
    longitude: 77.7499,
    evidence: [
      { id: 'ev-3', type: 'document', title: 'Victim statement', description: 'Recorded by SI Deepa R.', date: '06 Jul 2026' },
      { id: 'ev-4', type: 'screenshot', title: 'App screenshots', description: 'QuickCash Pro — 14 screenshots', date: '06 Jul 2026' },
    ],
    timeline: [
      { id: 'tl-4', date: '06 Jul 2026', time: '11:00', event: 'FIR filed by S. Venkatesh', officer: 'HC Prakash' },
      { id: 'tl-5', date: '06 Jul 2026', time: '14:30', event: 'Case assigned to SI Deepa R.', officer: 'Insp. R. Kumaraswamy' },
      { id: 'tl-6', date: '07 Jul 2026', time: '10:00', event: 'Bank account trace request submitted to HDFC', officer: 'SI Deepa R.' },
    ],
  },
  {
    id: 'KA-CR-1149',
    firNumber: 'FIR KA-CR-1149',
    title: 'Vehicle theft — ITPL parking',
    priority: 'review',
    filedDate: '05 Jul 2026',
    complainant: 'R. Fernandes',
    investigatingOfficer: 'HC Prakash',
    description: 'Motorcycle reported missing from basement parking, no forced entry.',
    entities: ['veh: KA-05-AB-4471', 'CCTV: 3 cameras', '2 prior complaints'],
    footerNote: 'Footage under review',
    category: 'property',
    status: 'open',
    linkedCases: [],
    sector: 'ITPL',
    location: 'ITPL Main Road, Whitefield',
    latitude: 12.9785,
    longitude: 77.6939,
    evidence: [
      { id: 'ev-5', type: 'cctv', title: 'CCTV Camera 1 — Basement entry', description: 'Recording from 2200–0200 hrs', date: '05 Jul 2026' },
      { id: 'ev-6', type: 'cctv', title: 'CCTV Camera 2 — Parking level B2', description: 'Recording from 2200–0200 hrs', date: '05 Jul 2026' },
      { id: 'ev-7', type: 'cctv', title: 'CCTV Camera 3 — Exit ramp', description: 'Recording from 2200–0200 hrs', date: '05 Jul 2026' },
    ],
    timeline: [
      { id: 'tl-7', date: '05 Jul 2026', time: '08:10', event: 'FIR filed by R. Fernandes', officer: 'HC Shalini' },
      { id: 'tl-8', date: '05 Jul 2026', time: '09:45', event: 'CCTV footage requested from ITPL management', officer: 'HC Prakash' },
      { id: 'tl-9', date: '06 Jul 2026', time: '15:00', event: 'Footage received — under review', officer: 'HC Prakash' },
    ],
  },
  {
    id: 'KA-CR-1138',
    firNumber: 'FIR KA-CR-1138',
    title: 'Neighbourhood dispute, assault',
    priority: 'routine',
    filedDate: '03 Jul 2026',
    complainant: 'G. Ramesh',
    investigatingOfficer: 'HC Shalini',
    description: 'Verbal dispute escalated to minor physical altercation between neighbours.',
    entities: ['no priors', 'witness x2'],
    footerNote: 'Statement recording scheduled',
    category: 'assault',
    status: 'open',
    linkedCases: [],
    sector: 'Sector 4',
    location: 'Marathahalli, Whitefield',
    latitude: 12.9568,
    longitude: 77.7009,
    evidence: [
      { id: 'ev-8', type: 'document', title: 'Initial complaint', description: 'Filed by G. Ramesh', date: '03 Jul 2026' },
    ],
    timeline: [
      { id: 'tl-10', date: '03 Jul 2026', time: '20:30', event: 'FIR filed by G. Ramesh', officer: 'HC Shalini' },
      { id: 'tl-11', date: '04 Jul 2026', time: '10:00', event: 'Witness statements scheduled', officer: 'HC Shalini' },
    ],
  },
  {
    id: 'KA-CR-1098',
    firNumber: 'FIR KA-CR-1098',
    title: 'Chain snatching — Near Hoodi Lake',
    priority: 'review',
    filedDate: '22 Jun 2026',
    complainant: 'M. Krishnamurthy',
    investigatingOfficer: 'SI Manjunath',
    description: 'Gold chain snatched by two-wheeler borne suspect near Hoodi Lake exit gate.',
    entities: ['MO: 2-wheeler snatch', 'evening hours'],
    footerNote: 'Linked to KA-CR-1142 cluster',
    category: 'property',
    status: 'open',
    linkedCases: ['KA-CR-1142', 'KA-CR-1076'],
    sector: 'Sector 6',
    location: 'Hoodi Lake, Whitefield',
    latitude: 12.9901,
    longitude: 77.6621,
    evidence: [],
    timeline: [
      { id: 'tl-12', date: '22 Jun 2026', time: '19:15', event: 'FIR filed', officer: 'HC Prakash' },
    ],
  },
  {
    id: 'KA-CR-1076',
    firNumber: 'FIR KA-CR-1076',
    title: 'Chain snatching — Marathahalli Bridge',
    priority: 'review',
    filedDate: '11 Jun 2026',
    complainant: 'P. Suresh',
    investigatingOfficer: 'SI Manjunath',
    description: 'Two-wheeler snatched gold chain from pedestrian near Marathahalli bridge.',
    entities: ['MO: 2-wheeler snatch'],
    footerNote: 'Earliest in cluster',
    category: 'property',
    status: 'open',
    linkedCases: ['KA-CR-1142', 'KA-CR-1098'],
    sector: 'Sector 5',
    location: 'Marathahalli Bridge, Whitefield',
    latitude: 12.9537,
    longitude: 77.7012,
    evidence: [],
    timeline: [
      { id: 'tl-13', date: '11 Jun 2026', time: '20:00', event: 'FIR filed', officer: 'HC Shalini' },
    ],
  },
];

// ─── Case Filters ───────────────────────────────────────────────────────────────
export const MOCK_CASE_FILTERS = [
  { id: 'all', label: 'All (27)', value: 'all' },
  { id: 'high', label: 'High priority (6)', value: 'urgent' },
  { id: 'cyber', label: 'Cyber (9)', value: 'cyber' },
  { id: 'property', label: 'Property crime (8)', value: 'property' },
  { id: 'unassigned', label: 'Unassigned (2)', value: 'unassigned' },
];

// ─── Alerts ─────────────────────────────────────────────────────────────────────
export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-1',
    type: 'pattern',
    severity: 'red',
    title: 'Pattern match — chain snatching cluster',
    description: 'FIR 1142 shares MO and location radius with two open cases in Hoodi.',
    time: '2 min ago',
    timestamp: '2026-07-08T14:18:00Z',
    isRead: false,
    linkedCaseId: 'KA-CR-1142',
  },
  {
    id: 'alert-2',
    type: 'patrol',
    severity: 'amber',
    title: 'Patrol deviation',
    description: 'Unit PCR-14 has been off its assigned route for 18 minutes.',
    time: '11 min ago',
    timestamp: '2026-07-08T14:09:00Z',
    isRead: false,
    linkedCaseId: null,
  },
  {
    id: 'alert-3',
    type: 'trend',
    severity: 'amber',
    title: 'Rising complaint volume — UPI fraud',
    description: '9 complaints from Whitefield in 48 hours, up from a weekly average of 3.',
    time: '1 hr ago',
    timestamp: '2026-07-08T13:20:00Z',
    isRead: true,
    linkedCaseId: null,
  },
  {
    id: 'alert-4',
    type: 'link',
    severity: 'green',
    title: 'Repeat offender identified',
    description: 'Vehicle KA-05-AB-4471 now linked to a second, unrelated theft complaint.',
    time: '2 hr ago',
    timestamp: '2026-07-08T12:20:00Z',
    isRead: true,
    linkedCaseId: 'KA-CR-1149',
  },
];

// ─── Chat Messages (Copilot) ────────────────────────────────────────────────────
export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'any chain snatching cases near Hoodi in the last month that look connected?',
    time: '14:02',
    timestamp: '2026-07-08T14:02:00Z',
  },
  {
    id: 'msg-2',
    role: 'copilot',
    content: "Three, actually — FIR 1142, 1098 and 1076. All within half a kilometre of Hoodi Circle, all evening hours, all two-wheeler suspects. Same build in two witness sketches. Worth pulling CCTV from the ITPL junction camera for that window.",
    time: '14:02',
    timestamp: '2026-07-08T14:02:30Z',
  },
  {
    id: 'msg-3',
    role: 'user',
    content: 'good — draft a case linking note for all three and flag it to SI Manjunath',
    time: '14:05',
    timestamp: '2026-07-08T14:05:00Z',
  },
  {
    id: 'msg-4',
    role: 'copilot',
    content: "Done — linking note added to all three files, and it's in Manjunath's queue for morning briefing. Flagged as a pattern under review, not yet confirmed.",
    time: '14:05',
    timestamp: '2026-07-08T14:05:30Z',
  },
];

export const MOCK_SUGGESTED_QUESTIONS = [
  'Show me unassigned FIRs this week',
  'Any vehicles flagged across multiple cases?',
  'Which sectors had the most incidents last 7 days?',
  'Summarise cyber fraud cases from June',
  'Who is on duty tonight?',
];

// ─── Network Graph ──────────────────────────────────────────────────────────────
export const MOCK_NETWORK_NODES: NetworkNode[] = [
  { id: 'n1', label: 'Suspect', type: 'suspect', x: 280, y: 200, radius: 26, color: '#14213D' },
  { id: 'n2', label: 'Alias', type: 'alias', x: 140, y: 100, radius: 18, color: '#3C4E6E' },
  { id: 'n3', label: 'Phone', type: 'phone', x: 430, y: 90, radius: 18, color: '#3C4E6E' },
  { id: 'n4', label: 'Address', type: 'address', x: 120, y: 300, radius: 18, color: '#3C4E6E' },
  { id: 'n5', label: 'FIR 1142', type: 'fir', x: 420, y: 320, radius: 22, color: '#B23A2E' },
  { id: 'n6', label: 'Vehicle', type: 'vehicle', x: 460, y: 240, radius: 16, color: '#8A6B2E' },
  { id: 'n7', label: 'Associate', type: 'associate', x: 90, y: 380, radius: 16, color: '#3C4E6E' },
];

export const MOCK_NETWORK_EDGES: NetworkEdge[] = [
  { id: 'e1', from: 'n1', to: 'n2', color: '#C7C2AF', width: 1.5 },
  { id: 'e2', from: 'n1', to: 'n3', color: '#C7C2AF', width: 1.5 },
  { id: 'e3', from: 'n1', to: 'n4', color: '#C7C2AF', width: 1.5 },
  { id: 'e4', from: 'n1', to: 'n5', color: '#B23A2E', width: 2 },
  { id: 'e5', from: 'n5', to: 'n6', color: '#C7C2AF', width: 1.5 },
  { id: 'e6', from: 'n4', to: 'n7', color: '#C7C2AF', width: 1.5 },
];

export const MOCK_SUSPECT_PROFILE = {
  id: 'S-2291',
  name: 'Suspect S-2291',
  aliases: ['Chintu', 'Raju'],
  vehicles: [{ reg: 'KA-05-EF-2091', model: 'Pulsar 150' }],
  linkedFirs: ['KA-CR-1142', 'KA-CR-1098', 'KA-CR-1076'],
  linkedFirsNote: 'Same MO, Sector 6, last 5 weeks',
  associates: 1,
  associatesNote: 'Seen together, 2 witness statements',
};

// ─── Map Pins ──────────────────────────────────────────────────────────────────
export const MOCK_MAP_PINS: MapPin[] = [
  { id: 'pin-1', type: 'hotspot', severity: 'red', x: 330, y: 215, label: 'Hoodi Circle', radius: 42, dotRadius: 8 },
  { id: 'pin-2', type: 'watch', severity: 'amber', x: 410, y: 260, label: 'ITPL Parking', radius: 30, dotRadius: 6 },
  { id: 'pin-3', type: 'watch', severity: 'amber', x: 250, y: 330, label: 'Marathahalli Bridge', radius: 26, dotRadius: 6 },
  { id: 'pin-4', type: 'cleared', severity: 'green', x: 520, y: 150, label: 'Sector 9', radius: 20, dotRadius: 6 },
];

export const MOCK_PATROL_UNITS: PatrolUnit[] = [
  { id: 'PCR-14', x: 120, y: 280, label: 'PCR-14', status: 'deviated' },
  { id: 'PCR-09', x: 470, y: 330, label: 'PCR-09', status: 'active' },
  { id: 'PCR-03', x: 560, y: 90, label: 'PCR-03', status: 'active' },
];

export const MOCK_MAP_LAYERS: Layer[] = [
  { id: 'cctv', label: 'CCTV coverage', enabled: true },
  { id: 'patrol', label: 'Patrol positions', enabled: true },
  { id: 'hotspots', label: '30-day hotspots', enabled: true },
  { id: 'cyber', label: 'Cyber fraud origin points', enabled: false },
  { id: 'streetlight', label: 'Streetlight outages', enabled: false },
  { id: 'prediction', label: 'Predicted risk (next 7 days)', enabled: false },
];

// ─── Notifications ──────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS = [
  ...MOCK_ALERTS.map(a => ({ ...a, category: 'alert' as const })),
  {
    id: 'notif-5',
    type: 'system',
    severity: 'green' as const,
    title: 'Shift change reminder',
    description: 'Night shift begins at 22:00. Please update duty log.',
    time: '3 hr ago',
    timestamp: '2026-07-08T11:20:00Z',
    isRead: true,
    linkedCaseId: null,
    category: 'system' as const,
  },
  {
    id: 'notif-6',
    type: 'system',
    severity: 'amber' as const,
    title: 'Weekly report due',
    description: 'Sub-division weekly crime summary report is due by Friday 17:00.',
    time: '5 hr ago',
    timestamp: '2026-07-08T09:20:00Z',
    isRead: true,
    linkedCaseId: null,
    category: 'system' as const,
  },
];

// ─── Monthly Trend (for analytics charts) ──────────────────────────────────────
export const MOCK_MONTHLY_TREND = [
  { month: 'Jan', cases: 18 },
  { month: 'Feb', cases: 22 },
  { month: 'Mar', cases: 19 },
  { month: 'Apr', cases: 25 },
  { month: 'May', cases: 21 },
  { month: 'Jun', cases: 29 },
  { month: 'Jul', cases: 27 },
];

export const MOCK_CATEGORY_DATA = [
  { category: 'Cyber', count: 9, color: '#3C4E6E' },
  { category: 'Property', count: 8, color: '#B23A2E' },
  { category: 'Assault', count: 4, color: '#B5811A' },
  { category: 'Vehicle', count: 4, color: '#3F6B4F' },
  { category: 'Others', count: 2, color: '#6B6F76' },
];
