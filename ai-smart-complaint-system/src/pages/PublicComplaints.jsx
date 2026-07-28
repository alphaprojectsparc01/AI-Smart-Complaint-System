import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import DepartmentIcon from '../components/DepartmentIcon';
import departments from '../data/departments';
import { useLang } from '../context/LanguageContext';
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

// Helper to extract a broad structural area parameter out of long MongoDB location string tokens
function parseAreaFromAddress(address) {
  if (!address) return '';
  const tokens = address.split(',');
  // Grab the second or first localized landmark token block (e.g. " Kharadi" or " Wagholi")
  if (tokens.length > 1) return tokens[0].trim();
  return address.substring(0, 15).trim();
}

export default function PublicComplaints() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dept, setDept] = useState(params.get('dept') || 'all');
  const [status, setStatus] = useState('all');
  const [area, setArea] = useState('all');

  useEffect(() => {
    let isMounted = true;
    const fetchPublicComplaints = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/complaints/public');
        if (isMounted) {
          const rawList = response.data || [];
          const normalized = rawList.map((c) => ({
            id: c.id || c.complaint_id,
            issueType: c.title || c.category,
            departmentId: c.department_id || c.departmentId,
            status: c.status,
            photo: c.image_url || c.imageUrl,
            address: c.address || '',
            area: parseAreaFromAddress(c.address),
            timeAgo: timeAgo(c.created_at || c.createdAt),
          }));
          setComplaints(normalized);
        }
      } catch (err) {
        console.error('Failed to parse collective public tracking records:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPublicComplaints();
    return () => { isMounted = false; };
  }, []);

  // Filter local state list based on selected drop-down filters
  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      const matchDept = dept === 'all' || c.departmentId === dept;
      const matchStatus = status === 'all' || c.status === status;
      const matchArea = area === 'all' || c.area === area;
      return matchDept && matchStatus && matchArea;
    });
  }, [complaints, dept, status, area]);

  // Extract a list of unique areas for the sector dropdown filter
  const uniqueAreas = useMemo(() => {
    const areasSet = new Set(complaints.map((c) => c.area).filter(Boolean));
    return Array.from(areasSet);
  }, [complaints]);

  return (
    <div className="min-h-screen bg-[#f9fbff] pb-12 text-slate-800">
      <Header  />
      
      <div className="mx-auto max-w-4xl px-4 pt-5">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('publicComplaints')}</h1>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="flex flex-wrap items-center gap-2.5 pb-4">
          <select 
            value={dept} 
            onChange={(e) => setDept(e.target.value)} 
            className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl shadow-sm focus:outline-none focus:border-blue-400 cursor-pointer min-w-[130px]"
          >
            <option value="all">{t('allDepartments') || 'All Departments'}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name[lang]}</option>
            ))}
          </select>

          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)} 
            className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl shadow-sm focus:outline-none focus:border-blue-400 cursor-pointer min-w-[110px]"
          >
            <option value="all">{t('allStatus') || 'All Status'}</option>
            <option value="Pending">{t('pending')}</option>
            <option value="In Progress">{t('inProgress')}</option>
            <option value="Resolved">{t('resolved')}</option>
          </select>

          <select 
            value={area} 
            onChange={(e) => setArea(e.target.value)} 
            className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl shadow-sm focus:outline-none focus:border-blue-400 cursor-pointer min-w-[110px]"
          >
            <option value="all">{t('allAreas') || 'All Areas'}</option>
            {uniqueAreas.map((a, idx) => (
              <option key={idx} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Complaints Layout List Items */}
        <div className="mt-2 space-y-3">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl border border-slate-100 bg-slate-100/70" />
            ))
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl py-12 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-400">{t('noResults')}</p>
            </div>
          ) : (
            filtered.map((c) => {
              const d = departments.find((x) => x.id === c.departmentId);
              return (
                <button
                  key={c.id}
                  onClick={() => navigate(`/complaint/${c.id}`)}
                  className="w-full bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-3 shadow-sm flex items-center text-left transition-all active:scale-[0.995] cursor-pointer"
                >
                  {/* Thumbnail Image */}
                  <div className="h-16 w-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-50 relative">
                    <img 
                      src={c.photo ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${c.photo}` : `https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=200`} 
                      alt={c.issueType} 
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Main Data Grid */}
                  <div className="ml-4 flex-1 grid grid-cols-[1fr_1fr_auto] items-center gap-4 min-w-0">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-blue-900 truncate tracking-tight">
                        {c.issueType}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                        {c.address}
                      </p>
                    </div>

                    <div className="min-w-0 flex items-center gap-2">
                      {d && (
                        <span className="grid h-5 w-5 place-items-center rounded bg-slate-50 flex-shrink-0">
                          <DepartmentIcon name={d.icon} size={12} color={d.color || '#475569'} />
                        </span>
                      )}
                      <p className="text-xs font-bold text-slate-500 truncate">
                        {d?.name[lang] || '—'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <StatusBadge status={c.status} size="sm" />
                      <span className="text-[10px] font-semibold text-slate-400 tracking-tight">
                        {c.timeAgo || 'just now'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}