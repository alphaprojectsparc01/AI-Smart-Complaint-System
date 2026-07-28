import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminSidebar from '../../components/AdminSidebar';
import DepartmentIcon from '../../components/DepartmentIcon';
import StatusBadge from '../../components/StatusBadge';
import departments from '../../data/departments';
import { useLang } from '../../context/LanguageContext';
import api from '../../utils/api';

export default function AdminDashboard() {
  const { t, lang } = useLang();
  const navigate = useNavigate();

  // --- Live Telemetry Hooks State Matrix ---
  const [liveComplaints, setLiveComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, byDepartment: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardTelemetry = async () => {
      try {
        // Dispatch unified parallel calls straight to your updated FastAPI endpoints
        const [statsRes, complaintsRes] = await Promise.all([
          api.get('/api/complaints/stats'),
          api.get('/api/complaints')
        ]);

        if (isMounted) {
          setStats(statsRes.data || { total: 0, pending: 0, inProgress: 0, resolved: 0, byDepartment: {} });
          
          const rawComplaints = complaintsRes.data || [];
          
          // Map properties safely to maintain UI framework compatibility layout settings
          const normalizedComplaints = rawComplaints.map(c => ({
            id: c.id || c.complaint_id || '—',
            issueType: c.title || c.category || "General Issue",
            departmentId: c.department_id || c.departmentId || "other",
            status: c.status || "Pending",
            createdAt: c.created_at || c.createdAt
          }));
          
          setLiveComplaints(normalizedComplaints);
          setLoading(false);
        }
      } catch (err) {
        console.error("Dashboard real-time database connection failed: ", err);
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardTelemetry();
    return () => { isMounted = false; };
  }, []);

  // Compute live Pie Chart weight matrix using backend dynamic data maps instead of mock arrays
  const deptData = departments.map((d) => {
    const backendCount = stats.byDepartment?.[d.id] || stats.byDepartment?.[d.id.toLowerCase()] || stats.byDepartment?.[d.id.toUpperCase()] || 0;
    return {
      name: d.name[lang],
      value: backendCount === 0 ? 0.001 : backendCount, // Micro fallback keeps chart structures clean without breaking bounds
      actualCount: backendCount,
      color: d.color,
    };
  });

  // Generate real-time line trends built straight from current live item array distribution sets
  const generateLiveMonthlyTrend = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    const trendMap = months.map(m => ({ month: m, total: 0, resolved: 0 }));
    
    if (liveComplaints && liveComplaints.length > 0) {
      liveComplaints.forEach(c => {
        if (!c.createdAt) return;
        const date = new Date(c.createdAt);
        if (date.getFullYear() === currentYear) {
          const monthIndex = date.getMonth();
          if (monthIndex >= 0 && monthIndex < 12) {
            trendMap[monthIndex].total += 1;
            if (c.status?.toLowerCase() === 'resolved') {
              trendMap[monthIndex].resolved += 1;
            }
          }
        }
      });
    }
    
    // Filter down array matrix bounds to show only months up to current timestamp marker layout
    const currentMonthIdx = new Date().getMonth();
    return trendMap.slice(0, currentMonthIdx + 1);
  };

  const monthlyTrendData = generateLiveMonthlyTrend();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 gap-3">
        <Loader2 className="animate-spin text-blue-600" size={26} />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Streaming city data matrix...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Connected Sidebar Navigation Shell Component */}
      <AdminSidebar />

      <main className="flex-1 px-6 py-6 overflow-y-auto max-h-screen">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              {t('dashboardOverview')}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Control dashboard metrics and municipal action lifecycles.
            </p>
          </div>
          <button onClick={() => navigate('/')} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition cursor-pointer">
            {t('goHome')}
          </button>
        </div>

        {/* Dynamic Stat Cards Grid Hooked Directly to MongoDB Live Aggregations */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label={t('totalComplaints')} value={stats.total || 0} color="text-slate-900" border="border-slate-200" />
          <StatCard label={t('pending')} value={stats.pending || 0} color="text-amber-600" border="border-amber-100" />
          <StatCard label={t('inProgress')} value={stats.inProgress || 0} color="text-blue-600" border="border-blue-100" />
          <StatCard label={t('resolved')} value={stats.resolved || 0} color="text-emerald-600" border="border-emerald-100" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{t('complaintsOverview')}</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2.5} dot={false} name="Total Cases" />
                  <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2.5} dot={false} name="Resolved" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{t('deptWiseComplaints')}</h2>
            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deptData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={65} paddingAngle={3}>
                    {deptData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [props.payload.actualCount, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-slate-50 pt-3">
              {deptData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] text-slate-600 font-semibold truncate">
                  <span className="flex items-center gap-1 truncate">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: d.color }} /> 
                    <span className="truncate">{d.name}</span>
                  </span>
                  <span className="text-slate-400 pl-1 font-mono">({d.actualCount})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent complaints segment mapped to dynamic data tables */}
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm mt-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{t('recentComplaints')}</h2>
          <div className="overflow-x-auto">
            {liveComplaints.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400 font-semibold">{t('noResults') || "No complaints filed yet."}</p>
            ) : (
              <table className="w-full min-w-[560px] text-left text-xs font-semibold">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="pb-2 font-bold">ID</th>
                    <th className="pb-2 font-bold">{t('issue')}</th>
                    <th className="pb-2 font-bold">{t('department')}</th>
                    <th className="pb-2 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {liveComplaints.slice(0, 8).map((c) => {
                    const d = departments.find((x) => x.id === c.departmentId);
                    return (
                      <tr key={c.id} className="cursor-pointer hover:bg-slate-50/70 transition-colors" onClick={() => navigate(`/complaint/${c.id}`)}>
                        <td className="py-3 font-mono text-blue-600 font-bold">
                          {c.id.length > 8 ? c.id.slice(-6).toUpperCase() : c.id}
                        </td>
                        <td className="py-3 font-bold text-slate-900">{c.issueType}</td>
                        <td className="py-3">
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <DepartmentIcon name={d?.icon || "ShieldAlert"} size={12} color={d?.color || "#64748b"} /> 
                            {d?.name[lang] || c.departmentId}
                          </span>
                        </td>
                        <td className="py-3"><StatusBadge status={c.status} size="sm" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, color, border }) {
  return (
    <div className={`p-4 bg-white rounded-2xl border ${border} shadow-sm transition-transform hover:-translate-y-0.5 duration-200`}>
      <p className={`text-2xl font-black tracking-tight font-mono ${color}`}>{value ? value.toLocaleString() : 0}</p>
      <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}