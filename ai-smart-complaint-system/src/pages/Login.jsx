import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building, Eye, EyeOff } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import CitySkyline from '../components/CitySkyline';

export default function Login() {
  const { t } = useLang();
  const { login } = useApp();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create URLSearchParams to match standard form-data structure (OAuth2PasswordRequestForm)
      const formData = new URLSearchParams();
      formData.append('username', email); // FastAPI OAuth2 expects the key to be exactly 'username'
      formData.append('password', password);

      // 2. Make the request to your endpoint
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        // Fallback to data.detail if backend returns 400 with a custom error message
        throw new Error(data.detail || 'Invalid email or password');
      }

      // 3. Save the token securely
      localStorage.setItem('token', data.access_token);
      
      // 4. Stash the complete user data object as a JSON string in localStorage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        // Update global context state with full user data profile
        login(data.user); 
      } else {
        // Safe structural fallback if backend user dictionary structure ever shifts
        const fallbackUser = { email };
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        login(fallbackUser); 
      }
      
      navigate('/home');
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
          <h1 className="font-display text-xl font-bold text-black"> {t('welcomeBack')}</h1>
          <p className="mt-1 text-sm text-black">
            {t('loginToContinue')}
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={submit} className="mt-5 space-y-4">
            <Field label="Email Address">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email"
                className="input"
                disabled={isLoading}
              />
            </Field>

            <Field label={t('password')}>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('enterPassword')}
                  className="input pr-10"
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw((v) => !v)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-civic-400"
                  disabled={isLoading}
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>

            {error && <p className="text-xs font-medium text-danger-600">{error}</p>}

            <div className="text-right">
              <button type="button" className="text-xs font-semibold text-civic-600">{t('forgotPassword')}</button>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : t('login')}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-civic-500">
            {t('noAccount')}{' '}
            <Link to="/register" className="font-semibold text-civic-700">{t('register')}</Link>
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