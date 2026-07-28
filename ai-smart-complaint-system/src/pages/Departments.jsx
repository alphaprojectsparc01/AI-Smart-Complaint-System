import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import DepartmentIcon from '../components/DepartmentIcon';
import departments from '../data/departments';
import { useLang } from '../context/LanguageContext';
import api from '../utils/api';

export default function Departments() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [deptStats, setDeptStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/complaints/stats');
        if (isMounted && response.data) {
          const rawStats = response.data.data || response.data;
          setDeptStats(rawStats.byDepartment || rawStats.by_department || {});
        }
      } catch (err) {
        console.error('Failed to load department statistics metrics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[#f9fbff] pb-12 text-slate-800">
      <Header showBack title={t('departments') || 'Departments'} />

      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('departments') || 'All Operational Departments'}
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Select a specific authority below to view active public reports and resolutions.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl border border-slate-100 bg-slate-100/70" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {departments.map((d) => {
              const count = deptStats[d.id] ?? 0;

              return (
                <button
                  key={d.id}
                  onClick={() => navigate(`/public-complaints?dept=${d.id}`)}
                  className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between text-left transition-all hover:shadow-md active:scale-[0.99] cursor-pointer w-full group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span 
                      className="grid h-12 w-12 place-items-center rounded-2xl flex-shrink-0 transition-transform group-hover:scale-105" 
                      style={{ background: d.bg || '#f1f5f9' }}
                    >
                      <DepartmentIcon name={d.icon} size={24} color={d.color || '#475569'} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate tracking-tight">
                        {d.name[lang]}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase mt-0.5 tracking-wider font-mono">
                        ID: {d.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-0.5 pl-2 flex-shrink-0">
                    <span className="text-xs font-extrabold text-blue-600 bg-blue-50/70 border border-blue-100/60 px-2.5 py-1 rounded-xl font-mono">
                      📋 {count}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 transition-colors group-hover:text-blue-500 mt-1">
                      {t('viewAll') || 'View'} →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}