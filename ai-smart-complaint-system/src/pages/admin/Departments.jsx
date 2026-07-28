import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Loader2, Plus, Trash2, Edit2, X, Save, Palette, AlertCircle } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import DepartmentIcon from '../../components/DepartmentIcon';
import { useLang } from '../../context/LanguageContext';
import api from '../../utils/api';

export default function Departments() {
  const { lang } = useLang();
  const navigate = useNavigate();
  
  const [liveDepts, setLiveDepts] = useState([]);
  const [stats, setStats] = useState({ byDepartment: {} });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uiError, setUiError] = useState(null);

  // Modal Panel workspace handling frames
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null); 
  const [form, setForm] = useState({ id: '', nameEn: '', nameTe: '', icon: 'Building2', color: '#3b82f6', bg: '#eff6ff' });

  const loadDataMatrix = async () => {
    try {
      setUiError(null);
      
      const activeToken = localStorage.getItem('token');
      if (activeToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${activeToken}`;
      }

      // FIXED: Point to the /api/admin/departments endpoint layout
      const [deptsResult, statsResult] = await Promise.allSettled([
        api.get('/api/admin/departments'), 
        api.get('/api/complaints/stats')
      ]);

      if (deptsResult.status === 'fulfilled') {
        console.log("🔍 [DEPT DEBUG] Loaded live records array:", deptsResult.value.data);
        setLiveDepts(deptsResult.value.data || []);
      } else {
        console.error("Failed fetching departments document collection:", deptsResult.reason);
        setUiError("Failed to fetch department rosters. Please verify you are logged in with administrative clearance.");
      }

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value.data || { byDepartment: {} });
      } else {
        console.warn("Telemetry statistics metrics route caught a temporary exception:", statsResult.reason);
      }

      setLoading(false);
    } catch (err) {
      console.error("Unexpected pipeline execution error inside dashboard matrix:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataMatrix();
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setForm({ id: '', nameEn: '', nameTe: '', icon: 'Building2', color: '#3b82f6', bg: '#eff6ff' });
    setShowModal(true);
  };

  const openEditModal = (d) => {
    const targetId = d.id || d._id;
    setEditingDept(targetId);
    setForm({
      id: targetId,
      nameEn: d.name?.en || '',
      nameTe: d.name?.te || '',
      icon: d.icon || 'Building2',
      color: d.color || '#3b82f6',
      bg: d.bg || '#eff6ff'
    });
    setShowModal(true);
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    
    const targetId = form.id.trim().toLowerCase();
    const payload = {
      id: targetId,
      name: { en: form.nameEn.trim(), te: form.nameTe.trim() },
      icon: form.icon.trim(),
      color: form.color,
      bg: form.bg
    };

    try {
      if (editingDept) {
        // FIXED: Added administrative routing prefix
        await api.put(`/api/admin/departments/${editingDept}`, payload);
      } else {
        // FIXED: Added administrative routing prefix
        await api.post('/api/admin/departments', payload);
      }
      setShowModal(false);
      loadDataMatrix();
    } catch (err) {
      alert("Database error applying department changes: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    const targetId = String(deptId).toLowerCase().trim();
    if (targetId === 'other') return alert("System Guardrail: Fallback channel 'other' is locked permanently.");
    if (!window.confirm(`Are you sure you want to delete department cluster '${targetId}'? Incoming AI tickets will default into 'other'.`)) return;
    
    setActionLoading(true);
    try {
      // FIXED: Added administrative routing prefix
      await api.delete(`/api/admin/departments/${targetId}`);
      loadDataMatrix();
    } catch (err) {
      alert("Deletion request rejected by database rule constraints: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50 text-xs font-bold"><Loader2 className="animate-spin text-blue-600 mr-2" size={16}/>Streaming Department Matrices...</div>;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar />
      <main className="flex-1 px-6 py-6 overflow-y-auto relative">
        
        <div className="mb-5 border-b border-slate-100 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">City Departments Hub</h1>
            <p className="text-xs text-slate-400 mt-0.5">Add new channels, tweak AI classification nodes, or delete municipal routing boundaries.</p>
          </div>
          <button 
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Plus size={14}/> Add New Department
          </button>
        </div>

        {uiError && (
          <div className="mb-5 p-4 bg-red-50 border border-red-100 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <p>{uiError}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {liveDepts.map(d => {
            const currentId = d.id || d._id;
            const totalVolume = stats.byDepartment?.[currentId] || stats.byDepartment?.[currentId.toUpperCase()] || 0;
            return (
              <div key={currentId} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-blue-200 hover:shadow-md transition-all duration-200 group relative">
                <div>
                  <div className="flex items-start justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: d.bg || '#f8fafc' }}>
                      <DepartmentIcon name={d.icon} size={18} color={d.color || '#475569'} />
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEditModal(d)} className="text-slate-400 hover:text-blue-600 p-1 bg-slate-50 hover:bg-blue-50 rounded-lg transition border border-slate-100 cursor-pointer">
                        <Edit2 size={11}/>
                      </button>
                      {currentId !== 'other' && (
                        <button onClick={() => handleDeleteDepartment(currentId)} className="text-slate-400 hover:text-red-600 p-1 bg-slate-50 hover:bg-red-50 rounded-lg transition border border-slate-100 cursor-pointer">
                          <Trash2 size={11}/>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-black text-slate-900">{d.name?.[lang] || d.name || currentId}</h3>
                    <span className="text-[9px] font-mono font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 uppercase inline-block mt-1">ID KEY: {currentId}</span>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-50 pt-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Live Queue Load: <span className="font-mono font-black text-slate-900 pl-0.5">{totalVolume} cases</span></span>
                  <button 
                    onClick={() => navigate(`/admin/complaints`, { state: { defaultDeptFilter: currentId } })}
                    className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Open Workspace <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {liveDepts.length === 0 && !loading && !uiError && (
          <div className="text-center py-12 text-slate-400 font-bold text-xs bg-white rounded-2xl border border-dashed border-slate-200">
            No dynamic department categories registered inside MongoDB database indexes yet. Click "Add New Department" to create one.
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 max-w-sm w-full shadow-xl space-y-4 text-xs font-bold animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <h3 className="text-sm font-black text-slate-900">{editingDept ? 'Modify Department Channel' : 'Spawn Department Node'}</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 p-1 cursor-pointer"><X size={15}/></button>
              </div>

              <form onSubmit={handleSaveDepartment} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-slate-500">Unique Routing Key String (ID)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. sanitation" 
                    disabled={!!editingDept}
                    value={form.id}
                    onChange={(e) => setForm(p => ({ ...p, id: e.target.value.replace(/[^a-zA-Z0-9]/g, '') }))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50/50 disabled:opacity-50 font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-500">Name (English)</label>
                    <input type="text" placeholder="e.g. Water Grid" value={form.nameEn} onChange={(e) => setForm(p => ({ ...p, nameEn: e.target.value }))} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-semibold focus:border-blue-500" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500">Name (Telugu)</label>
                    <input type="text" placeholder="e.g. నీటి సరఫరా" value={form.nameTe} onChange={(e) => setForm(p => ({ ...p, nameTe: e.target.value }))} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none font-semibold focus:border-blue-500" required />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500">Lucide Vector Icon Variant Token</label>
                  <select value={form.icon} onChange={(e) => setForm(p => ({ ...p, icon: e.target.value }))} className="w-full p-2.5 border border-slate-200 bg-white rounded-xl outline-none font-semibold focus:border-blue-500">
                    <option value="Building2">Building / Block</option>
                    <option value="Droplet">Droplet / Water Grid</option>
                    <option value="Zap">Zap / Power Grid</option>
                    <option value="Trash2">Trash / Sanitation</option>
                    <option value="Truck">Truck / Logistics</option>
                    <option value="HardHat">HardHat / Engineering</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-slate-50 pt-2.5">
                  <div className="space-y-1">
                    <label className="text-slate-500 flex items-center gap-1"><Palette size={11}/> Core Color</label>
                    <input type="color" value={form.color} onChange={(e) => setForm(p => ({ ...p, color: e.target.value }))} className="w-full h-9 rounded-lg border p-0.5 cursor-pointer bg-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 flex items-center gap-1"><Palette size={11}/> Theme Background</label>
                    <input type="color" value={form.bg} onChange={(e) => setForm(p => ({ ...p, bg: e.target.value }))} className="w-full h-9 rounded-lg border p-0.5 cursor-pointer bg-white" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl mt-3 transition shadow-sm flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 text-xs"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={13}/> : <Save size={13}/>}
                  {editingDept ? 'Commit Changes' : 'Spawn Channel Grid'}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}