import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import Header from '../components/Header';
import { useLang } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

export default function ComplaintSuccess() {
  const { id } = useParams();
  const { t } = useLang();
  const { findById } = useApp();
  const navigate = useNavigate();
  const complaint = findById(id);

  return (
    <div className="flex min-h-full flex-col">
      <Header title={t('appName')} />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-ok-100">
          <CheckCircle2 size={44} className="text-ok-600" />
        </div>
        <h1 className="mt-5 font-display text-xl font-bold text-civic-900">{t('submittedSuccess')}</h1>

        <div className="mt-6 w-full card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-civic-400">{t('yourComplaintId')}</p>
          <p className="mt-1 font-mono text-2xl font-bold text-civic-800">{complaint?.id || id}</p>
          {complaint && (
            <p className="mt-2 text-sm text-civic-600">{complaint.issueType}</p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-ok-100 px-4 py-2.5 text-xs font-medium text-ok-600">
          <MessageCircle size={15} /> {t('whatsappUpdate')}
        </div>

        <div className="mt-8 flex w-full flex-col gap-3">
          <button onClick={() => navigate(`/complaint/${complaint?.id || id}`)} className="btn-primary w-full">
            {t('trackComplaint')}
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-outline w-full">
            {t('goHome')}
          </button>
        </div>
      </div>
    </div>
  );
}
