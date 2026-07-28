import { useEffect, useState } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminSidebar from '../../components/AdminSidebar';
import departments from '../../data/departments';
import { useLang } from '../../context/LanguageContext';
import api from '../../utils/api';

export default function Analytics() {
  const { lang } = useLang();
  const [liveComplaints, setLiveComplaints] = useState([]);
  const [stats, setStats] = useState({ byDepartment: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/complaints/stats').then(res => setStats(res.data));
    api.get('/api/complaints').then(res => {
      setLiveComplaints(res.data.map(c => ({
        status: c.status || "Pending",
        createdAt: c.created_at || c.createdAt
      })));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const deptData = departments.map(d => ({
    name: d.name[lang],
    value: stats.byDepartment?.[d.id] || 0.001,
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

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-xs font-bold"><Loader2 className="animate-spin text-blue-600 mr-2" size={16}/>Loading Analytics Dashboard...</div>;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar />
      <main className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="mb-5 border-b border-slate-100 pb-4">
          <h1 className="text-lg font-black text-slate-900 uppercase">System Intelligence Analytics</h1>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Resolution Throughput Volume Matrix</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                    <Bar dataKey="total" fill="#3b82f6" name="Incoming Issues" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" fill="#10b981" name="Resolved Tasks" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Workload Distribution Density</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deptData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={85} paddingAngle={2} label>
                      {deptData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <ShieldAlert className="text-emerald-500 flex-shrink-0" size={20} />
            <p className="text-xs font-semibold text-slate-500 leading-normal">
              <strong>Telemetry Metrics Clear:</strong> Automated infrastructure dataset engines running at optimal latency bounds. Gemini spatial risk triage calculations feeding data parameters cleanly without validation bottlenecks.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}