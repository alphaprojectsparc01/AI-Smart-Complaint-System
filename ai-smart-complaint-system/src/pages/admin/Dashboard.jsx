import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminSidebar from '../../components/AdminSidebar';
import DepartmentIcon from '../../components/DepartmentIcon';
import departments from '../../data/departments';
import { useLang } from '../../context/LanguageContext';
import StatusBadge from '../../components/StatusBadge';
import api from '../../utils/api';

export default function Dashboard() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [liveComplaints, setLiveComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, byDepartment: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/complaints/stats').then(res => setStats(res.data));
    api.get('/api/complaints').then(res => {
      setLiveComplaints(res.data.map(c => ({
        id: c.id || c.complaint_id,
        issueType: c.title || c.category || "General Issue",
        departmentId: c.department_id || c.departmentId,
        status: c.status || "Pending",
        createdAt: c.created_at || c.createdAt
      })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const deptData = departments.map(d => ({
    name: d.name[lang],
    value: stats.byDepartment?.[d.id] || 0.001,
    actualCount: stats.byDepartment?.[d.id] || 0,
    color: d.color
  }));

  const monthlyTrendData = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = months.map(m => ({ month: m, total: 0, resolved: 0 }));
    liveComplaints.forEach(c => {
      if (!c.createdAt) return;
      const monthIndex = new Date(c.createdAt).getMonth();
      if (monthIndex >= 0 && monthIndex < 12) {
        trendMap[monthIndex].total += 1;
        if (c.status?.toLowerCase() === 'resolved') trendMap[monthIndex].resolved += 1;
      }
    });
    return trendMap.slice(0, new Date().getMonth() + 1);
  })();

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-xs font-bold"><Loader2 className="animate-spin text-blue-600 mr-2" size={16}/>Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar />
      <main className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
          <h1 className="text-lg font-black text-slate-900 uppercase">Dashboard Overview</h1>
          <button onClick={() => navigate('/')} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50">Exit Panel</button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label={t('totalComplaints')} value={stats.total} color="text-slate-900" border="border-slate-200" />
          <StatCard label={t('pending')} value={stats.pending} color="text-amber-600" border="border-amber-100" />
          <StatCard label={t('inProgress')} value={stats.inProgress} color="text-blue-600" border="border-blue-100" />
          <StatCard label={t('resolved')} value={stats.resolved} color="text-emerald-600" border="border-emerald-100" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3 mt-6">
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

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm mt-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{t('recentComplaints')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs font-semibold">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">{t('issue')}</th>
                  <th className="pb-2">{t('department')}</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {liveComplaints.slice(0, 5).map((c) => {
                  const d = departments.find((x) => x.id === c.departmentId);
                  return (
                    <tr key={c.id} className="cursor-pointer hover:bg-slate-50/70" onClick={() => navigate(`/complaint/${c.id}`)}>
                      <td className="py-3 font-mono text-blue-600 font-bold">{c.id}</td>
                      <td className="py-3 font-bold text-slate-900">{c.issueType}</td>
                      <td className="py-3">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <DepartmentIcon name={d?.icon} size={12} color={d?.color} /> {d?.name[lang] || c.departmentId}
                        </span>
                      </td>
                      <td className="py-3"><StatusBadge status={c.status} size="sm" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, color, border }) {
  return (
    <div className={`p-4 bg-white rounded-2xl border ${border} shadow-sm`}>
      <p className={`text-2xl font-black tracking-tight font-mono ${color}`}>{value.toLocaleString()}</p>
      <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}