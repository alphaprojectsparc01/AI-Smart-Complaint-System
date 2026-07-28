// Seed data so the app feels alive on first run. Everything here is fake/demo data.
export const DEMO_MOBILE = '9876543210';

export const seedUser = {
  name: 'Hari Kumar',
  mobile: DEMO_MOBILE,
  email: 'hari.kumar@email.com',
};

let idCounter = 124;
export function nextComplaintId() {
  idCounter += 1;
  return `ASC${new Date().getFullYear()}${String(idCounter).padStart(5, '0')}`;
}

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (n) => new Date(Date.now() - n * 60 * 60 * 1000).toISOString();

export const seedComplaints = [
  {
    id: 'ASC202400124',
    issueType: 'Road Damage',
    departmentId: 'roads',
    description: 'There is a big pothole on the road causing problems for vehicles.',
    address: 'Main Road, Near Bus Stand, Kakinada',
    landmark: 'Opposite to SBI Bank',
    mobile: DEMO_MOBILE,
    status: 'In Progress',
    photo: null,
    confidence: 96,
    createdAt: hoursAgo(2),
    history: [
      { label: 'Complaint Submitted', at: daysAgo(2), done: true },
      { label: 'Assigned to Officer', at: daysAgo(1), done: true },
      { label: 'In Progress', at: hoursAgo(6), done: true },
      { label: 'Resolved', at: null, done: false },
    ],
  },
  {
    id: 'ASC202400123',
    issueType: 'Water Leakage',
    departmentId: 'water',
    description: 'Continuous water leakage from the main pipeline near the park.',
    address: 'Gandhi Nagar, 2nd Lane',
    landmark: 'Near Community Park',
    mobile: DEMO_MOBILE,
    status: 'In Progress',
    photo: null,
    confidence: 91,
    createdAt: hoursAgo(2),
    history: [
      { label: 'Complaint Submitted', at: daysAgo(1), done: true },
      { label: 'Assigned to Officer', at: hoursAgo(20), done: true },
      { label: 'In Progress', at: hoursAgo(2), done: true },
      { label: 'Resolved', at: null, done: false },
    ],
  },
  {
    id: 'ASC202400122',
    issueType: 'Garbage Dump',
    departmentId: 'municipal',
    description: 'Garbage has not been collected for over a week.',
    address: 'Ashok Nagar, Street 5',
    landmark: 'Near Government School',
    mobile: DEMO_MOBILE,
    status: 'Pending',
    photo: null,
    confidence: 89,
    createdAt: daysAgo(1),
    history: [{ label: 'Complaint Submitted', at: daysAgo(1), done: true }],
  },
  {
    id: 'ASC202400121',
    issueType: 'Road Damage',
    departmentId: 'roads',
    description: 'Broken road surface near the market causing traffic jams.',
    address: 'Market Road',
    landmark: 'Near Vegetable Market',
    mobile: DEMO_MOBILE,
    status: 'Resolved',
    photo: null,
    confidence: 94,
    createdAt: daysAgo(2),
    history: [
      { label: 'Complaint Submitted', at: daysAgo(5), done: true },
      { label: 'Assigned to Officer', at: daysAgo(4), done: true },
      { label: 'In Progress', at: daysAgo(3), done: true },
      { label: 'Resolved', at: daysAgo(2), done: true },
    ],
  },
  {
    id: 'ASC202400120',
    issueType: 'Street Light Issue',
    departmentId: 'electricity',
    description: 'Street light not working for the past 10 days.',
    address: 'Ring Road, Block 4',
    landmark: 'Near Water Tank',
    mobile: '9123456780',
    status: 'Resolved',
    photo: null,
    confidence: 92,
    createdAt: daysAgo(6),
    history: [
      { label: 'Complaint Submitted', at: daysAgo(6), done: true },
      { label: 'Assigned to Officer', at: daysAgo(5), done: true },
      { label: 'In Progress', at: daysAgo(4), done: true },
      { label: 'Resolved', at: daysAgo(3), done: true },
    ],
  },
  {
    id: 'ASC202400119',
    issueType: 'Sewage Overflow',
    departmentId: 'municipal',
    description: 'Sewage water overflowing onto the street.',
    address: 'Balaji Nagar',
    landmark: 'Near Temple',
    mobile: '9988776655',
    status: 'In Progress',
    photo: null,
    confidence: 88,
    createdAt: daysAgo(1),
    history: [
      { label: 'Complaint Submitted', at: daysAgo(1), done: true },
      { label: 'Assigned to Officer', at: hoursAgo(10), done: true },
    ],
  },
];

export const seedNotifications = [
  {
    id: 'n1',
    complaintId: 'ASC202400124',
    message: { en: 'Your complaint ASC202400124 has been assigned to an officer.', te: 'మీ ఫిర్యాదు ASC202400124 అధికారికి కేటాయించబడింది.' },
    at: hoursAgo(10),
    type: 'info',
  },
  {
    id: 'n2',
    complaintId: 'ASC202400123',
    message: { en: 'Your complaint ASC202400123 is now in progress.', te: 'మీ ఫిర్యాదు ASC202400123 ఇప్పుడు ప్రగతిలో ఉంది.' },
    at: hoursAgo(2),
    type: 'info',
  },
  {
    id: 'n3',
    complaintId: 'ASC202400121',
    message: { en: 'Your complaint ASC202400121 has been resolved.', te: 'మీ ఫిర్యాదు ASC202400121 పరిష్కరించబడింది.' },
    at: daysAgo(2),
    type: 'success',
  },
  {
    id: 'n4',
    complaintId: null,
    message: { en: 'Welcome to AI Smart Complaint System!', te: 'AI స్మార్ట్ ఫిర్యాదు వ్యవస్థకు స్వాగతం!' },
    at: daysAgo(3),
    type: 'welcome',
  },
];

export const cityStats = {
  total: 1248,
  pending: 356,
  inProgress: 542,
  resolved: 892,
};

export const monthlyTrend = [
  { month: 'Jan', total: 210, resolved: 150 },
  { month: 'Feb', total: 260, resolved: 190 },
  { month: 'Mar', total: 300, resolved: 220 },
  { month: 'Apr', total: 240, resolved: 200 },
  { month: 'May', total: 320, resolved: 260 },
  { month: 'Jun', total: 280, resolved: 230 },
];
