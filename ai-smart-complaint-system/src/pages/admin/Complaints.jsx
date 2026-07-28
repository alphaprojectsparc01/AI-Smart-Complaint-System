import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Loader2, Trash2, SlidersHorizontal, Eye, X, MapPin, Sparkles } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import DepartmentIcon from '../../components/DepartmentIcon';
import StatusBadge from '../../components/StatusBadge';
import departments from '../../data/departments';
import { useLang } from '../../context/LanguageContext';
import api from '../../utils/api';

export default function Complaints() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Drawer layout active focus entity state
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/api/complaints');
      setComplaints(res.data.map(c => ({
        dbId: c._id, 
        id: c.id || c.complaint_id,
        issueType: c.title || c.category || "General Issue",
        departmentId: c.department_id || c.departmentId,
        status: c.status || "Pending",
        address: c.address || "Location detail missing",
        priority: c.priority || "Medium",
        confidence: c.ai_result?.confidence || "N/A",
        locationContext: c.ai_result?.location_context || "N/A"
      })));
      setLoading(false);
    } catch (err) {
      console.error("Failed fetching records matrix:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateField = async (dbId, fieldName, value) => {
    setActionLoading(dbId);
    try {
      const payload = { [fieldName]: value };
      await api.put(`/api/complaints/${dbId}`, payload);
      
      setComplaints(prev => prev.map(c => c.dbId === dbId ? { ...c, [fieldName === 'department_id' ? 'departmentId' : fieldName]: value } : c));
      
      // Keep drawer context synced up with inline change structures
      if (selectedTicket && selectedTicket.dbId === dbId) {
        setSelectedTicket(prev => ({ ...prev, [fieldName === 'department_id' ? 'departmentId' : fieldName]: value }));
      }
    } catch (err) {
      alert("Operational failure modifying complaint parameters: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteTicket = async (dbId, userFriendlyId) => {
    if (!window.confirm(`Are you absolutely sure you want to completely purge ticket ${userFriendlyId} from municipal records?`)) return;
    setActionLoading(dbId);
    try {
      await api.delete(`/api/complaints/${dbId}`);
      setComplaints(prev => prev.filter(c => c.dbId !== dbId));
      if (selectedTicket && selectedTicket.dbId === dbId) setSelectedTicket(null);
    } catch (err) {
      alert("Unauthorized or failed structural removal operation: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = complaints.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDept = deptFilter === 'all' || c.departmentId === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-xs font-bold"><Loader2 className="animate-spin text-blue-600 mr-2" size={16}/>Loading Complaints Module...</div>;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar />
      <main className="flex-1 px-6 py-6 overflow-y-auto relative">
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-lg font-black text-slate-900 uppercase">Complaints Control Center</h1>
            <p className="text-xs text-slate-400 mt-0.5">Modify triage statuses, update department channels, or view spatial context telemetry grids.</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          {/* Controls toolbar */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-9 pr-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50/50 outline-none" 
              />  
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="w-full p-2 text-xs font-semibold border border-slate-200 bg-white rounded-xl outline-none"
            >
              <option value="all">{t('allStatusProfiles')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="in progress">{t('inProgress')}</option>
              <option value="resolved">{t('resolved')}</option>
            </select>
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="w-full p-2 text-xs font-semibold border border-slate-200 bg-white rounded-xl outline-none">
              <option value="all">All Department Channels</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name[lang]}</option>)}
            </select>
          </div>

          {/* Master Admin Management Datatable Grid */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full min-w-[850px] text-left text-xs font-semibold">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                  <th className="pb-2">{t('ticketId')}</th>
                  <th className="pb-2">{t('issueContext')}</th>
                  <th className="pb-2">{t('quickReroute')}</th>
                  <th className="pb-2">{t('statusLifecycle')}</th>
                  <th className="pb-2 text-center">{t('dangerControl')}</th>
                  <th className="pb-2 text-center">{t('inspectionWorkspace')}</th>
                  <th className="pb-2 text-center">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(c => {
                  const d = departments.find(x => x.id === c.departmentId);
                  return (
                    <tr key={c.id} className={`hover:bg-slate-50/50 transition-colors ${selectedTicket?.dbId === c.dbId ? 'bg-blue-50/40' : ''}`}>
                      <td className="py-3 font-mono text-blue-600 font-black">{c.id}</td>
                      
                      <td className="py-3 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <DepartmentIcon name={d?.icon} size={11} color={d?.color} />
                          <span className="font-bold text-slate-900">{c.issueType}</span>
                        </div>
                        <p className="truncate text-slate-500 text-[11px] font-medium">{c.address}</p>
                      </td>
                      
                      <td className="py-3">
                        <select 
                          value={c.departmentId || "other"} 
                          disabled={actionLoading === c.dbId}
                          onChange={(e) => handleUpdateField(c.dbId, 'department_id', e.target.value)}
                          className="p-1.5 text-[11px] font-bold border border-slate-200 bg-slate-50 rounded-lg outline-none focus:bg-white focus:border-blue-500 cursor-pointer disabled:opacity-40"
                        >
                          {departments.map(deptItem => (
                            <option key={deptItem.id} value={deptItem.id}>{deptItem.name['en']}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <select 
                            value={c.status} 
                            disabled={actionLoading === c.dbId}
                            onChange={(e) => handleUpdateField(c.dbId, 'status', e.target.value)}
                            className="p-1.5 text-[11px] font-bold border border-slate-200 bg-slate-50 rounded-lg outline-none focus:bg-white focus:border-emerald-500 cursor-pointer disabled:opacity-40"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                          <StatusBadge status={c.status} size="sm" />
                        </div>
                      </td>

                      <td className="py-3 text-center">
                        <button 
                          disabled={actionLoading === c.dbId}
                          onClick={() => handleDeleteTicket(c.dbId, c.id)}
                          className="text-red-600 hover:text-white hover:bg-red-600 border border-red-100 bg-red-50/40 p-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-30 inline-flex items-center"
                          title="Purge Document"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>

                      <td className="py-3 flex justify-center gap-2">
                       
                        <button 
                          onClick={() => navigate(`/complaint/${c.id}`)} 
                          className="bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1"
                        >
                          <SlidersHorizontal size={10} /> {t('fullView')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-400 font-bold">No tickets match active parameters.</div>
            )}
          </div>
        </div>

        {/* =====================================================================
            CONNECTED DYNAMIC INSPECTION SIDE PANEL DRAWER
            ===================================================================== */}
        {selectedTicket && (
          <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-slate-200 shadow-xl p-5 z-20 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-blue-600 font-black">{selectedTicket.id}</span>
                  <h3 className="text-sm font-black text-slate-900 mt-0.5">Telemetry Overview</h3>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-900 p-1 rounded-lg">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1"><MapPin size={11}/> Reported Geolocation Address</p>
                <p className="text-xs font-bold text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">{selectedTicket.address}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1"><Sparkles size={11}/> AI Spatial Risk Assessment</p>
                <p className="text-xs font-medium text-blue-900 leading-relaxed bg-blue-50/40 p-2.5 rounded-xl border border-blue-100 italic">
                  {selectedTicket.locationContext !== 'N/A' ? selectedTicket.locationContext : "No coordinate parameters provided for location proximity profiling."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-bold border-t border-slate-50 pt-3">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider">AI Confidence</p>
                  <p className="text-slate-900 font-black font-mono mt-0.5 uppercase text-emerald-600">{selectedTicket.confidence}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider">Public Urgency</p>
                  <p className="text-slate-900 font-black font-mono mt-0.5 uppercase text-red-600">{selectedTicket.priority}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <button 
                onClick={() => navigate(`/complaint/${selectedTicket.id}`)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold transition text-center shadow-sm"
              >
                Open Full Triage View
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}