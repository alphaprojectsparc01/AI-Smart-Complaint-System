// Central bilingual dictionary. Add a new key here and it becomes available
// via the useLang() hook as t('key') in both English and Telugu.
const translations = {
  appName: { en: 'AI Smart Complaint System', te: 'AI స్మార్ట్ ఫిర్యాదు వ్యవస్థ' },
  tagline: { en: 'Report Issues. Build Better Cities.', te: 'సమస్యలు నివేదించండి. మెరుగైన నగరాలు నిర్మించండి.' },

  // Home
  reportIssue: { en: 'Report Issue', te: 'ఫిర్యాదు నమోదు చేయండి' },
  trackComplaint: { en: 'Track Complaint', te: 'ఫిర్యాదు ట్రాక్ చేయండి' },
  sos: { en: 'SOS', te: 'ఆత్యవసర సేవలు' },
  totalComplaints: { en: 'Total Complaints', te: 'మొత్తం ఫిర్యాదులు' },
  pending: { en: 'Pending', te: 'పెండింగ్‌లో' },
  resolved: { en: 'Resolved', te: 'పరిష్కరించబడింది' },
  departments: { en: 'Departments', te: 'శాఖలు' },
  viewAll: { en: 'View All', te: 'అన్నీ చూడండి' },
  recentComplaints: { en: 'Recent Complaints', te: 'ఇటీవలి ఫిర్యాదులు' },
  inProgress: { en: 'In Progress', te: 'ప్రగతిలో ఉంది' },

  // Auth
  welcomeBack: { en: 'Welcome Back!', te: 'తిరిగి స్వాగతం!' },
  loginToContinue: { en: 'Login to continue', te: 'కొనసాగించడానికి లాగిన్ అవ్వండి' },
  createAccount: { en: 'Create Account', te: 'ఖాతా సృష్టించండి' },
  fullName: { en: 'Full Name', te: 'పూర్తి పేరు' },
  mobileNumber: { en: 'Mobile Number', te: 'మొబైల్ నంబర్' },
  email: { en: 'Email', te: 'ఇమెయిల్' },
  password: { en: 'Password', te: 'పాస్‌వర్డ్' },
  forgotPassword: { en: 'Forgot Password?', te: 'పాస్‌వర్డ్ మర్చిపోయారా?' },
  login: { en: 'Login', te: 'లాగిన్' },
  register: { en: 'Register', te: 'నమోదు చేయండి' },
  noAccount: { en: "Don't have an account?", te: 'ఖాతా లేదా?' },
  haveAccount: { en: 'Already have an account?', te: 'ఇప్పటికే ఖాతా ఉందా?' },
  enterMobile: { en: 'Enter mobile number', te: 'మొబైల్ నంబర్ నమోదు చేయండి' },
  enterPassword: { en: 'Enter password', te: 'పాస్‌వర్డ్ నమోదు చేయండి' },
  enterName: { en: 'Enter full name', te: 'పూర్తి పేరు నమోదు చేయండి' },
  enterEmail: { en: 'Enter email', te: 'ఇమెయిల్ నమోదు చేయండి' },

  // Dashboard
  welcomeUser: { en: 'Welcome', te: 'స్వాగతం' },
  myComplaints: { en: 'My Complaints', te: 'నా ఫిర్యాదులు' },
  reportNewIssue: { en: 'Report New Issue', te: 'కొత్త ఫిర్యాదు నమోదు చేయండి' },
  // Add these inside the translations object
  home: { en: 'Home', te: 'హోమ్' },
  dashboard: { en: 'Dashboard', te: 'డాష్‌బోర్డ్' },
  adminPanel: { en: 'Admin Panel', te: 'అడ్మిన్ ప్యానెల్' },
  // Add this inside your translations object
fullView: { en: 'Full View', te: 'పూర్తి వీక్షణ' },
ticketId: { en: 'Ticket ID', te: 'టికెట్ ID' },
  issueContext: { en: 'Issue / Context', te: 'సమస్య / సందర్భం' },
  quickReroute: { en: 'Quick Re-Route', te: 'త్వరిత రీ-రూట్' },
  statusLifecycle: { en: 'Status Lifecycle', te: 'స్థితి చక్రం' },
  dangerControl: { en: 'Danger Control', te: 'ప్రమాద నియంత్రణ' },
  inspectionWorkspace: { en: 'Inspection Workspace', te: 'తనిఖీ వర్క్‌స్పేస్' },
  action: { en: 'Action', te: 'చర్య' },
  searchPlaceholder: { en: 'Search Ticket ID or location address...', te: 'టికెట్ ID లేదా చిరునామా కోసం శోధించండి...' },
  allStatusProfiles: { en: 'All Status Profiles', te: 'అన్ని స్థితి ప్రొఫైల్‌లు' },
  allDeptChannels: { en: 'All Department Channels', te: 'అన్ని శాఖల ఛానెల్‌లు' },
  // Note: Ensure you already have 'pending', 'inProgress', and 'resolved' in your file

  // Report Issue steps
  stepCapture: { en: 'Capture Image', te: 'చిత్రం తీయండి' },
  stepAnalysis: { en: 'AI Analysis', te: 'AI విశ్లేషణ' },
  stepDetails: { en: 'Details', te: 'వివరాలు' },
  stepSubmit: { en: 'Submit', te: 'సమర్పించండి' },
  takePhoto: { en: 'Take a Photo', te: 'ఫోటో తీయండి' },
  camera: { en: 'Camera', te: 'కెమెరా' },
  gallery: { en: 'Gallery', te: 'గ్యాలరీ' },
  supportedFormats: { en: 'Supported formats: JPG, PNG (Max 5MB)', te: 'మద్దతు ఉన్న ఫార్మాట్‌లు: JPG, PNG (గరిష్టం 5MB)' },
  aiAnalyzing: { en: 'AI is Analyzing Your Image...', te: 'AI మీ ఫోటోను విశ్లేషిస్తోంది...' },
  pleaseWait: { en: 'Please wait while we analyze...', te: 'దయచేసి విశ్లేషించే వరకు వేచి ఉండండి...' },
  detectedIssue: { en: 'Detected Issue', te: 'గుర్తించిన సమస్య' },
  confidence: { en: 'Confidence', te: 'నమ్మకం' },
  autoSelected: { en: 'Automatically selected by AI', te: 'AI ద్వారా స్వయంచాలకంగా ఎంపిక చేయబడింది' },
  changeDepartment: { en: 'Change Department', te: 'శాఖను మార్చండి' },
  complaintDetails: { en: 'Complaint Details', te: 'ఫిర్యాదు వివరాలు' },
  description: { en: 'Description', te: 'వివరణ' },
  address: { en: 'Address', te: 'చిరునామా' },
  landmark: { en: 'Landmark', te: 'ల్యాండ్‌మార్క్' },
  selectLocation: { en: 'Select Location', te: 'స్థానాన్ని ఎంచుకోండి' },
  useCurrentLocation: { en: 'Use Current Location', te: 'ప్రస్తుత స్థానాన్ని ఉపయోగించండి' },
  reviewSubmit: { en: 'Review & Submit', te: 'సమీక్షించి సమర్పించండి' },
  department: { en: 'Department', te: 'శాఖ' },
  issue: { en: 'Issue', te: 'సమస్య' },
  location: { en: 'Location', te: 'స్థానం' },
  photo: { en: 'Photo', te: 'ఫోటో' },
  submitComplaint: { en: 'Submit Complaint', te: 'ఫిర్యాదును సమర్పించండి' },
  mobileRequired: { en: 'Mobile number is mandatory to verify your complaint', te: 'మీ ఫిర్యాదును ధృవీకరించడానికి మొబైల్ నంబర్ తప్పనిసరి' },
  next: { en: 'Next', te: 'తదుపరి' },
  back: { en: 'Back', te: 'వెనుకకు' },

  // Success
  submittedSuccess: { en: 'Complaint Submitted Successfully!', te: 'ఫిర్యాదు విజయవంతంగా సమర్పించబడింది!' },
  yourComplaintId: { en: 'Your Complaint ID', te: 'మీ ఫిర్యాదు ID' },
  whatsappUpdate: { en: 'You will receive updates on WhatsApp', te: 'మీకు WhatsApp ద్వారా నవీకరణలు అందుతాయి' },
  goHome: { en: 'Go to Home', te: 'హోమ్‌కి వెళ్ళండి' },

  // Track
  trackYourComplaint: { en: 'Track Your Complaint', te: 'మీ ఫిర్యాదును ట్రాక్ చేయండి' },
  byComplaintId: { en: 'By Complaint ID', te: 'ఫిర్యాదు IDతో' },
  byMobile: { en: 'By Mobile Number', te: 'మొబైల్ నంబర్‌తో' },
  search: { en: 'Search', te: 'శోధించండి' },
  trackingHistory: { en: 'Tracking History', te: 'ట్రాకింగ్ చరిత్ర' },
  dateSubmitted: { en: 'Date Submitted', te: 'సమర్పించిన తేదీ' },
  noResults: { en: 'No complaints found. Check the ID or mobile number.', te: 'ఫిర్యాదులు కనుగొనబడలేదు. ID లేదా మొబైల్ నంబర్ తనిఖీ చేయండి.' },

  // Public complaints
  publicComplaints: { en: 'Public Complaints', te: 'ప్రజా ఫిర్యాదులు' },
  allDepartments: { en: 'All Departments', te: 'అన్ని శాఖలు' },
  allStatus: { en: 'All Status', te: 'అన్ని స్థితులు' },
  allAreas: { en: 'All Areas', te: 'అన్ని ప్రాంతాలు' },

  // SOS
  emergencyServices: { en: 'Emergency Services', te: 'ఆత్యవసర సేవలు' },
  callHint: { en: 'Tap any number to call them instantly', te: 'తక్షణమే కాల్ చేయడానికి ఏదైనా నంబర్‌ను నొక్కండి' },

  // Notifications
  notifications: { en: 'Notifications', te: 'ప్రకటనలు' },

  // Profile
  profile: { en: 'Profile Page', te: 'ప్రొఫైల్ పేజీ' },
  personalInfo: { en: 'Personal Information', te: 'వ్యక్తిగత సమాచారం' },
  changePassword: { en: 'Change Password', te: 'పాస్‌వర్డ్ మార్చండి' },
  languageLabel: { en: 'Language', te: 'భాష' },
  helpSupport: { en: 'Help & Support', te: 'సహాయం & మద్దతు' },
  logout: { en: 'Logout', te: 'లాగ్ అవుట్' },

  // Admin
  adminDashboard: { en: 'Admin Dashboard', te: 'అడ్మిన్ డాష్‌బోర్డ్' },
  dashboardOverview: { en: 'Dashboard Overview', te: 'డాష్‌బోర్డ్ అవలోకనం' },
  complaintsOverview: { en: 'Complaints Overview', te: 'ఫిర్యాదుల అవలోకనం' },
  deptWiseComplaints: { en: 'Department Wise Complaints', te: 'శాఖల వారీగా ఫిర్యాదులు' },
  officers: { en: 'Officers', te: 'అధికారులు' },
  users: { en: 'Users', te: 'వినియోగదారులు' },
  analytics: { en: 'Analytics', te: 'విశ్లేషణలు' },
  settings: { en: 'Settings', te: 'సెట్టింగ్‌లు' },
};

export default translations;
