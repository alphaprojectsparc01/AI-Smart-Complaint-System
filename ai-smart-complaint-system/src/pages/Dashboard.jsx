import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import DepartmentIcon from '../components/DepartmentIcon';
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

export default function Dashboard() {
  const { t, lang } = useLang();
  const { user } = useApp();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Parse active user details from context, falling back safely to local storage if refreshed
  const currentUser = useMemo(() => {
    if (user) return user;
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    const fetchComplaints = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await api.get('/api/complaints');
        if (cancelled) return;

        const normalized = (res.data || []).map((c) => ({
          id: c.complaint_id,
          departmentId: c.department_id,
          issueType: c.title || c.category,
          status: c.status,
          createdAt: c.created_at,
          timeAgo: timeAgo(c.created_at),
        }));

        // Most recent first
        normalized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setComplaints(normalized);
      } catch (err) {
        console.error('Failed to fetch complaints:', err);
        if (!cancelled) {
          setFetchError(
            err.response?.data?.detail || 'Could not load your complaints. Please try again.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchComplaints();
    return () => { cancelled = true; };
  }, []);

  // Memoize counts to prevent recalculation on unrelated renders
  const counts = useMemo(() => {
    return {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === 'Pending').length,
      inProgress: complaints.filter((c) => c.status === 'In Progress').length,
      resolved: complaints.filter((c) => c.status === 'Resolved').length,
    };
  }, [complaints]);

  // Show only top 5 most recent items on dashboard
  const recentComplaints = useMemo(() => {
    return complaints.slice(0, 5);
  }, [complaints]);

  // Extract a fallback display name based on available profile data keys
  const userDisplayName = currentUser?.name || currentUser?.username || 'Citizen';

  return (
    <div className="min-h-screen bg-[#f9fbff] pb-12 text-slate-800">
      <Header showBell showProfile />

      {/* Hero Welcome Banner */}
      <section className="px-5 pt-7 pb-3 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t('welcomeUser')}, {userDisplayName}!
        </h1>
      </section>

      {/* Stats Counters Card Grid */}
      <section className="px-5 py-2 max-w-5xl mx-auto">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
          <MiniStat
            label={t('myComplaints')}
            value={counts.total}
            colorClass="text-blue-700"
            borderColor="border-blue-100/70"
          />
          <MiniStat
            label={t('pending')}
            value={counts.pending}
            colorClass="text-red-700"
            borderColor="border-red-100/70"
          />
          <MiniStat
            label={t('inProgress')}
            value={counts.inProgress}
            colorClass="text-amber-600"
            borderColor="border-amber-100/70"
          />
          <MiniStat
            label={t('resolved')}
            value={counts.resolved}
            colorClass="text-emerald-700"
            borderColor="border-emerald-100/70"
          />
        </div>
      </section>

      {/* Action CTA Buttons */}
      <section className="px-5 py-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/report')}
            className="flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base py-3.5 px-4 shadow-sm active:scale-[0.99] transition-transform"
          >
            {t('reportNewIssue')}
          </button>

          <button
            onClick={() => navigate('/track')}
            className="flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base py-3.5 px-4 shadow-sm active:scale-[0.99] transition-transform"
          >
            {t('trackComplaint')}
          </button>
        </div>
      </section>

      {/* Recent Complaints Section */}
      <section className="px-5 pt-4 max-w-5xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950 tracking-tight">
            {t('recentComplaints')}
          </h2>
          {complaints.length > 0 && (
            <button
              onClick={() => navigate('/public-complaints')}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              {t('viewAll')}
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl border border-slate-100 bg-slate-100/70" />
            ))}
          </div>
        ) : fetchError ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center text-sm font-medium text-red-600 shadow-sm">
            {fetchError}
          </div>
        ) : complaints.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400 shadow-sm">
            {lang === 'en' ? "You haven't filed any complaints yet." : 'మీరు ఇంకా ఏ ఫిర్యాదు నమోదు చేయలేదు.'}
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentComplaints.map((c) => {
              const dept = departments.find((d) => d.id === c.departmentId);
              return (
                <button
                  key={c.id}
                  onClick={() => navigate(`/complaint/${c.id}`)}
                  className="flex w-full items-center justify-between rounded-xl bg-white p-3 border border-slate-100 shadow-sm transition-all hover:border-slate-200 active:scale-[0.995]"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Icon Base Frame */}
                    <span
                      className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl"
                      style={{ background: dept?.bg || '#f1f5f9' }}
                    >
                      <DepartmentIcon name={dept?.icon} size={18} color={dept?.color || '#475569'} />
                    </span>

                    {/* Center details aligned horizontally */}
                    <div className="flex min-w-0 items-center gap-5">
                      <p className="font-mono text-sm font-bold text-slate-900 tracking-tight whitespace-nowrap">
                        {c.id}
                      </p>
                      <p className="truncate text-sm font-medium text-slate-700">
                        {c.issueType}
                      </p>
                    </div>
                  </div>

                  {/* Status Block Stacked on the right */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
                    <StatusBadge status={c.status} size="sm" />
                    <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                      {c.timeAgo}
                    </span>
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

function MiniStat({ label, value, colorClass, borderColor }) {
  return (
    <div className={`rounded-xl bg-white border ${borderColor} p-3 text-center shadow-sm flex flex-col justify-between min-h-[96px] transition-all`}>
      <p className={`text-xs font-bold tracking-tight uppercase ${colorClass} truncate`}>
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900 my-0.5">
        {value}
      </p>
      <div className="h-2 w-full bg-transparent" />
    </div>
  );
}