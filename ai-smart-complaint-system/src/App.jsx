import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import ComplaintSuccess from './pages/ComplaintSuccess';
import Track from './pages/Track';
import ComplaintDetail from './pages/ComplaintDetail';
import PublicComplaints from './pages/PublicComplaints';
import SOS from './pages/SOS';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

import AdminDashboard from './pages/admin/Dashboard';
import AdminComplaints from './pages/admin/Complaints';
import AdminDepartments from './pages/admin/Departments';
import AdminOfficers from './pages/admin/Officers';
import AdminAnalytics from './pages/admin/Analytics';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminSettings from './pages/admin/Settings';

import Departments from './pages/Departments';
import PersonalInfo from './pages/PersonalInfo';
import ChangePassword from './pages/ChangePassword';
import Support from './pages/Support';

// Protects private pages: Redirects to /login if NOT logged in
function RequireAuth({ children }) {
  const { user } = useApp();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

// Protects public pages: Redirects to /dashboard if ALREADY logged in
function RequireGuest({ children }) {
  const { user } = useApp();
  if (user) return <Navigate to="/home" replace />;
  return children;
}

// Protects admin pages: Redirects to /dashboard if NOT an admin
function RequireAdmin({ children }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useApp();

  return (
    <Routes>
      {/* Root Path: Automatically route based on login status */}
      <Route path="/" element={user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} />
      
      {/* Public Pages */}
      <Route path="/home" element={<Home />} />
      <Route path="/track" element={<Track />} />
      <Route path="/complaint/:id" element={<ComplaintDetail />} />
      <Route path="/public-complaints" element={<PublicComplaints />} />
      <Route path="/sos" element={<SOS />} />
      <Route path="/departments" element={<Departments />} />

      {/* Guest-Only Pages */}
      <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
      <Route path="/register" element={<RequireGuest><Register /></RequireGuest>} />

      {/* Protected Private Citizen Pages */}
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/report" element={<RequireAuth><ReportIssue /></RequireAuth>} />
      <Route path="/report/success/:id" element={<RequireAuth><ComplaintSuccess /></RequireAuth>} />
      <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
      
      {/* Citizen Profile Submenus */}
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/profile/edit" element={<RequireAuth><PersonalInfo /></RequireAuth>} />
      <Route path="/profile/password" element={<RequireAuth><ChangePassword /></RequireAuth>} />
      <Route path="/profile/support" element={<RequireAuth><Support /></RequireAuth>} />

      {/* =====================================================================
          PROTECTED MUNICIPAL ADMINISTRATION SUITE
          ===================================================================== */}
      <Route path="/admin" element={<RequireAdmin><Outlet /></RequireAdmin>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="complaints" element={<AdminComplaints />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="officers" element={<AdminOfficers />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Fallback for 404/Unknown URLs */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </LanguageProvider>
  );
}