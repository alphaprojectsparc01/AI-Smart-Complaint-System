import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building, ShieldCheck } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import CitySkyline from '../components/CitySkyline';

export default function Register() {
  const { t } = useLang();
  const { register } = useApp(); 
  const navigate = useNavigate();
  
  // Set default role value string state to "citizen"
  const [form, setForm] = useState({ name: '', mobile: '', email: '', role: 'citizen', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError(t('fullName') + ' required');
    if (!/^\d{10}$/.test(form.mobile)) return setError(t('mobileNumber') + ' — 10 digits required');
    if (!form.email.trim()) return setError(t('email') + ' required');
    if (!form.role) return setError('Role selection required');
    if (!form.password.trim()) return setError(t('password') + ' required');

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          mobile: form.mobile,
          email: form.email,
          role: form.role, // Injected into backend payload context parameters array
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      if (typeof register === 'function') {
        register(form);
      }
      
      navigate('/login'); 
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-civic-50 px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <CitySkyline className="mx-auto mt-5 h-16 w-full max-w-[220px]" />
          <p className="font-display text-lg font-bold text-civic-900">{t('appName')}</p>
          <h1 className="font-display text-xl font-bold text-black">{t('createAccount')}</h1>
        </div>

        <div className="card p-6">
          <form onSubmit={submit} className="mt-5 space-y-4">
            <Field label={t('fullName')}>
              <input 
                value={form.name} 
                onChange={update('name')} 
                placeholder={t('enterName')} 
                className="input" 
                disabled={isLoading}
              />
            </Field>
            
            <Field label={t('mobileNumber')}>
              <input
                type="tel" 
                inputMode="numeric" 
                maxLength={10}
                value={form.mobile}
                onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value.replace(/\D/g, '') }))}
                placeholder={t('enterMobile')} 
                className="input"
                disabled={isLoading}
              />
            </Field>
            
            <Field label={t('email')}>
              <input 
                type="email" 
                value={form.email} 
                onChange={update('email')} 
                placeholder={t('enterEmail')} 
                className="input" 
                disabled={isLoading}
              />
            </Field>

            {/* ADDS CLEAR WORKSPACE DROPDOWN LIST INPUT CELL SECTOR */}
            <Field label="Account Authorization Access Role">
              <select 
                value={form.role} 
                onChange={update('role')} 
                className="input bg-white cursor-pointer font-semibold text-slate-700 text-xs"
                disabled={isLoading}
              >
                <option value="citizen">Public Citizen Client Channel</option>
                <option value="officer">Field Operations Officer Handler</option>
                <option value="admin">System Administration Hub Manager</option>
              </select>
            </Field>
            
            <Field label={t('password')}>
              <input 
                type="password" 
                value={form.password} 
                onChange={update('password')} 
                placeholder={t('enterPassword')} 
                className="input" 
                disabled={isLoading}
              />
            </Field>

            {error && <p className="text-xs font-medium text-danger-600">{error}</p>}

            <button 
              type="submit" 
              className="w-full rounded-xl bg-ok-600 px-5 py-3 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : t('register')}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-civic-500">
            {t('haveAccount')}{' '}
            <Link to="/login" className="font-semibold text-civic-700">{t('login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-civic-700">{label}</span>
      {children}
    </label>
  );
}