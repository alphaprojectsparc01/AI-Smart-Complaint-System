import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bell, Building, Home, LayoutDashboard, FileWarning, ListChecks, LogOut, ShieldCheck } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

export default function Header({ title, showBack = false, showBell = false, showProfile = false, showNav = true, dark = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, toggleLang, t } = useLang();
  const { notifications, user, logout } = useApp();

  const navLinks = [
    { to: '/home', label: t('home'), icon: Home },
    { to: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/report', label: t('reportIssue'), icon: FileWarning },
    { to: '/track', label: t('trackComplaint'), icon: ListChecks },
  ];

  const handleLogout = () => {
    logout?.();
    navigate('/login');
  };

  return (
    <header className={`sticky top-0 z-20 w-full border-b ${dark ? 'bg-civic-800 border-civic-700 text-white' : 'bg-white/90 backdrop-blur border-civic-100'}`}>
      <div className="flex h-16 w-full items-center gap-3 px-4">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            aria-label={t('back')}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full tap-highlight active:scale-95 transition ${dark ? 'hover:bg-white/10' : 'hover:bg-civic-50'}`}
          >
            <ArrowLeft size={19} />
          </button>
        )}
        {!showBack && (
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${dark ? 'bg-white/10' : 'bg-civic-700'}`}>
            <Building size={18} color="#fff" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className={`truncate font-display text-[15px] font-semibold leading-tight ${dark ? 'text-white' : 'text-civic-900'}`}>
            {title || t('appName')}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {/* Admin Panel Access Button - Only visible for Admins */}
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin/dashboard')}
              aria-label={t('adminPanel')}
              className={`flex items-center gap-1.5 px-3 h-9 rounded-full tap-highlight active:scale-95 transition text-xs font-semibold ${
                dark ? 'text-blue-300 hover:bg-white/10' : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <ShieldCheck size={16} />
              <span className="hidden sm:inline">{t('adminPanel')}</span>
            </button>
          )}

          {showBell && (
            <button
              onClick={() => navigate('/notifications')}
              aria-label={t('notifications')}
              className={`relative grid h-9 w-9 place-items-center rounded-full tap-highlight active:scale-95 transition ${dark ? 'hover:bg-white/10' : 'hover:bg-civic-50'}`}
            >
              <Bell size={19} />
              {notifications.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-saffron-500" />
              )}
            </button>
          )}

          {showProfile && (
            <button
              onClick={() => navigate('/profile')}
              aria-label={t('profile')}
              className="grid h-9 w-9 place-items-center rounded-full bg-civic-100 text-xs font-semibold text-civic-700 tap-highlight active:scale-95 transition"
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </button>
          )}

          <button
            onClick={toggleLang}
            className={`grid h-9 w-9 place-items-center rounded-full border text-[11px] font-semibold tap-highlight active:scale-95 transition ${dark ? 'border-white/30 text-white hover:bg-white/10' : 'border-civic-200 text-civic-700 hover:bg-civic-50'}`}
          >
            {lang === 'en' ? 'తె' : 'EN'}
          </button>

          <div className={`mx-0.5 h-6 w-px shrink-0 ${dark ? 'bg-white/20' : 'bg-civic-200'}`} />

          <button
            onClick={handleLogout}
            aria-label={t('logout')}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full tap-highlight active:scale-95 transition ${dark ? 'text-white hover:bg-white/10' : 'text-red-600 hover:bg-red-50'}`}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {showNav && (
        <nav className="scrollbar-none flex w-full gap-2 overflow-x-auto px-4 pb-3">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-medium tap-highlight active:scale-95 transition ${
                  active
                    ? dark
                      ? 'border-white bg-white text-civic-800'
                      : 'border-civic-700 bg-civic-700 text-white'
                    : dark
                    ? 'border-white/30 text-white hover:bg-white/10'
                    : 'border-civic-200 text-civic-700 hover:bg-civic-50'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}