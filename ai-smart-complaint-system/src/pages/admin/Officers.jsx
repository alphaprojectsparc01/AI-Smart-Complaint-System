import { useEffect, useState } from 'react';
import { Search, Phone, ShieldAlert, Award, UserCheck } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import DepartmentIcon from '../../components/DepartmentIcon';
import departments from '../../data/departments';
import { useLang } from '../../context/LanguageContext';
import api from '../../utils/api';

export default function Officers() {
  const { lang } = useLang();
  const [searchTerm, setSearchTerm] = useState('');
  const [officersList, setOfficersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch true database documents on mount
  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/officers');
      console.log("🔍 [ROSTER DEBUG] Raw array entries fetched from /api/officers:", res.data);
      setOfficersList(res.data || []);
    } catch (err) {
      console.error('Failed to load database roster records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  const filteredOfficers = officersList.filter(o => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    
    return (
      (o.name || '').toLowerCase().includes(term) ||
      (o.area || '').toLowerCase().includes(term) ||
      (o.rank || '').toLowerCase().includes(term) ||
      (o.department_id || '').toLowerCase().includes(term) ||
      (o._id || o.id || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar />
      <main className="flex-1 px-6 py-6 overflow-y-auto">
        
        {/* Module Title Header */}
        <div className="mb-5 border-b border-slate-100 pb-4">
          <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">
            Officers Field Directory
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Review active task distribution and real-time case routing updates across municipal sectors.
          </p>
        </div>

        {/* Directory Controls Box */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search officer name, technician ID, operational zone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Officers Roster Table */}
          <div className="overflow-x-auto pt-2">
            {loading ? (
              <div className="text-center py-8 text-xs font-bold text-slate-400 animate-pulse">
                Synchronizing core field force rosters...
              </div>
            ) : (
              <table className="w-full min-w-[650px] text-left text-xs font-semibold">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                    <th className="pb-2">Officer ID</th>
                    <th className="pb-2">Full Name & Rank</th>
                    <th className="pb-2">Assigned Branch</th>
                    <th className="pb-2">Operational Jurisdiction</th>
                    <th className="pb-2">Current Capacity Load</th>
                    <th className="pb-2 text-center">Contact Terminal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredOfficers.map(o => {
                    const rawDept = String(o.department_id || '').toLowerCase().trim();
                    
                    // Cross-string matcher handles short codes and corporate variations cleanly
                    const d = departments.find(x => {
                      const staticId = String(x.id).toLowerCase().trim();
                      return staticId === rawDept || rawDept.includes(staticId) || staticId.includes(rawDept);
                    });

                    const officerIdStr = o._id || o.id || '—';
                    return (
                      <tr key={officerIdStr} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 font-mono font-bold text-slate-400" title={officerIdStr}>
                          {officerIdStr.length > 8 ? officerIdStr.slice(-6).toUpperCase() : officerIdStr}
                        </td>
                        <td className="py-3">
                          <p className="font-black text-slate-900">{o.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                            <Award size={10} className="text-blue-500" /> {o.rank || "Field Inspector"}
                          </p>
                        </td>
                        <td className="py-3">
                          <span className="flex items-center gap-1.5 text-slate-600 font-bold capitalize">
                            <DepartmentIcon name={d?.icon || "ShieldAlert"} size={12} color={d?.color || "#64748b"} /> 
                            {d?.name[lang] || o.department_id || "General Operations"}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-slate-500">
                          <p>{o.area || "Unassigned Sector"}</p>
                          <p className="text-[9px] font-mono text-slate-400 font-normal mt-0.5">
                            {o.latitude ? o.latitude.toFixed(4) : '0.0000'}, {o.longitude ? o.longitude.toFixed(4) : '0.0000'}
                          </p>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 font-mono font-bold px-2.5 py-0.5 rounded border ${
                            (o.active_tasks || 0) >= 4 
                              ? 'bg-red-50 text-red-600 border-red-100' 
                              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            <UserCheck size={11} /> {o.active_tasks || 0} active tasks
                          </span>
                        </td>
                        <td className="py-3 text-center font-mono text-slate-600">
                          <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                            <Phone size={10} className="text-slate-400" /> {o.phone || "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            
            {!loading && filteredOfficers.length === 0 && (
              <div className="text-center py-8 text-slate-400 font-bold">
                No active officers found matching query constraints.
              </div>
            )}
          </div>
        </div>

        {/* Operational System Notice */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3 mt-6">
          <ShieldAlert className="text-blue-500 flex-shrink-0" size={18} />
          <p className="text-xs font-semibold text-slate-500 leading-normal">
            <strong>Fleet Logistics System Status:</strong> Active task counts are synced in real-time with ongoing MongoDB complaint modifications. AI spatial routing factors suggest the closest low-load technician based on geolocation pinpoint data.
          </p>
        </div>

      </main>
    </div>
  );
}