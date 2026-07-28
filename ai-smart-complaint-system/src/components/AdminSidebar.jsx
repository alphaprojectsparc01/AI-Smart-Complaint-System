import { LayoutGrid, ClipboardList, Building2, Users, BarChart3, Bell, Settings, LogOut, Home, Languages } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

export default function AdminSidebar() {
  const { t, lang, toggleLang } = useLang();
  const { logout } = useApp();
  const navigate = useNavigate();

  const NAV = [
    { path: '/home', icon: Home, label: { en: 'Home', te: 'హోమ్' } },
    { path: '/admin/dashboard', icon: LayoutGrid, label: { en: 'Dashboard', te: 'డాష్‌బోర్డ్' } },
    { path: '/admin/complaints', icon: ClipboardList, label: { en: 'Complaints Management', te: 'ఫిర్యాదుల నిర్వహణ' } },
    { path: '/admin/departments', icon: Building2, label: { en: 'City Departments', te: 'నగర శాఖలు' } },
    { path: '/admin/officers', icon: Users, label: { en: 'Officers Directory', te: 'అధికారుల జాబితా' } },
    { path: '/admin/analytics', icon: BarChart3, label: { en: 'Deep Analytics', te: 'లోతైన విశ్లేషణలు' } },
    { path: '/admin/announcements', icon: Bell, label: { en: 'Broadcast Center', te: 'ప్రకటనల కేంద్రం' } },
    { path: '/admin/settings', icon: Settings, label: { en: 'System Settings', te: 'వ్యవస్థ సెట్టింగ్‌లు' } },
  ];

  const handleLogout = () => { 
    logout(); 
    navigate('/login'); 
  };

return (
    <aside className="hidden w-64 flex-shrink-0 flex-col bg-slate-900 text-white sm:flex border-r border-slate-800 h-screen">
      
      {/* 1. Header (Fixed at top) */}
      <div className="flex-shrink-0 flex items-center gap-2 px-5 py-5 border-b border-slate-800/60">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500 text-white shadow-sm">
          <LayoutGrid size={15} />
        </div>
        <p className="font-bold text-sm tracking-tight">SmartCity Admin v2.6</p>
      </div>

      {/* 2. Navigation (This area scrolls if links are too long) */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV.map((n) => {
          const Icon = n.icon;
          return (
            <NavLink
              key={n.path}
              to={n.path}
              className={({ isActive }) => `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition uppercase tracking-wider ${
                isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Icon size={15} /> {n.label[lang]}
            </NavLink>
          );
        })}
      </nav>

      {/* 3. Footer Controls (Always visible at the bottom) */}
      <div className="flex-shrink-0 border-t border-slate-800 p-3 space-y-1 bg-slate-900">
        <button 
          onClick={toggleLang} 
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold tracking-wider uppercase text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Languages size={15} /> {lang === 'en' ? 'Switch to Telugu' : 'ఇంగ్లీషుకు మారండి'}
        </button>

        <button 
          onClick={handleLogout} 
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold tracking-wider uppercase text-slate-400 hover:bg-red-950/30 hover:text-red-400 transition-colors"
        >
          <LogOut size={15} /> {t('logout')}
        </button>
      </div>
    </aside>
  );

}