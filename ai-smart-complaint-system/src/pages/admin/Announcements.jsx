import { useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import departments from '../../data/departments';
import { useLang } from '../../context/LanguageContext';

export default function Announcements() {
  const { lang } = useLang();
  const [form, setForm] = useState({ title: '', message: '', targetDept: 'all' });
  const [success, setSuccess] = useState(false);
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Pre-Monsoon System Verification', message: 'All central drainage systems in city limits are set to absolute active monitoring status.', date: '2026-07-19' }
  ]);

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!form.title || !form.message) return;
    setAnnouncements(prev => [
      { id: Date.now(), title: form.title, message: form.message, date: new Date().toISOString().split('T')[0] },
      ...prev
    ]);
    setForm({ title: '', message: '', targetDept: 'all' });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar />
      <main className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="mb-5 border-b border-slate-100 pb-4">
          <h1 className="text-lg font-black text-slate-900 uppercase">Emergency Broadcast Center</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm md:col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Compose Broadcast Note</h3>
            <form onSubmit={handleBroadcast} className="space-y-4 text-xs font-bold">
              {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={14} /> Alert dispatched cleanly.
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-slate-600">Announcement Title</label>
                <input type="text" placeholder="e.g. Water Pipeline Maintenance" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50/40" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600">Target Channel Segment</label>
                <select value={form.targetDept} onChange={(e) => setForm(p => ({ ...p, targetDept: e.target.value }))} className="w-full p-3 border border-slate-200 bg-white rounded-xl outline-none">
                  <option value="all">Broadcast to All Citizens</option>
                  {departments.map(d => <option key={d.id} value={d.id}>Only {d.name[lang]}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600">Notification Message Body</label>
                <textarea rows={4} placeholder="Provide structural details regarding the affected zones..." value={form.message} onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50/40 resize-none" required />
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 uppercase rounded-xl tracking-wider shadow-sm cursor-pointer transition">Dispatch Alert</button>
            </form>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Alert Feed Broadcast History</h3>
            {announcements.map(a => (
              <div key={a.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm relative overflow-hidden flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5"><Bell size={13} className="text-blue-500"/>{a.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed">{a.message}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border flex-shrink-0">{a.date}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}