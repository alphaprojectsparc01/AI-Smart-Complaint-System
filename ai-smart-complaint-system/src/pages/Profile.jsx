import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, KeyRound, Languages, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import { useLang } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const { t, lang, toggleLang } = useLang();
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Try AppContext state first
    if (user) {
      setCurrentUser(user);
      setLoading(false);
      return;
    }

    // 2. Direct fallback lookup directly from browser Storage
    const savedString = localStorage.getItem('user');
    if (savedString) {
      try {
        const parsedUser = JSON.parse(savedString);
        setCurrentUser(parsedUser);
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
      }
    }
    setLoading(false);
  }, [user]);

  // 3. Route Guard: Redirect away if load finishes and there is no user context anywhere
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9fbff]">
        <p className="text-sm font-medium text-slate-500">Loading profile...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  const doLogout = () => {
    localStorage.clear();
    if (typeof logout === 'function') {
      logout();
    }
    navigate('/login');
  };

  // Safely grab structural values even if properties are nested or undefined
  const displayName = currentUser.name || currentUser.username || 'User';
  const displayLetter = displayName[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-[#f9fbff] pb-12 text-slate-800">
      <Header title={t('profile')} showBack />
      <div className="mx-auto max-w-xl px-4 pt-5">
        
        {/* Profile Details Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-full bg-blue-600 text-xl font-extrabold text-white">
            {displayLetter}
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 tracking-tight">{displayName}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{currentUser.email || '—'}</p>
            {currentUser.mobile && (
              <p className="mt-0.5 font-mono text-xs text-slate-400">{currentUser.mobile}</p>
            )}
            {currentUser.role && (
              <span className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 border border-slate-200/40">
                {currentUser.role}
              </span>
            )}
          </div>
        </div>

        {/* Settings Navigation Options Row Block */}
        <div className="bg-white border border-slate-100 rounded-2xl mt-4 shadow-sm divide-y divide-slate-100 overflow-hidden">
          <MenuRow 
            icon={User} 
            label={t('personalInfo') || 'Personal Information'} 
            onClick={() => navigate('/profile/edit')} 
          />
          <MenuRow 
            icon={KeyRound} 
            label={t('changePassword') || 'Security & Password'} 
            onClick={() => navigate('/profile/password')} 
          />
          <MenuRow 
            icon={Languages} 
            label={t('languageLabel') || 'App Language'} 
            value={lang === 'en' ? 'English' : 'తెలుగు'} 
            onClick={toggleLang} 
          />
          <MenuRow 
            icon={HelpCircle} 
            label={t('helpSupport') || 'Help & Support'} 
            onClick={() => navigate('/profile/support')} 
          />
        </div>

        {/* Red Alert Logout Action Option */}
        <button
          onClick={doLogout}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100/80 py-3.5 text-sm font-bold text-red-600 transition active:scale-95 cursor-pointer shadow-sm"
        >
          <LogOut size={16} /> {t('logout')}
        </button>
      </div>
    </div>
  );
}

function MenuRow({ icon: Icon, label, value, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50/80 active:bg-slate-100/50 cursor-pointer group"
    >
      <Icon size={17} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
      <span className="flex-1 text-sm font-bold text-slate-700 tracking-tight group-hover:text-slate-900 transition-colors">{label}</span>
      {value && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100/30 mr-1">{value}</span>}
      <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-400 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}