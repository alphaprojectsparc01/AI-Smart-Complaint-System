import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus2, Search, Siren } from 'lucide-react';
import Header from '../components/Header';
import DepartmentIcon from '../components/DepartmentIcon';
import StatusBadge from '../components/StatusBadge';
import departments from '../data/departments';
import { useLang } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import api from '../utils/api';

function timeAgo(dateString) {
  if (!dateString) return '';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Home() {
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const { user } = useApp();

  const [recent, setRecent] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [stats, setStats] = useState({ 
    total: 0, 
    pending: 0, 
    inProgress: 0, 
    resolved: 0, 
    byDepartment: {} 
  });

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoadingRecent(true);
      try {
        // Fetch public global complaints and global system stats in parallel
        const [publicRes, statsRes] = await Promise.all([
          api.get('/api/complaints/public').catch(err => {
            console.error('Error fetching global public complaints:', err);
            return { data: [] };
          }),
          api.get('/api/complaints/stats').catch(err => {
            console.error('Error fetching global stats:', err);
            return { data: null };
          })
        ]);

        if (cancelled) return;

        // 1. Process and Normalize Global Complaints Feed
        const rawComplaints = publicRes.data?.data || publicRes.data || [];
        const normalizedComplaints = rawComplaints.map((c) => ({
          id: c.id || c._id,
          issueType: c.title || c.category || 'Civic Issue',
          departmentId: c.department_id || c.departmentId,
          status: c.status || 'Pending',
          imageUrl: c.image_url || c.imageUrl,
          timeAgo: timeAgo(c.created_at || c.createdAt),
        }));
        setRecent(normalizedComplaints);

        // 2. Process and Normalize Global System Stats
        if (statsRes && statsRes.data) {
          const rawStats = statsRes.data.data || statsRes.data;
          setStats({
            total: rawStats.total ?? rawStats.total_complaints ?? 0,
            pending: rawStats.pending ?? rawStats.pending_complaints ?? 0,
            inProgress: rawStats.inProgress ?? rawStats.in_progress ?? 0,
            resolved: rawStats.resolved ?? rawStats.resolved_complaints ?? 0,
            byDepartment: rawStats.byDepartment || rawStats.by_department || {},
          });
        }
      } catch (err) {
        console.error('Failed to parse home view dashboard data:', err);
      } finally {
        if (!cancelled) setLoadingRecent(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-[#f9fbff] pb-12 text-slate-800">
      <Header showBell showProfile={!!user} />

      {/* Hero Header Section */}
      <section className="px-5 pt-8 pb-5 text-center max-w-5xl mx-auto">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {t('appName')}
        </h1>
        <p className="mt-1.5 text-sm font-semibold text-slate-600 max-w-md mx-auto">
          {t('tagline')}
        </p>

        {/* Big Action Callouts Grid */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate(user ? '/report' : '/login')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-2 transition-transform active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <FilePlus2 size={22} />
            <span className="text-center text-xs font-bold leading-tight">{t('reportIssue')}</span>
          </button>

          <button
            onClick={() => navigate('/track')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-2 transition-transform active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <Search size={22} />
            <span className="text-center text-xs font-bold leading-tight">{t('trackComplaint')}</span>
          </button>

          <button
            onClick={() => navigate('/sos')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white py-3.5 px-2 transition-transform active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <Siren size={22} />
            <span className="text-center text-xs font-bold leading-tight">{t('sos')}</span>
          </button>
        </div>
      </section>

      {/* Stats Cards Section (Global System Metrics) */}
      <div className="mx-auto max-w-5xl px-5 py-2">
        <div className="grid grid-cols-4 gap-2.5">
          <StatCard label={t('totalComplaints')} value={stats.total} colorClass="text-blue-700" borderColor="border-blue-100/70" />
          <StatCard label={t('pending')} value={stats.pending} colorClass="text-amber-600" borderColor="border-amber-100/70" />
          <StatCard label={t('resolved')} value={stats.resolved} colorClass="text-emerald-700" borderColor="border-emerald-100/70" />
          <StatCard label={t('departments')} value={departments.length} colorClass="text-blue-800" borderColor="border-slate-100" />
        </div>
      </div>

      {/* Departments Layout List with Live Database Item Counts */}
      <section className="mx-auto mt-6 max-w-5xl px-5">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-base font-bold text-slate-950 tracking-tight">
            {t('departments')}
          </h2>
          <button
            onClick={() => navigate('/departments')}
            className="text-sm font-bold text-blue-600 hover:underline cursor-pointer"
          >
            {t('viewAll')}
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2.5">
          {departments.slice(0, 5).map((d) => (
            <button
              key={d.id}
              onClick={() => navigate(`/public-complaints?dept=${d.id}`)}
              className="bg-white border border-slate-100 rounded-2xl flex flex-col items-center p-3.5 shadow-sm transition-all hover:border-slate-200 active:scale-[0.98] cursor-pointer"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full mb-3" style={{ background: d.bg || '#f1f5f9' }}>
                <DepartmentIcon name={d.icon} size={22} color={d.color || '#475569'} />
              </span>
              <span className="text-center text-xs font-bold text-slate-800 leading-tight tracking-tight min-h-[32px] flex items-center justify-center">
                {d.name[lang]}
              </span>
              <span className="font-mono text-[11px] text-emerald-600 font-bold mt-2 flex items-center gap-0.5">
                📋 {stats.byDepartment?.[d.id] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Global Recent Complaints Grid Section */}
      <section className="mx-auto mt-7 max-w-5xl px-5">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-base font-bold text-slate-950 tracking-tight">
            {t('recentComplaints')}
          </h2>
          <button
            onClick={() => navigate('/public-complaints')}
            className="text-sm font-bold text-blue-600 hover:underline cursor-pointer"
          >
            {t('viewAll')}
          </button>
        </div>

        {loadingRecent ? (
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border border-slate-100 bg-slate-100/70" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400 shadow-sm">
            {lang === 'en' ? 'No complaints reported yet.' : 'ఇంకా ఏ ఫిర్యాదు నమోదు కాలేదు.'}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {recent.map((c) => {
              return (
                <button
                  key={c.id}
                  onClick={() => navigate(`/complaint/${c.id}`)}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm text-left flex flex-col transition-all hover:border-slate-200 active:scale-[0.98] cursor-pointer"
                >
                  <div className="h-28 w-full bg-slate-200 relative overflow-hidden">
                    <img
                      src={c.imageUrl ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${c.imageUrl}` : `https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=400`}
                      alt={c.issueType}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between items-center text-center">
                    <div>
                      <p className="text-xs font-bold text-slate-900 tracking-tight line-clamp-2">
                        {c.issueType}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        {c.timeAgo}
                      </p>
                    </div>

                    <div className="mt-2.5">
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, colorClass, borderColor }) {
  return (
    <div className={`rounded-xl bg-white border ${borderColor} p-3 text-center shadow-sm flex flex-col justify-between min-h-[96px]`}>
      <p className={`text-xs font-bold tracking-tight ${colorClass} truncate`}>
        {label}
      </p>
      <p className="text-xl font-extrabold text-slate-900 my-0.5">
        {(value ?? 0).toLocaleString()}
      </p>
      <div className="h-1 w-full bg-transparent" />
    </div>
  );
}