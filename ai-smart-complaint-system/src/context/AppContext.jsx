import { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext(null);

function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }) {
  // 1. Initialize states strictly from local storage fallbacks or empty states
  const [user, setUser] = useState(() => loadState('user', null));
  const [complaints, setComplaints] = useState(() => loadState('asc_complaints', []));
  const [notifications, setNotifications] = useState(() => loadState('asc_notifications', []));

  // 2. Sync local storage whenever states update dynamically
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // Safety reset if user wipes out
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('asc_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('asc_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // 3. Set real backend response objects to global state
  const login = (userData) => {
    setUser(userData);
  };

  const register = (userData) => {
    // Handled by API call directly, but we can store locally if needed post-registration
   alert("Login to your account");
  };

  const logout = () => {
    setUser(null);
    setComplaints([]);
    setNotifications([]);
  };

  const addComplaint = (complaint) => {
    setComplaints((prev) => [complaint, ...prev]);
  };

  // 4. Utilities for filtering live database collections
  const findByEmail = (email) => complaints.filter((c) => c.email === email);
  const findById = (id) => complaints.find((c) => String(c.id).toLowerCase() === String(id).toLowerCase());

  // Filter complaints based on the authenticated user's email field
  const myComplaints = user ? findByEmail(user.email) : [];

  const value = {
    user,
    login,
    register,
    logout,
    complaints,
    setComplaints, // Exposed so you can fetch entire lists from backend and set them easily
    addComplaint,
    findByEmail,
    findById,
    myComplaints,
    notifications,
    setNotifications
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}