import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import DepartmentIcon from '../components/DepartmentIcon';
import departments from '../data/departments';
import { useLang } from '../context/LanguageContext';
import api from '../utils/api';

export default function Track() {
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const [mode, setMode] = useState('mobile'); // 'mobile' | 'id'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    const cleanedQuery = query.trim();
    if (!cleanedQuery) return;

    setLoading(true);
    setResults(null);
    try {
      if (mode === 'id') {
        // Fetch specific complaint by ID path parameter
        const response = await api.get(`/api/complaints/${cleanedQuery}`);
        if (response.data) {
          const c = response.data;
          // Normalize the single backend object into a list context layout
          setResults([{
            id: c.complaint_id || c.id,
            issueType: c.title || c.category,
            departmentId: c.department_id || c.departmentId,
            status: c.status,
          }]);
        } else {
          setResults([]);
        }
      } else {
        // Query list data filtering by user phone number
        // (Adjust endpoint path to match your specific user/complaint query if needed)
        const response = await api.get(`/api/complaints?mobile=${cleanedQuery}`);
        const rawList = response.data || [];
        
        // Handle cases where the general path doesn't auto-filter by parameter on backend yet
        // Local filter fallback ensures exact rendering criteria matching phone context payloads
        const filtered = rawList.filter(c => c.mobile === cleanedQuery || c.phone === cleanedQuery);
        
        const normalized = (filtered.length > 0 ? filtered : rawList).map(c => ({
          id: c.complaint_id || c.id,
          issueType: c.title || c.category,
          departmentId: c.department_id || c.departmentId,
          status: c.status,
        }));
        
        setResults(normalized);
      }
    } catch (err) {
      console.error('Search trace request encountered error status:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full pb-10 bg-[#f9fbff]">
      <Header  />
      <div className="mx-auto max-w-2xl px-4 pt-5">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">{t('trackYourComplaint')}</h1>

        {/* Tab Selection */}
        <div className="mt-4 flex gap-2 rounded-xl bg-slate-100 p-1 border border-slate-200/50">
          <button
            onClick={() => { setMode('id'); setResults(null); setQuery(''); }}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${mode === 'id' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
          >
            {t('byComplaintId')}
          </button>
          <button
            onClick={() => { setMode('mobile'); setResults(null); setQuery(''); }}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${mode === 'mobile' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
          >
            {t('byMobile')}
          </button>
        </div>

        {/* Search Field Controls */}
        <div className="mt-4 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(mode === 'mobile' ? e.target.value.replace(/\D/g, '') : e.target.value)}
            placeholder={mode === 'mobile' ? t('enterMobile') : 'ASC202600001'}
            maxLength={mode === 'mobile' ? 10 : undefined}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm outline-none transition focus:border-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && search()}
          />
          <button 
            onClick={search} 
            disabled={loading}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 transition-transform active:scale-[0.98] shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <SearchIcon size={16} /> {loading ? '...' : t('search')}
          </button>
        </div>

        {/* Results Stream Grid */}
        {results && (
          <div className="mt-6">
            {results.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400 shadow-sm">
                {t('noResults')}
              </div>
            ) : (
              <>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('recentComplaints')} ({results.length})
                </h2>
                <div className="space-y-2.5">
                  {results.map((c) => {
                    const dept = departments.find((d) => d.id === c.departmentId);
                    return (
                      <button
                        key={c.id}
                        onClick={() => navigate(`/complaint/${c.id}`)}
                        className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 text-left shadow-sm transition-all hover:border-slate-200 hover:shadow-md active:scale-[0.99] cursor-pointer"
                      >
                        <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl" style={{ background: dept?.bg || '#f1f5f9' }}>
                          <DepartmentIcon name={dept?.icon} size={18} color={dept?.color || '#475569'} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900 tracking-tight">{c.issueType}</p>
                          <p className="truncate font-mono text-[11px] text-slate-400 mt-0.5">{c.id}</p>
                        </div>
                        <StatusBadge status={c.status} size="sm" />
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}