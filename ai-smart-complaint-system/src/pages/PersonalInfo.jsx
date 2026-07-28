import React from 'react';
import Header from '../components/Header';
import { useLang } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

export default function PersonalInfo() {
  const { t } = useLang();
  const { user } = useApp();

  return (
    <div className="min-h-screen bg-[#f9fbff] pb-12 text-slate-800">
      <Header title={t('personalInfo') || 'Personal Info'} showBack />
      <div className="mx-auto max-w-xl px-4 pt-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
            <p className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl p-3">{user?.name || user?.username || '—'}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
            <p className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl p-3">{user?.email || '—'}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Mobile Number</label>
            <p className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl p-3 font-mono">{user?.mobile || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}