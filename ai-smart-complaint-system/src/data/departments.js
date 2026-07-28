// Master list of departments. `icon` is a lucide-react icon name (resolved in DepartmentIcon.jsx).
// `issueTypes` links the department to the issue categories the AI classifier can detect.
const departments = [
  {
    id: 'water',
    name: { en: 'Water Dept', te: 'నీటి శాఖ' },
    icon: 'Droplets',
    color: '#2E5AAE',
    bg: '#E7EDF7',
    phone: '1800-123-0128',
    issueTypes: ['Water Leakage', 'No Water Supply', 'Contaminated Water'],
  },
  {
    id: 'municipal',
    name: { en: 'Municipal Corp', te: 'మున్సిపల్ కార్పొరేషన్' },
    icon: 'Building2',
    color: '#1F9D55',
    bg: '#E1F6E9',
    phone: '1800-123-0212',
    issueTypes: ['Garbage Dump', 'Sewage Overflow', 'Stray Animals'],
  },
  {
    id: 'health',
    name: { en: 'Health Dept', te: 'ఆరోగ్య శాఖ' },
    icon: 'HeartPulse',
    color: '#D14343',
    bg: '#FBE2E2',
    phone: '1800-123-0098',
    issueTypes: ['Health Hazard', 'Mosquito Breeding', 'Unhygienic Food Stall'],
  },
  {
    id: 'roads',
    name: { en: 'Roads & Transport', te: 'రోడ్లు & రవాణా' },
    icon: 'Construction',
    color: '#C98A16',
    bg: '#FCEFD3',
    phone: '1800-123-0156',
    issueTypes: ['Road Damage', 'Traffic Signal Fault', 'Illegal Parking'],
  },
  {
    id: 'electricity',
    name: { en: 'Electricity Dept', te: 'విద్యుత్ శాఖ' },
    icon: 'Zap',
    color: '#D9631E',
    bg: '#FBE7D8',
    phone: '1800-123-0121',
    issueTypes: ['Street Light Issue', 'Power Outage', 'Exposed Wiring'],
  },
];

export default departments;

export function departmentForIssue(issueType) {
  return departments.find((d) => d.issueTypes.includes(issueType)) || departments[0];
}
