import React, { useState } from 'react';
import Header from '../components/Header';
import { useLang } from '../context/LanguageContext';
import api from '../utils/api';

export default function ChangePassword() {
  const { t } = useLang();
  const [passwords, setPasswords] = useState({ old: '', new: '' });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // FIXED: Pointed to /api/auth/ and mapped properties to old_password / new_password
      await api.put('/api/auth/change-password', {
        old_password: passwords.old,
        new_password: passwords.new
      });
      
      setIsSuccess(true);
      setMessage('Password updated successfully!');
      setPasswords({ old: '', new: '' });
    } catch (err) {
      setIsSuccess(false);
      // Fallback message extraction if the backend sends a specific failure reason
      const errorDetail = err.response?.data?.detail || 'Failed to change password. Try again.';
      setMessage(errorDetail);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fbff] pb-12 text-slate-800">
      <Header title={t('changePassword') || 'Change Password'} showBack />
      <div className="mx-auto max-w-xl px-4 pt-5">
        <form onSubmit={handleUpdate} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          
          {message && (
            <p className={`text-xs font-bold p-3 rounded-xl border ${
              isSuccess 
                ? 'text-blue-600 bg-blue-50 border-blue-100/50' 
                : 'text-red-600 bg-red-50 border-red-100/50'
            }`}>
              {message}
            </p>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Current Password</label>
            <input 
              type="password" 
              value={passwords.old}
              onChange={(e) => setPasswords({...passwords, old: e.target.value})}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500" 
              required 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
            <input 
              type="password" 
              value={passwords.new}
              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500" 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition cursor-pointer shadow-sm text-sm">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}