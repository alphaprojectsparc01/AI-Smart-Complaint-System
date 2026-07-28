import AdminSidebar from '../../components/AdminSidebar';

export default function Settings() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar />
      <main className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="mb-5 border-b border-slate-100 pb-4">
          <h1 className="text-lg font-black text-slate-900 uppercase">System Core Control Variables</h1>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm max-w-xl space-y-6 text-xs font-bold">
          <div>
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-50 pb-2 mb-4">AI Vision Engine Schema Controls</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-800">Forced Category Filtering Policy</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Filter non-civic irrelevant image inputs seamlessly at endpoint layer.</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-black rounded border border-emerald-100 uppercase text-[10px]">Active Node</span>
              </div>
              
              <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                <div>
                  <p className="text-slate-800">Dynamic DB Directory Mapping</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Recompile prompt enum models from live MongoDB parameter sets.</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-black rounded border border-emerald-100 uppercase text-[10px]">Active Node</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-50 pb-2 mb-4">API Token Engine Latency Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-slate-400 text-[10px] uppercase tracking-wider">Target Model Instance</p>
                <p className="text-sm font-black text-slate-900 mt-1 font-mono">gemini-3.1-flash-lite</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-slate-400 text-[10px] uppercase tracking-wider">Average Dispatch Delay</p>
                <p className="text-sm font-black text-blue-600 mt-1 font-mono">~340 ms / call</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-50">
            <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition cursor-pointer">
              Save Infrastructure Directives
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}